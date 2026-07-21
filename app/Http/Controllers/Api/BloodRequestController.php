<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CreateBloodRequestRequest;
use App\Http\Requests\UpdateBloodRequestStatusRequest;
use App\Http\Resources\BloodRequestResource;
use App\Models\BloodRequest;
use App\Services\BloodCompatibilityService;
use App\Services\DonorMatchingService;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BloodRequestController extends Controller
{
    public function __construct(
        protected DonorMatchingService $matchingService,
        protected NotificationService $notificationService,
        protected BloodCompatibilityService $compatibilityService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $requests = BloodRequest::with(['bloodType', 'seeker'])
            ->latest()
            ->paginate(15);

        return response()->json([
            'success' => true,
            'message' => 'Blood requests retrieved successfully',
            'data' => BloodRequestResource::collection($requests),
            'meta' => [
                'current_page' => $requests->currentPage(),
                'last_page' => $requests->lastPage(),
                'per_page' => $requests->perPage(),
                'total' => $requests->total(),
            ],
        ]);
    }

    public function myRequests(Request $request): JsonResponse
    {
        $requests = $request->user()
            ->bloodRequests()
            ->with('bloodType')
            ->latest()
            ->paginate(15);

        return response()->json([
            'success' => true,
            'message' => 'Your blood requests retrieved successfully',
            'data' => BloodRequestResource::collection($requests),
            'meta' => [
                'current_page' => $requests->currentPage(),
                'last_page' => $requests->lastPage(),
                'per_page' => $requests->perPage(),
                'total' => $requests->total(),
            ],
        ]);
    }

    public function store(CreateBloodRequestRequest $request): JsonResponse
    {
        $bloodRequest = BloodRequest::create([
            'seeker_id' => $request->user()->id,
            'blood_type_id' => $request->blood_type_id,
            'hospital_name' => $request->hospital_name,
            'hospital_address' => $request->hospital_address,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'units_required' => $request->units_required,
            'urgency_level' => $request->urgency_level,
            'notes' => $request->notes,
        ]);

        $bloodRequest->load('bloodType');

        // Find matching donors and send notifications
        $matchedDonors = $this->matchingService->findMatchingDonors(
            $bloodRequest->blood_type_id,
            $bloodRequest->latitude,
            $bloodRequest->longitude,
            $request->radius ?? 50
        );

        if ($matchedDonors->isNotEmpty()) {
            $this->notificationService->notifyDonorsAboutRequest($bloodRequest, $matchedDonors);
        }

        return response()->json([
            'success' => true,
            'message' => 'Blood request created successfully',
            'data' => [
                'request' => new BloodRequestResource($bloodRequest),
                'matched_donors_count' => $matchedDonors->count(),
            ],
        ], 201);
    }

    public function show(BloodRequest $bloodRequest): JsonResponse
    {
        $bloodRequest->load(['bloodType', 'seeker']);

        return response()->json([
            'success' => true,
            'message' => 'Blood request retrieved successfully',
            'data' => new BloodRequestResource($bloodRequest),
        ]);
    }

    public function updateStatus(UpdateBloodRequestStatusRequest $request, BloodRequest $bloodRequest): JsonResponse
    {
        if ($bloodRequest->seeker_id !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to update this request',
                'data' => null,
            ], 403);
        }

        $bloodRequest->update(['status' => $request->status]);

        return response()->json([
            'success' => true,
            'message' => 'Blood request status updated successfully',
            'data' => new BloodRequestResource($bloodRequest->fresh(['bloodType', 'seeker'])),
        ]);
    }
}