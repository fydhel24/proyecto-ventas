<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Run the roles and permissions seeder first
        $this->call(RolesAndPermissionsSeeder::class);

        // Run pharmacy seeder
        $this->call(PharmacySeeder::class);

        // Create default admin user
        $user = User::firstOrCreate(
            ['email' => 'admin@gmail.com'],
            [
                'name' => 'admin',
                'password' => 'admin@gmail.com',
                'email_verified_at' => now(),
            ]
        );

        // Assign admin role if user doesn't already have it
        if (!$user->hasRole('admin')) {
            $adminRole = Role::where('name', 'admin')->first();
            if ($adminRole) {
                $user->assignRole($adminRole);
            }
        }
    }
}
