import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import {
    Users,
    Plus,
    Search,
    Edit2,
    Trash2,
    MoreVertical,
    UserPlus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';

export default function Clientes({ clientes, filters }: any) {
    const [search, setSearch] = useState(filters.search || '');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentCliente, setCurrentCliente] = useState<any>(null);
    const [formData, setFormData] = useState({
        nombre: '',
        nit_ci: '',
        telefono: '',
        direccion: ''
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/clientes', { search }, { preserveState: true });
    };

    const openModal = (cliente: any = null) => {
        if (cliente) {
            setCurrentCliente(cliente);
            setFormData({
                nombre: cliente.nombre,
                nit_ci: cliente.nit_ci,
                telefono: cliente.telefono || '',
                direccion: cliente.direccion || ''
            });
        } else {
            setCurrentCliente(null);
            setFormData({ nombre: '', nit_ci: '', telefono: '', direccion: '' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (currentCliente) {
            router.put(`/clientes/${currentCliente.id}`, formData, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    toast.success("Cliente actualizado");
                }
            });
        } else {
            router.post('/clientes', formData, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    toast.success("Cliente registrado");
                }
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm("¿Estás seguro de eliminar este cliente?")) {
            router.delete(`/clientes/${id}`, {
                onSuccess: () => toast.success("Cliente eliminado")
            });
        }
    };

    return (
        <AppLayout>
            <Head title="Clientes - Nexus Farma" />

            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Gestión de Clientes</h1>
                        <p className="text-slate-500">Administra la base de datos de tus clientes habituales.</p>
                    </div>
                    <Button className="bg-[#16A34A] hover:bg-[#15803d]" onClick={() => openModal()}>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Nuevo Cliente
                    </Button>
                </div>

                <Card className="border-none shadow-sm">
                    <CardHeader className="p-4 border-b">
                        <form onSubmit={handleSearch} className="flex gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                <Input
                                    placeholder="Buscar por nombre o CI/NIT..."
                                    className="pl-10"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <Button type="submit" variant="secondary">Buscar</Button>
                        </form>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nombre / Razón Social</TableHead>
                                    <TableHead>CI / NIT</TableHead>
                                    <TableHead>Teléfono</TableHead>
                                    <TableHead>Dirección</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {clientes.data.map((cliente: any) => (
                                    <TableRow key={cliente.id}>
                                        <TableCell className="font-medium">{cliente.nombre}</TableCell>
                                        <TableCell>{cliente.nit_ci}</TableCell>
                                        <TableCell>{cliente.telefono || 'N/A'}</TableCell>
                                        <TableCell>{cliente.direccion || 'N/A'}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => openModal(cliente)}>
                                                        <Edit2 className="w-4 h-4 mr-2" /> Editar
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(cliente.id)}>
                                                        <Trash2 className="w-4 h-4 mr-2" /> Eliminar
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{currentCliente ? 'Editar Cliente' : 'Nuevo Cliente'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Nombre Completo / Razón Social</label>
                            <Input
                                value={formData.nombre}
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">CI / NIT</label>
                            <Input
                                value={formData.nit_ci}
                                onChange={(e) => setFormData({ ...formData, nit_ci: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Teléfono</label>
                            <Input
                                value={formData.telefono}
                                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Dirección</label>
                            <Input
                                value={formData.direccion}
                                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                            <Button type="submit" className="bg-[#16A34A] hover:bg-[#15803d]">Guardar</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
