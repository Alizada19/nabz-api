<?php

namespace Tests\Feature;

use App\Models\BloodType;
use App\Models\DonorProfile;
use App\Models\User;
use App\Services\DonorMatchingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DonorMatchingTest extends TestCase
{
    use RefreshDatabase;

    protected DonorMatchingService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\BloodTypeSeeder::class);
        $this->service = app(DonorMatchingService::class);
    }

    public function test_finds_nearby_compatible_donors(): void
    {
        $bloodType = BloodType::where('name', 'A+')->first();

        // Create donor with compatible blood type within range
        $donor = User::factory()->create([
            'role' => 'donor',
            'latitude' => 3.1390,
            'longitude' => 101.6869,
            'is_available' => true,
        ]);

        DonorProfile::create([
            'user_id' => $donor->id,
            'blood_type_id' => BloodType::where('name', 'A+')->first()->id,
            'available_status' => true,
        ]);

        // Search near the donor's location
        $donors = $this->service->findMatchingDonors(
            $bloodType->id,
            3.1500, // Slightly different coordinates
            101.7000,
            50 // 50 km radius
        );

        $this->assertGreaterThan(0, $donors->count());
    }

    public function test_excludes_unavailable_donors(): void
    {
        $bloodType = BloodType::where('name', 'O+')->first();

        // Create unavailable donor
        $donor = User::factory()->create([
            'role' => 'donor',
            'latitude' => 3.1390,
            'longitude' => 101.6869,
            'is_available' => false,
        ]);

        DonorProfile::create([
            'user_id' => $donor->id,
            'blood_type_id' => $bloodType->id,
            'available_status' => false,
        ]);

        $donors = $this->service->findMatchingDonors(
            $bloodType->id,
            3.1390,
            101.6869,
            50
        );

        $this->assertCount(0, $donors);
    }

    public function test_calculate_distance(): void
    {
        // Distance between Kuala Lumpur and Petaling Jaya (approximately 10-15 km)
        $distance = $this->service->calculateDistance(
            3.1390, // KL latitude
            101.6869, // KL longitude
            3.1073, // PJ latitude
            101.6067 // PJ longitude
        );

        $this->assertGreaterThan(5, $distance);
        $this->assertLessThan(20, $distance);
    }
}