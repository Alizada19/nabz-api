<?php

namespace App\Services;

use App\Models\BloodRequest;
use App\Models\Notification;
use Illuminate\Support\Collection;

class NotificationService
{
    /**
     * Notify donors about a new blood request
     */
    public function notifyDonorsAboutRequest(BloodRequest $request, Collection $donors): void
    {
        $request->load(['bloodType', 'seeker']);

        foreach ($donors as $donor) {
            $distance = isset($donor->distance) ? round($donor->distance, 1) : 'nearby';

            Notification::create([
                'user_id' => $donor->id,
                'title' => 'Emergency Blood Request',
                'message' => sprintf(
                    'A patient needs %s blood at %s (%s km away). Urgency: %s',
                    $request->bloodType->name,
                    $request->hospital_name,
                    is_numeric($distance) ? $distance : $distance,
                    ucfirst($request->urgency_level)
                ),
                'type' => 'blood_request',
                'data' => [
                    'request_id' => $request->id,
                    'blood_type' => $request->bloodType->name,
                    'hospital_name' => $request->hospital_name,
                    'urgency_level' => $request->urgency_level,
                    'distance_km' => $distance,
                ],
            ]);

            // Here you would integrate with Firebase Cloud Messaging
            // to send push notifications to mobile devices
            // $this->sendPushNotification($donor, $title, $message);
        }
    }

    /**
     * Placeholder for Firebase Cloud Messaging integration
     */
    protected function sendPushNotification($user, string $title, string $message): void
    {
        // Implement Firebase Cloud Messaging here
        // This would use the user's FCM token to send push notifications
        // Example:
        // Firebase::messaging()->send([
        //     'token' => $user->fcm_token,
        //     'notification' => [
        //         'title' => $title,
        //         'body' => $message,
        //     ],
        // ]);
    }
}