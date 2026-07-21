<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BloodRequestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'seeker' => [
                'id' => $this->seeker->id,
                'name' => $this->seeker->name,
                'phone' => $this->seeker->phone,
            ],
            'blood_type' => [
                'id' => $this->bloodType->id,
                'name' => $this->bloodType->name,
            ],
            'hospital_name' => $this->hospital_name,
            'hospital_address' => $this->hospital_address,
            'location' => [
                'latitude' => (float) $this->latitude,
                'longitude' => (float) $this->longitude,
            ],
            'units_required' => $this->units_required,
            'urgency_level' => $this->urgency_level,
            'status' => $this->status,
            'notes' => $this->notes,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}