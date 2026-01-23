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
    stats: {
        total_products: number;
        low_stock_count: number;
        low_stock_list: Product[];
        by_category: Array<{ label: string, value: number }>;
        by_brand: Array<{ label: string, value: number }>;
        valuation: {
            cost: number;
            potential_revenue: number;
            potential_profit: number;
        };
    };
    filters: {
        start_date?: string;
        end_date?: string;
    };
}

export default function ProductsReport({ products, stats, filters }: ProductsReportProps) {
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
                header: 'Unidades Vendidas',
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
                <div className="flex flex-col gap-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">
                                Análisis de <span className="text-primary italic">Productos e Inventario</span>
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Monitorea stock, categorías, marcas y rentabilidad de tu catálogo.
                            </p>
                        </div>
                        <Button variant="outline" onClick={() => window.history.back()}>
                            <ArrowLeft className="w-4 h-4 mr-2" /> Volver
                        </Button>
                    </div>

                    {/* Dashboard Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card>
                            <CardHeader className="py-4">
                                <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">Total Productos</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-black">{stats.total_products}</div>
                                <p className="text-xs text-muted-foreground mt-1 text-primary font-bold">Items en catálogo</p>
                            </CardContent>
                        </Card>
                        <Card className={stats.low_stock_count > 0 ? 'bg-red-50 border-red-100' : ''}>
                            <CardHeader className="py-4">
                                <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">Stock Bajo</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className={`text-3xl font-black ${stats.low_stock_count > 0 ? 'text-red-600' : ''}`}>{stats.low_stock_count}</div>
                                <p className="text-xs text-muted-foreground mt-1">Menos de 5 unidades</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="py-4">
                                <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">Valoración Potencial</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-black">{Math.round(stats.valuation.potential_revenue)} Bs</div>
                                <p className="text-xs text-muted-foreground mt-1 font-bold text-green-600">Total en Precio 1</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-primary/5 border-primary/20">
                            <CardHeader className="py-4">
                                <CardTitle className="text-sm font-black uppercase tracking-widest text-primary">Margen Potencial</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-black text-primary">{Math.round(stats.valuation.potential_profit)} Bs</div>
                                <p className="text-xs text-muted-foreground mt-1">Beneficio proyectado</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Distribution Charts/Tables */}
                        <div className="lg:col-span-1 flex flex-col gap-6">
                            <Card className="rounded-3xl border-none shadow-sm overflow-hidden">
                                <CardHeader className="bg-slate-50 border-b py-4">
                                    <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-blue-500" /> Por Categoría
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableBody>
                                            {stats.by_category.map((item, i) => (
                                                <TableRow key={i} className="hover:bg-slate-50/50">
                                                    <TableCell className="font-bold text-slate-700">{item.label}</TableCell>
                                                    <TableCell className="text-right font-black text-blue-600">{item.value}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>

                            <Card className="rounded-3xl border-none shadow-sm overflow-hidden">
                                <CardHeader className="bg-slate-50 border-b py-4">
                                    <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-orange-500" /> Por Marca
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableBody>
                                            {stats.by_brand.map((item, i) => (
                                                <TableRow key={i} className="hover:bg-slate-50/50">
                                                    <TableCell className="font-bold text-slate-700">{item.label}</TableCell>
                                                    <TableCell className="text-right font-black text-orange-600">{item.value}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Inventory & Sales Table */}
                        <div className="lg:col-span-2 flex flex-col gap-6">
                            {/* Sales Filter */}
                            <Card className="rounded-3xl border-none shadow-sm">
                                <CardHeader className="pb-4 border-b">
                                    <div className="flex flex-wrap items-end gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                                                <Calendar className="w-3 h-3" /> Analizar Ventas Desde
                                            </label>
                                            <Input
                                                type="date"
                                                value={startDate}
                                                onChange={(e) => setStartDate(e.target.value)}
                                                className="h-10 w-48 rounded-xl"
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
                                                className="h-10 w-48 rounded-xl"
                                            />
                                        </div>
                                        <Button onClick={handleFilter} className="h-10 px-6 font-bold rounded-xl shadow-lg shadow-primary/20">
                                            <Search className="w-4 h-4 mr-2" /> Analizar
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            {table.getHeaderGroups().map(group => (
                                                <TableRow key={group.id} className="bg-slate-50/50">
                                                    {group.headers.map(header => (
                                                        <TableHead key={header.id} className="font-bold text-xs uppercase text-slate-500">
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

                            {/* Low Stock Detailed List */}
                            {stats.low_stock_count > 0 && (
                                <Card className="rounded-3xl border-red-100 bg-red-50/30 overflow-hidden">
                                    <CardHeader className="py-4 border-b border-red-100 flex flex-row items-center justify-between">
                                        <CardTitle className="text-sm font-black uppercase tracking-widest text-red-600 flex items-center gap-2">
                                            <Package className="w-4 h-4" /> Alerta de Re-abastecimiento
                                        </CardTitle>
                                        <Badge variant="destructive">{stats.low_stock_count} Críticos</Badge>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
                                            {stats.low_stock_list.map((item, i) => (
                                                <div key={i} className="bg-white p-3 rounded-2xl border border-red-100 flex justify-between items-center">
                                                    <span className="text-sm font-bold text-slate-700">{item.nombre}</span>
                                                    <Badge variant="destructive" className="font-black">{item.stock} UN</Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-between mt-2 px-2">
                        <div className="text-sm text-muted-foreground font-medium">
                            Se muestran {products.data.length} productos con mayor actividad.
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
