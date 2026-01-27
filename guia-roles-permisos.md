# Guía de Gestión de Roles y Permisos (Nexus)

Esta guía explica cómo administrar el sistema de control de acceso basado en roles (RBAC) utilizando el paquete **Spatie Laravel Permission** integrado con **Inertia.js**.

## 1. Conceptos Básicos

- **Permisos**: Acciones específicas que se pueden realizar (ej: `crear productos`, `ver ventas`).
- **Roles**: Grupos de permisos asignados a usuarios (ej: `admin`, `vendedor`).
- **Control en Frontend**: Uso del hook `usePermissions` para ocultar elementos de la interfaz.
- **Control en Backend**: Uso de middleware en las rutas para proteger los endpoints.

---

## 2. Cómo añadir un nuevo Permiso

### Paso A: Registrar en la Base de Datos
Para que un permiso exista, debe estar en la tabla `permissions`. Puedes añadirlo manualmente o mediante el seeder:

1. Abre `database/seeders/RolesAndPermissionsSeeder.php`.
2. Añade el nuevo permiso al array `$permissions`.
3. Ejecuta: `php artisan db:seed --class=RolesAndPermissionsSeeder`.

### Paso B: Proteger la Ruta (Backend)
En `routes/web.php`, puedes proteger un grupo de rutas:

```php
Route::middleware(['can:nombre del permiso'])->group(function () {
    Route::resource('secreto', SecretoController::class);
});
```

---

## 3. Cómo ocultar elementos en el Sidebar

1. Abre `resources/js/components/app-sidebar.tsx`.
2. Busca la constante `mainNavItems`.
3. Añade la propiedad `permission` a tu objeto:

```tsx
{
    title: 'Mi Nuevo Módulo',
    href: '/nuevo-modulo',
    icon: MyIcon,
    permission: 'ver nuevo modulo', // <--- Este es el nombre del permiso
},
```

---

## 4. Uso del Hook `usePermissions` en Componentes React

Si necesitas controlar la visibilidad de un botón o sección dentro de una página:

```tsx
import { usePermissions } from '@/hooks/use-permissions';

export default function MiComponente() {
    const { hasPermission, hasRole } = usePermissions();

    return (
        <div>
            {hasPermission('crear productos') && (
                <Button>Añadir Producto</Button>
            )}
            
            {hasRole('admin') && (
                <p>Solo el administrador ve esto.</p>
            )}
        </div>
    );
}
```

---

## 5. Gestión desde la Interfaz
Puedes administrar qué permisos tiene cada rol desde el módulo de **Roles** en el sistema:
1. Ve a la sección **Roles**.
2. Haz clic en **Gestionar Permisos** en el rol deseado.
3. Selecciona los permisos y haz clic en **Sincronizar**.

> [!TIP]
> El rol `admin` tiene permiso total por defecto en el hook `usePermissions`. Si deseas cambiar esto, modifica el archivo `resources/js/hooks/use-permissions.ts`.


para hacer un reset con --seeder
php artisan migrate:fresh --seed
