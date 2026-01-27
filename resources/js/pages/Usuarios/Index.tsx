import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router } from '@inertiajs/react'; // Import router for manual visits
import { Users, Plus, Trash2, Edit, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { store, update, destroy } from '@/routes/usuarios';
import { debounce } from 'lodash';

interface User {
    id: number;
    name: string;
    email: string;
    status: boolean;
    sucursal?: { id: number; nombre_sucursal: string };
    roles: { name: string }[];
}

interface Sucursal {
    id: number;
    nombre_sucursal: string;
}

interface Role {
    id: number;
    name: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Props {
    users: {
        data: User[];
        links: PaginationLink[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: {
        search?: string;
    };
    sucursales: Sucursal[];
    roles: Role[];
}

const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Usuarios', href: '/usuarios' },
];

export default function Index({ users, filters, sucursales, roles }: Props) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    const { data, setData, post, patch, processing, reset, errors } = useForm({
        name: '',
        email: '',
        password: '',
        sucursal_id: '',
        role: '',
        status: true,
    });

    // Debounced search
    const handleSearch = React.useCallback(
        debounce((term: string) => {
            router.get(
                '/usuarios',
                { search: term },
                { preserveState: true, replace: true }
            );
        }, 300),
        []
    );

    useEffect(() => {
        handleSearch(searchTerm);
    }, [searchTerm, handleSearch]);

    const openCreate = () => {
        setEditingUser(null);
        reset();
        setIsDialogOpen(true);
    };

    const openEdit = (user: User) => {
        setEditingUser(user);
        setData({
            name: user.name,
            email: user.email,
            password: '',
            sucursal_id: user.sucursal?.id.toString() || '',
            role: user.roles[0]?.name || '',
            status: user.status,
        });
        setIsDialogOpen(true);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingUser) {
            patch(update({ usuario: editingUser.id }).url, {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    toast.success('Usuario actualizado');
                },
            });
        } else {
            post(store().url, {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    reset();
                    toast.success('Usuario creado');
                },
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Estás seguro de eliminar este usuario?')) {
            post(destroy(id.toString()).url, {
                _method: 'delete',
                onSuccess: () => toast.success('Usuario eliminado'),
            } as any);
        }
    };

    const toggleStatus = (user: User) => {
        router.put(update({ usuario: user.id }).url, {
            ...user,
            sucursal_id: user.sucursal?.id,
            role: user.roles[0]?.name,
            status: !user.status
        }, {
            preserveScroll: true,
            onSuccess: () => toast.success(`Usuario ${!user.status ? 'activado' : 'desactivado'}`),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Usuarios" />
            <div className="flex flex-1 flex-col gap-6 p-6 overflow-y-auto">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Gestión de Usuarios</h1>
                        <p className="text-muted-foreground mt-1">Administra los accesos y sucursales del personal</p>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-64">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar usuarios..."
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button onClick={openCreate}>
                            <Plus className="mr-2 h-4 w-4" />
                            Nuevo
                        </Button>
                    </div>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>{editingUser ? 'Editar Usuario' : 'Crear Usuario'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={submit} className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Nombre Completo</label>
                                <Input
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="ej: Juan Pérez"
                                />
                                {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email</label>
                                <Input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="juan@ejemplo.com"
                                />
                                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Contraseña {editingUser && '(dejar en blanco para no cambiar)'}</label>
                                <Input
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                />
                                {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Sucursal</label>
                                    <Select value={data.sucursal_id} onValueChange={(val) => setData('sucursal_id', val)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccione" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {sucursales.map((s) => (
                                                <SelectItem key={s.id} value={s.id.toString()}>
                                                    {s.nombre_sucursal}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.sucursal_id && <p className="text-xs text-red-500">{errors.sucursal_id}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Rol</label>
                                    <Select value={data.role} onValueChange={(val) => setData('role', val)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccione" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {roles.map((r) => (
                                                <SelectItem key={r.id} value={r.name}>
                                                    {r.name.toUpperCase()}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.role && <p className="text-xs text-red-500">{errors.role}</p>}
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="status-mode"
                                    checked={data.status}
                                    onCheckedChange={(checked) => setData('status', checked)}
                                />
                                <label htmlFor="status-mode" className="text-sm font-medium">
                                    Usuario Activo
                                </label>
                            </div>
                            <Button type="submit" className="w-full mt-4" disabled={processing}>
                                {processing ? 'Procesando...' : (editingUser ? 'Actualizar' : 'Crear Usuario')}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Listado de Personal
                            <Badge variant="secondary" className="ml-2">
                                {users.total} Usuarios
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nombre</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Sucursal</TableHead>
                                    <TableHead>Rol</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                                            No se encontraron usuarios
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    users.data.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium">{user.name}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>{user.sucursal?.nombre_sucursal || 'Sin sucursal'}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="capitalize">
                                                    {user.roles[0]?.name || 'Sin rol'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Switch
                                                        checked={user.status}
                                                        onCheckedChange={() => toggleStatus(user)}
                                                    />
                                                    <span className={`text-xs ${user.status ? 'text-green-500' : 'text-muted-foreground'}`}>
                                                        {user.status ? 'Activo' : 'Inactivo'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => openEdit(user)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive"
                                                    onClick={() => handleDelete(user.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        {/* Pagination */}
                        <div className="flex items-center justify-between space-x-2 py-4">
                            <div className="text-sm text-muted-foreground">
                                Página {users.current_page} de {users.last_page}
                            </div>
                            <div className="space-x-2 flex">
                                {users.links.map((link, i) => {
                                    if (link.label.includes('Previous')) {
                                        return (
                                            <Button
                                                key={i}
                                                variant="outline"
                                                size="sm"
                                                onClick={() => link.url && router.get(link.url, { search: searchTerm })}
                                                disabled={!link.url}
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                            </Button>
                                        );
                                    }
                                    if (link.label.includes('Next')) {
                                        return (
                                            <Button
                                                key={i}
                                                variant="outline"
                                                size="sm"
                                                onClick={() => link.url && router.get(link.url, { search: searchTerm })}
                                                disabled={!link.url}
                                            >
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        );
                                    }
                                    return null; // For simplicty only prev/next, or implement full numbers if needed
                                })}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
