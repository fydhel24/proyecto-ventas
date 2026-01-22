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
    cuadernos: PaginatedResponse<Cuaderno>;
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
    }, [cuadernos.data]);

    const updateLocalState = (id: number, field: keyof Cuaderno, value: string | boolean) => {
        setLocalState(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
    };

    const persistChange = (id: number, field: keyof Cuaderno, value: string | boolean) => {
        router.patch(`/cuadernos/${id}`, { [field]: value }, { preserveState: true, preserveScroll: true });
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
                cell: ({ row }) => {
                    const item = row.original;
                    const local = localState[item.id] || {};
                    return (
                        <div className="flex gap-2 justify-center">
                            <Checkbox checked={local.la_paz ?? item.la_paz} onCheckedChange={(v) => updateAndSave(item.id, 'la_paz', Boolean(v))} />
                            <Checkbox checked={local.enviado ?? item.enviado} onCheckedChange={(v) => updateAndSave(item.id, 'enviado', Boolean(v))} />
                            <Checkbox checked={local.p_listo ?? item.p_listo} onCheckedChange={(v) => updateAndSave(item.id, 'p_listo', Boolean(v))} />
                            <Checkbox checked={local.p_pendiente ?? item.p_pendiente} onCheckedChange={(v) => updateAndSave(item.id, 'p_pendiente', Boolean(v))} />
                        </div>
                    );
                },
                enableSorting: false,
            },
            {
                accessorKey: 'nombre',
                header: 'Cliente',
                cell: ({ row }) => {
                    const item = row.original;
                    const local = localState[item.id] || {};
                    return (
                        <div className="flex flex-col gap-2 min-w-[180px]">
                            <div className="relative">
                                <User className="absolute left-2 top-1.5 h-3.5 w-3.5 text-muted-foreground" />
                                <Input
                                    className="h-7 pl-7 text-xs border-transparent bg-transparent hover:bg-muted focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-input transition-all"
                                    placeholder="Nombre"
                                    value={local.nombre ?? item.nombre ?? ''}
                                    onChange={(e) => updateLocalState(item.id, 'nombre', e.target.value)}
                                    onBlur={(e) => persistChange(item.id, 'nombre', e.target.value)}
                                />
                            </div>
                            <div className="relative">
                                <IdCard className="absolute left-2 top-1.5 h-3.5 w-3.5 text-muted-foreground" />
                                <Input
                                    className="h-7 pl-7 text-xs border-transparent bg-muted hover:bg-muted focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-ring transition-all"
                                    placeholder="CI"
                                    value={local.ci ?? item.ci ?? ''}
                                    onChange={(e) => updateLocalState(item.id, 'ci', e.target.value)}
                                    onBlur={(e) => persistChange(item.id, 'ci', e.target.value)}
                                />
                            </div>
                        </div>
                    );
                },
            },
            {
                id: 'ubicacion',
                header: 'Ubicación',
                cell: ({ row }) => {
                    const item = row.original;
                    const local = localState[item.id] || {};
                    return (
                        <div className="flex flex-col gap-2 min-w-[160px]">
                            <div className="relative">
                                <MapIcon className="absolute left-2 top-1.5 h-3.5 w-3.5 text-muted-foreground" />
                                <Input
                                    className="h-7 pl-7 text-xs border-transparent bg-transparent hover:bg-muted transition-all"
                                    placeholder="Departamento"
                                    value={local.departamento ?? item.departamento ?? ''}
                                    onChange={(e) => updateLocalState(item.id, 'departamento', e.target.value)}
                                    onBlur={(e) => persistChange(item.id, 'departamento', e.target.value)}
                                />
                            </div>
                            <div className="relative">
                                <MapPin className="absolute left-2 top-1.5 h-3.5 w-3.5 text-muted-foreground" />
                                <Input
                                    className="h-7 pl-7 text-xs border-transparent bg-transparent hover:bg-muted transition-all"
                                    placeholder="Provincia"
                                    value={local.provincia ?? item.provincia ?? ''}
                                    onChange={(e) => updateLocalState(item.id, 'provincia', e.target.value)}
                                    onBlur={(e) => persistChange(item.id, 'provincia', e.target.value)}
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
                                {item.productos.map((p) => (
                                    <div key={p.id} className="flex items-center justify-between text-xs p-1.5 rounded-md bg-muted/50 border border-transparent hover:border-border transition-colors">
                                        <span className="font-medium truncate max-w-[100px]" title={p.nombre}>{p.nombre}</span>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <span className="bg-background px-1.5 rounded border text-[10px]">x{p.pivot.cantidad}</span>
                                            <span className="font-mono text-[10px]">{p.pivot.precio_venta} Bs</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Button size="sm" variant="outline" className="w-full h-7 text-xs dashed border-dashed text-muted-foreground hover:text-primary" onClick={() => { setSelectedCuadernoId(item.id); setModalOpen(true); }}>
                                <PlusIcon className="h-3 w-3 mr-1" /> Agregar
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
                                    <div key={img.id} className="flex items-center gap-1">
                                        <Button variant="outline" size="sm" className="h-7 text-xs px-2" onClick={() => { setCurrentImage(img.url); setImageModalOpen(true); }}>
                                            {img.pivot?.tipo === 'producto' ? 'Producto' : img.pivot?.tipo === 'comprobante' ? 'Comprobante' : 'Ver'}
                                        </Button>
                                    </div>
                                ))
                            ) : (
                                <div className="w-full text-center text-muted-foreground text-xs py-2 flex flex-col items-center gap-1">
                                    <ImageIcon className="w-4 h-4 opacity-50" />
                                    <span className="text-[10px]">Sin fotos</span>
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
                    return (
                        <Badge variant={item.estado === 'Entregado' ? 'default' : item.estado === 'Pendiente' ? 'destructive' : 'outline'}>{item.estado}</Badge>
                    );
                },
            },
            {
                id: 'actions',
                header: 'Acciones',
                cell: ({ row }) => {
                    const item = row.original;
                    return (
                        <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-green-500 hover:text-green-600 hover:bg-green-100" onClick={() => handleConfirm(item.id)} title="Confirmar"><Check className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-100" onClick={() => handleDelete(item.id)} title="Eliminar"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                    );
                },
                enableHiding: false,
            },
        ],
        [localState]
    );

    const table = useReactTable({
        data: cuadernos.data,
        columns,
        getRowId: row => row.id.toString(),
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    });

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
                        <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4">
                            <div className="flex flex-wrap items-center gap-2">
                                <div className="flex gap-2">
                                    {filter === 'p_listo' && (
                                        <>
                                            <Button onClick={handleBulkConfirm} disabled={isProcessing} className="bg-green-600 hover:bg-green-700 h-9 font-medium text-white shadow-sm">
                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                {selectedIds.length > 0 ? `Confirmar ${selectedIds.length}` : 'Confirmar '}
                                            </Button>
                                            <Button onClick={handlePdfRespaldo} variant="outline" className="h-9 border-blue-200 text-blue-700 hover:bg-blue-50">
                                                <FileText className="w-4 h-4 mr-2" />
                                                Respaldo ({selectedIds.length || '0'})
                                            </Button>
                                            <Button onClick={handleClearSelection} variant="ghost" className="h-9 text-red-600 hover:text-red-700 hover:bg-red-50">
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                Limpiar ({selectedIds.length})
                                            </Button>
                                            <Button onClick={handleGenerarFichas} variant="outline" className="h-9 border-purple-200 text-purple-700 hover:bg-purple-50">
                                                <Package className="w-4 h-4 mr-2" />
                                                Fichas ({selectedIds.length || '0'})
                                            </Button>
                                            <Button onClick={handleGenerarNotas} variant="outline" className="h-9 border-orange-200 text-orange-700 hover:bg-orange-50">
                                                <FileText className="w-4 h-4 mr-2" />
                                                Notas ({selectedIds.length || '0'})
                                            </Button>
                                        </>
                                    )}
                                </div>
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="Buscar..." className="pl-8 h-9 w-64" value={search} onChange={(e) => setSearch(e.target.value)} />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        {table.getHeaderGroups().map(group => (
                                            <TableRow key={group.id} className="bg-muted/50">
                                                {group.headers.map(header => (
                                                    <TableHead key={header.id} className="text-xs uppercase font-bold text-muted-foreground">
                                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                                    </TableHead>
                                                ))}
                                            </TableRow>
                                        ))}
                                    </TableHeader>
                                    <TableBody>
                                        {table.getRowModel().rows.length ? (
                                            table.getRowModel().rows.map(row => (
                                                <TableRow key={row.id} className="hover:bg-muted/30 transition-colors">
                                                    {row.getVisibleCells().map(cell => (
                                                        <TableCell key={cell.id} className="py-2.5">
                                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow><TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">Sin resultados.</TableCell></TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                            <div className="flex items-center justify-between mt-4">
                                <div className="text-sm text-muted-foreground">
                                    Página {cuadernos.current_page} de {cuadernos.last_page} ({cuadernos.total} registros)
                                </div>
                                <div className="flex gap-1">
                                    {cuadernos.links.map((link, i) => (
                                        <Button key={i} variant={link.active ? "default" : "outline"} size="sm" asChild={!!link.url} disabled={!link.url} className="h-8 min-w-[32px]">
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
