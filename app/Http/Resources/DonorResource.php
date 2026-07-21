<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DonorResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'blood_type' => [
                'id' => $this->donorProfile->bloodType->id,
                'name' => $this->donorProfile->bloodType->name,
            ],
            'location' => $this->location,
            'distance_km' => $this->when(isset($this->distance), function () {
                return round($this->distance, 2);
            }),
            'total_donations' => $this->donorProfile->total_donations,
            'is_available' => $this->is_available && $this->donorProfile->available_status,
        ];
    }
}