import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import productosRoutes from '@/routes/productos';
import { Link, router, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import {
    PlusIcon,
    EditIcon,
    TrashIcon,
    PackageIcon,
    TagIcon,
    WarehouseIcon,
    DollarSignIcon,
    SearchIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

// ✅ Importa los componentes de paginación de shadcn
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';

interface Producto {
    id: number;
    nombre: string;
    principio_activo: string | null;
    lote: string | null;
    fecha_vencimiento: string | null;
    precio_venta: string;
    laboratorio: { nombre_lab: string } | null;
    categoria: { nombre_cat: string } | null;
}

interface Props {
    productos: {
        data: Producto[];
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
        total: number;
        current_page: number;
        last_page: number;
    };
    filters?: {
        search?: string;
    };
}

export default function Index({ productos, filters }: Props) {
    const [search, setSearch] = useState(filters?.search || '');
    const { url } = usePage();

    // Búsqueda con debounce
    useEffect(() => {
        const handler = setTimeout(() => {
            router.get(url, { search }, { preserveState: true, replace: true });
        }, 300);
        return () => clearTimeout(handler);
    }, [search]);

    const eliminar = (id: number) => {
        if (confirm('¿Eliminar este producto de forma permanente?')) {
            router.delete(productosRoutes.destroy(id), {
                onSuccess: () => {
                    toast.success('Producto eliminado correctamente');
                },
                onError: () => {
                    toast.error('Error al eliminar el producto');
                }
            });
        }
    };

    // Manejar clic en enlace de paginación
    const handlePageClick = (url: string | null) => {
        if (url) {
            router.get(url, { search }, { preserveState: true });
        }
    };

    // Procesar los enlaces para identificar tipos (prev, next, ellipsis, etc.)
    const renderPaginationItems = () => {
        return productos.links.map((link, index) => {
            // Normalizar el label
            const label = link.label
                .replace('&laquo;', 'Anterior')
                .replace('&raquo;', 'Siguiente')
                .replace('&hellip;', '...');

            // Detectar tipo
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

            // Enlace de número de página
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
                        {label}
                    </Button>
                </PaginationItem>
            );
        });
    };

    return (
        <AppLayout>
            <div className="container mx-auto py-8 px-4 sm:px-6">
                <div className="flex flex-col gap-8">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-1">
                            <h1 className="text-4xl font-black tracking-tight text-foreground flex items-center gap-3">
                                <span className="p-2 bg-primary/10 rounded-xl">
                                    <PackageIcon className="w-8 h-8 text-primary" />
                                </span>
                                Gestión de <span className="text-primary italic">Medicamentos</span>
                            </h1>
                            <p className="text-muted-foreground text-sm font-medium">
                                Control total sobre el stock, vencimientos y laboratorios de tu farmacia.
                            </p>
                        </div>
                        <Link href={productosRoutes.create()}>
                            <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 h-11 px-6 font-bold transition-all hover:scale-[1.02] active:scale-95">
                                <PlusIcon className="mr-2 h-5 w-5" />
                                Nuevo Medicamento
                            </Button>
                        </Link>
                    </div>

                    <Card className="border-border/40 shadow-xl shadow-primary/5 bg-background/50 backdrop-blur-sm overflow-hidden">
                        <CardHeader className="border-b border-border/40 bg-muted/20 pb-6 pt-6 px-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="relative w-full md:w-96 group">
                                    <SearchIcon className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="Buscar por nombre, principio activo, laboratorio..."
                                        className="w-full pl-10 pr-4 py-2.5 bg-background border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                                    Total: {productos?.total || 0} Ítems
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="p-0">
                            {productos.data.length === 0 ? (
                                <div className="py-20 text-center text-muted-foreground">
                                    <div className="bg-muted/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-border/60">
                                        <PackageIcon className="h-8 w-8 opacity-20" />
                                    </div>
                                    <p className="font-bold">No se encontraron productos en el inventario.</p>
                                    <p className="text-xs opacity-60 mt-1">Intenta ajustar los términos de búsqueda.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader className="bg-muted/30">
                                                <TableRow className="border-b border-border/40 hover:bg-transparent">
                                                    <TableHead className="text-[11px] uppercase font-black tracking-widest text-muted-foreground h-12">
                                                        <div className="flex items-center gap-2">
                                                            <TagIcon className="h-3.5 w-3.5" />
                                                            Nombre
                                                        </div>
                                                    </TableHead>
                                                    <TableHead className="text-[11px] uppercase font-black tracking-widest text-muted-foreground h-12">
                                                        Laboratorio
                                                    </TableHead>
                                                    <TableHead className="text-[11px] uppercase font-black tracking-widest text-muted-foreground h-12">
                                                        Categoría
                                                    </TableHead>
                                                    <TableHead className="text-[11px] uppercase font-black tracking-widest text-muted-foreground h-12 text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <DollarSignIcon className="h-3.5 w-3.5" />
                                                            Precio Público
                                                        </div>
                                                    </TableHead>
                                                    <TableHead className="text-[11px] uppercase font-black tracking-widest text-muted-foreground h-12 text-right px-6">
                                                        Acciones
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {productos.data.map((p) => (
                                                    <TableRow
                                                        key={p.id}
                                                        className="group hover:bg-primary/[0.02] dark:hover:bg-primary/[0.05] transition-colors border-b border-border/20"
                                                    >
                                                        <TableCell className="font-bold text-sm py-4">
                                                            <div className="flex flex-col">
                                                                <span>{p.nombre}</span>
                                                                <span className="text-[10px] font-medium text-muted-foreground/70">{p.principio_activo}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-xs font-medium text-muted-foreground">{p.laboratorio?.nombre_lab || '—'}</TableCell>
                                                        <TableCell className="text-xs font-medium text-muted-foreground">{p.categoria?.nombre_cat || '—'}</TableCell>
                                                        <TableCell className="text-center">
                                                            <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-xl bg-primary/5 border border-primary/20 text-primary font-black text-sm shadow-sm">
                                                                <span className="text-[10px] mr-1 opacity-70">Bs</span> {Number(p.precio_venta).toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-right py-4 px-6">
                                                            <div className="flex justify-end gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                                                                <Link href={productosRoutes.edit(p.id)}>
                                                                    <Button
                                                                        size="icon"
                                                                        variant="ghost"
                                                                        className="h-9 w-9 text-primary hover:bg-primary/10 rounded-lg transition-all active:scale-90"
                                                                        title="Editar Producto"
                                                                    >
                                                                        <EditIcon className="h-4.5 w-4.5" />
                                                                    </Button>
                                                                </Link>
                                                                <Button
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    className="h-9 w-9 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all active:scale-90"
                                                                    onClick={() => eliminar(p.id)}
                                                                    title="Eliminar de catálogo"
                                                                >
                                                                    <TrashIcon className="h-4.5 w-4.5" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>

                                    {/* Pagination section */}
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 border-t border-border/40 bg-muted/10">
                                        <div className="text-xs font-black text-muted-foreground uppercase tracking-widest">
                                            Mostrando <span className="text-primary">{productos.data.length}</span> de <span className="text-primary">{productos?.total || 0}</span> registros
                                        </div>
                                        <Pagination className="w-auto mx-0">
                                            <PaginationContent className="gap-1.5">
                                                {renderPaginationItems()}
                                            </PaginationContent>
                                        </Pagination>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
