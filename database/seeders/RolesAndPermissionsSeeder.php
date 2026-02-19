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

        // Definición de permisos por grupos temáticos
        $permissionGroups = [
            'Dashboard' => [
                'ver dashboard',
            ],
            'Productos' => [
                'ver productos',
                'crear productos',
                'editar productos',
                'eliminar productos',
            ],
            'Sucursales' => [
                'ver sucursales',
                'crear sucursales',
                'editar sucursales',
                'eliminar sucursales',
            ],
            'Inventarios' => [
                'ver inventarios',
                'crear inventarios',
                'editar inventarios',
                'eliminar inventarios',
                'ver solicitudes',
                'crear solicitudes',
                'confirmar solicitudes',
                'ver envios',
                'crear envios',
            ],
            'Ventas y Pedidos' => [
                'ver ventas',
                'crear ventas',
                'editar ventas',
                'eliminar ventas',
                'ver cuadernos',
                'crear cuadernos',
                'editar cuadernos',
                'gestionar reservas',
            ],
            'Compras' => [
                'ver compras',
                'registrar compra',
            ],
            'Reportes' => [
                'ver reportes',
                'exportar reportes',
            ],
            'Usuarios y Seguridad' => [
                'ver usuarios',
                'crear usuarios',
                'editar usuarios',
                'eliminar usuarios',
                'ver roles',
                'crear roles',
                'asignar permisos',
                'editar roles',
            ],
            'Herramientas' => [
                'ver whatsapp',
            ],
            'Cajas' => [
                'ver cajas',
                'abrir cajas',
                'cerrar cajas',
                'ver reportes cajas',
            ],
        ];

        // Crear todos los permisos
        $allPermissions = [];
        foreach ($permissionGroups as $group => $permissions) {
            foreach ($permissions as $permission) {
                $allPermissions[] = $permission;
                \Spatie\Permission\Models\Permission::findOrCreate($permission);
            }
        }

        // Crear roles y asignar permisos
        $roleAdmin = \Spatie\Permission\Models\Role::findOrCreate('admin');
        $roleAdmin->syncPermissions(\Spatie\Permission\Models\Permission::all());

        // Vendedor: puede ver y crear ventas, ver productos e inventarios
        $roleVendedor = \Spatie\Permission\Models\Role::findOrCreate('vendedor');
        $roleVendedor->syncPermissions([
            'ver dashboard',
            'ver productos',
            'ver inventarios',
            'ver ventas',
            'crear ventas',
            'ver cuadernos',
            'crear cuadernos',
            'ver cajas',
            'abrir cajas',
            'cerrar cajas',
        ]);

        // Almacenero: maneja inventarios y solicitudes
        $roleAlmacenero = \Spatie\Permission\Models\Role::findOrCreate('almacenero');
        $roleAlmacenero->syncPermissions([
            'ver dashboard',
            'ver productos',
            'ver inventarios',
            'crear inventarios',
            'editar inventarios',
            'ver solicitudes',
            'crear solicitudes',
            'confirmar solicitudes',
            'ver envios',
            'crear envios',
        ]);

        // Jefe de Sucursal: acceso completo a su sucursal
        $roleJefeSucursal = \Spatie\Permission\Models\Role::findOrCreate('jefe_sucursal');
        $roleJefeSucursal->syncPermissions([
            'ver dashboard',
            'ver productos',
            'ver sucursales',
            'ver inventarios',
            'crear inventarios',
            'editar inventarios',
            'ver ventas',
            'crear ventas',
            'ver usuarios',
            'ver cuadernos',
            'crear cuadernos',
            'editar cuadernos',
            'ver reportes',
            'exportar reportes',
            'ver cajas',
            'abrir cajas',
            'cerrar cajas',
            'ver reportes cajas',
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

        // Guardar grupos de permisos en configuración para uso en frontend
        config(['permission_groups' => $permissionGroups]);
    }
}
