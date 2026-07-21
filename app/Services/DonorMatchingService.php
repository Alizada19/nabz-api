<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class DonorMatchingService
{
    public function __construct(protected BloodCompatibilityService $compatibilityService)
    {}

    /**
     * Find matching donors based on blood type and location
     */
    public function findMatchingDonors(
        int $bloodTypeId,
        float $latitude,
        float $longitude,
        float $radiusKm = 50
    ): Collection {
        $compatibleTypeIds = $this->compatibilityService->getCompatibleDonorTypeIds($bloodTypeId);

        return User::query()
            ->select('users.*')
            ->selectRaw(
                '( 6371 * acos( cos( radians(?) ) * cos( radians( latitude ) ) * cos( radians( longitude ) - radians(?) ) + sin( radians(?) ) * sin( radians( latitude ) ) ) ) AS distance',
                [$latitude, $longitude, $latitude]
            )
            ->join('donor_profiles', 'users.id', '=', 'donor_profiles.user_id')
            ->whereIn('donor_profiles.blood_type_id', $compatibleTypeIds)
            ->where('users.role', 'donor')
            ->where('users.is_available', true)
            ->where('donor_profiles.available_status', true)
            ->whereNotNull('users.latitude')
            ->whereNotNull('users.longitude')
            ->having('distance', '<=', $radiusKm)
            ->with(['donorProfile.bloodType'])
            ->orderBy('distance')
            ->get();
    }

    /**
     * Calculate distance between two coordinates using Haversine formula
     */
    public function calculateDistance(
        float $lat1,
        float $lon1,
        float $lat2,
        float $lon2
    ): float {
        $earthRadius = 6371; // Earth's radius in kilometers

        $latDelta = deg2rad($lat2 - $lat1);
        $lonDelta = deg2rad($lon2 - $lon1);

        $a = sin($latDelta / 2) * sin($latDelta / 2) +
            cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
            sin($lonDelta / 2) * sin($lonDelta / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }
}