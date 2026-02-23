import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import inventariosRoutes from '@/routes/inventarios';
import { BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
    Boxes,
    ChevronRight,
    Info,
    Package,
    Plus,
    Search,
    Warehouse,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import InventarioModal from './Partials/InventarioModal';

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

export default function Index({
    productos_inventario,
    productos_all,
    sucursales,
    filters,
}: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'ingreso' | 'reparticion'>(
        'ingreso',
    );
    const [search, setSearch] = useState(filters?.search || '');
    const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>(
        {},
    );

    // Búsqueda con debounce
    useEffect(() => {
        if (search === (filters?.search || '')) return;

        const handler = setTimeout(() => {
            router.get(
                inventariosRoutes.index().url,
                { search },
                { preserveState: true, replace: true },
            );
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
                                : 'hover:bg-accent',
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
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                        <div className="space-y-1">
                            <h1 className="flex items-center gap-3 text-4xl font-black tracking-tight text-foreground">
                                <span className="rounded-2xl bg-primary/10 p-2 shadow-inner">
                                    <Boxes className="h-9 w-9 text-primary" />
                                </span>
                                Repartición de{' '}
                                <span className="text-primary italic">
                                    Platillos
                                </span>
                            </h1>
                            <p className="ml-2 border-l-2 border-primary/20 pl-1 text-sm font-medium text-muted-foreground">
                                Distribución diaria de preparaciones por
                                sucursal.
                            </p>
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <Button
                                onClick={() => {
                                    setModalMode('reparticion');
                                    setIsModalOpen(true);
                                }}
                                variant="outline"
                                className="h-12 rounded-xl border-2 border-primary/20 px-8 text-xs font-black tracking-widest uppercase transition-all hover:bg-primary/5"
                            >
                                <Boxes className="mr-2 h-5 w-5 text-primary" />{' '}
                                Repartir Platillos
                            </Button>
                            <Button
                                onClick={() => {
                                    setModalMode('ingreso');
                                    setIsModalOpen(true);
                                }}
                                className="h-12 rounded-xl border-b-4 border-primary/20 px-8 text-xs font-black tracking-widest uppercase shadow-2xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-95"
                            >
                                <Plus className="mr-2 h-5 w-5 stroke-[3]" />{' '}
                                Asignar Platillos
                            </Button>
                        </div>
                    </div>

                    {/* Main Content Card */}
                    <Card className="overflow-hidden rounded-3xl border-2 border-border/40 bg-background/50 shadow-2xl shadow-primary/5 backdrop-blur-md">
                        <CardHeader className="border-b border-border/40 bg-muted/20 px-8 pt-8 pb-8">
                            <div className="flex flex-col justify-between gap-8 md:flex-row md:items-center">
                                <div className="group relative w-full md:w-[450px]">
                                    <Search className="absolute top-3.5 left-4 h-5 w-5 stroke-[2.5] text-muted-foreground transition-all group-focus-within:text-primary" />
                                    <Input
                                        type="text"
                                        placeholder="Buscar producto o sucursal..."
                                        className="h-12 w-full rounded-2xl border-2 border-border/50 bg-background/80 pr-6 pl-12 font-medium shadow-lg transition-all placeholder:text-muted-foreground/50 focus-visible:border-primary focus-visible:ring-primary/20"
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                    />
                                </div>
                                <div className="flex items-center gap-4 rounded-2xl border border-border/40 bg-background/40 p-3 shadow-inner">
                                    <div className="text-right">
                                        <p className="text-[10px] font-black tracking-[0.2em] text-muted-foreground uppercase">
                                            Registros Totales
                                        </p>
                                        <p className="text-2xl leading-none font-black text-primary">
                                            {productos_inventario?.total || 0}
                                        </p>
                                    </div>
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                                        <Package className="h-6 w-6 stroke-[2] text-primary" />
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto px-6 py-4">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-none hover:bg-transparent">
                                            <TableHead className="w-[50px] text-[11px] font-black tracking-[0.15em] text-muted-foreground/80 uppercase"></TableHead>
                                            <TableHead className="text-[11px] font-black tracking-[0.15em] text-muted-foreground/80 uppercase">
                                                Platillo
                                            </TableHead>
                                            <TableHead className="text-center text-[11px] font-black tracking-[0.15em] text-muted-foreground/80 uppercase">
                                                Disponibles Hoy
                                            </TableHead>
                                            <TableHead className="text-center text-[10px] text-[11px] font-black tracking-[0.15em] tracking-widest text-muted-foreground/80 uppercase">
                                                Estado
                                            </TableHead>
                                            <TableHead className="text-right text-[11px] font-black tracking-[0.15em] text-muted-foreground/80 uppercase">
                                                Acciones
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {productos_inventario.data.length ===
                                        0 ? (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={5}
                                                    className="h-40 text-center"
                                                >
                                                    <div className="flex flex-col items-center justify-center gap-2 opacity-40">
                                                        <Search className="mb-2 h-12 w-12" />
                                                        <p className="text-lg font-black tracking-tight uppercase">
                                                            No se encontraron
                                                            productos
                                                        </p>
                                                        <p className="text-sm font-medium">
                                                            Intenta con otros
                                                            términos de
                                                            búsqueda.
                                                        </p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            productos_inventario.data.map(
                                                (prod) => (
                                                    <Collapsible
                                                        key={prod.id}
                                                        open={
                                                            expandedRows[
                                                                prod.id
                                                            ]
                                                        }
                                                        onOpenChange={() =>
                                                            toggleRow(prod.id)
                                                        }
                                                        asChild
                                                    >
                                                        <>
                                                            <TableRow
                                                                className={cn(
                                                                    'group cursor-pointer border-b-0 transition-all hover:bg-primary/[0.03]',
                                                                    expandedRows[
                                                                        prod.id
                                                                    ] &&
                                                                        'bg-primary/[0.04]',
                                                                )}
                                                                onClick={() =>
                                                                    toggleRow(
                                                                        prod.id,
                                                                    )
                                                                }
                                                            >
                                                                <TableCell>
                                                                    <div
                                                                        className={cn(
                                                                            'flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-all group-hover:bg-primary/20 group-hover:text-primary',
                                                                            expandedRows[
                                                                                prod
                                                                                    .id
                                                                            ] &&
                                                                                'rotate-90 bg-primary text-primary-foreground',
                                                                        )}
                                                                    >
                                                                        <ChevronRight className="h-5 w-5 stroke-[3]" />
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div className="flex flex-col">
                                                                        <span className="text-lg leading-tight font-black tracking-tight text-foreground uppercase italic transition-colors group-hover:text-primary">
                                                                            {
                                                                                prod.nombre
                                                                            }
                                                                        </span>
                                                                        <span className="mt-1 text-[10px] font-bold tracking-widest text-muted-foreground/60 uppercase">
                                                                            {
                                                                                prod
                                                                                    .inventarios
                                                                                    .length
                                                                            }{' '}
                                                                            Sucursales
                                                                            registradas
                                                                        </span>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="text-center">
                                                                    <div className="inline-flex flex-col items-center rounded-2xl border-2 border-border/80 bg-background px-4 py-1.5 shadow-sm transition-all group-hover:border-primary/30">
                                                                        <span className="text-2xl leading-none font-black text-primary">
                                                                            {prod.stock_total ||
                                                                                0}
                                                                        </span>
                                                                        <span className="text-[8px] font-black tracking-tighter text-muted-foreground/60 uppercase">
                                                                            unidades
                                                                        </span>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="text-center">
                                                                    <Badge
                                                                        variant={
                                                                            prod.stock_total >
                                                                            10
                                                                                ? 'default'
                                                                                : prod.stock_total >
                                                                                    0
                                                                                  ? 'secondary'
                                                                                  : 'destructive'
                                                                        }
                                                                        className="rounded-full border-2 px-4 py-1.5 text-[9px] font-black tracking-[0.1em] uppercase shadow-sm"
                                                                    >
                                                                        {prod.stock_total >
                                                                        10
                                                                            ? 'Platillos Disponibles'
                                                                            : prod.stock_total >
                                                                                0
                                                                              ? 'Pocos Platillos'
                                                                              : 'Agotado'}
                                                                    </Badge>
                                                                </TableCell>
                                                                <TableCell className="text-right">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="rounded-xl text-muted-foreground opacity-50 transition-all group-hover:opacity-100 hover:bg-primary/10 hover:text-primary"
                                                                    >
                                                                        <Info className="h-5 w-5" />
                                                                    </Button>
                                                                </TableCell>
                                                            </TableRow>

                                                            {/* Desglose por Sucursal */}
                                                            <CollapsibleContent
                                                                asChild
                                                            >
                                                                <TableRow className="border-b-2 border-primary/10 bg-primary/[0.01]">
                                                                    <TableCell
                                                                        colSpan={
                                                                            5
                                                                        }
                                                                        className="p-0"
                                                                    >
                                                                        <div className="grid animate-in grid-cols-1 gap-6 px-16 py-8 duration-300 slide-in-from-top-2 md:grid-cols-2 lg:grid-cols-3">
                                                                            {prod.inventarios.map(
                                                                                (
                                                                                    inv,
                                                                                ) => (
                                                                                    <div
                                                                                        key={
                                                                                            inv.id
                                                                                        }
                                                                                        className="group/branch flex items-center gap-4 rounded-2xl border-2 border-border/60 bg-background p-5 shadow-lg transition-all hover:border-primary/40 hover:shadow-primary/5"
                                                                                    >
                                                                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted transition-colors group-hover/branch:bg-primary/10">
                                                                                            <Warehouse className="h-6 w-6 text-muted-foreground transition-colors group-hover/branch:text-primary" />
                                                                                        </div>
                                                                                        <div className="flex-1">
                                                                                            <p className="mb-1 text-[10px] leading-none font-black tracking-widest text-muted-foreground uppercase">
                                                                                                Sucursal
                                                                                            </p>
                                                                                            <h4 className="truncate font-bold text-foreground">
                                                                                                {
                                                                                                    inv
                                                                                                        .sucursal
                                                                                                        .nombre_sucursal
                                                                                                }
                                                                                            </h4>
                                                                                        </div>
                                                                                        <div className="ml-auto border-l-2 border-border/40 pl-4 text-right">
                                                                                            <p className="mb-1 text-[10px] leading-none font-black tracking-widest text-primary uppercase">
                                                                                                Cantidad
                                                                                            </p>
                                                                                            <p className="text-xl font-black">
                                                                                                {
                                                                                                    inv.stock
                                                                                                }
                                                                                            </p>
                                                                                        </div>
                                                                                    </div>
                                                                                ),
                                                                            )}
                                                                            {prod
                                                                                .inventarios
                                                                                .length ===
                                                                                0 && (
                                                                                <div className="col-span-full rounded-3xl border-2 border-dashed py-8 text-center text-muted-foreground opacity-30">
                                                                                    No
                                                                                    hay
                                                                                    stock
                                                                                    asignado
                                                                                    a
                                                                                    ninguna
                                                                                    sucursal.
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </TableCell>
                                                                </TableRow>
                                                            </CollapsibleContent>
                                                        </>
                                                    </Collapsible>
                                                ),
                                            )
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination section */}
                            <div className="flex flex-col items-center justify-between gap-6 border-t border-border/40 bg-muted/20 p-10 sm:flex-row">
                                <div className="rounded-full border-2 border-border/50 bg-background/50 px-5 py-2.5 text-[10px] font-black tracking-[0.2em] text-muted-foreground uppercase shadow-inner">
                                    Página{' '}
                                    <span className="text-primary">
                                        {productos_inventario.from || 0}
                                    </span>{' '}
                                    -{' '}
                                    <span className="text-primary">
                                        {productos_inventario.to || 0}
                                    </span>{' '}
                                    de {productos_inventario?.total || 0}{' '}
                                    productos
                                </div>
                                <Pagination className="mx-0 w-auto">
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
                mode={modalMode}
                inventarios={productos_inventario.data.flatMap((p) =>
                    p.inventarios.map((inv) => ({
                        ...inv,
                        producto: { id: p.id },
                    })),
                )}
                productos={productos_all}
                sucursales={sucursales}
                onClose={() => setIsModalOpen(false)}
            />
        </AppLayout>
    );
}
