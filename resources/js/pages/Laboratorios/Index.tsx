import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import {
    Plus,
    Edit2,
    Trash2,
    Factory,
    Beaker
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
import { toast } from 'sonner';

export default function LaboratoriosIndex({ laboratorios }: any) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentLab, setCurrentLab] = useState<any>(null);
    const [nombre_lab, setNombreLab] = useState('');

    const openModal = (lab: any = null) => {
        setCurrentLab(lab);
        setNombreLab(lab ? lab.nombre_lab : '');
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (currentLab) {
            router.put(`/laboratorios/${currentLab.id}`, { nombre_lab }, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    toast.success("Laboratorio actualizado");
                }
            });
        } else {
            router.post('/laboratorios', { nombre_lab }, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    toast.success("Laboratorio registrado");
                }
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm("¿Eliminar este laboratorio?")) {
            router.delete(`/laboratorios/${id}`, {
                onSuccess: () => toast.success("Laboratorio eliminado"),
                onError: (errors) => toast.error(Object.values(errors)[0] as string)
            });
        }
    };

    return (
        <AppLayout>
            <Head title="Laboratorios - Nexus Farma" />

            <div className="p-6 max-w-4xl mx-auto space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Laboratorios Farmacéuticos</h1>
                        <p className="text-slate-500">Gestiona los fabricantes y distribuidores autorizados.</p>
                    </div>
                    <Button className="bg-[#16A34A] hover:bg-[#15803d]" onClick={() => openModal()}>
                        <Plus className="w-4 h-4 mr-2" /> Nuevo Laboratorio
                    </Button>
                </div>

                <Card className="border-none shadow-sm">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nombre del Laboratorio</TableHead>
                                    <TableHead>Productos Vinculados</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {laboratorios.map((lab: any) => (
                                    <TableRow key={lab.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                                                    <Beaker className="w-4 h-4 text-[#16A34A]" />
                                                </div>
                                                <span className="font-bold">{lab.nombre_lab}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{lab.productos_count} productos</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => openModal(lab)}>
                                                    <Edit2 className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(lab.id)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
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
                        <DialogTitle>{currentLab ? 'Editar Laboratorio' : 'Nuevo Laboratorio'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Nombre del Laboratorio</label>
                            <Input
                                value={nombre_lab}
                                onChange={(e) => setNombreLab(e.target.value)}
                                placeholder="Ej: Bagó, Vita, Bayer"
                                required
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
