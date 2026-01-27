import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { ShieldCheck, Plus, Trash2, Key, Info, ChevronDown } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { store, destroy, update } from '@/routes/roles';

interface Permission {
    id: number;
    name: string;
}

interface Role {
    id: number;
    name: string;
    permissions: Permission[];
}

interface Props {
    roles: Role[];
    all_permissions: Permission[];
}

const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Roles', href: '/roles' },
];

// Grupos de permisos temáticos para mejor UX
const PERMISSION_GROUPS: Record<string, string[]> = {
    'Dashboard': [
        'ver dashboard',
    ],
    'Productos': [
        'ver productos',
        'crear productos',
        'editar productos',
        'eliminar productos',
    ],
    'Sucursales': [
        'ver sucursales',
        'crear sucursales',
        'editar sucursales',
        'eliminar sucursales',
    ],
    'Inventarios': [
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
    'Ventas y Pedidos': [
        'ver ventas',
        'crear ventas',
        'editar ventas',
        'eliminar ventas',
        'ver cuadernos',
        'crear cuadernos',
        'editar cuadernos',
    ],
    'Reportes': [
        'ver reportes',
        'exportar reportes',
    ],
    'Usuarios y Seguridad': [
        'ver usuarios',
        'crear usuarios',
        'editar usuarios',
        'eliminar usuarios',
        'ver roles',
        'crear roles',
        'asignar permisos',
        'editar roles',
    ],
};

export default function Index({ roles, all_permissions }: Props) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
        'Dashboard': true,
        'Productos': true,
        'Inventarios': true,
        'Ventas y Pedidos': true,
    });

    const { data, setData, post, processing, reset, errors } = useForm({
        name: '',
    });

    const { data: permData, setData: setPermData, patch: patchPerms, processing: processingPerms } = useForm({
        permissions: [] as string[],
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(store().url, {
            onSuccess: () => {
                setIsDialogOpen(false);
                reset();
                toast.success('Rol creado correctamente');
            },
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Estás seguro de eliminar este rol?')) {
            const roleDestroy = destroy(id.toString());
            post(roleDestroy.url, {
                _method: 'delete',
                onSuccess: () => toast.success('Rol eliminado'),
            } as any);
        }
    };

    const openPermissionDialog = (role: Role) => {
        setSelectedRole(role);
        setPermData('permissions', role.permissions.map(p => p.name));
        setIsPermissionDialogOpen(true);
    };

    const handlePermissionSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRole) return;

        patchPerms(update(selectedRole.id.toString()).url, {
            onSuccess: () => {
                setIsPermissionDialogOpen(false);
                toast.success('Permisos actualizados correctamente');
            },
        });
    };

    const togglePermission = (permissionName: string) => {
        const current = [...permData.permissions];
        const index = current.indexOf(permissionName);
        if (index > -1) {
            current.splice(index, 1);
        } else {
            current.push(permissionName);
        }
        setPermData('permissions', current);
    };

    const toggleGroup = (groupName: string) => {
        setExpandedGroups(prev => ({
            ...prev,
            [groupName]: !prev[groupName]
        }));
    };

    const getPermissionCountByGroup = (groupName: string, permissions: Permission[]): { assigned: number; total: number } => {
        const groupPerms = PERMISSION_GROUPS[groupName] || [];
        const total = groupPerms.length;
        const assigned = groupPerms.filter(p => permissions.some(perm => perm.name === p)).length;
        return { assigned, total };
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Roles y Permisos" />
            <div className="flex flex-1 flex-col gap-6 p-6 overflow-y-auto">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Roles y Permisos</h1>
                        <p className="text-muted-foreground mt-1 text-sm flex items-center gap-1">
                            <Info className="h-4 w-4" /> Administra los niveles de acceso y permisos de cada rol.
                        </p>
                    </div>

                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="shadow-sm">
                                <Plus className="mr-2 h-4 w-4" />
                                Nuevo Rol
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Crear Nuevo Rol</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={submit} className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Nombre del Rol</label>
                                    <Input
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="ej: supervisor"
                                        autoFocus
                                    />
                                    {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                                </div>
                                <Button type="submit" className="w-full" disabled={processing}>
                                    {processing ? 'Guardando...' : 'Guardar Rol'}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid gap-6">
                    <Card className="border-none shadow-sm overflow-hidden">
                        <CardHeader className="bg-muted/30 pb-4">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5 text-primary" />
                                Roles del Sistema
                            </CardTitle>
                            <CardDescription>
                                Los roles definen grupos de permisos para los usuarios.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-muted/10">
                                    <TableRow>
                                        <TableHead className="w-[80px] pl-6">ID</TableHead>
                                        <TableHead>Nombre</TableHead>
                                        <TableHead>Permisos Asignados</TableHead>
                                        <TableHead className="text-right pr-6">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {roles.map((role) => (
                                        <TableRow key={role.id} className="group transition-colors hover:bg-muted/10">
                                            <TableCell className="pl-6 text-muted-foreground">{role.id}</TableCell>
                                            <TableCell className="font-semibold capitalize">
                                                {role.name}
                                                {role.name === 'admin' && (
                                                    <span className="ml-2 text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-bold uppercase">Sistema</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {role.permissions.slice(0, 5).map(p => (
                                                        <span key={p.id} className="text-[10px] bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded opacity-80">
                                                            {p.name}
                                                        </span>
                                                    ))}
                                                    {role.permissions.length > 5 && (
                                                        <span className="text-[10px] font-medium text-muted-foreground flex items-center ml-1">
                                                            +{role.permissions.length - 5} más
                                                        </span>
                                                    )}
                                                    {role.permissions.length === 0 && (
                                                        <span className="text-xs text-muted-foreground italic">Sin permisos asignados</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right pr-6">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 px-3 text-xs gap-1.5"
                                                        onClick={() => openPermissionDialog(role)}
                                                    >
                                                        <Key className="h-3.5 w-3.5" />
                                                        Gestionar Permisos
                                                    </Button>

                                                    {role.name !== 'admin' && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-destructive opacity-50 group-hover:opacity-100 transition-opacity"
                                                            onClick={() => handleDelete(role.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                {/* Modal de Gestión de Permisos */}
                <Dialog open={isPermissionDialogOpen} onOpenChange={setIsPermissionDialogOpen}>
                    <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
                        <DialogHeader className="p-6 border-b">
                            <DialogTitle className="flex items-center gap-2">
                                <Key className="h-5 w-5 text-primary" />
                                Gestionar Permisos: <span className="capitalize text-primary italic font-serif">{selectedRole?.name}</span>
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handlePermissionSubmit} className="flex flex-col flex-1 overflow-hidden">
                            <div className="p-6 overflow-y-auto flex-1">
                                {selectedRole?.name === 'admin' && (
                                    <div className="mb-6 p-3 bg-primary/10 border border-primary/20 rounded-lg text-sm text-primary flex items-start gap-3">
                                        <Info className="h-5 w-5 shrink-0 mt-0.5" />
                                        <p>El rol <strong>Administrador</strong> tiene acceso completo a todo el sistema por defecto. Los cambios aquí pueden ser restrictivos.</p>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    {Object.entries(PERMISSION_GROUPS).map(([groupName, groupPermissions]) => {
                                        const isExpanded = expandedGroups[groupName] !== false;
                                        const { assigned, total } = getPermissionCountByGroup(groupName, selectedRole?.permissions || []);

                                        return (
                                            <div key={groupName} className="border rounded-lg overflow-hidden">
                                                <button
                                                    type="button"
                                                    onClick={() => toggleGroup(groupName)}
                                                    className="w-full flex items-center justify-between p-4 bg-muted/50 hover:bg-muted/70 transition-colors"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <ChevronDown
                                                            className={`h-5 w-5 text-muted-foreground transition-transform ${!isExpanded ? '-rotate-90' : ''}`}
                                                        />
                                                        <span className="font-semibold text-sm">{groupName}</span>
                                                        <span className="text-xs text-muted-foreground ml-2">
                                                            {assigned}/{total}
                                                        </span>
                                                    </div>
                                                    <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-primary transition-all"
                                                            style={{ width: `${(assigned / total) * 100}%` }}
                                                        />
                                                    </div>
                                                </button>

                                                {isExpanded && (
                                                    <div className="p-4 bg-background space-y-3 border-t">
                                                        {groupPermissions.map((permissionName) => {
                                                            const permission = all_permissions.find(p => p.name === permissionName);
                                                            if (!permission) return null;

                                                            return (
                                                                <div key={permission.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/30 transition-colors">
                                                                    <Checkbox
                                                                        id={`perm-${permission.id}`}
                                                                        checked={permData.permissions.includes(permission.name)}
                                                                        onCheckedChange={() => togglePermission(permission.name)}
                                                                        className="border-primary/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                                                    />
                                                                    <label
                                                                        htmlFor={`perm-${permission.id}`}
                                                                        className="text-sm font-medium leading-none cursor-pointer select-none flex-1"
                                                                    >
                                                                        {permission.name}
                                                                    </label>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            <DialogFooter className="p-6 border-top bg-muted/20">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsPermissionDialogOpen(false)}
                                    className="h-10"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    className="h-10 px-8"
                                    disabled={processingPerms}
                                >
                                    {processingPerms ? 'Guardando...' : 'Sincronizar Permisos'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
