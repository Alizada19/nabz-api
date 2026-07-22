<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\BloodRequest;
use App\Models\DonorProfile;
use App\Models\BloodType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function stats(Request $request): JsonResponse
    {
        $totalUsers = User::count();
        $totalDonors = User::where('role', 'donor')->count();
        $availableDonors = User::where('role', 'donor')->where('is_available', true)->count();
        $requestsToday = BloodRequest::whereDate('created_at', now()->toDateString())->count();
        $pendingRequests = BloodRequest::where('status', 'pending')->count();
        $emergencyRequests = BloodRequest::whereIn('urgency_level', ['high', 'critical'])->count();

        // Get monthly requests for the current year
        $currentYear = now()->year;
        $monthlyRequests = [];
        for ($month = 1; $month <= 12; $month++) {
            $count = BloodRequest::whereYear('created_at', $currentYear)
                ->whereMonth('created_at', $month)
                ->count();
            $monthlyRequests[] = $count;
        }

        // Get blood group distribution
        $bloodTypes = BloodType::all();
        $bloodGroupStats = [];
        $totalDonorProfiles = DonorProfile::count();
        foreach ($bloodTypes as $type) {
            $count = DonorProfile::where('blood_type_id', $type->id)->count();
            $percentage = $totalDonorProfiles > 0 ? round(($count / $totalDonorProfiles) * 100) : 0;
            $bloodGroupStats[] = [
                'name' => $type->name,
                'count' => $count,
                'percentage' => $percentage
            ];
        }

        // Latest emergency requests (up to 3)
        $latestEmergencies = BloodRequest::with('bloodType')
            ->whereIn('urgency_level', ['high', 'critical'])
            ->latest()
            ->take(3)
            ->get()
            ->map(function ($req) {
                return [
                    'id' => $req->id,
                    'blood_type' => [
                        'name' => $req->bloodType->name ?? 'Any'
                    ],
                    'hospital_name' => $req->hospital_name,
                    'units_required' => $req->units_required,
                    'urgency_level' => $req->urgency_level,
                    'created_at' => $req->created_at->diffForHumans()
                ];
            });

        // Latest registered donors (up to 3)
        $latestDonors = User::with('donorProfile.bloodType')
            ->where('role', 'donor')
            ->latest()
            ->take(3)
            ->get()
            ->map(function ($usr) {
                return [
                    'id' => $usr->id,
                    'name' => $usr->name,
                    'location' => $usr->location,
                    'blood_type' => [
                        'name' => $usr->donorProfile->bloodType->name ?? 'O-'
                    ],
                    'created_at' => $usr->created_at->diffForHumans()
                ];
            });

        return response()->json([
            'success' => true,
            'message' => 'Dashboard analytics retrieved successfully',
            'data' => [
                'total_users' => $totalUsers,
                'total_donors' => $totalDonors,
                'available_donors' => $availableDonors,
                'requests_today' => $requestsToday,
                'pending_requests' => $pendingRequests,
                'emergency_requests' => $emergencyRequests,
                'monthly_requests' => $monthlyRequests,
                'blood_group_stats' => $bloodGroupStats,
                'latest_emergency_requests' => $latestEmergencies,
                'latest_registered_donors' => $latestDonors
            ]
        ]);
    }
}
