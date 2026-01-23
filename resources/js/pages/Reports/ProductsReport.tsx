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

interface Product {
    id: number;
    nombre: string;
    stock: number;
    sales_count: number;
}

interface ProductsReportProps {
    products: {
        data: Product[];
        links: any[];
        total: number;
    };
    filters: {
        start_date?: string;
        end_date?: string;
    };
}

export default function ProductsReport({ products, filters }: ProductsReportProps) {
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');

    const handleFilter = () => {
        router.get('/reports/products', {
            start_date: startDate,
            end_date: endDate,
        }, { preserveState: true });
    };

    const columns = useMemo<ColumnDef<Product>[]>(
        () => [
            {
                accessorKey: 'id',
                header: 'ID',
                cell: ({ getValue }) => <span className="font-mono text-xs">#{getValue<number>()}</span>,
            },
            {
                accessorKey: 'nombre',
                header: 'Producto',
                cell: ({ getValue }) => <span className="font-bold">{getValue<string>()}</span>,
            },
            {
                accessorKey: 'stock',
                header: 'Stock Actual',
                cell: ({ getValue }) => {
                    const stock = getValue<number>();
                    return (
                        <Badge variant={stock < 5 ? 'destructive' : 'outline'}>
                            {stock} unidades
                        </Badge>
                    );
                },
            },
            {
                accessorKey: 'sales_count',
                header: 'Ventas en Rango',
                cell: ({ getValue }) => (
                    <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-primary">{getValue<number>()}</span>
                        <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold">vendidos</span>
                    </div>
                ),
            },
        ],
        []
    );

    const table = useReactTable({
        data: products.data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <AppLayout>
            <Head title="Reporte de Productos" />
            <div className="container mx-auto py-8 px-4 sm:px-6">
                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">
                                Reporte de <span className="text-primary italic">Productos</span>
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Analiza el rendimiento de tus productos y stock actual.
                            </p>
                        </div>
                        <Button variant="outline" onClick={() => window.history.back()}>
                            <ArrowLeft className="w-4 h-4 mr-2" /> Volver
                        </Button>
                    </div>

                    <Card>
                        <CardHeader className="pb-4 border-b">
                            <div className="flex flex-wrap items-end gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                                        <Calendar className="w-3 h-3" /> Rango de Ventas Desde
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
                                        <Calendar className="w-3 h-3" /> Hasta
                                    </label>
                                    <Input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="h-10 w-48"
                                    />
                                </div>
                                <Button onClick={handleFilter} className="h-10 px-6 font-bold">
                                    <Search className="w-4 h-4 mr-2" /> Analizar Ventas
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
                                                    <TableCell key={cell.id} className="py-4">
                                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                                                No se encontraron productos.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <div className="flex items-center justify-between mt-2 px-2">
                        <div className="text-sm text-muted-foreground">
                            Mostrando {products.data.length} productos registrados.
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
