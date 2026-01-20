// resources/js/Pages/Cuadernos/Index.tsx

import AddProductoModal from '@/components/AddProductoModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { Head, router } from '@inertiajs/react';
import {
    MapPin,
    Phone,
    User,
    Package,
    Truck,
    CheckCircle,
    Clock,
    Map as MapIcon,
    PlusIcon,
    Search,
    IdCard,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Trash2,
    Check
} from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { Link } from '@inertiajs/react'; // Import Link for pagination
import { Image as ImageIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface Imagen {
    id: number;
    url: string;
    pivot: {
        tipo: string;
        cantidad: number;
    };
}

interface Producto {
    id: number;
    nombre: string;
    marca?: { nombre_marca: string };
    pivot: {
        cantidad: number;
        precio_venta: string;
    };
}

interface ProductoModal {
    id: number;
    nombre: string;
    stock: number;
}

interface Cuaderno {
    id: number;
    nombre: string;
    ci: string;
    celular: string;
    departamento: string;
    provincia: string;
    tipo: string;
    estado: string;
    detalle: string | null;
    la_paz: boolean;
    enviado: boolean;
    p_listo: boolean;
    p_pendiente: boolean;
    created_at: string;
    productos: Producto[];
    imagenes?: Imagen[];
}

// Estado local para optimizar la UX
type LocalState = Record<number, Partial<Cuaderno>>;

// Pagination interfaces
interface Link {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedResponse<T> {
    data: T[];
    links: Link[];
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
}

export default function CuadernosIndex({
    cuadernos,
    productos,
    filters,
}: {
    cuadernos?: PaginatedResponse<Cuaderno>;
    productos: ProductoModal[];
    filters: { search?: string };
}) {
    const [localState, setLocalState] = useState<LocalState>({});
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedCuadernoId, setSelectedCuadernoId] = useState<number | null>(null);
    const [search, setSearch] = useState(filters.search || '');
    const [filter, setFilter] = useState(new URLSearchParams(window.location.search).get('filter') || '');
    const [imageModalOpen, setImageModalOpen] = useState(false);
    const [currentImage, setCurrentImage] = useState<string | null>(null);

    // Debounce search and filter
    useEffect(() => {
        const timer = setTimeout(() => {
            const currentParams = new URLSearchParams(window.location.search);

            // Sync search
            if (search) {
                currentParams.set('search', search);
            } else {
                currentParams.delete('search');
            }

            // Sync filter
            if (filter) {
                currentParams.set('filter', filter);
            } else {
                currentParams.delete('filter');
            }

            // Construct query string
            const queryRaw = currentParams.toString();
            const url = window.location.pathname + (queryRaw ? `?${queryRaw}` : '');

            // Only navigate if URL changed
            if (url !== window.location.pathname + window.location.search) {
                router.get(
                    url,
                    {},
                    {
                        preserveState: true,
                        preserveScroll: true,
                        replace: true,
                    },
                );
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [search, filter]);

    // Update local state when cuadernos data changes
    useEffect(() => {
        if (!cuadernos?.data) return;
        const initialState: LocalState = {};
        cuadernos.data.forEach((c) => {
            initialState[c.id] = {
                la_paz: c.la_paz,
                enviado: c.enviado,
                p_listo: c.p_listo,
                p_pendiente: c.p_pendiente,
            };
        });
        setLocalState(initialState);
    }, [cuadernos?.data]);

    // Lazy load cuadernos
    useEffect(() => {
        if (!cuadernos) {
            router.reload({ only: ['cuadernos'] });
        }
    }, [cuadernos]);

    // Actualiza solo el estado local (para inputs de texto)
    const updateLocalState = (
        id: number,
        field: keyof Cuaderno,
        value: string | boolean,
    ) => {
        setLocalState((prev) => ({
            ...prev,
            [id]: {
                ...prev[id],
                [field]: value,
            },
        }));
    };

    // Envía los cambios al servidor
    const persistChange = (
        id: number,
        field: keyof Cuaderno,
        value: string | boolean,
    ) => {
        router.patch(
            `/cuadernos/${id}`,
            { [field]: value },
            {
                preserveState: true,
                preserveScroll: true,
                onError: () => {
                    // Revertimos en caso de error buscando el valor original
                    const original = cuadernos.data.find((c) => c.id === id);
                    if (original) {
                        // @ts-ignore - Dynamic access is safe here given the context
                        updateLocalState(id, field, original[field]);
                    }
                },
            },
        );
    };

    // Helper para actualizar y guardar inmediatamente (para checkboxes)
    const updateAndSave = (
        id: number,
        field: keyof Cuaderno,
        value: boolean,
    ) => {
        updateLocalState(id, field, value);
        persistChange(id, field, value);
    };

    const handleAddProducto = (
        productoId: number,
        cantidad: number,
        precioVenta: number,
    ) => {
        if (!selectedCuadernoId) return;

        router.post(
            `/cuadernos/${selectedCuadernoId}/productos`,
            {
                producto_id: productoId,
                cantidad,
                precio_venta: precioVenta,
            },
            {
                onSuccess: () => {
                    // Reload to update the productos list
                    router.reload();
                },
            },
        );
    };
    const handleConfirm = (id: number) => {
        if (confirm('¿Confirmar pedido? Esto marcará el estado como Confirmado y Enviado.')) {
            router.patch(`/cuadernos/${id}`, {
                estado: 'Confirmado',
                enviado: true,
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Estás seguro de eliminar este registro?')) {
            router.delete(`/cuadernos/${id}`);
        }
    };


    return (
        <AppLayout>
            <Head title="Cuadernos" />
            <div className="container mx-auto py-6">
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Gestión de Cuadernos</h1>
                        <p className="text-muted-foreground">Administra las ventas, clientes y estados de los pedidos.</p>
                    </div>

                    <Card className="border-none shadow-md">
                        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4">
                            <div className="flex flex-col gap-1">
                                <CardTitle className="text-xl">Listado de Ordenes</CardTitle>
                                <CardDescription>Gestiona el seguimiento y detalles de cada venta.</CardDescription>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                                <div className="flex bg-muted p-1 rounded-lg gap-1 overflow-x-auto">
                                    <Button
                                        variant={filter === '' ? 'secondary' : 'ghost'}
                                        size="sm"
                                        className="h-8 text-xs px-3"
                                        onClick={() => setFilter('')}
                                    >
                                        Todos
                                    </Button>
                                    <Button
                                        variant={filter === 'la_paz' ? 'secondary' : 'ghost'}
                                        size="sm"
                                        className="h-8 text-xs px-3 gap-1.5"
                                        onClick={() => setFilter('la_paz')}
                                    >
                                        <MapPin className="w-3.5 h-3.5 text-blue-500" />
                                        La Paz
                                    </Button>
                                    <Button
                                        variant={filter === 'enviado' ? 'secondary' : 'ghost'}
                                        size="sm"
                                        className="h-8 text-xs px-3 gap-1.5"
                                        onClick={() => setFilter('enviado')}
                                    >
                                        <Truck className="w-3.5 h-3.5 text-orange-500" />
                                        Enviado
                                    </Button>
                                    <Button
                                        variant={filter === 'p_listo' ? 'secondary' : 'ghost'}
                                        size="sm"
                                        className="h-8 text-xs px-3 gap-1.5"
                                        onClick={() => setFilter('p_listo')}
                                    >
                                        <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                                        Listo
                                    </Button>
                                    <Button
                                        variant={filter === 'p_pendiente' ? 'secondary' : 'ghost'}
                                        size="sm"
                                        className="h-8 text-xs px-3 gap-1.5"
                                        onClick={() => setFilter('p_pendiente')}
                                    >
                                        <Clock className="w-3.5 h-3.5 text-red-500" />
                                        Pendiente
                                    </Button>
                                </div>
                                <div className="relative w-full md:w-64">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar..."
                                        className="pl-8 h-9"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                                        <TableHead className="w-[50px]">ID</TableHead>
                                        <TableHead className="text-center w-[60px]" title="La Paz"><MapPin className="w-4 h-4 mx-auto text-blue-500" /></TableHead>
                                        <TableHead className="text-center w-[60px]" title="Enviado"><Truck className="w-4 h-4 mx-auto text-orange-500" /></TableHead>
                                        <TableHead className="text-center w-[60px]" title="Listo"><CheckCircle className="w-4 h-4 mx-auto text-green-500" /></TableHead>
                                        <TableHead className="text-center w-[60px]" title="Pendiente"><Clock className="w-4 h-4 mx-auto text-red-500" /></TableHead>
                                        <TableHead className="min-w-[200px]">Cliente</TableHead>
                                        <TableHead className="min-w-[180px]">Ubicación</TableHead>
                                        <TableHead>Productos</TableHead>
                                        <TableHead>Imágenes</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {!cuadernos ? (
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <TableRow key={i}>
                                                <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                                                <TableCell><Skeleton className="h-4 w-4 mx-auto rounded-full" /></TableCell>
                                                <TableCell><Skeleton className="h-4 w-4 mx-auto rounded-full" /></TableCell>
                                                <TableCell><Skeleton className="h-4 w-4 mx-auto rounded-full" /></TableCell>
                                                <TableCell><Skeleton className="h-4 w-4 mx-auto rounded-full" /></TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-2">
                                                        <Skeleton className="h-7 w-full" />
                                                        <Skeleton className="h-7 w-full" />
                                                        <Skeleton className="h-7 w-full" />
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-2">
                                                        <Skeleton className="h-7 w-full" />
                                                        <Skeleton className="h-7 w-full" />
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-2">
                                                        <Skeleton className="h-6 w-32" />
                                                        <Skeleton className="h-6 w-24" />
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-1">
                                                        <Skeleton className="h-7 w-16" />
                                                        <Skeleton className="h-7 w-16" />
                                                    </div>
                                                </TableCell>
                                                <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Skeleton className="h-8 w-8" />
                                                        <Skeleton className="h-8 w-8" />
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : cuadernos.data.length > 0 ? (
                                        cuadernos.data.map((cuaderno) => {
                                            const local =
                                                localState[cuaderno.id] || {};
                                            const la_paz =
                                                local.la_paz ?? cuaderno.la_paz;
                                            const enviado =
                                                local.enviado ?? cuaderno.enviado;
                                            const p_listo =
                                                local.p_listo ?? cuaderno.p_listo;
                                            const p_pendiente =
                                                local.p_pendiente ??
                                                cuaderno.p_pendiente;

                                            return (
                                                <TableRow key={cuaderno.id} className="group hover:bg-muted/30 transition-colors">
                                                    <TableCell className="font-medium text-muted-foreground text-xs">
                                                        #{cuaderno.id}
                                                    </TableCell>

                                                    <TableCell className="text-center">
                                                        <Checkbox
                                                            className="mx-auto data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                                                            checked={la_paz}
                                                            onCheckedChange={(
                                                                checked,
                                                            ) => {
                                                                updateAndSave(
                                                                    cuaderno.id,
                                                                    'la_paz',
                                                                    Boolean(
                                                                        checked,
                                                                    ),
                                                                );
                                                            }}
                                                        />
                                                    </TableCell>

                                                    <TableCell className="text-center">
                                                        <Checkbox
                                                            className="mx-auto data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                                                            checked={enviado}
                                                            onCheckedChange={(
                                                                checked,
                                                            ) => {
                                                                updateAndSave(
                                                                    cuaderno.id,
                                                                    'enviado',
                                                                    Boolean(
                                                                        checked,
                                                                    ),
                                                                );
                                                            }}
                                                        />
                                                    </TableCell>

                                                    <TableCell className="text-center">
                                                        <Checkbox
                                                            className="mx-auto data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                                                            checked={p_listo}
                                                            onCheckedChange={(
                                                                checked,
                                                            ) => {
                                                                updateAndSave(
                                                                    cuaderno.id,
                                                                    'p_listo',
                                                                    Boolean(
                                                                        checked,
                                                                    ),
                                                                );
                                                            }}
                                                        />
                                                    </TableCell>

                                                    <TableCell className="text-center">
                                                        <Checkbox
                                                            className="mx-auto data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
                                                            checked={p_pendiente}
                                                            onCheckedChange={(
                                                                checked,
                                                            ) => {
                                                                updateAndSave(
                                                                    cuaderno.id,
                                                                    'p_pendiente',
                                                                    Boolean(
                                                                        checked,
                                                                    ),
                                                                );
                                                            }}
                                                        />
                                                    </TableCell>

                                                    <TableCell>
                                                        <div className="flex flex-col gap-2 min-w-[180px]">
                                                            <div className="relative">
                                                                <User className="absolute left-2 top-1.5 h-3.5 w-3.5 text-muted-foreground" />
                                                                <Input
                                                                    className="h-7 pl-7 text-xs border-transparent bg-transparent hover:bg-muted focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-input transition-all"
                                                                    placeholder="Nombre"
                                                                    value={local.nombre ?? cuaderno.nombre ?? ''}
                                                                    onChange={(e) => updateLocalState(cuaderno.id, 'nombre', e.target.value)}
                                                                    onBlur={(e) => persistChange(cuaderno.id, 'nombre', e.target.value)}
                                                                />
                                                            </div>
                                                            <div className="relative">
                                                                <IdCard className="absolute left-2 top-1.5 h-3.5 w-3.5 text-muted-foreground" />
                                                                <Input
                                                                    className="h-7 pl-7 text-xs border-transparent bg-transparent hover:bg-muted focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-input transition-all"
                                                                    placeholder="CI"
                                                                    value={local.ci ?? cuaderno.ci ?? ''}
                                                                    onChange={(e) => updateLocalState(cuaderno.id, 'ci', e.target.value)}
                                                                    onBlur={(e) => persistChange(cuaderno.id, 'ci', e.target.value)}
                                                                />
                                                            </div>
                                                            <div className="relative">
                                                                <Phone className="absolute left-2 top-1.5 h-3.5 w-3.5 text-muted-foreground" />
                                                                <Input
                                                                    className="h-7 pl-7 text-xs border-transparent bg-transparent hover:bg-muted focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-input transition-all"
                                                                    placeholder="Celular"
                                                                    value={local.celular ?? cuaderno.celular ?? ''}
                                                                    onChange={(e) => updateLocalState(cuaderno.id, 'celular', e.target.value)}
                                                                    onBlur={(e) => persistChange(cuaderno.id, 'celular', e.target.value)}
                                                                />
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col gap-2 min-w-[160px]">
                                                            <div className="relative">
                                                                <MapIcon className="absolute left-2 top-1.5 h-3.5 w-3.5 text-muted-foreground" />
                                                                <Input
                                                                    className="h-7 pl-7 text-xs border-transparent bg-transparent hover:bg-muted focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-input transition-all"
                                                                    placeholder="Departamento"
                                                                    value={local.departamento ?? cuaderno.departamento ?? ''}
                                                                    onChange={(e) => updateLocalState(cuaderno.id, 'departamento', e.target.value)}
                                                                    onBlur={(e) => persistChange(cuaderno.id, 'departamento', e.target.value)}
                                                                />
                                                            </div>
                                                            <div className="relative">
                                                                <MapPin className="absolute left-2 top-1.5 h-3.5 w-3.5 text-muted-foreground" />
                                                                <Input
                                                                    className="h-7 pl-7 text-xs border-transparent bg-transparent hover:bg-muted focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-input transition-all"
                                                                    placeholder="Provincia"
                                                                    value={local.provincia ?? cuaderno.provincia ?? ''}
                                                                    onChange={(e) => updateLocalState(cuaderno.id, 'provincia', e.target.value)}
                                                                    onBlur={(e) => persistChange(cuaderno.id, 'provincia', e.target.value)}
                                                                />
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col gap-2 min-w-[200px]">
                                                            <div className="flex flex-col gap-1.5">
                                                                {cuaderno.productos.map((p) => (
                                                                    <div key={p.id} className="flex items-center justify-between text-xs p-1.5 rounded-md bg-muted/50 border border-transparent hover:border-border transition-colors group/item">
                                                                        <span className="font-medium truncate max-w-[100px]" title={p.nombre}>{p.nombre}</span>
                                                                        <div className="flex items-center gap-2 text-muted-foreground">
                                                                            <span className="bg-background px-1.5 rounded border text-[10px]">x{p.pivot.cantidad}</span>
                                                                            <span className="font-mono text-[10px]">{p.pivot.precio_venta} Bs</span>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="w-full h-7 text-xs gap-1 dashed border-dashed text-muted-foreground hover:text-primary"
                                                                onClick={() => {
                                                                    setSelectedCuadernoId(cuaderno.id);
                                                                    setModalOpen(true);
                                                                }}
                                                            >
                                                                <PlusIcon className="h-3 w-3" />
                                                                Agregar
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-wrap gap-1 min-w-[100px]">
                                                            {cuaderno.imagenes && cuaderno.imagenes.length > 0 ? (
                                                                cuaderno.imagenes.map((img) => (
                                                                    <div key={img.id} className="flex items-center gap-1">
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            className="h-7 text-xs px-2"
                                                                            onClick={() => {
                                                                                setCurrentImage(img.url);
                                                                                setImageModalOpen(true);
                                                                            }}
                                                                        >
                                                                            {img.pivot?.tipo === 'producto' ? 'Producto' :
                                                                                img.pivot?.tipo === 'comprobante' ? 'Comprobante' :
                                                                                    'Ver Imagen'}
                                                                        </Button>
                                                                        {img.pivot?.tipo === 'producto' && img.pivot?.cantidad > 0 && (
                                                                            <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full border border-purple-200">
                                                                                {img.pivot.cantidad}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <div className="w-full text-center text-muted-foreground text-xs py-2 flex flex-col items-center gap-1">
                                                                    <ImageIcon className="w-4 h-4 opacity-50" />
                                                                    <span className="text-[10px]">Sin fotos</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={
                                                            cuaderno.estado === 'Entregado' ? 'default' :
                                                                cuaderno.estado === 'Pendiente' ? 'destructive' :
                                                                    'outline'
                                                        }>
                                                            {cuaderno.estado}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-green-500 hover:text-green-600 hover:bg-green-100"
                                                                onClick={() => handleConfirm(cuaderno.id)}
                                                                title="Confirmar"
                                                            >
                                                                <Check className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-100"
                                                                onClick={() => handleDelete(cuaderno.id)}
                                                                title="Eliminar"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={12}
                                                className="text-center"
                                            >
                                                No hay cuadernos registrados.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                            {/* Pagination */}
                            {cuadernos && (
                                <div className="flex items-center justify-between mt-4">
                                    <div className="text-sm text-muted-foreground">
                                        Mostrando {cuadernos.from} a {cuadernos.to} de {cuadernos.total} resultados
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {cuadernos.links.map((link, i) => (
                                            <Button
                                                key={i}
                                                variant={link.active ? "default" : "outline"}
                                                size="sm"
                                                className={cn("h-8 w-8 p-0", !link.url && "opacity-50 cursor-not-allowed")}
                                                asChild={!!link.url}
                                                disabled={!link.url}
                                            >
                                                {link.url ? (
                                                    <Link href={link.url} preserveState preserveScroll>
                                                        <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                                    </Link>
                                                ) : (
                                                    <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                                )}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
            <AddProductoModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleAddProducto}
                productos={productos}
            />
            <Dialog open={imageModalOpen} onOpenChange={setImageModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Vista de Imagen</DialogTitle>
                    </DialogHeader>
                    <div className="flex items-center justify-center p-4">
                        {currentImage && (
                            <img
                                src={currentImage}
                                alt="Vista previa"
                                className="max-w-full max-h-[80vh] object-contain rounded-md"
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
