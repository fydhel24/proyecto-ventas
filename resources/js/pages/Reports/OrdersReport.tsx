import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    type ColumnDef,
} from '@tanstack/react-table'
import { Search, Calendar, ArrowLeft, Package } from 'lucide-react';
import React, { useState, useMemo } from 'react';

interface Order {
    id: number;
    nombre: string;
    celular: string;
    departamento: string;
    tipo: string;
    estado: string;
    created_at: string;
    productos: any[];
}

interface OrdersReportProps {
    orders: {
        data: Order[];
        links: any[];
        current_page: number;
        last_page: number;
        total: number;
    };
    summary: {
        total_profit: number;
        product_aggregates: Array<{
            nombre: string;
            total_qty: number;
            total_revenue: number;
        }>;
    };
    filters: {
        start_date?: string;
        end_date?: string;
    };
}

export default function OrdersReport({ orders, summary, filters }: OrdersReportProps) {
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');

    const handleFilter = () => {
        router.get('/reports/orders', {
            start_date: startDate,
            end_date: endDate,
        }, { preserveState: true });
    };

    const columns = useMemo<ColumnDef<Order>[]>(
        () => [
            {
                accessorKey: 'id',
                header: 'ID',
                cell: ({ getValue }) => <span className="font-mono text-xs">#{getValue<number>()}</span>,
            },
            {
                accessorKey: 'created_at',
                header: 'Fecha',
                cell: ({ getValue }) => <span>{new Date(getValue<string>()).toLocaleDateString()}</span>,
            },
            {
                accessorKey: 'nombre',
                header: 'Cliente',
            },
            {
                accessorKey: 'celular',
                header: 'Celular',
            },
            {
                accessorKey: 'departamento',
                header: 'Dpto.',
            },
            {
                id: 'productos',
                header: 'Productos',
                cell: ({ row }) => (
                    <div className="flex flex-col gap-1">
                        {row.original.productos.map((p, i) => (
                            <span key={i} className="text-xs text-muted-foreground">
                                {p.nombre} (x{p.pivot.cantidad})
                            </span>
                        ))}
                    </div>
                ),
            },
        ],
        []
    );

    const table = useReactTable({
        data: orders.data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <AppLayout>
            <Head title="Reporte de Ventas Confirmadas" />
            <div className="container mx-auto py-8 px-4 sm:px-6">
                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">
                                Reporte de <span className="text-primary italic">Pedidos Confirmados</span>
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Análisis unificado de todos los pedidos confirmados por fecha.
                            </p>
                        </div>
                        <Button variant="outline" onClick={() => window.history.back()}>
                            <ArrowLeft className="w-4 h-4 mr-2" /> Volver
                        </Button>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card className="bg-primary/5 border-primary/20">
                            <CardHeader className="py-4">
                                <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">Ganancia Total</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-black text-primary">{summary.total_profit} Bs</div>
                                <p className="text-xs text-muted-foreground mt-1">Basado en precio de venta</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="py-4">
                                <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">Total Pedidos</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-black">{orders.total}</div>
                                <p className="text-xs text-muted-foreground mt-1">En el rango seleccionado</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Table */}
                        <Card className="lg:col-span-2">
                            <CardHeader className="pb-4 border-b">
                                <div className="flex flex-wrap items-end gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                                            <Calendar className="w-3 h-3" /> Fecha Inicio
                                        </label>
                                        <Input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="h-10 w-48"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                                            <Calendar className="w-3 h-3" /> Fecha Fin
                                        </label>
                                        <Input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="h-10 w-48"
                                        />
                                    </div>
                                    <Button onClick={handleFilter} className="h-10 px-6 font-bold">
                                        <Search className="w-4 h-4 mr-2" /> Filtrar
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        {table.getHeaderGroups().map(group => (
                                            <TableRow key={group.id}>
                                                {group.headers.map(header => (
                                                    <TableHead key={header.id} className="font-bold text-xs uppercase">
                                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                                    </TableHead>
                                                ))}
                                            </TableRow>
                                        ))}
                                    </TableHeader>
                                    <TableBody>
                                        {table.getRowModel().rows.length ? (
                                            table.getRowModel().rows.map(row => (
                                                <TableRow key={row.id}>
                                                    {row.getVisibleCells().map(cell => (
                                                        <TableCell key={cell.id} className="py-3">
                                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                                                    No se encontraron resultados.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        {/* Aggregates Table */}
                        <Card>
                            <CardHeader className="pb-4 border-b">
                                <CardTitle className="text-lg font-black flex items-center gap-2">
                                    <Package className="w-5 h-5 text-primary" /> Productos Enviados
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="text-xs uppercase font-bold">Producto</TableHead>
                                            <TableHead className="text-xs uppercase font-bold text-right">Cant.</TableHead>
                                            <TableHead className="text-xs uppercase font-bold text-right">Total Bs</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {summary.product_aggregates.length ? (
                                            summary.product_aggregates.map((item, i) => (
                                                <TableRow key={i}>
                                                    <TableCell className="text-xs font-medium">{item.nombre}</TableCell>
                                                    <TableCell className="text-xs font-black text-right">{item.total_qty}</TableCell>
                                                    <TableCell className="text-xs font-mono text-right">{item.total_revenue}</TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={3} className="h-24 text-center text-muted-foreground text-xs">
                                                    Sin datos de productos.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Simple Pagination */}
                    <div className="flex items-center justify-between mt-2 px-2">
                        <div className="text-sm text-muted-foreground">
                            Mostrando {orders.data.length} de {orders.total} registros
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
