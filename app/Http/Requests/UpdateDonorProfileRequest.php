<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateDonorProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'blood_type_id' => ['nullable', 'exists:blood_types,id'],
            'available_status' => ['nullable', 'boolean'],
            'last_donation_date' => ['nullable', 'date', 'before_or_equal:today'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'location' => ['nullable', 'string', 'max:255'],
            'is_available' => ['nullable', 'boolean'],
        ];
    }
}