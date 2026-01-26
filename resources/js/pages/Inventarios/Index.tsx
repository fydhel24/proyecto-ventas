import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Plus, Boxes, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import InventarioModal from './Partials/InventarioModal';
import inventariosRoutes from '@/routes/inventarios';
import { Badge } from '@/components/ui/badge';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

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
    inventarios: {
        data: Inventario[];
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
        total: number;
        from: number;
        to: number;
    };
    productos: Producto[];
    sucursales: Sucursal[];
    filters: {
        search?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Inventarios',
        href: '/inventarios',
    },
];

export default function Index({ inventarios, productos, sucursales, filters }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [search, setSearch] = useState(filters?.search || '');

    // Búsqueda con debounce
    useEffect(() => {
        const handler = setTimeout(() => {
            router.get(inventariosRoutes.index().url, { search }, { preserveState: true, replace: true });
        }, 300);
        return () => clearTimeout(handler);
    }, [search]);

    const handlePageClick = (url: string | null) => {
        if (url) {
            router.get(url, { search }, { preserveState: true });
        }
    };

    const renderPaginationItems = () => {
        return inventarios.links.map((link, index) => {
            const label = link.label
                .replace('&laquo;', 'Anterior')
                .replace('&raquo;', 'Siguiente')
                .replace('&hellip;', '...');

            const isPrevious = label === 'Anterior';
            const isNext = label === 'Siguiente';
            const isEllipsis = label === '...';
            const isActive = link.active;

            if (isPrevious) {
                return (
                    <PaginationItem key={index}>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-2"
                            onClick={() => handlePageClick(link.url)}
                            disabled={!link.url}
                        >
                            <PaginationPrevious className="h-4 w-4" />
                        </Button>
                    </PaginationItem>
                );
            }

            if (isNext) {
                return (
                    <PaginationItem key={index}>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-2"
                            onClick={() => handlePageClick(link.url)}
                            disabled={!link.url}
                        >
                            <PaginationNext className="h-4 w-4" />
                        </Button>
                    </PaginationItem>
                );
            }

            if (isEllipsis) {
                return (
                    <PaginationItem key={index}>
                        <PaginationEllipsis />
                    </PaginationItem>
                );
            }

            return (
                <PaginationItem key={index}>
                    <Button
                        variant={isActive ? 'default' : 'outline'}
                        size="sm"
                        className={cn(
                            'h-8 w-8',
                            isActive
                                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                                : 'hover:bg-accent'
                        )}
                        onClick={() => handlePageClick(link.url)}
                        disabled={!link.url}
                    >
                        <span dangerouslySetInnerHTML={{ __html: label }} />
                    </Button>
                </PaginationItem>
            );
        });
    };

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
                        <CardHeader className="border-b border-border/40 bg-muted/20 pb-6 pt-6 px-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="relative w-full md:w-96 group">
                                    <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <Input
                                        type="text"
                                        placeholder="Buscar por producto o sucursal..."
                                        className="w-full pl-10 pr-4 py-2.5 bg-background border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                                    Total: {inventarios?.total || 0} Registros
                                </div>
                            </div>
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
                                    {inventarios.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                                No hay registros de inventario.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        inventarios.data.map((inv) => (
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

                            {/* Pagination section */}
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 border-t border-border/40 bg-muted/10">
                                <div className="text-xs font-black text-muted-foreground uppercase tracking-widest">
                                    Mostrando <span className="text-primary">{inventarios.from || 0}</span> a <span className="text-primary">{inventarios.to || 0}</span> de <span className="text-primary">{inventarios?.total || 0}</span> registros
                                </div>
                                <Pagination className="w-auto mx-0">
                                    <PaginationContent className="gap-1.5">
                                        {renderPaginationItems()}
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <InventarioModal
                open={isModalOpen}
                inventarios={inventarios.data}
                productos={productos}
                sucursales={sucursales}
                onClose={() => setIsModalOpen(false)}
            />
        </AppLayout>
    );
}
