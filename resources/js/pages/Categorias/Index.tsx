import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import {
    Plus,
    Edit2,
    Trash2,
    Search,
    LayoutGrid
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

export default function CategoriasIndex({ categorias }: any) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentCat, setCurrentCat] = useState<any>(null);
    const [nombre_cat, setNombreCat] = useState('');

    const openModal = (cat: any = null) => {
        setCurrentCat(cat);
        setNombreCat(cat ? cat.nombre_cat : '');
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (currentCat) {
            router.put(`/categorias/${currentCat.id}`, { nombre_cat }, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    toast.success("Categoría actualizada");
                }
            });
        } else {
            router.post('/categorias', { nombre_cat }, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    toast.success("Categoría creada");
                }
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm("¿Eliminar esta categoría?")) {
            router.delete(`/categorias/${id}`, {
                onSuccess: () => toast.success("Categoría eliminada"),
                onError: (errors) => toast.error(Object.values(errors)[0] as string)
            });
        }
    };

    return (
        <AppLayout>
            <Head title="Categorías - Nexus Farma" />

            <div className="p-6 max-w-4xl mx-auto space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 text-slate-900">Categorías de Productos</h1>
                        <p className="text-slate-500">Organiza tus medicamentos por grupos terapéuticos.</p>
                    </div>
                    <Button className="bg-[#16A34A] hover:bg-[#15803d]" onClick={() => openModal()}>
                        <Plus className="w-4 h-4 mr-2" /> Nueva Categoría
                    </Button>
                </div>

                <Card className="border-none shadow-sm">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nombre de la Categoría</TableHead>
                                    <TableHead>No. Productos</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {categorias.map((cat: any) => (
                                    <TableRow key={cat.id}>
                                        <TableCell className="font-bold">{cat.nombre_cat}</TableCell>
                                        <TableCell>{cat.productos_count} productos</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => openModal(cat)}>
                                                    <Edit2 className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(cat.id)}>
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
                        <DialogTitle>{currentCat ? 'Editar Categoría' : 'Nueva Categoría'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Nombre de la Categoría</label>
                            <Input
                                value={nombre_cat}
                                onChange={(e) => setNombreCat(e.target.value)}
                                placeholder="Ej: Antibióticos"
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
