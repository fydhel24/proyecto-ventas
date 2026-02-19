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

interface Inventario {
    id: number;
    sucursal_id: number;
    stock: number;
}

interface Product {
    id: number;
    nombre: string;
    stock: number;
    inventarios: Inventario[]; // Added inventories relationship
}

interface Sucursal {
    id: number;
    nombre_sucursal: string;
}

interface ProductsReportProps {
    products: {
        data: Product[];
        links: any[];
        total: number;
    };
    sucursales: Sucursal[]; // Added branches
    stats: {
        total_products: number;
        low_stock_count: number;
        low_stock_list: Product[];
        by_category: Array<{ label: string, value: number }>;
        by_lab: Array<{ label: string, value: number }>;
        valuation: {
            cost: number;
            potential_revenue: number;
            potential_profit: number;
        };
    };
    filters: {
        start_date?: string;
        end_date?: string;
        search?: string; // Added search filter
    };
}

export default function ProductsReport({ products, sucursales, stats, filters }: ProductsReportProps) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = () => {
        router.get('/reports/products', { search }, { preserveState: true });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSearch();
    };

    const getStockForBranch = (product: Product, sucursalId: number) => {
        const inventory = product.inventarios.find(inv => inv.sucursal_id === sucursalId);
        return inventory ? inventory.stock : 0;
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
            // Dynamic Columns for each Branch
            ...sucursales.map(sucursal => ({
                id: `sucursal_${sucursal.id}`,
                header: () => <span className="text-[10px] uppercase font-black text-center block">{sucursal.nombre_sucursal}</span>,
                cell: ({ row }: { row: any }) => {
                    const stock = getStockForBranch(row.original, sucursal.id);
                    return (
                        <div className={`text-center font-mono font-medium ${stock === 0 ? 'text-muted-foreground/30' : ''}`}>
                            {stock > 0 ? stock : '-'}
                        </div>
                    );
                },
            })),
            {
                accessorKey: 'stock',
                header: 'Total Global',
                cell: ({ getValue }) => {
                    const stock = getValue<number>();
                    return (
                        <div className="flex justify-center">
                            <Badge variant={stock < 5 ? 'destructive' : 'secondary'} className="font-bold">
                                {stock}
                            </Badge>
                        </div>
                    );
                },
            },
        ],
        [sucursales]
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
                                Análisis de <span className="text-primary italic">Stock y Medicamentos</span>
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Monitorea stock, categorías, laboratorios y rentabilidad de tu catálogo.
                            </p>
                        </div>
                        <Button variant="outline" onClick={() => window.history.back()}>
                            <ArrowLeft className="w-4 h-4 mr-2" /> Volver
                        </Button>
                    </div>

                    {/* Dashboard Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card className="shadow-none border-border/50">
                            <CardHeader className="py-4">
                                <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">Total Medicamentos</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-black">{stats.total_products}</div>
                                <p className="text-xs text-primary font-black uppercase tracking-widest mt-1">Catálogo base</p>
                            </CardContent>
                        </Card>
                        <Card className={stats.low_stock_count > 0 ? 'bg-red-500/5 dark:bg-red-500/10 border-red-500/20 shadow-none' : 'shadow-none border-border/50'}>
                            <CardHeader className="py-4">
                                <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">Stock Bajo</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className={`text-3xl font-black ${stats.low_stock_count > 0 ? 'text-red-500' : ''}`}>{stats.low_stock_count}</div>
                                <p className="text-xs text-muted-foreground mt-1">Menos de 5 unidades</p>
                            </CardContent>
                        </Card>
                        <Card className="shadow-none border-border/50">
                            <CardHeader className="py-4">
                                <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">Valoración Potencial</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{Math.round(stats.valuation.potential_revenue)} Bs</div>
                                <p className="text-xs text-muted-foreground mt-1 font-bold">Total en Precio 1</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-primary/5 dark:bg-primary/10 border-primary/20 dark:border-primary/30 shadow-none">
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
                        {/* Distribution Tables */}
                        <div className="lg:col-span-1 flex flex-col gap-6">
                            <Card className="rounded-xl border border-border/50 shadow-none overflow-hidden">
                                <CardHeader className="bg-muted/30 border-b py-4">
                                    <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-blue-500" /> Por Categoría
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableBody>
                                            {stats.by_category.map((item, i) => (
                                                <TableRow key={i} className="hover:bg-muted/10 border-b border-border/40 last:border-0 transition-none">
                                                    <TableCell className="font-bold text-foreground/80">{item.label}</TableCell>
                                                    <TableCell className="text-right font-black text-blue-500">{item.value}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>

                            <Card className="rounded-xl border border-border/50 shadow-none overflow-hidden">
                                <CardHeader className="bg-muted/30 border-b py-4">
                                    <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-orange-500" /> Por Laboratorio
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableBody>
                                            {(stats as any).by_lab?.map((item: any, i: number) => (
                                                <TableRow key={i} className="hover:bg-muted/10 border-b border-border/40 last:border-0 transition-none">
                                                    <TableCell className="font-bold text-foreground/80">{item.label}</TableCell>
                                                    <TableCell className="text-right font-black text-orange-500">{item.value}</TableCell>
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
                            <Card className="rounded-xl border border-border/50 shadow-sm overflow-hidden">
                                <CardHeader className="pb-4 border-b bg-muted/20">
                                    <div className="flex w-full max-w-sm items-center space-x-2">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                type="search"
                                                placeholder="Buscar producto..."
                                                className="pl-8 bg-background"
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                                onKeyDown={handleKeyDown}
                                            />
                                        </div>
                                        <Button onClick={handleSearch}>Buscar</Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader className="bg-muted/10">
                                            {table.getHeaderGroups().map(group => (
                                                <TableRow key={group.id} className="border-b border-border/40">
                                                    {group.headers.map(header => (
                                                        <TableHead key={header.id} className="font-bold text-[10px] uppercase text-slate-500 h-11 tracking-wider">
                                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                                        </TableHead>
                                                    ))}
                                                </TableRow>
                                            ))}
                                        </TableHeader>
                                        <TableBody>
                                            {table.getRowModel().rows.length ? (
                                                table.getRowModel().rows.map(row => (
                                                    <TableRow key={row.id} className="border-b border-border/20 transition-none hover:bg-muted/5">
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
                                <Card className="rounded-xl border-red-500/20 bg-red-500/5 dark:bg-red-500/10 overflow-hidden shadow-none">
                                    <CardHeader className="py-4 border-b border-red-500/20 flex flex-row items-center justify-between">
                                        <CardTitle className="text-sm font-black uppercase tracking-widest text-red-500 flex items-center gap-2">
                                            <Package className="w-4 h-4" /> Alerta de Re-abastecimiento
                                        </CardTitle>
                                        <Badge variant="destructive" className="font-black">Críticos</Badge>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
                                            {stats.low_stock_list.map((item, i) => (
                                                <div key={i} className="bg-background/60 dark:bg-background/40 p-3 rounded-lg border border-red-500/10 flex justify-between items-center shadow-sm">
                                                    <span className="text-sm font-bold text-foreground/80">{item.nombre}</span>
                                                    <Badge variant="destructive" className="font-black shadow-sm">{item.stock} UN</Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-between mt-2 px-2">
                        <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                            Se muestran {products.data.length} productos con mayor actividad.
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
