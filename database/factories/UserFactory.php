<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserFactory extends Factory
{
    protected static ?string $password;

    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'phone' => fake()->unique()->phoneNumber(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'role' => fake()->randomElement(['donor', 'seeker']),
            'latitude' => fake()->latitude(3.0, 3.3),
            'longitude' => fake()->longitude(101.5, 101.8),
            'location' => fake()->city(),
            'is_available' => true,
            'remember_token' => Str::random(10),
        ];
    }

    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    public function donor(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'donor',
        ]);
    }

    public function seeker(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'seeker',
        ]);
    }
}