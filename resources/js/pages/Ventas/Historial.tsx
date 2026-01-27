import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { FileText, Search, Printer, Ban, Plus, Minus, AlertTriangle } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Venta {
    id: number;
    cliente: string;
    ci?: string;
    tipo_pago: string;
    monto_total: number;
    estado?: string;
    created_at: string;
    sucursal: {
        id: number;
        nombre_sucursal: string;
    };
    detalles: Array<{
        cantidad: number;
        inventario: {
            producto: {
                nombre: string;
            };
        };
    }>;
}

interface Props {
    ventas: {
        data: Venta[];
        current_page: number;
        last_page: number;
        total: number;
        per_page: number;
    };
    isAdmin: boolean;
    filters: {
        query: string;
        sucursal_id: string | null;
    };
}

export default function HistorialVentas({ ventas, isAdmin, filters }: Props) {
    const [query, setQuery] = useState(filters.query || '');

    // Debounce search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (query !== (filters.query || '')) {
                router.get('/ventas/historial', { query }, {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                });
            }
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [query]);

    const handlePageChange = (page: number) => {
        router.get('/ventas/historial', { query, page }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleCancel = (ventaId: number) => {
        router.post(`/ventas/${ventaId}/cancelar`, {}, {
            onSuccess: () => toast.success('Venta anulada correctamente'),
            onError: () => toast.error('Error al anular la venta'),
        });
    };

    const handlePrint = (ventaId: number) => {
        window.open(`/ventas/${ventaId}/pdf`, '_blank');
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Ventas', href: '/ventas/historial' }, { title: 'Historial', href: '/ventas/historial' }]}>
            <Head title="Historial de Ventas" />

            <div className="p-4 sm:p-6 space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                            <FileText className="h-8 w-8 text-primary" />
                            Historial de Ventas
                        </h1>
                        <p className="text-muted-foreground mt-1">Gestione y revise el historial de transacciones</p>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por cliente, ticket o producto..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="pl-9 h-10"
                        />
                    </div>
                </div>

                <Card className="border-none shadow-lg">
                    <CardHeader className="bg-muted/30 py-4">
                        <CardTitle className="text-lg">
                            Transacciones ({ventas.total})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="font-bold">Ticket</TableHead>
                                        <TableHead className="font-bold">Fecha</TableHead>
                                        <TableHead className="font-bold">Cliente</TableHead>
                                        <TableHead className="font-bold">Productos</TableHead>
                                        <TableHead className="font-bold">Total</TableHead>
                                        <TableHead className="font-bold">Estado</TableHead>
                                        <TableHead className="font-bold text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {ventas.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                                No se encontraron ventas
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        ventas.data.map((venta) => (
                                            <TableRow key={venta.id} className="hover:bg-muted/30">
                                                <TableCell className="font-mono font-medium">
                                                    #{String(venta.id).padStart(6, '0')}
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(venta.created_at).toLocaleString('es-BO', {
                                                        day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </TableCell>
                                                <TableCell className="max-w-[150px] truncate" title={venta.cliente}>
                                                    {venta.cliente}
                                                </TableCell>
                                                <TableCell className="max-w-[200px]">
                                                    <div className="text-sm">
                                                        {venta.detalles.slice(0, 2).map((d, i) => (
                                                            <div key={i} className="truncate">
                                                                <span className="font-semibold">{d.cantidad}x</span> {d.inventario.producto.nombre}
                                                            </div>
                                                        ))}
                                                        {venta.detalles.length > 2 && (
                                                            <span className="text-xs text-muted-foreground italic">
                                                                +{venta.detalles.length - 2} más...
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-bold">
                                                    Bs. {Number(venta.monto_total).toFixed(2)}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={venta.estado === 'Cancelado' ? 'destructive' : 'default'} className={
                                                        venta.estado === 'Cancelado' ? '' : 'bg-green-600 hover:bg-green-700'
                                                    }>
                                                        {venta.estado === 'Cancelado' ? 'Cancelado' : 'Completado'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button variant="outline" size="icon" onClick={() => handlePrint(venta.id)}>
                                                                        <Printer className="h-4 w-4 text-blue-600" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>Imprimir Nota</TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>

                                                        {venta.estado !== 'Cancelado' && (
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button variant="outline" size="icon" className="text-red-600 hover:bg-red-50 hover:text-red-700">
                                                                        <Ban className="h-4 w-4" />
                                                                    </Button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                                                                            <AlertTriangle className="h-5 w-5" />
                                                                            ¿Anular esta venta?
                                                                        </AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            Esta acción revertirá el stock de los productos al inventario. La venta quedará marcada como "Anulada" pero no se eliminará del historial.
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                                        <AlertDialogAction
                                                                            onClick={() => handleCancel(venta.id)}
                                                                            className="bg-red-600 hover:bg-red-700"
                                                                        >
                                                                            Sí, anular venta
                                                                        </AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Pagination */}
                {ventas.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(ventas.current_page - 1)}
                            disabled={ventas.current_page === 1}
                        >
                            <Minus className="h-4 w-4 mr-1" /> Anterior
                        </Button>
                        <span className="text-sm font-medium">
                            Página {ventas.current_page} de {ventas.last_page}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(ventas.current_page + 1)}
                            disabled={ventas.current_page === ventas.last_page}
                        >
                            Siguiente <Plus className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
