import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { searchProductos, store } from '@/routes/ventas';
import axios from 'axios';
import { Boxes, Minus, Plus, Search, ShoppingCart, Trash2, X, Building2, User2, LayoutGrid, List, Check, ChevronsUpDown } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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
}

import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function POS({ sucursal, sucursales, isAdmin, categorias, usuarios, sucursalesConCajaAbierta }: Props) {
    const { app_url } = usePage().props as any;
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [currentSucursalId, setCurrentSucursalId] = useState<string>(sucursal?.id.toString() || '');
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
    } as VentaForm & { user_vendedor_id?: number });

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
                console.error("Error al cargar carrito", e);
            }
        }

        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData);
                // Merge saved data with current values, prioritizing saved if valid
                setData(prev => ({
                    ...prev,
                    cliente: parsedData.cliente || '',
                    ci: parsedData.ci || '',
                    tipo_pago: parsedData.tipo_pago || 'Efectivo',
                    efectivo: parsedData.efectivo || 0,
                    qr: parsedData.qr || 0,
                    user_vendedor_id: parsedData.user_vendedor_id,
                }));
                if (parsedData.user_vendedor_id) setAssignUser(true);
            } catch (e) {
                console.error("Error al cargar datos del formulario", e);
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
            user_vendedor_id: data.user_vendedor_id
        };
        localStorage.setItem('nexus_pos_data', JSON.stringify(dataToSave));
    }, [data.cliente, data.ci, data.tipo_pago, data.efectivo, data.qr, data.user_vendedor_id, isLoaded]);

    useEffect(() => {
        if (currentSucursalId) fetchProducts(1);
    }, [selectedCategory, currentSucursalId]);

    const fetchProducts = async (page: number) => {
        setIsLoading(true);
        try {
            const response = await axios.get(searchProductos({
                query: search,
                categoria_id: selectedCategory === 'all' ? null : selectedCategory,
                sucursal_id: currentSucursalId,
                page: page,
                per_page: 12
            }).url);
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

        const existing = cart.find(i => i.inventario_id === inventory.id);
        if (existing) {
            updateQuantity(inventory.id, 1);
            return;
        }

        const newItem: CartItem = {
            inventario_id: inventory.id,
            producto: inventory.producto,
            cantidad: 1,
            precio_seleccionado: inventory.producto.precio_1,
            stock_max: inventory.stock
        };

        setCart([...cart, newItem]);
        toast.info(`${inventory.producto.nombre} agregado`, {
            icon: <ShoppingCart className="h-4 w-4" />
        });
    };

    const updateQuantity = (id: number, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.inventario_id === id) {
                const newQty = Math.min(Math.max(1, item.cantidad + delta), item.stock_max);
                if (newQty === item.stock_max && delta > 0) toast.warning('Límite de stock alcanzado');
                return { ...item, cantidad: newQty };
            }
            return item;
        }));
    };

    const removeItem = (id: number) => {
        setCart(prev => prev.filter(i => i.inventario_id !== id));
    };

    const total = cart.reduce((acc, item) => acc + (item.cantidad * item.precio_seleccionado), 0);

    useEffect(() => {
        setData(prev => ({
            ...prev,
            sucursal_id: currentSucursalId,
            carrito: cart.map(i => ({
                inventario_id: i.inventario_id,
                cantidad: i.cantidad,
                precio_venta: i.precio_seleccionado
            })),
            monto_total: total,
            pagado: data.efectivo + data.qr,
            cambio: Math.max(0, (data.efectivo + data.qr) - total)
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
                carrito: cart.map(item => ({
                    inventario_id: item.inventario_id,
                    cantidad: item.cantidad,
                    precio_venta: item.precio_seleccionado
                })),
                monto_total: total,
                pagado: data.efectivo + data.qr,
                cambio: Math.max(0, (data.efectivo + data.qr) - total),
                efectivo: data.efectivo,
                qr: data.qr,
                user_vendedor_id: data.user_vendedor_id
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
        <AppLayout breadcrumbs={[{ title: 'Ventas', href: '/ventas' }, { title: 'POS', href: '/ventas/create' }]}>
            <Head title="Punto de Venta" />
            <div className="flex flex-col h-[calc(100vh-100px)] p-2 sm:p-4 gap-4 overflow-hidden">

                {!isBoxOpen && (
                    <Alert variant="destructive" className="border-destructive/50 bg-destructive/10 text-destructive animate-in fade-in slide-in-from-top-2">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Caja Cerrada</AlertTitle>
                        <AlertDescription>
                            No hay una caja abierta para esta sucursal. Debe abrir una caja antes de realizar ventas.
                        </AlertDescription>
                    </Alert>
                )}

                <div className={`flex flex-col lg:flex-row items-center justify-between bg-card p-3 sm:p-4 rounded-2xl border shadow-sm gap-3 sm:gap-4 transition-opacity duration-300 ${!isBoxOpen ? 'opacity-50 pointer-events-none grayscale-[0.5]' : ''}`}>
                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className="p-2 sm:p-3 bg-primary text-primary-foreground rounded-xl shadow-inner">
                            <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <h1 className="text-lg sm:text-xl font-black tracking-tight">Venta Rápida</h1>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="sm:hidden h-8 w-8 ml-2"
                                    onClick={() => setIsMobileGridView(!isMobileGridView)}
                                >
                                    {isMobileGridView ? <List className="h-5 w-5" /> : <LayoutGrid className="h-5 w-5" />}
                                </Button>
                            </div>
                            {isAdmin ? (
                                <Select value={currentSucursalId} onValueChange={setCurrentSucursalId}>
                                    <SelectTrigger className="h-6 sm:h-7 border-none bg-transparent p-0 text-xs font-bold text-muted-foreground focus:ring-0">
                                        <Building2 className="mr-1 h-3 w-3" />
                                        <SelectValue placeholder="Seleccionar Sucursal" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sucursales.map(s => (
                                            <SelectItem key={s.id} value={s.id.toString()}>{s.nombre_sucursal}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <p className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                                    <Building2 className="h-3 w-3" /> {sucursal?.nombre_sucursal}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 w-full lg:w-auto">
                        <div className="relative flex-1 lg:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar producto..."
                                className="pl-9 h-10 sm:h-11 rounded-full bg-muted/50 border-none ring-offset-background focus-visible:ring-primary"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && fetchProducts(1)}
                            />
                        </div>
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                            <SelectTrigger className="w-[120px] sm:w-[160px] h-10 sm:h-11 rounded-full bg-muted/50 border-none font-medium">
                                <SelectValue placeholder="Categoría" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas</SelectItem>
                                {categorias.map(c => (
                                    <SelectItem key={c.id} value={c.id.toString()}>{c.nombre_cat}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Button
                        variant="default"
                        size="icon"
                        className="relative rounded-2xl h-12 w-12 sm:h-14 sm:w-14 shadow-xl hover:scale-105 transition-transform"
                        onClick={() => setIsCartOpen(true)}
                    >
                        <ShoppingCart className="h-6 w-6 sm:h-7 sm:w-7" />
                        {cart.length > 0 && (
                            <Badge className="absolute -top-2 -right-2 h-6 w-6 sm:h-7 sm:w-7 flex items-center justify-center p-0 rounded-full border-2 border-background animate-bounce font-bold">
                                {cart.length}
                            </Badge>
                        )}
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                    {isLoading ? (
                        <div className="flex flex-col gap-3 sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 sm:gap-4">
                            {[...Array(16)].map((_, i) => (
                                <Card key={i} className="animate-pulse h-24 sm:h-60 bg-muted/20 border-none rounded-2xl" />
                            ))}
                        </div>
                    ) : items.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center opacity-20">
                            <Boxes className="h-20 w-20 sm:h-24 sm:w-24 mb-4" />
                            <p className="text-xl sm:text-2xl font-black">Catálogo vacío</p>
                        </div>
                    ) : (
                        <>
                            {/* MÓVIL: Tarjetas horizontales */}
                            <div className="flex flex-col gap-3 sm:hidden pb-12">
                                {items.map((inventory) => {
                                    const isOutOfStock = inventory.stock <= 0;
                                    return (
                                        <Card
                                            key={inventory.id}
                                            className={`overflow-hidden hover:shadow-lg transition-all cursor-pointer group flex flex-col ${isOutOfStock ? 'border-destructive/50 bg-destructive/5' : ''}`}
                                            onClick={() => addToCart(inventory)}
                                        >
                                            <div className="aspect-square relative overflow-hidden bg-muted">
                                                {inventory.producto.fotos && inventory.producto.fotos.length > 0 ? (
                                                    <img
                                                        src={getImageUrl(inventory.producto.fotos)}
                                                        alt={inventory.producto.nombre}
                                                        className={`w-full h-full object-cover transition-transform group-hover:scale-110 ${isOutOfStock ? 'opacity-50 grayscale' : ''}`}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                                        <Boxes className="w-12 h-12 opacity-20" />
                                                    </div>
                                                )}
                                                <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                                                    <Badge variant="secondary" className="font-bold shadow-sm">
                                                        Bs. {inventory.producto.precio_1}
                                                    </Badge>

                                                    {isOutOfStock ? (
                                                        <Badge variant="destructive" className="font-bold shadow-sm">
                                                            SIN STOCK
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="font-bold shadow-sm bg-background/80 backdrop-blur-sm">
                                                            Stock: {inventory.stock}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <CardContent className="p-4 flex-1 flex flex-col gap-2">
                                                <div className="flex-1">
                                                    <h3 className={`font-bold leading-tight line-clamp-2 ${isOutOfStock ? 'text-muted-foreground' : ''}`}>
                                                        {inventory.producto.nombre}
                                                    </h3>
                                                    {inventory.producto.marca && (
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            {inventory.producto.marca.nombre}
                                                        </p>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>

                            {/* DESKTOP: Tarjetas verticales (grid) */}
                            <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 gap-4 pb-12">
                                {items.map((inv) => {
                                    const isOutOfStock = inv.stock <= 0;
                                    return (
                                        <Card
                                            key={inv.id}
                                            className={`group relative hover:shadow-2xl transition-all duration-300 shadow-sm rounded-2xl overflow-hidden bg-card cursor-pointer ${isOutOfStock ? 'border-2 border-destructive/50 bg-destructive/5' : 'border-none'}`}
                                            onClick={() => addToCart(inv)}
                                        >
                                            <div className="aspect-square relative overflow-hidden bg-muted/5">
                                                <img
                                                    src={getImageUrl(inv.producto.fotos)}
                                                    alt={inv.producto.nombre}
                                                    className={`object-cover w-full h-full group-hover:scale-110 transition-transform duration-500 ${isOutOfStock ? 'opacity-50 grayscale' : ''}`}
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <div className="bg-white text-black p-2 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-transform">
                                                        <Plus className="h-6 w-6" />
                                                    </div>
                                                </div>

                                                <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                                                    {isOutOfStock ? (
                                                        <Badge variant="destructive" className="font-bold text-xs shadow-sm">
                                                            SIN STOCK
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="font-bold shadow-sm bg-background/80 backdrop-blur-sm text-[10px] h-5">
                                                            Stock: {inv.stock}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <CardContent className="p-3">
                                                <div className="flex flex-col gap-0.5">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-[9px] font-bold text-primary/70">{inv.producto.marca?.nombre || 'General'}</span>
                                                        <span className="text-[8px] text-muted-foreground">•</span>
                                                        <span className="text-[9px] font-medium text-muted-foreground">{inv.producto.categoria?.nombre_cat}</span>
                                                    </div>
                                                    <h3 className={`text-sm font-bold line-clamp-2 min-h-[2rem] leading-tight group-hover:text-primary transition-colors ${isOutOfStock ? 'text-muted-foreground' : ''}`}>
                                                        {inv.producto.nombre}
                                                    </h3>
                                                    <div className="mt-2 text-base font-black text-foreground">
                                                        Bs. {inv.producto.precio_1}
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
                    <div className="flex items-center justify-center gap-2 sm:gap-4 bg-card/80 backdrop-blur-md p-2 sm:p-3 rounded-2xl border shadow-lg">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-full px-2 sm:px-4 text-xs sm:text-sm"
                            disabled={pagination.current_page === 1}
                            onClick={() => fetchProducts(pagination.current_page - 1)}
                        >
                            <Minus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" /> Anterior
                        </Button>
                        <div className="flex items-center gap-1">
                            {[...Array(pagination.last_page)].map((_, i) => {
                                const page = i + 1;
                                if (page === 1 || page === pagination.last_page || (page >= pagination.current_page - 1 && page <= pagination.current_page + 1)) {
                                    return (
                                        <Button
                                            key={page}
                                            variant={pagination.current_page === page ? "default" : "ghost"}
                                            size="icon"
                                            className="h-7 w-7 sm:h-8 sm:w-8 rounded-full text-xs font-bold"
                                            onClick={() => fetchProducts(page)}
                                        >
                                            {page}
                                        </Button>
                                    );
                                } else if (page === pagination.current_page - 2 || page === pagination.current_page + 2) {
                                    return <span key={page} className="text-xs">...</span>;
                                }
                                return null;
                            })}
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-full px-2 sm:px-4 text-xs sm:text-sm"
                            disabled={pagination.current_page === pagination.last_page}
                            onClick={() => fetchProducts(pagination.current_page + 1)}
                        >
                            Siguiente <Plus className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                    </div>
                )}
            </div>

            <Dialog open={isCartOpen} onOpenChange={setIsCartOpen}>
                <DialogContent className="max-w-full sm:max-w-2xl max-h-[95vh] flex flex-col p-0 overflow-hidden rounded-[1.5rem] sm:rounded-[2.5rem] border-none shadow-2xl">
                    <div className="bg-primary p-4 sm:p-6 text-primary-foreground shrink-0">
                        <div className="flex items-center justify-between gap-2 sm:gap-4">
                            <div className="min-w-0">
                                <DialogTitle className="text-xl sm:text-3xl font-black tracking-tighter flex items-center gap-2">
                                    <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" /> <span className="truncate">Finalizar venta</span>
                                </DialogTitle>
                                <DialogDescription className="opacity-80 font-medium text-primary-foreground/80 text-xs sm:text-sm">
                                    {cart.length} producto{cart.length !== 1 ? 's' : ''} • Total: Bs. {total.toFixed(2)}
                                </DialogDescription>
                            </div>

                            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                                <div className="flex items-center gap-2 bg-primary-foreground/10 px-2 sm:px-3 py-1.5 rounded-full border border-primary-foreground/20">
                                    <Label htmlFor="assign-sw" className="hidden sm:block text-[10px] font-bold uppercase tracking-wider cursor-pointer select-none text-primary-foreground">
                                        Asignar
                                    </Label>
                                    <Switch
                                        id="assign-sw"
                                        checked={assignUser}
                                        onCheckedChange={(c) => {
                                            setAssignUser(c);
                                            if (!c) setData('user_vendedor_id', undefined);
                                        }}
                                        className="scale-75 sm:scale-100 data-[state=checked]:bg-white data-[state=unchecked]:bg-black/20"
                                    />
                                </div>

                                {assignUser && (
                                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                        <Popover open={openUserSelect} onOpenChange={setOpenUserSelect}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    aria-expanded={openUserSelect}
                                                    className="w-[180px] sm:w-[220px] h-8 sm:h-9 justify-between bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground font-medium hover:bg-primary-foreground/20 hover:text-primary-foreground border-none text-xs sm:text-sm"
                                                >
                                                    {data.user_vendedor_id
                                                        ? usuarios.find((u) => u.id === data.user_vendedor_id)?.name
                                                        : "Seleccionar vendedor..."}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[200px] p-0">
                                                <Command>
                                                    <CommandInput placeholder="Buscar vendedor..." />
                                                    <CommandList>
                                                        <CommandEmpty>No se encontró vendedor.</CommandEmpty>
                                                        <CommandGroup>
                                                            {usuarios
                                                                .filter(u => {
                                                                    if (isAdmin) return true;
                                                                    return u.sucursal_id === (sucursal?.id || parseInt(currentSucursalId));
                                                                })
                                                                .map((user) => (
                                                                    <CommandItem
                                                                        key={user.id}
                                                                        value={user.name}
                                                                        onSelect={() => {
                                                                            setData('user_vendedor_id', user.id);
                                                                            setOpenUserSelect(false);
                                                                        }}
                                                                    >
                                                                        <Check
                                                                            className={cn(
                                                                                "mr-2 h-4 w-4",
                                                                                data.user_vendedor_id === user.id ? "opacity-100" : "opacity-0"
                                                                            )}
                                                                        />
                                                                        {user.name}
                                                                    </CommandItem>
                                                                ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                )}

                                <Button variant="ghost" size="icon" onClick={() => setIsCartOpen(false)} className="rounded-full h-8 w-8 sm:h-10 sm:w-10 text-primary-foreground hover:bg-primary-foreground/20">
                                    <X className="h-5 w-5 sm:h-6 sm:w-6" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleFinishVenta} className="flex-1 flex flex-col overflow-hidden">
                        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center opacity-30 gap-4">
                                    <ShoppingCart className="h-16 w-16 sm:h-20 sm:w-20" />
                                    <p className="text-lg sm:text-xl font-bold">Tu bolsa está vacía</p>
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                                        {cart.map((item) => (
                                            <div key={`cart-${item.inventario_id}`} className="flex items-center gap-3 bg-card p-3 rounded-xl border border-border shadow-sm group transition-all hover:bg-muted/30 focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary">
                                                {/* Imagen solo en desktop */}
                                                <div className="hidden sm:block h-16 w-16 rounded-lg overflow-hidden bg-background shrink-0 shadow-sm border border-border">
                                                    <img src={getImageUrl(item.producto.fotos)} className="w-full h-full object-cover" alt={item.producto.nombre} />
                                                </div>
                                                <div className="flex-1 min-w-0 space-y-2">
                                                    <h4 className="font-bold text-sm sm:text-base line-clamp-1 text-foreground">{item.producto.nombre}</h4>
                                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Cant:</span>
                                                            <div className="flex items-center bg-background rounded-lg border border-input p-0.5 shadow-sm focus-within:ring-1 focus-within:ring-primary focus-within:border-primary">
                                                                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" onClick={() => updateQuantity(item.inventario_id, -1)}>
                                                                    <Minus className="h-3.5 w-3.5" />
                                                                </Button>
                                                                <Input
                                                                    type="number"
                                                                    className="w-12 h-8 text-center border-none p-0 focus-visible:ring-0 font-bold bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                                    value={item.cantidad.toString()}
                                                                    onChange={(e) => {
                                                                        const val = parseInt(e.target.value);
                                                                        if (!isNaN(val)) {
                                                                            const newQty = Math.max(1, Math.min(val, item.stock_max));
                                                                            setCart(prev => prev.map(p => p.inventario_id === item.inventario_id ? { ...p, cantidad: newQty } : p));
                                                                        }
                                                                    }}
                                                                />
                                                                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" onClick={() => updateQuantity(item.inventario_id, 1)}>
                                                                    <Plus className="h-3.5 w-3.5" />
                                                                </Button>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
                                                            <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider shrink-0">Precio:</Label>
                                                            <Input
                                                                type="number"
                                                                className="h-9 flex-1 sm:w-24 rounded-lg text-sm font-bold border-input bg-background text-right pr-3 focus-visible:ring-primary"
                                                                value={item.precio_seleccionado || ''}
                                                                onFocus={(e) => e.target.select()}
                                                                onChange={(e) => {
                                                                    const p = parseFloat(e.target.value);
                                                                    setCart(cart.map(i => i.inventario_id === item.inventario_id ? { ...i, precio_seleccionado: isNaN(p) ? 0 : p } : i));
                                                                }}
                                                                step="0.01"
                                                                min="0"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-2 pl-2 border-l border-border/50">
                                                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors" onClick={() => removeItem(item.inventario_id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                    <div className="text-base sm:text-lg font-black text-primary">Bs. {(item.cantidad * item.precio_seleccionado).toFixed(2)}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold text-muted-foreground">Cliente</Label>
                                            <div className="relative">
                                                <User2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    className="pl-10 h-11 rounded-xl bg-muted/40 border-none font-semibold"
                                                    value={data.cliente}
                                                    onChange={e => setData('cliente', e.target.value)}
                                                    placeholder="Nombre del cliente"
                                                    required
                                                />
                                            </div>
                                        </div>



                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold text-muted-foreground">NIT / CI</Label>
                                            <Input
                                                className="h-11 rounded-xl bg-muted/40 border-none font-semibold"
                                                value={data.ci}
                                                onChange={e => setData('ci', e.target.value)}
                                                placeholder="Opcional"
                                            />
                                        </div>

                                        <div className="space-y-3 sm:col-span-2">
                                            <Label className="text-xs font-semibold text-muted-foreground">Medio de pago</Label>
                                            <RadioGroup value={data.tipo_pago} onValueChange={val => setData('tipo_pago', val)} className="flex flex-col sm:flex-row gap-3">
                                                <div className="flex items-center space-x-2 flex-1 relative">
                                                    <RadioGroupItem value="Efectivo" id="efectivo" className="peer sr-only" />
                                                    <Label htmlFor="efectivo" className="flex-1 cursor-pointer p-3 border-2 border-border rounded-xl font-bold text-muted-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary peer-data-[state=checked]:bg-primary/5 transition-all text-center hover:bg-muted/30">
                                                        💵 Efectivo
                                                    </Label>
                                                </div>
                                                <div className="flex items-center space-x-2 flex-1 relative">
                                                    <RadioGroupItem value="QR" id="qr" className="peer sr-only" />
                                                    <Label htmlFor="qr" className="flex-1 cursor-pointer p-3 border-2 border-border rounded-xl font-bold text-muted-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary peer-data-[state=checked]:bg-primary/5 transition-all text-center hover:bg-muted/30">
                                                        📱 QR
                                                    </Label>
                                                </div>
                                                <div className="flex items-center space-x-2 flex-1 relative">
                                                    <RadioGroupItem value="Efectivo + QR" id="mixto" className="peer sr-only" />
                                                    <Label htmlFor="mixto" className="flex-1 cursor-pointer p-3 border-2 border-border rounded-xl font-bold text-muted-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary peer-data-[state=checked]:bg-primary/5 transition-all text-center hover:bg-muted/30">
                                                        💵 + 📱 Mixto
                                                    </Label>
                                                </div>
                                            </RadioGroup>
                                        </div>

                                        {(data.tipo_pago === 'Efectivo' || data.tipo_pago === 'Efectivo + QR') && (
                                            <div className="space-y-2 group">
                                                <div className="flex justify-between items-center">
                                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground group-focus-within:text-primary transition-colors">Monto en efectivo</Label>
                                                    <Button type="button" variant="ghost" size="sm" className="h-5 text-[10px] text-muted-foreground hover:text-destructive" onClick={() => setData('efectivo', 0)}>Limpiar</Button>
                                                </div>
                                                <div className="relative">
                                                    <Input
                                                        type="number"
                                                        className="h-12 pl-4 pr-4 text-lg rounded-xl bg-muted/30 border-input font-bold text-center focus-visible:ring-primary focus-visible:border-primary transition-all shadow-inner"
                                                        value={data.efectivo || ''}
                                                        onFocus={(e) => e.target.select()}
                                                        onChange={e => handleNumberInput(e.target.value, (v) => setData('efectivo', v))}
                                                        min="0"
                                                        step="0.01"
                                                        placeholder="0.00"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        {(data.tipo_pago === 'QR' || data.tipo_pago === 'Efectivo + QR') && (
                                            <div className="space-y-2 group">
                                                <div className="flex justify-between items-center">
                                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground group-focus-within:text-primary transition-colors">Monto por QR</Label>
                                                    <Button type="button" variant="ghost" size="sm" className="h-5 text-[10px] text-muted-foreground hover:text-destructive" onClick={() => setData('qr', 0)}>Limpiar</Button>
                                                </div>
                                                <Input
                                                    type="number"
                                                    className="h-12 text-lg rounded-xl bg-muted/30 border-input font-bold text-center focus-visible:ring-primary focus-visible:border-primary transition-all shadow-inner"
                                                    value={data.qr || ''}
                                                    onFocus={(e) => e.target.select()}
                                                    onChange={e => handleNumberInput(e.target.value, (v) => setData('qr', v))}
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
                            <div className="p-4 sm:p-6 border-t bg-muted/20 space-y-3 sm:space-y-4 shrink-0">
                                <div className="bg-primary/10 rounded-xl p-4 border border-primary/20 flex justify-between items-center">
                                    <span className="text-sm sm:text-base font-semibold text-muted-foreground">Total a pagar</span>
                                    <span className="text-2xl sm:text-3xl font-black text-primary">Bs. {total.toFixed(2)}</span>
                                </div>

                                {data.pagado >= total && (
                                    <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/20 flex justify-between items-center">
                                        <span className="text-sm sm:text-base font-bold text-green-600">Cambio</span>
                                        <span className="text-xl sm:text-2xl font-black text-green-600">Bs. {data.cambio.toFixed(2)}</span>
                                    </div>
                                )}

                                <div className="flex gap-2 sm:gap-3">
                                    <Button type="button" variant="outline" className="h-12 sm:h-14 flex-1 rounded-xl font-bold" onClick={() => { setCart([]); setIsCartOpen(false); }}>
                                        <Trash2 className="mr-2 h-4 w-4" /> Vaciar
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isProcessing || data.pagado < total || cart.length === 0}
                                        className="h-12 sm:h-14 flex-[2] rounded-xl font-bold text-base sm:text-lg shadow-xl hover:scale-[1.02] transition-transform"
                                    >
                                        {isProcessing ? 'Procesando...' : (
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
