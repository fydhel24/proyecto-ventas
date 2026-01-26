import { usePage } from '@inertiajs/react';

export function usePermissions() {
    const { auth } = usePage().props as any;
    const userPermissions = auth.user?.permissions || [];
    const userRoles = auth.user?.roles || [];

    const hasPermission = (permission: string) => {
        if (userRoles.includes('admin')) return true;
        return userPermissions.includes(permission);
    };

    const hasRole = (role: string) => {
        return userRoles.includes(role);
    };

    const canAny = (permissions: string[]) => {
        if (userRoles.includes('admin')) return true;
        return permissions.some(p => userPermissions.includes(p));
    };

    return { hasPermission, hasRole, canAny };
}
