<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateDonorProfileRequest;
use App\Http\Resources\DonorProfileResource;
use App\Models\DonorProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DonorProfileController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $profile = $request->user()->donorProfile()->with('bloodType')->first();

        if (!$profile) {
            return response()->json([
                'success' => false,
                'message' => 'Donor profile not found',
                'data' => null,
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Donor profile retrieved successfully',
            'data' => new DonorProfileResource($profile),
        ]);
    }

    public function update(UpdateDonorProfileRequest $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->isDonor()) {
            return response()->json([
                'success' => false,
                'message' => 'Only donors can update donor profile',
                'data' => null,
            ], 403);
        }

        $profile = $user->donorProfile;

        if (!$profile) {
            $profile = DonorProfile::create([
                'user_id' => $user->id,
                'blood_type_id' => $request->blood_type_id,
                'available_status' => $request->available_status ?? true,
            ]);
        } else {
            $profile->update($request->validated());
        }

        if ($request->has('latitude') && $request->has('longitude')) {
            $user->update([
                'latitude' => $request->latitude,
                'longitude' => $request->longitude,
                'location' => $request->location,
            ]);
        }

        if ($request->has('is_available')) {
            $user->update(['is_available' => $request->is_available]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Donor profile updated successfully',
            'data' => new DonorProfileResource($profile->fresh('bloodType')),
        ]);
    }
}