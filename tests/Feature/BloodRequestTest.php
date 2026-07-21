<?php

namespace Tests\Feature;

use App\Models\BloodType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BloodRequestTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\BloodTypeSeeder::class);
    }

    public function test_user_can_create_blood_request(): void
    {
        $user = User::factory()->create(['role' => 'seeker']);
        $bloodType = BloodType::first();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/blood-requests', [
                'blood_type_id' => $bloodType->id,
                'hospital_name' => 'General Hospital',
                'hospital_address' => '123 Medical Street',
                'latitude' => 3.1390,
                'longitude' => 101.6869,
                'units_required' => 2,
                'urgency_level' => 'high',
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'request',
                    'matched_donors_count',
                ],
            ]);

        $this->assertDatabaseHas('blood_requests', [
            'seeker_id' => $user->id,
            'hospital_name' => 'General Hospital',
            'urgency_level' => 'high',
        ]);
    }

    public function test_user_can_view_their_requests(): void
    {
        $user = User::factory()->create(['role' => 'seeker']);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/blood-requests/my');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data',
                'meta',
            ]);
    }

    public function test_user_can_update_request_status(): void
    {
        $user = User::factory()->create(['role' => 'seeker']);
        $bloodType = BloodType::first();
        $token = $user->createToken('test-token')->plainTextToken;

        $request = $user->bloodRequests()->create([
            'blood_type_id' => $bloodType->id,
            'hospital_name' => 'Test Hospital',
            'hospital_address' => 'Test Address',
            'latitude' => 3.1390,
            'longitude' => 101.6869,
            'units_required' => 1,
            'urgency_level' => 'medium',
            'status' => 'pending',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->patchJson("/api/blood-requests/{$request->id}/status", [
                'status' => 'completed',
            ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('blood_requests', [
            'id' => $request->id,
            'status' => 'completed',
        ]);
    }
}