<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BloodRequestController;
use App\Http\Controllers\Api\DonorController;
use App\Http\Controllers\Api\DonorProfileController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\DashboardController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Authentication
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', [AuthController::class, 'profile']);

    // Donor Profile
    Route::get('/donor-profile', [DonorProfileController::class, 'show']);
    Route::put('/donor-profile', [DonorProfileController::class, 'update']);

    // Blood Requests
    Route::get('/blood-requests', [BloodRequestController::class, 'index']);
    Route::post('/blood-requests', [BloodRequestController::class, 'store']);
    Route::get('/blood-requests/my', [BloodRequestController::class, 'myRequests']);
    Route::get('/blood-requests/{bloodRequest}', [BloodRequestController::class, 'show']);
    Route::patch('/blood-requests/{bloodRequest}/status', [BloodRequestController::class, 'updateStatus']);

    // Donors
    Route::get('/donors/nearby', [DonorController::class, 'nearby']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::patch('/notifications/{notification}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);

    // Dashboard Analytics
    Route::get('/dashboard-stats', [DashboardController::class, 'stats']);
});