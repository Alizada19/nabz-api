<?php

namespace Tests\Feature;

use App\Models\BloodType;
use App\Services\BloodCompatibilityService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BloodCompatibilityTest extends TestCase
{
    use RefreshDatabase;

    protected BloodCompatibilityService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\BloodTypeSeeder::class);
        $this->service = app(BloodCompatibilityService::class);
    }

    public function test_o_negative_can_receive_from_o_negative_only(): void
    {
        $bloodType = BloodType::where('name', 'O-')->first();
        $compatible = $this->service->getCompatibleDonorTypes($bloodType->id);

        $this->assertCount(1, $compatible);
        $this->assertEquals('O-', $compatible->first()->name);
    }

    public function test_ab_positive_can_receive_from_all_types(): void
    {
        $bloodType = BloodType::where('name', 'AB+')->first();
        $compatible = $this->service->getCompatibleDonorTypes($bloodType->id);

        $this->assertCount(8, $compatible);
        $this->assertTrue($compatible->pluck('name')->contains('O-'));
        $this->assertTrue($compatible->pluck('name')->contains('AB+'));
    }

    public function test_a_positive_compatibility(): void
    {
        $bloodType = BloodType::where('name', 'A+')->first();
        $compatible = $this->service->getCompatibleDonorTypes($bloodType->id);

        $expectedTypes = ['O-', 'O+', 'A-', 'A+'];
        $this->assertCount(4, $compatible);

        foreach ($expectedTypes as $type) {
            $this->assertTrue($compatible->pluck('name')->contains($type));
        }
    }

    public function test_is_compatible_method(): void
    {
        $this->assertTrue($this->service->isCompatible('O-', 'AB+'));
        $this->assertTrue($this->service->isCompatible('A+', 'AB+'));
        $this->assertFalse($this->service->isCompatible('B+', 'A+'));
        $this->assertFalse($this->service->isCompatible('AB+', 'O-'));
    }
}