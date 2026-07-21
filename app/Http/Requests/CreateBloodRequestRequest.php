<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CreateBloodRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'blood_type_id' => ['required', 'exists:blood_types,id'],
            'hospital_name' => ['required', 'string', 'max:255'],
            'hospital_address' => ['required', 'string'],
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'units_required' => ['nullable', 'integer', 'min:1', 'max:10'],
            'urgency_level' => ['nullable', Rule::in(['low', 'medium', 'high', 'critical'])],
            'notes' => ['nullable', 'string', 'max:1000'],
            'radius' => ['nullable', 'numeric', 'min:1', 'max:500'],
        ];
    }
}