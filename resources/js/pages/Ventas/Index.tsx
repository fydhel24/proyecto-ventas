import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { create } from '@/routes/ventas';
import { Plus, ShoppingCart, Eye } from 'lucide-react';
import React from 'react';

interface Venta {
    id: number;
    cliente: string;
    tipo_pago: string;
    monto_total: number;
    estado: string;
    created_at: string;
    vendedor: { name: string };
}

interface Props {
    ventas: {
        data: Venta[];
        links: any[];
    };
}

const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Ventas', href: '/ventas' },
];

export default function Index({ ventas }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Ventas" />
            <div className="flex flex-1 flex-col gap-6 p-6 overflow-y-auto">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Ventas</h1>
                        <p className="text-muted-foreground mt-1">Historial de transacciones realizadas</p>
                    </div>
                    <Button asChild>
                        <Link href={create().url}>
                            <Plus className="mr-2 h-4 w-4" />
                            Nueva Venta
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <ShoppingCart className="h-5 w-5" />
                            Todas las Ventas
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Cliente</TableHead>
                                    <TableHead>Vendedor</TableHead>
                                    <TableHead>Pago</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {ventas.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                            No hay ventas registradas.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    ventas.data.map((venta) => (
                                        <TableRow key={venta.id}>
                                            <TableCell>{new Date(venta.created_at).toLocaleDateString()}</TableCell>
                                            <TableCell className="font-medium">{venta.cliente}</TableCell>
                                            <TableCell>{venta.vendedor.name}</TableCell>
                                            <TableCell>{venta.tipo_pago}</TableCell>
                                            <TableCell className="font-bold">Bs. {venta.monto_total}</TableCell>
                                            <TableCell>
                                                <Badge variant={venta.estado === 'completado' ? 'default' : 'secondary'}>
                                                    {venta.estado}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
