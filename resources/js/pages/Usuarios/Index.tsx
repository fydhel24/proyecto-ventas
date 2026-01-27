import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { Users, Plus, Trash2, Edit } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { store, update, destroy } from '@/routes/usuarios';

interface User {
    id: number;
    name: string;
    email: string;
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

interface Props {
    users: User[];
    sucursales: Sucursal[];
    roles: Role[];
}

const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Usuarios', href: '/usuarios' },
];

export default function Index({ users, sucursales, roles }: Props) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const { data, setData, post, patch, processing, reset, errors } = useForm({
        name: '',
        email: '',
        password: '',
        sucursal_id: '',
        role: '',
    });

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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Usuarios" />
            <div className="flex flex-1 flex-col gap-6 p-6 overflow-y-auto">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Gestión de Usuarios</h1>
                        <p className="text-muted-foreground mt-1">Administra los accesos y sucursales del personal</p>
                    </div>

                    <Button onClick={openCreate}>
                        <Plus className="mr-2 h-4 w-4" />
                        Nuevo Usuario
                    </Button>
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
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">{user.name}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>{user.sucursal?.nombre_sucursal || 'Sin sucursal'}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="capitalize">
                                                {user.roles[0]?.name || 'Sin rol'}
                                            </Badge>
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
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
