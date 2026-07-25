<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_list_users(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        User::factory()->count(5)->create(['role' => 'seeker']);

        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/users');

        $response->assertStatus(200)
            ->assertJsonCount(6, 'data');
    }

    public function test_admin_can_update_user(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create([
            'name' => 'Old Name',
            'role' => 'seeker'
        ]);

        Sanctum::actingAs($admin);

        $response = $this->putJson("/api/users/{$user->id}", [
            'name' => 'New Name',
            'email' => 'newemail@example.com',
            'phone' => '+199998888',
            'role' => 'admin',
            'location' => 'Detroit, MI'
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'New Name',
            'role' => 'admin'
        ]);
    }

    public function test_admin_can_delete_user(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create(['role' => 'seeker']);

        Sanctum::actingAs($admin);

        $response = $this->deleteJson("/api/users/{$user->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('users', [
            'id' => $user->id
        ]);
    }
}
