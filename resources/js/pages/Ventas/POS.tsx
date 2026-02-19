import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { searchProductos, store } from '@/routes/ventas';
import { Head, useForm, usePage } from '@inertiajs/react';
import axios from 'axios';
import {
    Boxes,
    Building2,
    Check,
    ChevronsUpDown,
    LayoutGrid,
    List,
    Minus,
    Plus,
    Search,
    ShoppingCart,
    Trash2,
    User2,
    X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface VentaForm {
    sucursal_id: string;
    cliente: string;
    ci: string;
    tipo_pago: string;
    carrito: any[];
    monto_total: number;
    pagado: number;
    cambio: number;
    efectivo: number;
    qr: number;
    user_vendedor_id?: number;
    mesa_id?: number;
    estado_comanda: string;
}

interface Photo {
    id: number;
    url: string;
}

interface Product {
    id: number;
    nombre: string;
    precio_1: number;
    precio_2: number;
    precio_3: number;
    marca?: { nombre: string };
    categoria?: { nombre_cat: string };
    fotos: Photo[];
}

interface Inventory {
    id: number;
    producto: Product;
    stock: number;
}

interface Category {
    id: number;
    nombre_cat: string;
}

interface Sucursal {
    id: number;
    nombre_sucursal: string;
}

interface CartItem {
    inventario_id: number;
    producto: Product;
    cantidad: number;
    precio_seleccionado: number;
    stock_max: number;
}

interface PaginationData {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
    data: Inventory[];
}

interface User {
    id: number;
    name: string;
    sucursal_id: number | null;
}

interface Props {
    sucursal: Sucursal | null;
    sucursales: Sucursal[];
    isAdmin: boolean;
    categorias: Category[];
    usuarios: User[];
    sucursalesConCajaAbierta: number[];
    mesas: any[];
}

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

export default function POS({
    sucursal,
    sucursales,
    isAdmin,
    categorias = [],
    usuarios,
    sucursalesConCajaAbierta,
    mesas = [],
}: Props) {
    const { app_url } = usePage().props as any;
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [currentSucursalId, setCurrentSucursalId] = useState<string>(
        sucursal?.id.toString() || '',
    );
    const [items, setItems] = useState<Inventory[]>([]);
    const [pagination, setPagination] = useState<PaginationData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [assignUser, setAssignUser] = useState(false);
    const [openUserSelect, setOpenUserSelect] = useState(false);
    const [isMobileGridView, setIsMobileGridView] = useState(false);

    // Check if current branch has an open box
    const isBoxOpen = currentSucursalId
        ? sucursalesConCajaAbierta.includes(parseInt(currentSucursalId))
        : false;

    const { data, setData, reset } = useForm({
        sucursal_id: currentSucursalId,
        cliente: '',
        ci: '',
        tipo_pago: 'Efectivo',
        carrito: [] as any[],
        monto_total: 0,
        pagado: 0,
        cambio: 0,
        efectivo: 0,
        qr: 0,
        user_vendedor_id: undefined as number | undefined,
        mesa_id: undefined as number | undefined,
        estado_comanda: 'pagado',
    } as VentaForm & { user_vendedor_id?: number; mesa_id?: number });

    // Helper for safe number input (allows empty string)
    const handleNumberInput = (val: string, setter: (v: number) => void) => {
        if (val === '') {
            setter(0);
            return;
        }
        const num = parseFloat(val);
        if (!isNaN(num)) setter(num);
    };

    const [isProcessing, setIsProcessing] = useState(false);

    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const savedCart = localStorage.getItem('nexus_pos_cart');
        const savedData = localStorage.getItem('nexus_pos_data');

        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart));
            } catch (e) {
                console.error('Error al cargar carrito', e);
            }
        }

        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData);
                // Merge saved data with current values, prioritizing saved if valid
                setData((prev) => ({
                    ...prev,
                    cliente: parsedData.cliente || '',
                    ci: parsedData.ci || '',
                    tipo_pago: parsedData.tipo_pago || 'Efectivo',
                    efectivo: parsedData.efectivo || 0,
                    qr: parsedData.qr || 0,
                    user_vendedor_id: parsedData.user_vendedor_id,
                    mesa_id: parsedData.mesa_id,
                    estado_comanda: parsedData.estado_comanda || 'pagado',
                }));
                if (parsedData.user_vendedor_id) setAssignUser(true);
            } catch (e) {
                console.error('Error al cargar datos del formulario', e);
            }
        }
        setIsLoaded(true);
    }, []);

    useEffect(() => {
        if (!isLoaded) return;
        localStorage.setItem('nexus_pos_cart', JSON.stringify(cart));
    }, [cart, isLoaded]);

    // Persist relevant form data
    useEffect(() => {
        if (!isLoaded) return;
        const dataToSave = {
            cliente: data.cliente,
            ci: data.ci,
            tipo_pago: data.tipo_pago,
            efectivo: data.efectivo,
            qr: data.qr,
            user_vendedor_id: data.user_vendedor_id,
            mesa_id: data.mesa_id,
            estado_comanda: data.estado_comanda,
        };
        localStorage.setItem('nexus_pos_data', JSON.stringify(dataToSave));
    }, [
        data.cliente,
        data.ci,
        data.tipo_pago,
        data.efectivo,
        data.qr,
        data.user_vendedor_id,
        isLoaded,
    ]);

    useEffect(() => {
        if (currentSucursalId) fetchProducts(1);
    }, [selectedCategory, currentSucursalId]);

    const fetchProducts = async (page: number) => {
        setIsLoading(true);
        try {
            const response = await axios.get(
                searchProductos({
                    query: search,
                    categoria_id:
                        selectedCategory === 'all' ? null : selectedCategory,
                    sucursal_id: currentSucursalId,
                    page: page,
                    per_page: 12,
                }).url,
            );
            setPagination(response.data);
            setItems(response.data.data);
        } catch (error) {
            toast.error('Error al cargar productos');
        } finally {
            setIsLoading(false);
        }
    };

    const addToCart = (inventory: Inventory) => {
        if (inventory.stock <= 0) {
            toast.warning('Sin stock disponible');
            return;
        }

        const existing = cart.find((i) => i.inventario_id === inventory.id);
        if (existing) {
            updateQuantity(inventory.id, 1);
            return;
        }

        const newItem: CartItem = {
            inventario_id: inventory.id,
            producto: inventory.producto,
            cantidad: 1,
            precio_seleccionado: inventory.producto.precio_1,
            stock_max: inventory.stock,
        };

        setCart([...cart, newItem]);
        toast.info(`${inventory.producto.nombre} agregado`, {
            icon: <ShoppingCart className="h-4 w-4" />,
        });
    };

    const updateQuantity = (id: number, delta: number) => {
        setCart((prev) =>
            prev.map((item) => {
                if (item.inventario_id === id) {
                    const newQty = Math.min(
                        Math.max(1, item.cantidad + delta),
                        item.stock_max,
                    );
                    if (newQty === item.stock_max && delta > 0)
                        toast.warning('Límite de stock alcanzado');
                    return { ...item, cantidad: newQty };
                }
                return item;
            }),
        );
    };

    const removeItem = (id: number) => {
        setCart((prev) => prev.filter((i) => i.inventario_id !== id));
    };

    const total = cart.reduce(
        (acc, item) => acc + item.cantidad * item.precio_seleccionado,
        0,
    );

    useEffect(() => {
        setData((prev) => ({
            ...prev,
            sucursal_id: currentSucursalId,
            carrito: cart.map((i) => ({
                inventario_id: i.inventario_id,
                cantidad: i.cantidad,
                precio_venta: i.precio_seleccionado,
            })),
            monto_total: total,
            pagado: data.efectivo + data.qr,
            cambio: Math.max(0, data.efectivo + data.qr - total),
        }));
    }, [cart, total, data.efectivo, data.qr, currentSucursalId]);

    const handleFinishVenta = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        try {
            const response = await axios.post(store().url, {
                sucursal_id: data.sucursal_id,
                cliente: data.cliente,
                ci: data.ci,
                tipo_pago: data.tipo_pago,
                carrito: cart.map((item) => ({
                    inventario_id: item.inventario_id,
                    cantidad: item.cantidad,
                    precio_venta: item.precio_seleccionado,
                })),
                monto_total: total,
                pagado: data.efectivo + data.qr,
                cambio: Math.max(0, data.efectivo + data.qr - total),
                efectivo: data.efectivo,
                qr: data.qr,
                user_vendedor_id: data.user_vendedor_id,
                mesa_id: data.mesa_id,
                estado_comanda: data.estado_comanda,
            });

            if (response.data.success) {
                window.open(`/ventas/${response.data.venta_id}/pdf`, '_blank');
                setCart([]);
                localStorage.removeItem('nexus_pos_cart');
                localStorage.removeItem('nexus_pos_data');
                reset();
                setIsCartOpen(false);
                toast.success('Venta procesada exitosamente');
            }
        } catch (error: any) {
            if (error.response?.data?.error) {
                toast.error(error.response.data.error);
            } else {
                toast.error('Error al procesar la venta');
            }
        } finally {
            setIsProcessing(false);
        }
    };

    const getImageUrl = (fotos: Photo[]) => {
        if (fotos.length > 0) {
            if (fotos[0].url.startsWith('http')) return fotos[0].url;
            return `${app_url}/storage/${fotos[0].url}`;
        }
        return '/images/placeholder-product.png';
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Ventas', href: '/ventas' },
                { title: 'POS', href: '/ventas/create' },
            ]}
        >
            <Head title="Punto de Venta" />
            <div className="flex h-[calc(100vh-100px)] flex-col gap-4 overflow-hidden p-2 sm:p-4">
                {!isBoxOpen && (
                    <Alert
                        variant="destructive"
                        className="animate-in border-destructive/50 bg-destructive/10 text-destructive fade-in slide-in-from-top-2"
                    >
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Caja Cerrada</AlertTitle>
                        <AlertDescription>
                            No hay una caja abierta para esta sucursal. Debe
                            abrir una caja antes de realizar ventas.
                        </AlertDescription>
                    </Alert>
                )}

                <div
                    className={`flex flex-col items-center justify-between gap-3 rounded-2xl border bg-card p-3 shadow-sm transition-opacity duration-300 sm:gap-4 sm:p-4 lg:flex-row ${!isBoxOpen ? 'pointer-events-none opacity-50 grayscale-[0.5]' : ''}`}
                >
                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className="rounded-xl bg-primary p-2 text-primary-foreground shadow-inner sm:p-3">
                            <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <h1 className="text-lg font-black tracking-tight sm:text-xl">
                                    Venta Rápida
                                </h1>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="ml-2 h-8 w-8 sm:hidden"
                                    onClick={() =>
                                        setIsMobileGridView(!isMobileGridView)
                                    }
                                >
                                    {isMobileGridView ? (
                                        <List className="h-5 w-5" />
                                    ) : (
                                        <LayoutGrid className="h-5 w-5" />
                                    )}
                                </Button>
                            </div>
                            {isAdmin ? (
                                <Select
                                    value={currentSucursalId}
                                    onValueChange={setCurrentSucursalId}
                                >
                                    <SelectTrigger className="h-6 border-none bg-transparent p-0 text-xs font-bold text-muted-foreground focus:ring-0 sm:h-7">
                                        <Building2 className="mr-1 h-3 w-3" />
                                        <SelectValue placeholder="Seleccionar Sucursal" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sucursales.map((s) => (
                                            <SelectItem
                                                key={s.id}
                                                value={s.id.toString()}
                                            >
                                                {s.nombre_sucursal}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <p className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground">
                                    <Building2 className="h-3 w-3" />{' '}
                                    {sucursal?.nombre_sucursal}
                                </p>
                            )}
                            <div className="mt-1 flex items-center gap-2">
                                <Select
                                    value={data.mesa_id?.toString()}
                                    onValueChange={(val) =>
                                        setData('mesa_id', parseInt(val))
                                    }
                                >
                                    <SelectTrigger className="h-6 rounded-full border-none bg-primary/10 px-2 text-[10px] font-black text-primary focus:ring-0 sm:h-7">
                                        <LayoutGrid className="mr-1 h-3 w-3" />
                                        <SelectValue placeholder="MESAS" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="null">
                                            Ninguna (Llevar)
                                        </SelectItem>
                                        {mesas.map((m) => (
                                            <SelectItem
                                                key={m.id}
                                                value={m.id.toString()}
                                            >
                                                {m.nombre_mesa}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <div className="flex w-full items-center gap-2 lg:w-auto">
                        <div className="relative flex-1 lg:w-96">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Buscar producto..."
                                className="h-10 rounded-full border-none bg-muted/50 pl-9 ring-offset-background focus-visible:ring-primary sm:h-11"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) =>
                                    e.key === 'Enter' && fetchProducts(1)
                                }
                            />
                        </div>
                        <Select
                            value={selectedCategory}
                            onValueChange={setSelectedCategory}
                        >
                            <SelectTrigger className="h-10 w-[120px] rounded-full border-none bg-muted/50 font-medium sm:h-11 sm:w-[160px]">
                                <SelectValue placeholder="Categoría" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas</SelectItem>
                                {categorias.map((c) => (
                                    <SelectItem
                                        key={c.id}
                                        value={c.id.toString()}
                                    >
                                        {c.nombre_cat}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Button
                        variant="default"
                        size="icon"
                        className="relative h-12 w-12 rounded-2xl shadow-xl transition-transform hover:scale-105 sm:h-14 sm:w-14"
                        onClick={() => setIsCartOpen(true)}
                    >
                        <ShoppingCart className="h-6 w-6 sm:h-7 sm:w-7" />
                        {cart.length > 0 && (
                            <Badge className="absolute -top-2 -right-2 flex h-6 w-6 animate-bounce items-center justify-center rounded-full border-2 border-background p-0 font-bold sm:h-7 sm:w-7">
                                {cart.length}
                            </Badge>
                        )}
                    </Button>
                </div>

                <div className="custom-scrollbar flex-1 overflow-y-auto pr-1">
                    {isLoading ? (
                        <div className="flex flex-col gap-3 sm:grid sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8">
                            {[...Array(16)].map((_, i) => (
                                <Card
                                    key={i}
                                    className="h-24 animate-pulse rounded-2xl border-none bg-muted/20 sm:h-60"
                                />
                            ))}
                        </div>
                    ) : items.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center opacity-20">
                            <Boxes className="mb-4 h-20 w-20 sm:h-24 sm:w-24" />
                            <p className="text-xl font-black sm:text-2xl">
                                Catálogo vacío
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* MÓVIL: Tarjetas horizontales */}
                            <div className="flex flex-col gap-3 pb-12 sm:hidden">
                                {items.map((inventory) => {
                                    const isOutOfStock = inventory.stock <= 0;
                                    return (
                                        <Card
                                            key={inventory.id}
                                            className={`group flex cursor-pointer flex-col overflow-hidden transition-all hover:shadow-lg ${isOutOfStock ? 'border-destructive/50 bg-destructive/5' : ''}`}
                                            onClick={() => addToCart(inventory)}
                                        >
                                            <div className="relative aspect-square overflow-hidden bg-muted">
                                                {inventory.producto.fotos &&
                                                inventory.producto.fotos
                                                    .length > 0 ? (
                                                    <img
                                                        src={getImageUrl(
                                                            inventory.producto
                                                                .fotos,
                                                        )}
                                                        alt={
                                                            inventory.producto
                                                                .nombre
                                                        }
                                                        className={`h-full w-full object-cover transition-transform group-hover:scale-110 ${isOutOfStock ? 'opacity-50 grayscale' : ''}`}
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                                        <Boxes className="h-12 w-12 opacity-20" />
                                                    </div>
                                                )}
                                                <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
                                                    <Badge
                                                        variant="secondary"
                                                        className="font-bold shadow-sm"
                                                    >
                                                        Bs.{' '}
                                                        {
                                                            inventory.producto
                                                                .precio_1
                                                        }
                                                    </Badge>

                                                    {isOutOfStock ? (
                                                        <Badge
                                                            variant="destructive"
                                                            className="font-bold shadow-sm"
                                                        >
                                                            SIN STOCK
                                                        </Badge>
                                                    ) : (
                                                        <Badge
                                                            variant="outline"
                                                            className="bg-background/80 font-bold shadow-sm backdrop-blur-sm"
                                                        >
                                                            Stock:{' '}
                                                            {inventory.stock}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <CardContent className="flex flex-1 flex-col gap-2 p-4">
                                                <div className="flex-1">
                                                    <h3
                                                        className={`line-clamp-2 leading-tight font-bold ${isOutOfStock ? 'text-muted-foreground' : ''}`}
                                                    >
                                                        {
                                                            inventory.producto
                                                                .nombre
                                                        }
                                                    </h3>
                                                    {inventory.producto
                                                        .marca && (
                                                        <p className="mt-1 text-xs text-muted-foreground">
                                                            {
                                                                inventory
                                                                    .producto
                                                                    .marca
                                                                    .nombre
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>

                            {/* DESKTOP: Tarjetas verticales (grid) */}
                            <div className="hidden gap-4 pb-12 sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8">
                                {items.map((inv) => {
                                    const isOutOfStock = inv.stock <= 0;
                                    return (
                                        <Card
                                            key={inv.id}
                                            className={`group relative cursor-pointer overflow-hidden rounded-2xl bg-card shadow-sm transition-all duration-300 hover:shadow-2xl ${isOutOfStock ? 'border-2 border-destructive/50 bg-destructive/5' : 'border-none'}`}
                                            onClick={() => addToCart(inv)}
                                        >
                                            <div className="relative aspect-square overflow-hidden bg-muted/5">
                                                <img
                                                    src={getImageUrl(
                                                        inv.producto.fotos,
                                                    )}
                                                    alt={inv.producto.nombre}
                                                    className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 ${isOutOfStock ? 'opacity-50 grayscale' : ''}`}
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                                                    <div className="translate-y-4 transform rounded-full bg-white p-2 text-black transition-transform group-hover:translate-y-0">
                                                        <Plus className="h-6 w-6" />
                                                    </div>
                                                </div>

                                                <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
                                                    {isOutOfStock ? (
                                                        <Badge
                                                            variant="destructive"
                                                            className="text-xs font-bold shadow-sm"
                                                        >
                                                            SIN STOCK
                                                        </Badge>
                                                    ) : (
                                                        <Badge
                                                            variant="outline"
                                                            className="h-5 bg-background/80 text-[10px] font-bold shadow-sm backdrop-blur-sm"
                                                        >
                                                            Stock: {inv.stock}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <CardContent className="p-3">
                                                <div className="flex flex-col gap-0.5">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-[9px] font-bold text-primary/70">
                                                            {inv.producto.marca
                                                                ?.nombre ||
                                                                'General'}
                                                        </span>
                                                        <span className="text-[8px] text-muted-foreground">
                                                            •
                                                        </span>
                                                        <span className="text-[9px] font-medium text-muted-foreground">
                                                            {
                                                                inv.producto
                                                                    .categoria
                                                                    ?.nombre_cat
                                                            }
                                                        </span>
                                                    </div>
                                                    <h3
                                                        className={`line-clamp-2 min-h-[2rem] text-sm leading-tight font-bold transition-colors group-hover:text-primary ${isOutOfStock ? 'text-muted-foreground' : ''}`}
                                                    >
                                                        {inv.producto.nombre}
                                                    </h3>
                                                    <div className="mt-2 text-base font-black text-foreground">
                                                        Bs.{' '}
                                                        {inv.producto.precio_1}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>

                {pagination && pagination.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2 rounded-2xl border bg-card/80 p-2 shadow-lg backdrop-blur-md sm:gap-4 sm:p-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-full px-2 text-xs sm:px-4 sm:text-sm"
                            disabled={pagination.current_page === 1}
                            onClick={() =>
                                fetchProducts(pagination.current_page - 1)
                            }
                        >
                            <Minus className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />{' '}
                            Anterior
                        </Button>
                        <div className="flex items-center gap-1">
                            {[...Array(pagination.last_page)].map((_, i) => {
                                const page = i + 1;
                                if (
                                    page === 1 ||
                                    page === pagination.last_page ||
                                    (page >= pagination.current_page - 1 &&
                                        page <= pagination.current_page + 1)
                                ) {
                                    return (
                                        <Button
                                            key={page}
                                            variant={
                                                pagination.current_page === page
                                                    ? 'default'
                                                    : 'ghost'
                                            }
                                            size="icon"
                                            className="h-7 w-7 rounded-full text-xs font-bold sm:h-8 sm:w-8"
                                            onClick={() => fetchProducts(page)}
                                        >
                                            {page}
                                        </Button>
                                    );
                                } else if (
                                    page === pagination.current_page - 2 ||
                                    page === pagination.current_page + 2
                                ) {
                                    return (
                                        <span key={page} className="text-xs">
                                            ...
                                        </span>
                                    );
                                }
                                return null;
                            })}
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-full px-2 text-xs sm:px-4 sm:text-sm"
                            disabled={
                                pagination.current_page === pagination.last_page
                            }
                            onClick={() =>
                                fetchProducts(pagination.current_page + 1)
                            }
                        >
                            Siguiente{' '}
                            <Plus className="ml-1 h-3 w-3 sm:ml-2 sm:h-4 sm:w-4" />
                        </Button>
                    </div>
                )}
            </div>

            <Dialog open={isCartOpen} onOpenChange={setIsCartOpen}>
                <DialogContent className="flex max-h-[95vh] max-w-full flex-col overflow-hidden rounded-[1.5rem] border-none p-0 shadow-2xl sm:max-w-2xl sm:rounded-[2.5rem]">
                    <div className="shrink-0 bg-primary p-4 text-primary-foreground sm:p-6">
                        <div className="flex items-center justify-between gap-2 sm:gap-4">
                            <div className="min-w-0">
                                <DialogTitle className="flex items-center gap-2 text-xl font-black tracking-tighter sm:text-3xl">
                                    <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />{' '}
                                    <span className="truncate">
                                        Finalizar venta
                                    </span>
                                </DialogTitle>
                                <DialogDescription className="text-xs font-medium text-primary-foreground/80 opacity-80 sm:text-sm">
                                    {cart.length} producto
                                    {cart.length !== 1 ? 's' : ''} • Total: Bs.{' '}
                                    {total.toFixed(2)}
                                </DialogDescription>
                            </div>

                            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                                <div className="flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-2 py-1.5 sm:px-3">
                                    <Label
                                        htmlFor="assign-sw"
                                        className="hidden cursor-pointer text-[10px] font-bold tracking-wider text-primary-foreground uppercase select-none sm:block"
                                    >
                                        Asignar
                                    </Label>
                                    <Switch
                                        id="assign-sw"
                                        checked={assignUser}
                                        onCheckedChange={(c) => {
                                            setAssignUser(c);
                                            if (!c)
                                                setData(
                                                    'user_vendedor_id',
                                                    undefined,
                                                );
                                        }}
                                        className="scale-75 data-[state=checked]:bg-white data-[state=unchecked]:bg-black/20 sm:scale-100"
                                    />
                                </div>

                                {assignUser && (
                                    <div className="animate-in duration-300 fade-in slide-in-from-right-4">
                                        <Popover
                                            open={openUserSelect}
                                            onOpenChange={setOpenUserSelect}
                                        >
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    aria-expanded={
                                                        openUserSelect
                                                    }
                                                    className="h-8 w-[180px] justify-between border-none border-primary-foreground/20 bg-primary-foreground/10 text-xs font-medium text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground sm:h-9 sm:w-[220px] sm:text-sm"
                                                >
                                                    {data.user_vendedor_id
                                                        ? usuarios.find(
                                                              (u) =>
                                                                  u.id ===
                                                                  data.user_vendedor_id,
                                                          )?.name
                                                        : 'Seleccionar vendedor...'}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[200px] p-0">
                                                <Command>
                                                    <CommandInput placeholder="Buscar vendedor..." />
                                                    <CommandList>
                                                        <CommandEmpty>
                                                            No se encontró
                                                            vendedor.
                                                        </CommandEmpty>
                                                        <CommandGroup>
                                                            {usuarios
                                                                .filter((u) => {
                                                                    if (isAdmin)
                                                                        return true;
                                                                    return (
                                                                        u.sucursal_id ===
                                                                        (sucursal?.id ||
                                                                            parseInt(
                                                                                currentSucursalId,
                                                                            ))
                                                                    );
                                                                })
                                                                .map((user) => (
                                                                    <CommandItem
                                                                        key={
                                                                            user.id
                                                                        }
                                                                        value={
                                                                            user.name
                                                                        }
                                                                        onSelect={() => {
                                                                            setData(
                                                                                'user_vendedor_id',
                                                                                user.id,
                                                                            );
                                                                            setOpenUserSelect(
                                                                                false,
                                                                            );
                                                                        }}
                                                                    >
                                                                        <Check
                                                                            className={cn(
                                                                                'mr-2 h-4 w-4',
                                                                                data.user_vendedor_id ===
                                                                                    user.id
                                                                                    ? 'opacity-100'
                                                                                    : 'opacity-0',
                                                                            )}
                                                                        />
                                                                        {
                                                                            user.name
                                                                        }
                                                                    </CommandItem>
                                                                ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                )}

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsCartOpen(false)}
                                    className="h-8 w-8 rounded-full text-primary-foreground hover:bg-primary-foreground/20 sm:h-10 sm:w-10"
                                >
                                    <X className="h-5 w-5 sm:h-6 sm:w-6" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <form
                        onSubmit={handleFinishVenta}
                        className="flex flex-1 flex-col overflow-hidden"
                    >
                        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-6">
                            {cart.length === 0 ? (
                                <div className="flex h-full flex-col items-center justify-center gap-4 opacity-30">
                                    <ShoppingCart className="h-16 w-16 sm:h-20 sm:w-20" />
                                    <p className="text-lg font-bold sm:text-xl">
                                        Tu bolsa está vacía
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="custom-scrollbar max-h-[40vh] space-y-3 overflow-y-auto pr-2">
                                        {cart.map((item) => (
                                            <div
                                                key={`cart-${item.inventario_id}`}
                                                className="group flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-sm transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/50 hover:bg-muted/30"
                                            >
                                                {/* Imagen solo en desktop */}
                                                <div className="hidden h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border bg-background shadow-sm sm:block">
                                                    <img
                                                        src={getImageUrl(
                                                            item.producto.fotos,
                                                        )}
                                                        className="h-full w-full object-cover"
                                                        alt={
                                                            item.producto.nombre
                                                        }
                                                    />
                                                </div>
                                                <div className="min-w-0 flex-1 space-y-2">
                                                    <h4 className="line-clamp-1 text-sm font-bold text-foreground sm:text-base">
                                                        {item.producto.nombre}
                                                    </h4>
                                                    <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-4">
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                                                                Cant:
                                                            </span>
                                                            <div className="flex items-center rounded-lg border border-input bg-background p-0.5 shadow-sm focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                                                    onClick={() =>
                                                                        updateQuantity(
                                                                            item.inventario_id,
                                                                            -1,
                                                                        )
                                                                    }
                                                                >
                                                                    <Minus className="h-3.5 w-3.5" />
                                                                </Button>
                                                                <Input
                                                                    type="number"
                                                                    className="h-8 w-12 [appearance:textfield] border-none bg-transparent p-0 text-center font-bold focus-visible:ring-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                                                    value={item.cantidad.toString()}
                                                                    onChange={(
                                                                        e,
                                                                    ) => {
                                                                        const val =
                                                                            parseInt(
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            );
                                                                        if (
                                                                            !isNaN(
                                                                                val,
                                                                            )
                                                                        ) {
                                                                            const newQty =
                                                                                Math.max(
                                                                                    1,
                                                                                    Math.min(
                                                                                        val,
                                                                                        item.stock_max,
                                                                                    ),
                                                                                );
                                                                            setCart(
                                                                                (
                                                                                    prev,
                                                                                ) =>
                                                                                    prev.map(
                                                                                        (
                                                                                            p,
                                                                                        ) =>
                                                                                            p.inventario_id ===
                                                                                            item.inventario_id
                                                                                                ? {
                                                                                                      ...p,
                                                                                                      cantidad:
                                                                                                          newQty,
                                                                                                  }
                                                                                                : p,
                                                                                    ),
                                                                            );
                                                                        }
                                                                    }}
                                                                />
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                                                    onClick={() =>
                                                                        updateQuantity(
                                                                            item.inventario_id,
                                                                            1,
                                                                        )
                                                                    }
                                                                >
                                                                    <Plus className="h-3.5 w-3.5" />
                                                                </Button>
                                                            </div>
                                                        </div>

                                                        <div className="flex w-full flex-1 items-center gap-2 sm:w-auto">
                                                            <Label className="shrink-0 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                                                                Precio:
                                                            </Label>
                                                            <Input
                                                                type="number"
                                                                className="h-9 flex-1 rounded-lg border-input bg-background pr-3 text-right text-sm font-bold focus-visible:ring-primary sm:w-24"
                                                                value={
                                                                    item.precio_seleccionado ||
                                                                    ''
                                                                }
                                                                onFocus={(e) =>
                                                                    e.target.select()
                                                                }
                                                                onChange={(
                                                                    e,
                                                                ) => {
                                                                    const p =
                                                                        parseFloat(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        );
                                                                    setCart(
                                                                        cart.map(
                                                                            (
                                                                                i,
                                                                            ) =>
                                                                                i.inventario_id ===
                                                                                item.inventario_id
                                                                                    ? {
                                                                                          ...i,
                                                                                          precio_seleccionado:
                                                                                              isNaN(
                                                                                                  p,
                                                                                              )
                                                                                                  ? 0
                                                                                                  : p,
                                                                                      }
                                                                                    : i,
                                                                        ),
                                                                    );
                                                                }}
                                                                step="0.01"
                                                                min="0"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-2 border-l border-border/50 pl-2">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                                                        onClick={() =>
                                                            removeItem(
                                                                item.inventario_id,
                                                            )
                                                        }
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                    <div className="text-base font-black text-primary sm:text-lg">
                                                        Bs.{' '}
                                                        {(
                                                            item.cantidad *
                                                            item.precio_seleccionado
                                                        ).toFixed(2)}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 border-t pt-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold text-muted-foreground">
                                                Mesa / Ubicación
                                            </Label>
                                            <Select
                                                value={data.mesa_id?.toString()}
                                                onValueChange={(val) =>
                                                    setData(
                                                        'mesa_id',
                                                        parseInt(val),
                                                    )
                                                }
                                            >
                                                <SelectTrigger className="h-11 rounded-xl border-none bg-muted/40 font-bold">
                                                    <SelectValue placeholder="Seleccionar Mesa" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="null">
                                                        Sin Mesa (Pedido para
                                                        llevar)
                                                    </SelectItem>
                                                    {mesas.map((m) => (
                                                        <SelectItem
                                                            key={m.id}
                                                            value={m.id.toString()}
                                                        >
                                                            {m.nombre_mesa} (
                                                            {m.estado})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {data.mesa_id && (
                                            <div className="space-y-2">
                                                <Label className="text-xs font-semibold text-muted-foreground">
                                                    Estado del Pedido
                                                </Label>
                                                <Select
                                                    value={data.estado_comanda}
                                                    onValueChange={(val) =>
                                                        setData(
                                                            'estado_comanda',
                                                            val,
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger className="h-11 rounded-xl border-none bg-[var(--theme-primary)]/10 font-bold text-[var(--theme-primary)]">
                                                        <SelectValue placeholder="Estado" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="en_cocina">
                                                            🔥 En Cocina
                                                        </SelectItem>
                                                        <SelectItem value="pendiente">
                                                            ⏳ Pendiente
                                                        </SelectItem>
                                                        <SelectItem value="pagado">
                                                            ✅ Pagado /
                                                            Entregado
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}

                                        <div className="space-y-2 sm:col-span-2">
                                            <Label className="text-xs font-semibold text-muted-foreground">
                                                Cliente / Nota
                                            </Label>
                                            <div className="relative">
                                                <User2 className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                <Input
                                                    className="h-11 rounded-xl border-none bg-muted/40 pl-10 font-semibold"
                                                    value={data.cliente}
                                                    onChange={(e) =>
                                                        setData(
                                                            'cliente',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Nombre o Número de Mesa"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold text-muted-foreground">
                                                NIT / CI
                                            </Label>
                                            <Input
                                                className="h-11 rounded-xl border-none bg-muted/40 font-semibold"
                                                value={data.ci}
                                                onChange={(e) =>
                                                    setData(
                                                        'ci',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Opcional"
                                            />
                                        </div>

                                        <div className="space-y-3 sm:col-span-2">
                                            <Label className="text-xs font-semibold text-muted-foreground">
                                                Medio de pago
                                            </Label>
                                            <RadioGroup
                                                value={data.tipo_pago}
                                                onValueChange={(val) =>
                                                    setData('tipo_pago', val)
                                                }
                                                className="flex flex-col gap-3 sm:flex-row"
                                            >
                                                <div className="relative flex flex-1 items-center space-x-2">
                                                    <RadioGroupItem
                                                        value="Efectivo"
                                                        id="efectivo"
                                                        className="peer sr-only"
                                                    />
                                                    <Label
                                                        htmlFor="efectivo"
                                                        className="flex-1 cursor-pointer rounded-xl border-2 border-border p-3 text-center font-bold text-muted-foreground transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 peer-data-[state=checked]:text-primary hover:bg-muted/30"
                                                    >
                                                        💵 Efectivo
                                                    </Label>
                                                </div>
                                                <div className="relative flex flex-1 items-center space-x-2">
                                                    <RadioGroupItem
                                                        value="QR"
                                                        id="qr"
                                                        className="peer sr-only"
                                                    />
                                                    <Label
                                                        htmlFor="qr"
                                                        className="flex-1 cursor-pointer rounded-xl border-2 border-border p-3 text-center font-bold text-muted-foreground transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 peer-data-[state=checked]:text-primary hover:bg-muted/30"
                                                    >
                                                        📱 QR
                                                    </Label>
                                                </div>
                                                <div className="relative flex flex-1 items-center space-x-2">
                                                    <RadioGroupItem
                                                        value="Efectivo + QR"
                                                        id="mixto"
                                                        className="peer sr-only"
                                                    />
                                                    <Label
                                                        htmlFor="mixto"
                                                        className="flex-1 cursor-pointer rounded-xl border-2 border-border p-3 text-center font-bold text-muted-foreground transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 peer-data-[state=checked]:text-primary hover:bg-muted/30"
                                                    >
                                                        💵 + 📱 Mixto
                                                    </Label>
                                                </div>
                                            </RadioGroup>
                                        </div>

                                        {(data.tipo_pago === 'Efectivo' ||
                                            data.tipo_pago ===
                                                'Efectivo + QR') && (
                                            <div className="group space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <Label className="text-xs font-bold tracking-wider text-muted-foreground uppercase transition-colors group-focus-within:text-primary">
                                                        Monto en efectivo
                                                    </Label>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-5 text-[10px] text-muted-foreground hover:text-destructive"
                                                        onClick={() =>
                                                            setData(
                                                                'efectivo',
                                                                0,
                                                            )
                                                        }
                                                    >
                                                        Limpiar
                                                    </Button>
                                                </div>
                                                <div className="relative">
                                                    <Input
                                                        type="number"
                                                        className="h-12 rounded-xl border-input bg-muted/30 pr-4 pl-4 text-center text-lg font-bold shadow-inner transition-all focus-visible:border-primary focus-visible:ring-primary"
                                                        value={
                                                            data.efectivo || ''
                                                        }
                                                        onFocus={(e) =>
                                                            e.target.select()
                                                        }
                                                        onChange={(e) =>
                                                            handleNumberInput(
                                                                e.target.value,
                                                                (v) =>
                                                                    setData(
                                                                        'efectivo',
                                                                        v,
                                                                    ),
                                                            )
                                                        }
                                                        min="0"
                                                        step="0.01"
                                                        placeholder="0.00"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        {(data.tipo_pago === 'QR' ||
                                            data.tipo_pago ===
                                                'Efectivo + QR') && (
                                            <div className="group space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <Label className="text-xs font-bold tracking-wider text-muted-foreground uppercase transition-colors group-focus-within:text-primary">
                                                        Monto por QR
                                                    </Label>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-5 text-[10px] text-muted-foreground hover:text-destructive"
                                                        onClick={() =>
                                                            setData('qr', 0)
                                                        }
                                                    >
                                                        Limpiar
                                                    </Button>
                                                </div>
                                                <Input
                                                    type="number"
                                                    className="h-12 rounded-xl border-input bg-muted/30 text-center text-lg font-bold shadow-inner transition-all focus-visible:border-primary focus-visible:ring-primary"
                                                    value={data.qr || ''}
                                                    onFocus={(e) =>
                                                        e.target.select()
                                                    }
                                                    onChange={(e) =>
                                                        handleNumberInput(
                                                            e.target.value,
                                                            (v) =>
                                                                setData(
                                                                    'qr',
                                                                    v,
                                                                ),
                                                        )
                                                    }
                                                    min="0"
                                                    step="0.01"
                                                    placeholder="0.00"
                                                    required
                                                />
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        {cart.length > 0 && (
                            <div className="shrink-0 space-y-3 border-t bg-muted/20 p-4 sm:space-y-4 sm:p-6">
                                <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/10 p-4">
                                    <span className="text-sm font-semibold text-muted-foreground sm:text-base">
                                        Total a pagar
                                    </span>
                                    <span className="text-2xl font-black text-primary sm:text-3xl">
                                        Bs. {total.toFixed(2)}
                                    </span>
                                </div>

                                {data.pagado >= total && (
                                    <div className="flex items-center justify-between rounded-xl border border-green-500/20 bg-green-500/10 p-4">
                                        <span className="text-sm font-bold text-green-600 sm:text-base">
                                            Cambio
                                        </span>
                                        <span className="text-xl font-black text-green-600 sm:text-2xl">
                                            Bs. {data.cambio.toFixed(2)}
                                        </span>
                                    </div>
                                )}

                                <div className="flex gap-2 sm:gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="h-12 flex-1 rounded-xl font-bold sm:h-14"
                                        onClick={() => {
                                            setCart([]);
                                            setIsCartOpen(false);
                                        }}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />{' '}
                                        Vaciar
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={
                                            isProcessing ||
                                            data.pagado < total ||
                                            cart.length === 0
                                        }
                                        className="h-12 flex-[2] rounded-xl text-base font-bold shadow-xl transition-transform hover:scale-[1.02] sm:h-14 sm:text-lg"
                                    >
                                        {isProcessing ? (
                                            'Procesando...'
                                        ) : (
                                            <>
                                                <ShoppingCart className="mr-2 h-5 w-5" />
                                                Vender
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
