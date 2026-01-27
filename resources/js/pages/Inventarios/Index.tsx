import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Plus, Boxes, Search, ChevronDown, ChevronRight, Warehouse, Package, Info } from 'lucide-react';
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface Inventario {
    id: number;
    sucursal: {
        id: number;
        nombre_sucursal: string;
    };
    stock: number;
}

interface ProductoInventario {
    id: number;
    nombre: string;
    stock_total: number;
    inventarios: Inventario[];
}

interface ProductoAll {
    id: number;
    nombre: string;
}

interface Sucursal {
    id: number;
    nombre_sucursal: string;
}

interface Props {
    productos_inventario: {
        data: ProductoInventario[];
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
        total: number;
        from: number;
        to: number;
    };
    productos_all: ProductoAll[];
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

export default function Index({ productos_inventario, productos_all, sucursales, filters }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [search, setSearch] = useState(filters?.search || '');
    const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});

    // Búsqueda con debounce
    useEffect(() => {
        if (search === (filters?.search || '')) return;

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

    const toggleRow = (id: number) => {
        setExpandedRows((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const renderPaginationItems = () => {
        return productos_inventario.links.map((link, index) => {
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
                            'h-8 w-8 font-bold',
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
            <Head title="Gestión de Inventarios" />

            <div className="p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col gap-8">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <h1 className="text-4xl font-black tracking-tight text-foreground flex items-center gap-3">
                                <span className="p-2 bg-primary/10 rounded-2xl shadow-inner">
                                    <Boxes className="w-9 h-9 text-primary" />
                                </span>
                                Administrar Stock <span className="text-primary italic">Sucursales</span>
                            </h1>
                            <p className="text-muted-foreground text-sm font-medium pl-1 border-l-2 border-primary/20 ml-2">
                                Gestión inteligente de productos por sucursal y almacén.
                            </p>
                        </div>
                        <Button
                            onClick={() => setIsModalOpen(true)}
                            className="h-12 px-8 font-black uppercase tracking-widest text-xs shadow-2xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-95 rounded-xl border-b-4 border-primary/20"
                        >
                            <Plus className="mr-2 h-5 w-5 stroke-[3]" /> Registrar Ingreso
                        </Button>
                    </div>

                    {/* Main Content Card */}
                    <Card className="border-border/40 shadow-2xl shadow-primary/5 bg-background/50 backdrop-blur-md overflow-hidden rounded-3xl border-2">
                        <CardHeader className="border-b border-border/40 bg-muted/20 pb-8 pt-8 px-8">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                                <div className="relative w-full md:w-[450px] group">
                                    <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-all stroke-[2.5]" />
                                    <Input
                                        type="text"
                                        placeholder="Buscar producto o sucursal..."
                                        className="w-full pl-12 pr-6 h-12 bg-background/80 border-2 border-border/50 rounded-2xl focus-visible:ring-primary/20 focus-visible:border-primary transition-all shadow-lg font-medium placeholder:text-muted-foreground/50"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                                <div className="flex items-center gap-4 bg-background/40 p-3 rounded-2xl border border-border/40 shadow-inner">
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-muted-foreground tracking-[0.2em] uppercase">Registros Totales</p>
                                        <p className="text-2xl font-black text-primary leading-none">{productos_inventario?.total || 0}</p>
                                    </div>
                                    <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
                                        <Package className="w-6 h-6 text-primary stroke-[2]" />
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto px-6 py-4">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-none hover:bg-transparent">
                                            <TableHead className="font-black text-[11px] uppercase tracking-[0.15em] text-muted-foreground/80 w-[50px]"></TableHead>
                                            <TableHead className="font-black text-[11px] uppercase tracking-[0.15em] text-muted-foreground/80">Producto</TableHead>
                                            <TableHead className="font-black text-[11px] uppercase tracking-[0.15em] text-muted-foreground/80 text-center">Stock Global</TableHead>
                                            <TableHead className="font-black text-[11px] uppercase tracking-[0.15em] text-muted-foreground/80 text-center uppercase tracking-widest text-[10px]">Estado</TableHead>
                                            <TableHead className="font-black text-[11px] uppercase tracking-[0.15em] text-muted-foreground/80 text-right">Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {productos_inventario.data.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="h-40 text-center">
                                                    <div className="flex flex-col items-center justify-center gap-2 opacity-40">
                                                        <Search className="w-12 h-12 mb-2" />
                                                        <p className="text-lg font-black tracking-tight uppercase">No se encontraron productos</p>
                                                        <p className="text-sm font-medium">Intenta con otros términos de búsqueda.</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            productos_inventario.data.map((prod) => (
                                                <Collapsible
                                                    key={prod.id}
                                                    open={expandedRows[prod.id]}
                                                    onOpenChange={() => toggleRow(prod.id)}
                                                    asChild
                                                >
                                                    <>
                                                        <TableRow className={cn(
                                                            "group border-b-0 hover:bg-primary/[0.03] transition-all cursor-pointer",
                                                            expandedRows[prod.id] && "bg-primary/[0.04]"
                                                        )} onClick={() => toggleRow(prod.id)}>
                                                            <TableCell>
                                                                <div className={cn(
                                                                    "w-8 h-8 rounded-lg flex items-center justify-center transition-all bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary",
                                                                    expandedRows[prod.id] && "bg-primary text-primary-foreground rotate-90"
                                                                )}>
                                                                    <ChevronRight className="w-5 h-5 stroke-[3]" />
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex flex-col">
                                                                    <span className="font-black text-lg text-foreground group-hover:text-primary transition-colors leading-tight italic uppercase tracking-tight">
                                                                        {prod.nombre}
                                                                    </span>
                                                                    <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mt-1">
                                                                        {prod.inventarios.length} Sucursales registradas
                                                                    </span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                <div className="inline-flex flex-col items-center bg-background border-2 border-border/80 px-4 py-1.5 rounded-2xl shadow-sm group-hover:border-primary/30 transition-all">
                                                                    <span className="text-2xl font-black text-primary leading-none">
                                                                        {prod.stock_total || 0}
                                                                    </span>
                                                                    <span className="text-[8px] font-black uppercase text-muted-foreground/60 tracking-tighter">unidades</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                <Badge
                                                                    variant={prod.stock_total > 10 ? 'default' : prod.stock_total > 0 ? 'secondary' : 'destructive'}
                                                                    className="px-4 py-1.5 rounded-full font-black text-[9px] uppercase tracking-[0.1em] border-2 shadow-sm"
                                                                >
                                                                    {prod.stock_total > 10 ? 'Stock Disponible' : prod.stock_total > 0 ? 'Stock Bajo' : 'Sin Stock'}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <Button variant="ghost" size="icon" className="rounded-xl hover:bg-primary/10 hover:text-primary text-muted-foreground opacity-50 group-hover:opacity-100 transition-all">
                                                                    <Info className="w-5 h-5" />
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>

                                                        {/* Desglose por Sucursal */}
                                                        <CollapsibleContent asChild>
                                                            <TableRow className="border-b-2 border-primary/10 bg-primary/[0.01]">
                                                                <TableCell colSpan={5} className="p-0">
                                                                    <div className="px-16 py-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-top-2 duration-300">
                                                                        {prod.inventarios.map((inv) => (
                                                                            <div key={inv.id} className="bg-background rounded-2xl p-5 border-2 border-border/60 shadow-lg hover:border-primary/40 hover:shadow-primary/5 transition-all group/branch flex items-center gap-4">
                                                                                <div className="w-12 h-12 rounded-xl bg-muted group-hover/branch:bg-primary/10 flex items-center justify-center transition-colors">
                                                                                    <Warehouse className="w-6 h-6 text-muted-foreground group-hover/branch:text-primary transition-colors" />
                                                                                </div>
                                                                                <div className="flex-1">
                                                                                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest leading-none mb-1">Sucursal</p>
                                                                                    <h4 className="font-bold text-foreground truncate">{inv.sucursal.nombre_sucursal}</h4>
                                                                                </div>
                                                                                <div className="text-right border-l-2 border-border/40 pl-4 ml-auto">
                                                                                    <p className="text-[10px] font-black uppercase text-primary tracking-widest leading-none mb-1">Stock</p>
                                                                                    <p className="text-xl font-black">{inv.stock}</p>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                        {prod.inventarios.length === 0 && (
                                                                            <div className="col-span-full py-8 text-center text-muted-foreground border-2 border-dashed rounded-3xl opacity-30">
                                                                                No hay stock asignado a ninguna sucursal.
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </TableCell>
                                                            </TableRow>
                                                        </CollapsibleContent>
                                                    </>
                                                </Collapsible>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination section */}
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-10 border-t border-border/40 bg-muted/20">
                                <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] bg-background/50 px-5 py-2.5 rounded-full border-2 border-border/50 shadow-inner">
                                    Página <span className="text-primary">{productos_inventario.from || 0}</span> - <span className="text-primary">{productos_inventario.to || 0}</span> de {productos_inventario?.total || 0} productos
                                </div>
                                <Pagination className="w-auto mx-0">
                                    <PaginationContent className="gap-2.5">
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
                inventarios={productos_inventario.data.flatMap(p => p.inventarios.map(inv => ({
                    ...inv,
                    producto: { id: p.id }
                })))}
                productos={productos_all}
                sucursales={sucursales}
                onClose={() => setIsModalOpen(false)}
            />
        </AppLayout>
    );
}
