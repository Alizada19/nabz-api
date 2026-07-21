<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'role' => $this->role,
            'location' => $this->location,
            'is_available' => $this->is_available,
            'donor_profile' => new DonorProfileResource($this->whenLoaded('donorProfile')),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}