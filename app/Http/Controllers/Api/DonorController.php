<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\DonorResource;
use App\Services\DonorMatchingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class DonorController extends Controller
{
    public function __construct(protected DonorMatchingService $matchingService)
    {}

    public function nearby(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'blood_type_id' => 'required|exists:blood_types,id',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'radius' => 'nullable|numeric|min:1|max:500',
        ]);

        $donors = $this->matchingService->findMatchingDonors(
            $validated['blood_type_id'],
            $validated['latitude'],
            $validated['longitude'],
            $validated['radius'] ?? 50
        );

        return response()->json([
            'success' => true,
            'message' => 'Nearby donors retrieved successfully',
            'data' => DonorResource::collection($donors),
            'meta' => [
                'total_found' => $donors->count(),
                'search_radius_km' => $validated['radius'] ?? 50,
            ],
        ]);
    }
}