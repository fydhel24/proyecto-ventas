import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import sucursalesRoutes from '@/routes/sucursales';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import SucursalModal from './Partials/SucursalModal';
import { Badge } from '@/components/ui/badge';

interface Sucursal {
    id: number;
    nombre_sucursal: string;
    direccion: string;
    estado: boolean;
}

interface Props {
    sucursales: Sucursal[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Sucursales',
        href: '/sucursales',
    },
];

export default function Index({ sucursales }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSucursal, setEditingSucursal] = useState<Sucursal | null>(null);

    const handleCreate = () => {
        setEditingSucursal(null);
        setIsModalOpen(true);
    };

    const handleEdit = (sucursal: Sucursal) => {
        setEditingSucursal(sucursal);
        setIsModalOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Estás seguro de que deseas eliminar esta sucursal?')) {
            router.delete(sucursalesRoutes.destroy(id).url);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Sucursales" />

            <div className="p-4 sm:p-6 lg:p-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <CardTitle className="text-2xl font-bold">Sucursales</CardTitle>
                        <Button onClick={handleCreate}>
                            <Plus className="mr-2 h-4 w-4" /> Nueva Sucursal
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nombre</TableHead>
                                    <TableHead>Dirección</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sucursales.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                            No hay sucursales registradas.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    sucursales.map((sucursal) => (
                                        <TableRow key={sucursal.id}>
                                            <TableCell className="font-medium text-foreground">{sucursal.nombre_sucursal}</TableCell>
                                            <TableCell className="text-foreground">{sucursal.direccion}</TableCell>
                                            <TableCell>
                                                <Badge variant={sucursal.estado ? 'default' : 'secondary'}>
                                                    {sucursal.estado ? 'Activo' : 'Inactivo'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(sucursal)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(sucursal.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            <SucursalModal
                open={isModalOpen}
                sucursal={editingSucursal}
                onClose={() => setIsModalOpen(false)}
            />
        </AppLayout>
    );
}
