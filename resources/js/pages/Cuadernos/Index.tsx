// resources/js/Pages/Cuadernos/Index.tsx

'use client';

import AddProductoModal from '@/components/AddProductoModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
import { cn } from '@/lib/utils';
import * as routes from '@/routes/cuadernos';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
    type ColumnDef,
    type ColumnFiltersState,
    type RowSelectionState,
    type SortingState,
    type VisibilityState,
} from '@tanstack/react-table';
import {
    CheckCircle,
    Clock,
    FileText,
    IdCard,
    Package,
    Phone,
    PlusIcon,
    Search,
    Trash2,
    User,
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';

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
    departamento: string; // Reutilizado para Fecha/Ref adicional
    provincia: string; // Reutilizado para Hora/Ref adicional
    tipo: string;
    estado: string;
    detalle: string | null;
    created_at: string;
    productos: Producto[];
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
    const [selectedCuadernoId, setSelectedCuadernoId] = useState<number | null>(
        null,
    );
    const [search, setSearch] = useState(filters.search || '');
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
        flags: false,
        ubicacion: false,
        imagenes: false,
    });

    // --- Única fuente de verdad para la selección persistente ---
    const [rowSelection, setRowSelection] = useState<RowSelectionState>(() => {
        if (typeof window === 'undefined') return {};
        const saved = localStorage.getItem('selected_cuadernos_v3');
        if (!saved) return {};
        try {
            return JSON.parse(saved);
        } catch (e) {
            console.error('Error al cargar seleccion de localStorage', e);
            return {};
        }
    });

    const [filter, setFilter] = useState(
        new URLSearchParams(window.location.search).get('filter') || '',
    );
    const [imageModalOpen, setImageModalOpen] = useState(false);
    const [currentImage, setCurrentImage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Persistir selección
    useEffect(() => {
        localStorage.setItem(
            'selected_cuadernos_v3',
            JSON.stringify(rowSelection),
        );
    }, [rowSelection]);

    // Eliminar columnas de flags, ubicación e imágenes por defecto
    useEffect(() => {
        setColumnVisibility({
            flags: false,
            ubicacion: false,
            imagenes: false,
        });
    }, []);

    // Escuchar URL de PDF para abrir automáticamente
    const { flash } = usePage().props as any;
    useEffect(() => {
        if (flash?.pdf_url) {
            window.open(flash.pdf_url, '_blank');
        }
    }, [flash?.pdf_url]);

    // IDs seleccionados derivados para compatibilidad con lógica de backend/PDF
    const selectedIds = useMemo(() => {
        return Object.keys(rowSelection)
            .filter((id) => rowSelection[id])
            .map((id) => parseInt(id));
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
                nombre: c.nombre,
                ci: c.ci,
                celular: c.celular,
                departamento: c.departamento,
                provincia: c.provincia,
            };
        });
        setLocalState(initialState);
    }, [cuadernos?.data]);

    const updateLocalState = (
        id: number,
        field: keyof Cuaderno,
        value: string | boolean,
    ) => {
        setLocalState((prev) => ({
            ...prev,
            [id]: { ...prev[id], [field]: value },
        }));
    };

    const persistChange = (
        id: number,
        field: keyof Cuaderno,
        value: string | boolean,
    ) => {
        const item = cuadernos?.data.find((c) => c.id === id);
        if (item && item[field] === value) return;
        router.patch(
            `/cuadernos/${id}`,
            { [field]: value },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.currentTarget.blur();
        }
    };

    const handleAddProducto = (
        productoId: number,
        cantidad: number,
        precioVenta: number,
    ) => {
        if (!selectedCuadernoId) return;
        router.post(
            `/cuadernos/${selectedCuadernoId}/productos`,
            { producto_id: productoId, cantidad, precio_venta: precioVenta },
            {
                onSuccess: () => {
                    setModalOpen(false);
                    router.reload();
                },
            },
        );
    };

    const handleConfirm = (id: number) => {
        if (confirm('¿Confirmar pedido?')) {
            router.patch(`/cuadernos/${id}`, {
                estado: 'Confirmado',
                enviado: true,
            });
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
        return selectedIds.some((id) => {
            const c = cuadernos.data.find((item) => item.id === id);
            return c?.estado === 'Confirmado';
        });
    };

    const handlePdfRespaldo = () => {
        if (selectedIds.length === 0)
            return alert('Selecciona al menos un registro.');
        const url = routes.confirmarSeleccion.url({
            query: { ids: selectedIds.map(String), view_pdf: '1' },
        });
        window.open(url, '_blank');
    };

    const handleGenerarFichas = () => {
        const url = routes.generarFichas.url({
            query: { ids: selectedIds.map(String) },
        });
        window.open(url, '_blank');
    };

    const handleGenerarNotas = () => {
        const url = routes.generarNotas.url({
            query: { ids: selectedIds.map(String) },
        });
        window.open(url, '_blank');
    };

    const handleBulkConfirm = () => {
        if (hasConfirmedSelection())
            return alert('Hay pedidos ya confirmados.');
        const count = selectedIds.length;
        const msg =
            count > 0
                ? `¿Confirmar ${count} pedidos?`
                : '¿Confirmar TODO lo que está LISTO?';
        if (confirm(msg)) {
            setIsProcessing(true);
            router.post(
                routes.confirmarSeleccion.url(),
                { ids: selectedIds },
                {
                    onSuccess: () => {
                        const url = routes.confirmarSeleccion.url({
                            query: {
                                ids: selectedIds.map(String),
                                view_pdf: '1',
                            },
                        });
                        window.open(url, '_blank');
                        handleClearSelection();
                    },
                    onFinish: () => setIsProcessing(false),
                },
            );
        }
    };

    const columns = useMemo<ColumnDef<Cuaderno>[]>(
        () => [
            {
                id: 'select',
                header: ({ table }) => (
                    <Checkbox
                        checked={
                            table.getIsAllPageRowsSelected() ||
                            (table.getIsSomePageRowsSelected() &&
                                'indeterminate')
                        }
                        onCheckedChange={(value) =>
                            table.toggleAllPageRowsSelected(!!value)
                        }
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
                cell: ({ getValue }) => (
                    <div className="text-xs font-medium text-muted-foreground">
                        #{getValue<number>()}
                    </div>
                ),
            },
            {
                accessorKey: 'nombre',
                header: 'Cliente / Comensal',
                cell: ({ row, table }) => {
                    const item = row.original;
                    const meta = table.options.meta as any;
                    const local = meta?.localState[item.id] || {};
                    return (
                        <div className="flex min-w-[200px] flex-col gap-2">
                            <div className="relative">
                                <User className="absolute top-1.5 left-2 h-3.5 w-3.5 text-muted-foreground" />
                                <Input
                                    className="h-7 border-transparent bg-transparent pl-7 text-xs transition-all hover:bg-muted focus-visible:border-input focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-ring"
                                    placeholder="Nombre Cliente"
                                    value={local.nombre ?? item.nombre ?? ''}
                                    onChange={(e) =>
                                        meta?.updateLocalState(
                                            item.id,
                                            'nombre',
                                            e.target.value,
                                        )
                                    }
                                    onBlur={(e) =>
                                        meta?.persistChange(
                                            item.id,
                                            'nombre',
                                            e.target.value,
                                        )
                                    }
                                    onKeyDown={meta?.handleKeyDown}
                                />
                            </div>
                            <div className="relative">
                                <IdCard className="absolute top-1.5 left-2 h-3.5 w-3.5 text-muted-foreground" />
                                <Input
                                    className="h-7 border-transparent bg-muted pl-7 text-xs transition-all hover:bg-muted focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-ring"
                                    placeholder="Referencia / CI"
                                    value={local.ci ?? item.ci ?? ''}
                                    onChange={(e) =>
                                        meta?.updateLocalState(
                                            item.id,
                                            'ci',
                                            e.target.value,
                                        )
                                    }
                                    onBlur={(e) =>
                                        meta?.persistChange(
                                            item.id,
                                            'ci',
                                            e.target.value,
                                        )
                                    }
                                    onKeyDown={meta?.handleKeyDown}
                                />
                            </div>
                        </div>
                    );
                },
            },
            {
                accessorKey: 'celular',
                header: 'Contacto',
                cell: ({ row, table }) => {
                    const item = row.original;
                    const meta = table.options.meta as any;
                    const local = meta?.localState[item.id] || {};
                    return (
                        <div className="relative min-w-[120px]">
                            <Phone className="absolute top-1.5 left-2 h-3.5 w-3.5 text-muted-foreground" />
                            <Input
                                className="h-7 border-transparent bg-transparent pl-7 text-xs transition-all hover:bg-muted"
                                placeholder="Teléfono"
                                value={local.celular ?? item.celular ?? ''}
                                onChange={(e) =>
                                    meta?.updateLocalState(
                                        item.id,
                                        'celular',
                                        e.target.value,
                                    )
                                }
                                onBlur={(e) =>
                                    meta?.persistChange(
                                        item.id,
                                        'celular',
                                        e.target.value,
                                    )
                                }
                                onKeyDown={meta?.handleKeyDown}
                            />
                        </div>
                    );
                },
            },
            {
                id: 'productos',
                header: () => (
                    <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-primary" />
                        <span>Platillos a Preparar</span>
                    </div>
                ),
                cell: ({ row }) => {
                    const item = row.original;
                    return (
                        <div className="flex min-w-[200px] flex-col gap-2">
                            <div className="flex flex-col gap-1.5">
                                {item.productos.map((p, i) => (
                                    <div
                                        key={`${p.id}-${i}`}
                                        className="flex items-center justify-between rounded-md border border-transparent bg-muted/50 p-1.5 text-xs transition-colors hover:border-border"
                                    >
                                        <span
                                            className="max-w-[100px] truncate font-medium"
                                            title={p.nombre}
                                        >
                                            {p.nombre}
                                        </span>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <span className="rounded border bg-background px-1.5 text-[10px]">
                                                x{p.pivot.cantidad}
                                            </span>
                                            <span className="font-mono text-[10px] text-primary">
                                                {p.pivot.precio_venta} Bs
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-full rounded-xl border-2 border-dashed text-xs font-bold text-muted-foreground transition-all hover:border-primary/50 hover:bg-primary/[0.05] hover:text-primary"
                                onClick={() => {
                                    setSelectedCuadernoId(item.id);
                                    setModalOpen(true);
                                }}
                            >
                                <PlusIcon className="mr-2 h-3.5 w-3.5" />{' '}
                                Agregar Item
                            </Button>
                        </div>
                    );
                },
            },
            {
                id: 'estado',
                header: 'Estado',
                cell: ({ row }) => {
                    const item = row.original;
                    const variant =
                        item.estado === 'Confirmado'
                            ? 'default'
                            : item.estado === 'Pendiente'
                              ? 'destructive'
                              : 'outline';
                    return (
                        <Badge
                            variant={variant}
                            className={cn(
                                'rounded-full border-2 px-3 py-1 text-[10px] font-black tracking-widest uppercase shadow-sm',
                                item.estado === 'Confirmado' &&
                                    'border-green-500/20 bg-green-500/10 text-green-600 shadow-green-500/5',
                                item.estado === 'Pendiente' &&
                                    'border-red-500/20 bg-red-500/10 text-red-600 shadow-red-500/5',
                            )}
                        >
                            {item.estado === 'Confirmado' ? (
                                <span className="flex items-center gap-1">
                                    <CheckCircle className="h-3 w-3" />{' '}
                                    CONFIRMADO
                                </span>
                            ) : (
                                item.estado
                            )}
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
                                className="h-9 w-9 rounded-lg text-green-600 transition-all hover:bg-green-100 hover:text-green-700 active:scale-90 dark:hover:bg-green-900/30"
                                onClick={() => handleConfirm(item.id)}
                                title="Confirmar"
                            >
                                <CheckCircle className="h-5 w-5" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-lg text-red-500 transition-all hover:bg-red-100 hover:text-red-700 active:scale-90 dark:hover:bg-red-900/30"
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
        [],
    );

    const table = useReactTable({
        data: cuadernos?.data || [],
        columns,
        getRowId: (row) => row.id.toString(),
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
            <div className="container mx-auto px-4 py-8 sm:px-6">
                <div className="flex flex-col gap-8">
                    {/* Header Section */}
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                        <div className="space-y-1">
                            <h1 className="flex items-center gap-3 text-4xl font-black tracking-tight text-foreground">
                                <span className="rounded-xl bg-primary/10 p-2">
                                    <Clock className="h-8 w-8 text-primary" />
                                </span>
                                Reservas para{' '}
                                <span className="text-primary italic">
                                    Llevar
                                </span>
                            </h1>
                            <p className="text-sm font-medium text-muted-foreground">
                                Gestiona pedidos reservados que serán retirados
                                en local.
                            </p>
                        </div>
                    </div>

                    <Card className="overflow-hidden border-border/40 bg-background/50 shadow-xl shadow-primary/5 backdrop-blur-sm">
                        <CardHeader className="border-b border-border/40 bg-muted/20 pb-6">
                            <div className="flex flex-col items-center justify-between gap-6 lg:flex-row">
                                <div className="flex w-full flex-wrap items-center gap-3 lg:w-auto">
                                    {filter === 'p_listo' && (
                                        <div className="flex flex-wrap gap-2">
                                            <Button
                                                onClick={handleBulkConfirm}
                                                disabled={isProcessing}
                                                className="h-10 bg-green-600 px-6 font-bold text-white shadow-lg shadow-green-600/20 transition-all hover:scale-[1.02] hover:bg-green-700 active:scale-95"
                                            >
                                                <CheckCircle className="mr-2 h-4 w-4" />
                                                {selectedIds.length > 0
                                                    ? `Confirmar ${selectedIds.length}`
                                                    : 'Confirmar Todo'}
                                            </Button>
                                            <Button
                                                onClick={handlePdfRespaldo}
                                                variant="outline"
                                                className="h-10 border-blue-200 font-semibold text-blue-700 transition-all hover:bg-blue-50 dark:border-blue-900/50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                                            >
                                                <FileText className="mr-2 h-4 w-4" />
                                                Respaldo (
                                                {selectedIds.length || '0'})
                                            </Button>
                                            <Button
                                                onClick={handleGenerarFichas}
                                                variant="outline"
                                                className="h-10 border-purple-200 font-semibold text-purple-700 transition-all hover:bg-purple-50 dark:border-purple-900/50 dark:text-purple-400 dark:hover:bg-purple-900/20"
                                            >
                                                <Package className="mr-2 h-4 w-4" />
                                                Fichas (
                                                {selectedIds.length || '0'})
                                            </Button>
                                            <Button
                                                onClick={handleGenerarNotas}
                                                variant="outline"
                                                className="h-10 border-orange-200 font-semibold text-orange-700 transition-all hover:bg-orange-50 dark:border-orange-900/50 dark:text-orange-400 dark:hover:bg-orange-900/20"
                                            >
                                                <FileText className="mr-2 h-4 w-4" />
                                                Notas (
                                                {selectedIds.length || '0'})
                                            </Button>
                                            {selectedIds.length > 0 && (
                                                <Button
                                                    onClick={
                                                        handleClearSelection
                                                    }
                                                    variant="ghost"
                                                    className="h-10 font-bold text-red-600 transition-all hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Limpiar
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="group relative w-full lg:w-80">
                                    <Search className="absolute top-3 left-3.5 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                                    <Input
                                        placeholder="Buscar cliente, CI, ciudad..."
                                        className="h-10 w-full border-border/50 bg-background pl-10 shadow-sm transition-all focus-visible:border-primary focus-visible:ring-primary/30"
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-muted/30">
                                        {table
                                            .getHeaderGroups()
                                            .map((group) => (
                                                <TableRow
                                                    key={group.id}
                                                    className="border-b border-border/40 hover:bg-transparent"
                                                >
                                                    {group.headers.map(
                                                        (header) => (
                                                            <TableHead
                                                                key={header.id}
                                                                className="h-12 text-[11px] font-black tracking-widest text-muted-foreground uppercase"
                                                            >
                                                                {flexRender(
                                                                    header
                                                                        .column
                                                                        .columnDef
                                                                        .header,
                                                                    header.getContext(),
                                                                )}
                                                            </TableHead>
                                                        ),
                                                    )}
                                                </TableRow>
                                            ))}
                                    </TableHeader>
                                    <TableBody>
                                        {table.getRowModel().rows.length ? (
                                            table
                                                .getRowModel()
                                                .rows.map((row) => {
                                                    const isConfirmed =
                                                        row.original.estado ===
                                                        'Confirmado';
                                                    return (
                                                        <TableRow
                                                            key={row.id}
                                                            className={cn(
                                                                'group border-b border-border/20 transition-colors',
                                                                isConfirmed
                                                                    ? 'bg-green-500/5 hover:bg-green-500/10 dark:bg-green-500/10 dark:hover:bg-green-500/15'
                                                                    : 'hover:bg-primary/[0.02] dark:hover:bg-primary/[0.05]',
                                                            )}
                                                        >
                                                            {row
                                                                .getVisibleCells()
                                                                .map((cell) => (
                                                                    <TableCell
                                                                        key={
                                                                            cell.id
                                                                        }
                                                                        className="px-4 py-4 align-top"
                                                                    >
                                                                        {flexRender(
                                                                            cell
                                                                                .column
                                                                                .columnDef
                                                                                .cell,
                                                                            cell.getContext(),
                                                                        )}
                                                                    </TableCell>
                                                                ))}
                                                        </TableRow>
                                                    );
                                                })
                                        ) : (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={columns.length}
                                                    className="h-32 text-center text-muted-foreground"
                                                >
                                                    <div className="flex flex-col items-center gap-2">
                                                        <Search className="h-8 w-8 opacity-20" />
                                                        <p className="font-medium">
                                                            No se encontraron
                                                            registros en el
                                                            cuaderno.
                                                        </p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination section */}
                            <div className="flex flex-col items-center justify-between gap-4 border-t border-border/40 bg-muted/10 p-6 sm:flex-row">
                                <div className="text-sm font-bold tracking-wider text-muted-foreground uppercase">
                                    <span className="text-primary">
                                        {cuadernos?.from || 0}-
                                        {cuadernos?.to || 0}
                                    </span>{' '}
                                    de {cuadernos?.total || 0} registros
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {cuadernos?.links?.map((link, i) => (
                                        <Button
                                            key={i}
                                            variant={
                                                link.active
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                            size="sm"
                                            asChild={!!link.url}
                                            disabled={!link.url}
                                            className={cn(
                                                'h-9 min-w-[36px] font-bold transition-all',
                                                link.active
                                                    ? 'shadow-md shadow-primary/20'
                                                    : 'hover:border-primary/30 hover:bg-primary/10 hover:text-primary',
                                            )}
                                        >
                                            {link.url ? (
                                                <Link
                                                    href={link.url}
                                                    preserveState
                                                    preserveScroll
                                                >
                                                    <span
                                                        dangerouslySetInnerHTML={{
                                                            __html: link.label,
                                                        }}
                                                    />
                                                </Link>
                                            ) : (
                                                <span
                                                    dangerouslySetInnerHTML={{
                                                        __html: link.label,
                                                    }}
                                                />
                                            )}
                                        </Button>
                                    ))}
                                </div>
                            </div>
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
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Vista Previa de Imagen</DialogTitle>
                    </DialogHeader>
                    {currentImage && (
                        <img
                            src={currentImage}
                            className="h-auto max-w-full rounded-lg border shadow-lg"
                            alt="Vista previa"
                        />
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
