import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Plus, Boxes } from 'lucide-react';
import { useState } from 'react';
import InventarioModal from './Partials/InventarioModal';
import { Badge } from '@/components/ui/badge';

interface Inventario {
    id: number;
    producto: {
        id: number;
        nombre: string;
    };
    sucursal: {
        id: number;
        nombre_sucursal: string;
    };
    stock: number;
}

interface Producto {
    id: number;
    nombre: string;
}

interface Sucursal {
    id: number;
    nombre_sucursal: string;
}

interface Props {
    inventarios: Inventario[];
    productos: Producto[];
    sucursales: Sucursal[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Inventarios',
        href: '/inventarios',
    },
];

export default function Index({ inventarios, productos, sucursales }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inventarios" />

            <div className="p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
                                <span className="p-2 bg-primary/10 rounded-xl">
                                    <Boxes className="w-8 h-8 text-primary" />
                                </span>
                                Gestión de <span className="text-primary italic">Inventarios</span>
                            </h1>
                            <p className="text-muted-foreground text-sm font-medium">
                                Monitorea el stock actual de productos en todas las sucursales.
                            </p>
                        </div>
                        <Button onClick={() => setIsModalOpen(true)} className="h-11 px-6 font-bold shadow-lg shadow-primary/20">
                            <Plus className="mr-2 h-5 w-5" /> Registrar Ingreso
                        </Button>
                    </div>

                    <Card className="border-border/40 shadow-xl shadow-primary/5">
                        <CardHeader>
                            <CardTitle>Resumen de Stock por Sucursal</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-muted/30">
                                    <TableRow>
                                        <TableHead className="font-bold">Producto</TableHead>
                                        <TableHead className="font-bold">Sucursal</TableHead>
                                        <TableHead className="font-bold text-center">Stock Actual</TableHead>
                                        <TableHead className="font-bold text-center">Estado</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {inventarios.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                                No hay registros de inventario.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        inventarios.map((inv) => (
                                            <TableRow key={inv.id} className="group hover:bg-muted/50 transition-colors">
                                                <TableCell className="font-medium text-foreground">{inv.producto.nombre}</TableCell>
                                                <TableCell>{inv.sucursal.nombre_sucursal}</TableCell>
                                                <TableCell className="text-center">
                                                    <span className="font-black text-primary">{inv.stock}</span> Unid.
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant={inv.stock > 0 ? 'default' : 'destructive'}>
                                                        {inv.stock > 0 ? 'Con Stock' : 'Sin Stock'}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <InventarioModal
                open={isModalOpen}
                productos={productos}
                sucursales={sucursales}
                onClose={() => setIsModalOpen(false)}
            />
        </AppLayout>
    );
}
