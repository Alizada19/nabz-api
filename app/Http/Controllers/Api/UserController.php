<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $search = $request->query('search', '');
        $role = $request->query('role', '');

        $query = User::query();

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if (!empty($role)) {
            $query->where('role', $role);
        }

        $users = $query->with('donorProfile.bloodType')->latest()->paginate(10);

        return response()->json([
            'success' => true,
            'message' => 'Users retrieved successfully',
            'data' => $users->items(),
            'meta' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
            ]
        ]);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users')->ignore($user->id),
            ],
            'phone' => [
                'required',
                'string',
                'max:20',
                Rule::unique('users')->ignore($user->id),
            ],
            'role' => ['required', Rule::in(['admin', 'donor', 'seeker', 'coordinator'])],
            'location' => 'nullable|string|max:255',
            'is_available' => 'nullable|boolean',
            'password' => 'nullable|string|min:8|confirmed'
        ]);

        $user->name = $validated['name'];
        $user->email = $validated['email'];
        $user->phone = $validated['phone'];
        $user->role = $validated['role'];
        $user->location = $validated['location'] ?? $user->location;
        if (isset($validated['is_available'])) {
            $user->is_available = (bool) $validated['is_available'];
        }

        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        if ($user->role === 'donor') {
            $user->donorProfile()->updateOrCreate(
                ['user_id' => $user->id],
                [
                    'blood_type_id' => $request->blood_type_id ?? 1,
                    'total_donations' => $request->total_donations ?? 0,
                    'last_donation_date' => $request->last_donation_date ?? null,
                    'available_status' => isset($validated['is_available']) ? (bool)$validated['is_available'] : true,
                ]
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'User updated successfully',
            'data' => $user->load('donorProfile.bloodType')
        ]);
    }

    public function destroy(User $user): JsonResponse
    {
        // Don't let users delete themselves for safety
        if ($user->id === auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot delete your own account.',
                'data' => null
            ], 400);
        }

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User deleted successfully',
            'data' => null
        ]);
    }
}
