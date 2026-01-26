<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // create permissions
        $permissions = [
            'ver dashboard',
            'ver productos', 'crear productos', 'editar productos', 'eliminar productos',
            'ver sucursales', 'crear sucursales', 'editar sucursales', 'eliminar sucursales',
            'ver inventarios', 'crear inventarios', 'editar inventarios', 'eliminar inventarios',
            'ver ventas', 'crear ventas',
            'ver usuarios', 'crear usuarios', 'editar usuarios', 'eliminar usuarios',
            'ver roles', 'asignar permisos',
        ];

        foreach ($permissions as $permission) {
            \Spatie\Permission\Models\Permission::findOrCreate($permission);
        }

        // create roles and assign existing permissions
        $roleAdmin = \Spatie\Permission\Models\Role::findOrCreate('admin');
        $roleAdmin->syncPermissions(\Spatie\Permission\Models\Permission::all());

        $roleVendedor = \Spatie\Permission\Models\Role::findOrCreate('vendedor');
        $roleVendedor->syncPermissions([
            'ver dashboard',
            'ver productos',
            'ver inventarios',
            'ver ventas',
            'crear ventas',
        ]);

        // create a default admin user if none exists
        if (\App\Models\User::count() === 0) {
            $user = \App\Models\User::create([
                'name' => 'Admin User',
                'email' => 'admin@nexus.com',
                'password' => \Illuminate\Support\Facades\Hash::make('password'),
                'sucursal_id' => \App\Models\Sucursale::first()?->id ?? 1,
            ]);
            $user->assignRole($roleAdmin);
        }
    }
}
