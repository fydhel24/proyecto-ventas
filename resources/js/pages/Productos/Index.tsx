import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
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
import productosRoutes from '@/routes/productos';
import { Link, router, usePage } from '@inertiajs/react';
import {
    DollarSignIcon,
    EditIcon,
    PackageIcon,
    PlusIcon,
    SearchIcon,
    TagIcon,
    TrashIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';

// ✅ Importa los componentes de paginación de shadcn
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';

interface Producto {
    id: number;
    nombre: string;
    estado: '0' | '1'; // activo o inactivo como string
    precio_1: string;
    marca: { nombre_marca: string } | null;
    categoria: { nombre_cat: string } | null;
    fotos?: { url: string }[]; // relación cargada en controlador
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
                                : 'hover:bg-accent',
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
            <div className="container mx-auto px-4 py-8 sm:px-6">
                <div className="flex flex-col gap-8">
                    {/* Header Section */}
                    <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
                        <div className="space-y-1">
                            <h1 className="flex items-center gap-3 text-4xl font-black tracking-tight text-foreground">
                                <span className="rounded-xl bg-primary/10 p-2">
                                    <PackageIcon className="h-8 w-8 text-primary" />
                                </span>
                                Lista de{' '}
                                <span className="text-primary italic">
                                    Platillos
                                </span>
                            </h1>
                            <p className="text-sm font-medium text-muted-foreground">
                                Control total sobre todos tu platillos.
                            </p>
                        </div>
                        <Link href={productosRoutes.create()}>
                            <Button className="h-11 bg-primary px-6 font-bold text-white shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] hover:bg-primary/90 active:scale-95">
                                <PlusIcon className="mr-2 h-5 w-5" />
                                Nuevo Platillo
                            </Button>
                        </Link>
                    </div>

                    <Card className="overflow-hidden border-border/40 bg-background/50 shadow-xl shadow-primary/5 backdrop-blur-sm">
                        <CardHeader className="border-b border-border/40 bg-muted/20 px-6 pt-6 pb-6">
                            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
                                <div className="group relative w-full md:w-96">
                                    <SearchIcon className="absolute top-3 left-3.5 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                                    <input
                                        type="text"
                                        placeholder="Buscar por nombre..."
                                        className="w-full rounded-xl border border-border/50 bg-background py-2.5 pr-4 pl-10 shadow-sm transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                    />
                                </div>
                                <div className="text-[10px] font-black tracking-widest text-muted-foreground uppercase opacity-60">
                                    Total: {productos?.total || 0} Registros
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="p-0">
                            {productos.data.length === 0 ? (
                                <div className="py-20 text-center text-muted-foreground">
                                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-border/60 bg-muted/30">
                                        <PackageIcon className="h-8 w-8 opacity-20" />
                                    </div>
                                    <p className="font-bold">
                                        No se encontraron registros.
                                    </p>
                                    <p className="mt-1 text-xs opacity-60">
                                        Intenta ajustar los términos de
                                        búsqueda.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader className="bg-muted/30">
                                                <TableRow className="border-b border-border/40 hover:bg-transparent">
                                                    <TableHead className="h-12 text-center text-[11px] font-black tracking-widest text-muted-foreground uppercase">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <TagIcon className="h-3.5 w-3.5" />
                                                            Nombre
                                                        </div>
                                                    </TableHead>
                                                    <TableHead className="h-12 text-center text-[11px] font-black tracking-widest text-muted-foreground uppercase">
                                                        Categoría
                                                    </TableHead>
                                                    <TableHead className="h-12 text-center text-[11px] font-black tracking-widest text-muted-foreground uppercase">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <DollarSignIcon className="h-3.5 w-3.5" />
                                                            Precio Público
                                                        </div>
                                                    </TableHead>
                                                    <TableHead className="h-12 text-center text-[11px] font-black tracking-widest text-muted-foreground uppercase">
                                                        Fotos
                                                    </TableHead>
                                                    <TableHead className="h-12 text-center text-[11px] font-black tracking-widest text-muted-foreground uppercase">
                                                        Estado
                                                    </TableHead>
                                                    
                                                    <TableHead className="h-12 px-6 text-right text-[11px] font-black tracking-widest text-muted-foreground uppercase">
                                                        Acciones
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {productos.data.map((p) => (
                                                    <TableRow
                                                        key={p.id}
                                                        className="group border-b border-border/20 text-center transition-colors hover:bg-primary/[0.02] dark:hover:bg-primary/[0.05]"
                                                    >
                                                        <TableCell className="py-4 text-center text-sm font-bold">
                                                            {p.nombre}
                                                        </TableCell>
                                                        <TableCell className="text-center text-xs font-medium text-muted-foreground">
                                                            {p.categoria
                                                                ?.nombre_cat ||
                                                                '—'}
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <div className="inline-flex items-center justify-center rounded-xl border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-black text-primary shadow-sm">
                                                                <span className="mr-1 text-[10px] opacity-70">
                                                                    Bs
                                                                </span>{' '}
                                                                {Number(
                                                                    p.precio_1,
                                                                ).toLocaleString(
                                                                    'es-BO',
                                                                    {
                                                                        minimumFractionDigits: 2,
                                                                    },
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="py-4 text-xs">
                                                            <div className="flex items-center justify-center">
                                                                {p.fotos &&
                                                                p.fotos.length >
                                                                    0 ? (
                                                                    <img
                                                                        src={`/storage/${p.fotos[0].url}`}
                                                                        alt={
                                                                            p.nombre
                                                                        }
                                                                        className="h-10 w-10 rounded object-cover"
                                                                    />
                                                                ) : (
                                                                    <PackageIcon className="h-6 w-6 text-muted-foreground opacity-50" />
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-center text-xs font-medium">
                                                            <div className="flex items-center justify-center gap-2">
                                                                <Switch
                                                                    checked={
                                                                        p.estado ===
                                                                        '1'
                                                                    }
                                                                    onCheckedChange={() => {
                                                                        router.post(
                                                                            productosRoutes.toggleStatus(
                                                                                p.id,
                                                                            ),
                                                                            {},
                                                                            {
                                                                                preserveState: true,
                                                                            },
                                                                        );
                                                                    }}
                                                                />
                                                                <span
                                                                    className={`text-xs ${p.estado === '1' ? 'text-green-500' : 'text-muted-foreground'}`}
                                                                >
                                                                    {p.estado ===
                                                                    '1'
                                                                        ? 'Activo'
                                                                        : 'Inactivo'}
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        
                                                        <TableCell className="px-6 py-4 text-center">
                                                            <div className="flex justify-center gap-1.5 opacity-60 transition-opacity group-hover:opacity-100">
                                                                <Link
                                                                    href={productosRoutes.edit(
                                                                        p.id,
                                                                    )}
                                                                >
                                                                    <Button
                                                                        size="icon"
                                                                        variant="ghost"
                                                                        className="h-9 w-9 rounded-lg text-primary transition-all hover:bg-primary/10 active:scale-90"
                                                                        title="Editar Producto"
                                                                    >
                                                                        <EditIcon className="h-4.5 w-4.5" />
                                                                    </Button>
                                                                </Link>
                                                                <Button
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    className="h-9 w-9 rounded-lg text-red-500 transition-all hover:bg-red-50 hover:text-red-600 active:scale-90 dark:hover:bg-red-900/30"
                                                                    onClick={() =>
                                                                        eliminar(
                                                                            p.id,
                                                                        )
                                                                    }
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
                                    <div className="flex flex-col items-center justify-between gap-4 border-t border-border/40 bg-muted/10 p-6 sm:flex-row">
                                        <div className="text-xs font-black tracking-widest text-muted-foreground uppercase">
                                            Mostrando{' '}
                                            <span className="text-primary">
                                                {productos.data.length}
                                            </span>{' '}
                                            de{' '}
                                            <span className="text-primary">
                                                {productos?.total || 0}
                                            </span>{' '}
                                            registros
                                        </div>
                                        <Pagination className="mx-0 w-auto">
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
