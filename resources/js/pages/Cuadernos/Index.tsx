// resources/js/Pages/Cuadernos/Index.tsx

"use client"

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
import * as routes from '@/routes/cuadernos';
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
    type ColumnDef,
    type ColumnFiltersState,
    type SortingState,
    type VisibilityState,
    type RowSelectionState,
} from '@tanstack/react-table'
import {
    MapPin,
    Phone,
    User,
    Package,
    Truck,
    CheckCircle,
    Clock,
    FileText,
    Map as MapIcon,
    PlusIcon,
    Search,
    IdCard,
    Trash2,
    Check
} from 'lucide-react';
import React, { useEffect, useState, useMemo } from 'react';
import { Link } from '@inertiajs/react';
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

type LocalState = Record<number, Partial<Cuaderno>>;

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedResponse<T> {
    data: T[];
    links: PaginationLink[];
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
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

    // --- Única fuente de verdad para la selección persistente ---
    const [rowSelection, setRowSelection] = useState<RowSelectionState>(() => {
        if (typeof window === 'undefined') return {};
        const saved = localStorage.getItem('selected_cuadernos_v3');
        if (!saved) return {};
        try {
            return JSON.parse(saved);
        } catch (e) {
            console.error("Error al cargar seleccion de localStorage", e);
            return {};
        }
    });

    const [filter, setFilter] = useState(new URLSearchParams(window.location.search).get('filter') || '');
    const [imageModalOpen, setImageModalOpen] = useState(false);
    const [currentImage, setCurrentImage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Persistir selección
    useEffect(() => {
        localStorage.setItem('selected_cuadernos_v3', JSON.stringify(rowSelection));
    }, [rowSelection]);

    // IDs seleccionados derivados para compatibilidad con lógica de backend/PDF
    const selectedIds = useMemo(() => {
        return Object.keys(rowSelection)
            .filter(id => rowSelection[id])
            .map(id => parseInt(id));
    }, [rowSelection]);

    // Debounce búsqueda
    useEffect(() => {
        const t = setTimeout(() => {
            setColumnFilters((prev) => {
                const others = prev.filter((p) => p.id !== 'nombre');
                if (search) return [...others, { id: 'nombre', value: search }];
                return others;
            });
        }, 200);
        return () => clearTimeout(t);
    }, [search]);

    // Sincronizar estado local de inputs
    useEffect(() => {
        if (!cuadernos?.data) return;
        const initialState: LocalState = {};
        cuadernos.data.forEach((c) => {
            initialState[c.id] = {
                la_paz: c.la_paz,
                enviado: c.enviado,
                p_listo: c.p_listo,
                p_pendiente: c.p_pendiente,
                nombre: c.nombre,
                ci: c.ci,
                celular: c.celular,
                departamento: c.departamento,
                provincia: c.provincia
            };
        });
        setLocalState(initialState);
    }, [cuadernos?.data]);

    const updateLocalState = (id: number, field: keyof Cuaderno, value: string | boolean) => {
        setLocalState(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
    };

    const persistChange = (id: number, field: keyof Cuaderno, value: string | boolean) => {
        const item = cuadernos?.data.find(c => c.id === id);
        if (item && item[field] === value) return;
        router.patch(`/cuadernos/${id}`, { [field]: value }, { preserveState: true, preserveScroll: true });
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.currentTarget.blur();
        }
    };

    const updateAndSave = (id: number, field: keyof Cuaderno, value: boolean) => {
        updateLocalState(id, field, value);
        persistChange(id, field, value);
    };

    const handleAddProducto = (productoId: number, cantidad: number, precioVenta: number) => {
        if (!selectedCuadernoId) return;
        router.post(`/cuadernos/${selectedCuadernoId}/productos`, { producto_id: productoId, cantidad, precio_venta: precioVenta }, {
            onSuccess: () => {
                setModalOpen(false);
                router.reload();
            }
        });
    };

    const handleConfirm = (id: number) => {
        if (confirm('¿Confirmar pedido?')) {
            router.patch(`/cuadernos/${id}`, { estado: 'Confirmado', enviado: true });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Eliminar registro?')) {
            router.delete(`/cuadernos/${id}`);
        }
    };

    const handleClearSelection = () => {
        setRowSelection({});
        localStorage.removeItem('selected_cuadernos_v3');
    };

    const hasConfirmedSelection = () => {
        if (!cuadernos?.data) return false;
        return selectedIds.some(id => {
            const c = cuadernos.data.find(item => item.id === id);
            return c?.estado === 'Confirmado';
        });
    };

    const handlePdfRespaldo = () => {
        if (selectedIds.length === 0) return alert('Selecciona al menos un registro.');
        const url = routes.confirmarSeleccion.url({ query: { ids: selectedIds.map(String), view_pdf: '1' } });
        window.open(url, '_blank');
    };

    const handleGenerarFichas = () => {
        const url = routes.generarFichas.url({ query: { ids: selectedIds.map(String) } });
        window.open(url, '_blank');
    };

    const handleGenerarNotas = () => {
        const url = routes.generarNotas.url({ query: { ids: selectedIds.map(String) } });
        window.open(url, '_blank');
    };

    const handleBulkConfirm = () => {
        if (hasConfirmedSelection()) return alert('Hay pedidos ya confirmados.');
        const count = selectedIds.length;
        const msg = count > 0 ? `¿Confirmar ${count} pedidos?` : '¿Confirmar TODO lo que está LISTO?';
        if (confirm(msg)) {
            setIsProcessing(true);
            router.post(routes.confirmarSeleccion.url(), { ids: selectedIds }, {
                onSuccess: () => {
                    const url = routes.confirmarSeleccion.url({ query: { ids: selectedIds.map(String), view_pdf: '1' } });
                    window.open(url, '_blank');
                    handleClearSelection();
                },
                onFinish: () => setIsProcessing(false)
            });
        }
    };

    const columns = useMemo<ColumnDef<Cuaderno>[]>(
        () => [
            {
                id: 'select',
                header: ({ table }) => (
                    <Checkbox
                        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
                        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                        aria-label="Select all"
                    />
                ),
                cell: ({ row }) => (
                    <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(value) => row.toggleSelected(!!value)}
                        aria-label="Select row"
                    />
                ),
                enableSorting: false,
                enableHiding: false,
            },
            {
                id: 'id',
                header: 'ID',
                accessorFn: (row) => row.id,
                cell: ({ getValue }) => <div className="font-medium text-muted-foreground text-xs">#{getValue<number>()}</div>,
            },
            {
                id: 'flags',
                header: () => (
                    <div className="flex gap-2 justify-center">
                        <MapPin className="w-4 h-4 text-blue-500" />
                        <Truck className="w-4 h-4 text-orange-500" />
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <Clock className="w-4 h-4 text-red-500" />
                    </div>
                ),
                cell: ({ row, table }) => {
                    const item = row.original;
                    const meta = table.options.meta as any;
                    const local = meta?.localState[item.id] || {};
                    return (
                        <div className="flex gap-2 justify-center">
                            <Checkbox
                                checked={local.la_paz ?? item.la_paz}
                                onCheckedChange={(v) => meta?.updateAndSave(item.id, 'la_paz', Boolean(v))}
                                className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500 border-blue-500/30"
                            />
                            <Checkbox
                                checked={local.enviado ?? item.enviado}
                                onCheckedChange={(v) => meta?.updateAndSave(item.id, 'enviado', Boolean(v))}
                                className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500 border-orange-500/30"
                            />
                            <Checkbox
                                checked={local.p_listo ?? item.p_listo}
                                onCheckedChange={(v) => meta?.updateAndSave(item.id, 'p_listo', Boolean(v))}
                                className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600 border-green-600/30"
                            />
                            <Checkbox
                                checked={local.p_pendiente ?? item.p_pendiente}
                                onCheckedChange={(v) => meta?.updateAndSave(item.id, 'p_pendiente', Boolean(v))}
                                className="data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500 border-red-500/30"
                            />
                        </div>
                    );
                },
                enableSorting: false,
            },
            {
                accessorKey: 'nombre',
                header: 'Cliente',
                cell: ({ row, table }) => {
                    const item = row.original;
                    const meta = table.options.meta as any;
                    const local = meta?.localState[item.id] || {};
                    return (
                        <div className="flex flex-col gap-2 min-w-[180px]">
                            <div className="relative">
                                <User className="absolute left-2 top-1.5 h-3.5 w-3.5 text-muted-foreground" />
                                <Input
                                    className="h-7 pl-7 text-xs border-transparent bg-transparent hover:bg-muted focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-input transition-all"
                                    placeholder="Nombre"
                                    value={local.nombre ?? item.nombre ?? ''}
                                    onChange={(e) => meta?.updateLocalState(item.id, 'nombre', e.target.value)}
                                    onBlur={(e) => meta?.persistChange(item.id, 'nombre', e.target.value)}
                                    onKeyDown={meta?.handleKeyDown}
                                />
                            </div>
                            <div className="relative">
                                <IdCard className="absolute left-2 top-1.5 h-3.5 w-3.5 text-muted-foreground" />
                                <Input
                                    className="h-7 pl-7 text-xs border-transparent bg-muted hover:bg-muted focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-ring transition-all"
                                    placeholder="CI"
                                    value={local.ci ?? item.ci ?? ''}
                                    onChange={(e) => meta?.updateLocalState(item.id, 'ci', e.target.value)}
                                    onBlur={(e) => meta?.persistChange(item.id, 'ci', e.target.value)}
                                    onKeyDown={meta?.handleKeyDown}
                                />
                            </div>
                        </div>
                    );
                },
            },
            {
                id: 'ubicacion',
                header: 'Ubicación',
                cell: ({ row, table }) => {
                    const item = row.original;
                    const meta = table.options.meta as any;
                    const local = meta?.localState[item.id] || {};
                    return (
                        <div className="flex flex-col gap-2 min-w-[160px]">
                            <div className="relative">
                                <MapIcon className="absolute left-2 top-1.5 h-3.5 w-3.5 text-muted-foreground" />
                                <Input
                                    className="h-7 pl-7 text-xs border-transparent bg-transparent hover:bg-muted transition-all"
                                    placeholder="Departamento"
                                    value={local.departamento ?? item.departamento ?? ''}
                                    onChange={(e) => meta?.updateLocalState(item.id, 'departamento', e.target.value)}
                                    onBlur={(e) => meta?.persistChange(item.id, 'departamento', e.target.value)}
                                    onKeyDown={meta?.handleKeyDown}
                                />
                            </div>
                            <div className="relative">
                                <MapPin className="absolute left-2 top-1.5 h-3.5 w-3.5 text-muted-foreground" />
                                <Input
                                    className="h-7 pl-7 text-xs border-transparent bg-transparent hover:bg-muted transition-all"
                                    placeholder="Provincia"
                                    value={local.provincia ?? item.provincia ?? ''}
                                    onChange={(e) => meta?.updateLocalState(item.id, 'provincia', e.target.value)}
                                    onBlur={(e) => meta?.persistChange(item.id, 'provincia', e.target.value)}
                                    onKeyDown={meta?.handleKeyDown}
                                />
                            </div>
                        </div>
                    );
                },
            },
            {
                id: 'productos',
                header: 'Productos',
                cell: ({ row }) => {
                    const item = row.original;
                    return (
                        <div className="flex flex-col gap-2 min-w-[200px]">
                            <div className="flex flex-col gap-1.5">
                                {item.productos.map((p, i) => (
                                    <div key={`${p.id}-${i}`} className="flex items-center justify-between text-xs p-1.5 rounded-md bg-muted/50 border border-transparent hover:border-border transition-colors">
                                        <span className="font-medium truncate max-w-[100px]" title={p.nombre}>{p.nombre}</span>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <span className="bg-background px-1.5 rounded border text-[10px]">x{p.pivot.cantidad}</span>
                                            <span className="font-mono text-[10px] text-primary">{p.pivot.precio_venta} Bs</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Button
                                size="sm"
                                variant="outline"
                                className="w-full h-8 text-xs font-bold border-dashed border-2 hover:bg-primary/[0.05] hover:border-primary/50 text-muted-foreground hover:text-primary transition-all rounded-xl"
                                onClick={() => { setSelectedCuadernoId(item.id); setModalOpen(true); }}
                            >
                                <PlusIcon className="h-3.5 w-3.5 mr-2" /> Agregar Item
                            </Button>
                        </div>
                    );
                },
            },
            {
                id: 'imagenes',
                header: 'Imágenes',
                cell: ({ row }) => {
                    const item = row.original;
                    return (
                        <div className="flex flex-wrap gap-1 min-w-[100px]">
                            {item.imagenes && item.imagenes.length > 0 ? (
                                item.imagenes.map((img) => (
                                    <div key={img.id} className="relative group/img">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 text-[10px] px-3 font-bold border-border/40 hover:border-primary/50 transition-all rounded-full bg-background/50"
                                            onClick={() => { setCurrentImage(img.url); setImageModalOpen(true); }}
                                        >
                                            {img.pivot?.tipo === 'producto' ? 'Producto' : img.pivot?.tipo === 'comprobante' ? 'Pago' : 'Ver'}
                                        </Button>
                                    </div>
                                ))
                            ) : (
                                <div className="w-full text-center text-muted-foreground text-xs py-2 flex items-center justify-center gap-2 bg-muted/20 rounded-lg border border-dashed border-border/60">
                                    <ImageIcon className="w-4 h-4 opacity-30" />
                                    <span className="text-[9px] uppercase font-black tracking-tighter opacity-50">Sin Archivos</span>
                                </div>
                            )}
                        </div>
                    );
                },
            },
            {
                id: 'estado',
                header: 'Estado',
                cell: ({ row }) => {
                    const item = row.original;
                    const variant = item.estado === 'Confirmado' ? 'default' : item.estado === 'Pendiente' ? 'destructive' : 'outline';
                    return (
                        <Badge
                            variant={variant}
                            className={cn(
                                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border-2 shadow-sm",
                                item.estado === 'Confirmado' && "bg-green-500/10 text-green-600 border-green-500/20 shadow-green-500/5",
                                item.estado === 'Pendiente' && "bg-red-500/10 text-red-600 border-red-500/20 shadow-red-500/5"
                            )}
                        >
                            {item.estado}
                        </Badge>
                    );
                },
            },
            {
                id: 'actions',
                header: 'Acciones',
                cell: ({ row }) => {
                    const item = row.original;
                    return (
                        <div className="flex justify-end gap-1.5">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 text-green-600 hover:text-green-700 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-all active:scale-90"
                                onClick={() => handleConfirm(item.id)}
                                title="Confirmar"
                            >
                                <CheckCircle className="h-5 w-5" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all active:scale-90"
                                onClick={() => handleDelete(item.id)}
                                title="Eliminar"
                            >
                                <Trash2 className="h-5 w-5" />
                            </Button>
                        </div>
                    );
                },
                enableHiding: false,
            },
        ],
        []
    );

    const table = useReactTable({
        data: cuadernos?.data || [],
        columns,
        getRowId: row => row.id.toString(),
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        meta: {
            localState,
            updateLocalState,
            persistChange,
            handleKeyDown,
            updateAndSave,
        },
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    });

    return (
        <AppLayout>
            <Head title="Gestión de Cuadernos" />
            <div className="container mx-auto py-8 px-4 sm:px-6">
                <div className="flex flex-col gap-8">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <h1 className="text-4xl font-black tracking-tight text-foreground flex items-center gap-3">
                                <span className="p-2 bg-primary/10 rounded-xl">
                                    <FileText className="w-8 h-8 text-primary" />
                                </span>
                                Gestión de <span className="text-primary italic">Cuadernos</span>
                            </h1>
                            <p className="text-muted-foreground text-sm font-medium">
                                Administra ventas, clientes y logística en tiempo real.
                            </p>
                        </div>
                    </div>

                    <Card className="border-border/40 shadow-xl shadow-primary/5 bg-background/50 backdrop-blur-sm overflow-hidden">
                        <CardHeader className="border-b border-border/40 bg-muted/20 pb-6">
                            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                                    {filter === 'p_listo' && (
                                        <div className="flex flex-wrap gap-2">
                                            <Button onClick={handleBulkConfirm} disabled={isProcessing} className="bg-green-600 hover:bg-green-700 h-10 font-bold text-white shadow-lg shadow-green-600/20 px-6 transition-all hover:scale-[1.02] active:scale-95">
                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                {selectedIds.length > 0 ? `Confirmar ${selectedIds.length}` : 'Confirmar Todo'}
                                            </Button>
                                            <Button onClick={handlePdfRespaldo} variant="outline" className="h-10 border-blue-200 dark:border-blue-900/50 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-semibold transition-all">
                                                <FileText className="w-4 h-4 mr-2" />
                                                Respaldo ({selectedIds.length || '0'})
                                            </Button>
                                            <Button onClick={handleGenerarFichas} variant="outline" className="h-10 border-purple-200 dark:border-purple-900/50 text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 font-semibold transition-all">
                                                <Package className="w-4 h-4 mr-2" />
                                                Fichas ({selectedIds.length || '0'})
                                            </Button>
                                            <Button onClick={handleGenerarNotas} variant="outline" className="h-10 border-orange-200 dark:border-orange-900/50 text-orange-700 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 font-semibold transition-all">
                                                <FileText className="w-4 h-4 mr-2" />
                                                Notas ({selectedIds.length || '0'})
                                            </Button>
                                            {selectedIds.length > 0 && (
                                                <Button onClick={handleClearSelection} variant="ghost" className="h-10 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 font-bold transition-all">
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    Limpiar
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="relative w-full lg:w-80 group">
                                    <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <Input
                                        placeholder="Buscar cliente, CI, ciudad..."
                                        className="pl-10 h-10 w-full bg-background border-border/50 focus-visible:ring-primary/30 focus-visible:border-primary transition-all shadow-sm"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-muted/30">
                                        {table.getHeaderGroups().map(group => (
                                            <TableRow key={group.id} className="border-b border-border/40 hover:bg-transparent">
                                                {group.headers.map(header => (
                                                    <TableHead key={header.id} className="text-[11px] uppercase font-black tracking-widest text-muted-foreground h-12">
                                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                                    </TableHead>
                                                ))}
                                            </TableRow>
                                        ))}
                                    </TableHeader>
                                    <TableBody>
                                        {table.getRowModel().rows.length ? (
                                            table.getRowModel().rows.map(row => (
                                                <TableRow key={row.id} className="group hover:bg-primary/[0.02] dark:hover:bg-primary/[0.05] transition-colors border-b border-border/20">
                                                    {row.getVisibleCells().map(cell => (
                                                        <TableCell key={cell.id} className="py-4 px-4 align-top">
                                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <Search className="w-8 h-8 opacity-20" />
                                                        <p className="font-medium">No se encontraron registros en el cuaderno.</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination section */}
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 border-t border-border/40 bg-muted/10">
                                <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                                    <span className="text-primary">{cuadernos?.from || 0}-{cuadernos?.to || 0}</span> de {cuadernos?.total || 0} registros
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {cuadernos?.links?.map((link, i) => (
                                        <Button
                                            key={i}
                                            variant={link.active ? "default" : "outline"}
                                            size="sm"
                                            asChild={!!link.url}
                                            disabled={!link.url}
                                            className={cn(
                                                "h-9 min-w-[36px] font-bold transition-all",
                                                link.active ? "shadow-md shadow-primary/20" : "hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                                            )}
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
                        </CardContent>
                    </Card>
                </div>
            </div>
            <AddProductoModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleAddProducto} productos={productos} />
            <Dialog open={imageModalOpen} onOpenChange={setImageModalOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader><DialogTitle>Vista Previa de Imagen</DialogTitle></DialogHeader>
                    {currentImage && <img src={currentImage} className="max-w-full h-auto rounded-lg shadow-lg border" alt="Vista previa" />}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
