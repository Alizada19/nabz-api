<?php

namespace App\Services;

use App\Models\BloodType;
use Illuminate\Support\Collection;

class BloodCompatibilityService
{
    /**
     * Blood compatibility matrix - maps requested blood type to compatible donor types
     */
    protected array $compatibilityMatrix = [
        'O-' => ['O-'],
        'O+' => ['O-', 'O+'],
        'A-' => ['O-', 'A-'],
        'A+' => ['O-', 'O+', 'A-', 'A+'],
        'B-' => ['O-', 'B-'],
        'B+' => ['O-', 'O+', 'B-', 'B+'],
        'AB-' => ['O-', 'A-', 'B-', 'AB-'],
        'AB+' => ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
    ];

    /**
     * Get compatible donor blood types for a given blood type ID
     */
    public function getCompatibleDonorTypes(int $bloodTypeId): Collection
    {
        $bloodType = BloodType::findOrFail($bloodTypeId);
        $requestedType = $bloodType->name;

        $compatibleTypeNames = $this->compatibilityMatrix[$requestedType] ?? [];

        return BloodType::whereIn('name', $compatibleTypeNames)->get();
    }

    /**
     * Get compatible donor blood type IDs for a given blood type ID
     */
    public function getCompatibleDonorTypeIds(int $bloodTypeId): array
    {
        return $this->getCompatibleDonorTypes($bloodTypeId)->pluck('id')->toArray();
    }

    /**
     * Check if donor blood type is compatible with recipient blood type
     */
    public function isCompatible(string $donorType, string $recipientType): bool
    {
        $compatibleTypes = $this->compatibilityMatrix[$recipientType] ?? [];
        return in_array($donorType, $compatibleTypes);
    }
}