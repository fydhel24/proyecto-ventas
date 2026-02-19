import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import {
    Building,
    Plus,
    Search,
    Edit2,
    Trash2,
    MoreVertical,
    Mail,
    Phone,
    MapPin
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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

export default function Proveedores({ proveedores, filters }: any) {
    const [search, setSearch] = useState(filters.search || '');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentProveedor, setCurrentProveedor] = useState<any>(null);
    const [formData, setFormData] = useState({
        nombre: '',
        nit: '',
        telefono: '',
        email: '',
        direccion: ''
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/proveedores', { search }, { preserveState: true });
    };

    const openModal = (proveedor: any = null) => {
        if (proveedor) {
            setCurrentProveedor(proveedor);
            setFormData({
                nombre: proveedor.nombre,
                nit: proveedor.nit,
                telefono: proveedor.telefono || '',
                email: proveedor.email || '',
                direccion: proveedor.direccion || ''
            });
        } else {
            setCurrentProveedor(null);
            setFormData({ nombre: '', nit: '', telefono: '', email: '', direccion: '' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (currentProveedor) {
            router.put(`/proveedores/${currentProveedor.id}`, formData, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    toast.success("Proveedor actualizado");
                }
            });
        } else {
            router.post('/proveedores', formData, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    toast.success("Proveedor registrado");
                }
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm("¿Estás seguro de eliminar este proveedor?")) {
            router.delete(`/proveedores/${id}`, {
                onSuccess: () => toast.success("Proveedor eliminado")
            });
        }
    };

    return (
        <AppLayout>
            <Head title="Proveedores - Nexus Farma" />

            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Gestión de Proveedores</h1>
                        <p className="text-slate-500">Administra tus proveedores y laboratorios externos.</p>
                    </div>
                    <Button className="bg-[#16A34A] hover:bg-[#15803d]" onClick={() => openModal()}>
                        <Plus className="w-4 h-4 mr-2" />
                        Nueva Distribuidora
                    </Button>
                </div>

                <Card className="border-none shadow-sm">
                    <CardHeader className="p-4 border-b">
                        <form onSubmit={handleSearch} className="flex gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                <Input
                                    placeholder="Buscar por nombre o NIT..."
                                    className="pl-10 h-11"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <Button type="submit" variant="secondary" className="h-11">Buscar</Button>
                        </form>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nombre / Razón Social</TableHead>
                                    <TableHead>NIT</TableHead>
                                    <TableHead>Contacto</TableHead>
                                    <TableHead>Dirección</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {proveedores.data.map((prov: any) => (
                                    <TableRow key={prov.id} className="hover:bg-slate-50/50">
                                        <TableCell className="font-medium">{prov.nombre}</TableCell>
                                        <TableCell>{prov.nit}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col text-xs space-y-1">
                                                {prov.telefono && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {prov.telefono}</span>}
                                                {prov.email && <span className="flex items-center gap-1 text-slate-400"><Mail className="w-3 h-3" /> {prov.email}</span>}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1 text-sm text-slate-500">
                                                <MapPin className="w-3 h-3 flex-shrink-0" />
                                                <span className="truncate max-w-[200px]">{prov.direccion || 'S/D'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => openModal(prov)}>
                                                        <Edit2 className="w-4 h-4 mr-2" /> Editar
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(prov.id)}>
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
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{currentProveedor ? 'Editar Distribuidora' : 'Registrar Distribuidora'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold flex items-center gap-2">
                                <Building className="w-4 h-4 text-[#16A34A]" />
                                Nombre / Razón Social
                            </label>
                            <Input
                                value={formData.nombre}
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                required
                                className="h-11"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold">NIT</label>
                                <Input
                                    value={formData.nit}
                                    onChange={(e) => setFormData({ ...formData, nit: e.target.value })}
                                    required
                                    className="h-11"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold">Teléfono</label>
                                <Input
                                    value={formData.telefono}
                                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                    className="h-11"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold">Correo Electrónico</label>
                            <Input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="h-11"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold">Dirección Fiscal / Oficina</label>
                            <Input
                                value={formData.direccion}
                                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                                className="h-11"
                            />
                        </div>
                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="h-11 px-6">Cancelar</Button>
                            <Button type="submit" className="bg-[#16A34A] hover:bg-[#15803d] h-11 px-8 font-bold text-white">
                                {currentProveedor ? 'Actualizar Datos' : 'Registrar Proveedor'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
