<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DonorProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'blood_type' => [
                'id' => $this->bloodType->id,
                'name' => $this->bloodType->name,
            ],
            'last_donation_date' => $this->last_donation_date?->format('Y-m-d'),
            'total_donations' => $this->total_donations,
            'available_status' => $this->available_status,
            'is_available' => $this->isAvailable(),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}