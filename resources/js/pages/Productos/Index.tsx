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
import AppLayout from '@/layouts/app-layout';
import productosRoutes from '@/routes/productos';
import { Link, router, usePage } from '@inertiajs/react';
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
    stock: number;
    precio_1: string;
    marca: { nombre_marca: string } | null;
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
        meta: {
            current_page: number;
            last_page: number;
            total: number;
        };
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
            router.delete(productosRoutes.destroy(id));
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
                            size="6sm"
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
        <AppLayout title="Productos">
            <div className="container mx-auto py-6 px-4">
                <Card className="border border-border/60 shadow-lg overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 rounded-t-lg">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <PackageIcon className="h-5 w-5 text-primary" />
                                </div>
                                <CardTitle className="text-xl font-bold text-foreground">
                                    Gestión de Productos
                                </CardTitle>
                            </div>
                            <Link href={productosRoutes.create()}>
                                <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-md">
                                    <PlusIcon className="mr-2 h-4 w-4" />
                                    Nuevo Producto
                                </Button>
                            </Link>
                        </div>

                        {/* 🔍 Barra de búsqueda */}
                        <div className="mt-4 relative max-w-md">
                            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Buscar por nombre, marca o categoría..."
                                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </CardHeader>

                    <CardContent className="p-0">
                        {productos.data.length === 0 ? (
                            <div className="py-12 text-center text-muted-foreground">
                                <PackageIcon className="mx-auto h-12 w-12 opacity-50 mb-3" />
                                <p>No se encontraron productos.</p>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-b border-border/50 hover:bg-transparent">
                                                <TableHead className="font-medium text-muted-foreground w-1/4">
                                                    <div className="flex items-center gap-2">
                                                        <TagIcon className="h-4 w-4" />
                                                        Nombre
                                                    </div>
                                                </TableHead>
                                                <TableHead className="font-medium text-muted-foreground w-1/6">
                                                    Marca
                                                </TableHead>
                                                <TableHead className="font-medium text-muted-foreground w-1/6">
                                                    Categoría
                                                </TableHead>
                                                <TableHead className="font-medium text-muted-foreground w-1/8">
                                                    <div className="flex items-center gap-1">
                                                        <WarehouseIcon className="h-4 w-4" />
                                                        Stock
                                                    </div>
                                                </TableHead>
                                                <TableHead className="font-medium text-muted-foreground w-1/8">
                                                    <div className="flex items-center gap-1">
                                                        <DollarSignIcon className="h-4 w-4" />
                                                        Precio
                                                    </div>
                                                </TableHead>
                                                <TableHead className="text-right font-medium text-muted-foreground w-24">
                                                    Acciones
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {productos.data.map((p) => (
                                                <TableRow
                                                    key={p.id}
                                                    className="border-b border-border/30 transition-colors hover:bg-accent/30"
                                                >
                                                    <TableCell className="font-medium">{p.nombre}</TableCell>
                                                    <TableCell>{p.marca?.nombre_marca || '—'}</TableCell>
                                                    <TableCell>{p.categoria?.nombre_cat || '—'}</TableCell>
                                                    <TableCell>
                                                        <span
                                                            className={cn(
                                                                'px-2 py-1 rounded-full text-xs font-medium',
                                                                p.stock > 10
                                                                    ? 'bg-emerald-100 text-emerald-800'
                                                                    : p.stock > 0
                                                                    ? 'bg-amber-100 text-amber-800'
                                                                    : 'bg-rose-100 text-rose-800'
                                                            )}
                                                        >
                                                            {p.stock}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="font-medium">
                                                        Bs. {Number(p.precio_1).toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                                                    </TableCell>
                                                    <TableCell className="text-right space-x-1">
                                                        <Link href={productosRoutes.edit(p.id)}>
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="h-8 w-8 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                                                            >
                                                                <EditIcon className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                                                            onClick={() => eliminar(p.id)}
                                                        >
                                                            <TrashIcon className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* 📄 Paginación con shadcn/ui */}
                                {productos.links && productos.links.length > 3 && (
                                    <div className="px-4 py-4 border-t border-border/30">
                                        <Pagination>
                                            <PaginationContent>
                                                {renderPaginationItems()}
                                            </PaginationContent>
                                        </Pagination>
                                        
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}