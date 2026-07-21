<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BloodTypeSeeder extends Seeder
{
    public function run(): void
    {
        $bloodTypes = [
            ['name' => 'O-'],
            ['name' => 'O+'],
            ['name' => 'A-'],
            ['name' => 'A+'],
            ['name' => 'B-'],
            ['name' => 'B+'],
            ['name' => 'AB-'],
            ['name' => 'AB+'],
        ];

        foreach ($bloodTypes as $type) {
            DB::table('blood_types')->insert([
                'name' => $type['name'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}