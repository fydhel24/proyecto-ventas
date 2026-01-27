import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { searchProductos, store } from '@/routes/ventas';
import axios from 'axios';
import { Boxes, Minus, Plus, Search, ShoppingCart, Trash2, X, Building2, User2 } from 'lucide-react';
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

interface Props {
    sucursal: Sucursal | null;
    sucursales: Sucursal[];
    isAdmin: boolean;
    categorias: Category[];
}

export default function POS({ sucursal, sucursales, isAdmin, categorias }: Props) {
    const { app_url } = usePage().props as any;
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [currentSucursalId, setCurrentSucursalId] = useState<string>(sucursal?.id.toString() || '');
    const [items, setItems] = useState<Inventory[]>([]);
    const [pagination, setPagination] = useState<PaginationData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    const { data, setData, reset } = useForm({
        sucursal_id: currentSucursalId,
        cliente: 'Cliente General',
        ci: '',
        tipo_pago: 'Efectivo',
        carrito: [] as any[],
        monto_total: 0,
        pagado: 0,
        cambio: 0,
        efectivo: 0,
        qr: 0,
    } as VentaForm);

    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const savedCart = localStorage.getItem('nexus_pos_cart');
        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart));
            } catch (e) {
                console.error("Error al cargar carrito", e);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('nexus_pos_cart', JSON.stringify(cart));
    }, [cart]);

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
                qr: data.qr
            });

            if (response.data.success) {
                window.open(`/ventas/${response.data.venta_id}/pdf`, '_blank');
                setCart([]);
                localStorage.removeItem('nexus_pos_cart');
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

                <div className="flex flex-col lg:flex-row items-center justify-between bg-card p-3 sm:p-4 rounded-2xl border shadow-sm gap-3 sm:gap-4">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className="p-2 sm:p-3 bg-primary text-primary-foreground rounded-xl shadow-inner">
                            <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-lg sm:text-xl font-black tracking-tight">Venta Rápida</h1>
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
                                {items.map((inv) => (
                                    <Card
                                        key={inv.id}
                                        className="group relative hover:shadow-lg transition-all duration-300 border shadow-sm rounded-xl overflow-hidden bg-card cursor-pointer"
                                        onClick={() => addToCart(inv)}
                                    >
                                        <div className="flex items-center gap-3 p-3">
                                            <div className="h-20 w-20 rounded-lg overflow-hidden bg-muted/5 shrink-0">
                                                <img
                                                    src={getImageUrl(inv.producto.fotos)}
                                                    alt={inv.producto.nombre}
                                                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                                                />
                                                {inv.stock <= 0 && (
                                                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                                                        <Badge variant="destructive" className="font-bold text-xs">Agotado</Badge>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1.5 mb-1">
                                                    <span className="text-[8px] font-bold text-primary/70">{inv.producto.marca?.nombre || 'General'}</span>
                                                    <span className="text-[7px] text-muted-foreground">•</span>
                                                    <span className="text-[8px] font-medium text-muted-foreground">{inv.producto.categoria?.nombre_cat}</span>
                                                </div>
                                                <h3 className="text-sm font-bold line-clamp-2 leading-tight group-hover:text-primary transition-colors mb-1">
                                                    {inv.producto.nombre}
                                                </h3>
                                                <div className="text-lg font-black text-foreground">
                                                    Bs. {inv.producto.precio_1}
                                                </div>
                                                {inv.stock > 0 && inv.stock < 5 && (
                                                    <Badge variant="destructive" className="mt-1 text-[8px] h-4 px-1.5 font-bold">
                                                        Últimos {inv.stock}
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="shrink-0">
                                                <div className="bg-primary text-primary-foreground p-3 rounded-full">
                                                    <ShoppingCart className="h-5 w-5" />
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>

                            {/* DESKTOP: Tarjetas verticales (grid) */}
                            <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 gap-4 pb-12">
                                {items.map((inv) => (
                                    <Card
                                        key={inv.id}
                                        className="group relative hover:shadow-2xl transition-all duration-300 border-none shadow-sm rounded-2xl overflow-hidden bg-card cursor-pointer"
                                        onClick={() => addToCart(inv)}
                                    >
                                        <div className="aspect-square relative overflow-hidden bg-muted/5">
                                            <img
                                                src={getImageUrl(inv.producto.fotos)}
                                                alt={inv.producto.nombre}
                                                className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <div className="bg-white text-black p-2 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-transform">
                                                    <Plus className="h-6 w-6" />
                                                </div>
                                            </div>
                                            {inv.stock <= 0 && (
                                                <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                                                    <Badge variant="destructive" className="font-bold text-xs">Agotado</Badge>
                                                </div>
                                            )}
                                            {inv.stock > 0 && inv.stock < 5 && (
                                                <Badge variant="destructive" className="absolute top-2 right-2 text-[8px] h-4 px-1.5 font-bold">
                                                    Últimos {inv.stock}
                                                </Badge>
                                            )}
                                        </div>
                                        <CardContent className="p-3">
                                            <div className="flex flex-col gap-0.5">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-[9px] font-bold text-primary/70">{inv.producto.marca?.nombre || 'General'}</span>
                                                    <span className="text-[8px] text-muted-foreground">•</span>
                                                    <span className="text-[9px] font-medium text-muted-foreground">{inv.producto.categoria?.nombre_cat}</span>
                                                </div>
                                                <h3 className="text-sm font-bold line-clamp-2 min-h-[2rem] leading-tight group-hover:text-primary transition-colors">
                                                    {inv.producto.nombre}
                                                </h3>
                                                <div className="mt-2 text-base font-black text-foreground">
                                                    Bs. {inv.producto.precio_1}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
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
                        <div className="flex items-center justify-between">
                            <div>
                                <DialogTitle className="text-2xl sm:text-3xl font-black tracking-tighter flex items-center gap-2">
                                    <ShoppingCart className="h-6 w-6" /> Finalizar venta
                                </DialogTitle>
                                <DialogDescription className="opacity-80 font-medium text-primary-foreground/80">
                                    {cart.length} producto{cart.length !== 1 ? 's' : ''} • Total: Bs. {total.toFixed(2)}
                                </DialogDescription>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setIsCartOpen(false)} className="rounded-full h-10 w-10 text-primary-foreground hover:bg-primary-foreground/20">
                                <X className="h-6 w-6" />
                            </Button>
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
                                    <div className="space-y-3">
                                        {cart.map((item) => (
                                            <div key={`cart-${item.inventario_id}`} className="flex items-center gap-3 bg-muted/30 p-3 rounded-xl border border-muted/50 group transition-all hover:bg-muted/50">
                                                {/* Imagen solo en desktop */}
                                                <div className="hidden sm:block h-16 w-16 rounded-lg overflow-hidden bg-background shrink-0 shadow-sm border">
                                                    <img src={getImageUrl(item.producto.fotos)} className="w-full h-full object-cover" alt={item.producto.nombre} />
                                                </div>
                                                <div className="flex-1 min-w-0 space-y-2">
                                                    <h4 className="font-bold text-sm sm:text-base line-clamp-1">{item.producto.nombre}</h4>
                                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                                                        <div className="flex items-center bg-background rounded-lg border p-0.5 shadow-inner">
                                                            <Button type="button" variant="ghost" size="icon" className="h-9 w-9 rounded-md" onClick={() => updateQuantity(item.inventario_id, -1)}>
                                                                <Minus className="h-4 w-4" />
                                                            </Button>
                                                            <span className="w-10 text-center text-sm font-black">{item.cantidad}</span>
                                                            <Button type="button" variant="ghost" size="icon" className="h-9 w-9 rounded-md" onClick={() => updateQuantity(item.inventario_id, 1)}>
                                                                <Plus className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                        <div className="flex items-center gap-2 w-full sm:w-auto">
                                                            <Label className="text-xs font-semibold text-muted-foreground shrink-0">Precio:</Label>
                                                            <Input
                                                                type="number"
                                                                className="h-11 sm:h-9 flex-1 sm:w-28 rounded-lg text-base sm:text-sm font-bold border-2 bg-background text-center"
                                                                value={item.precio_seleccionado || 0}
                                                                onChange={(e) => {
                                                                    const p = parseFloat(e.target.value) || 0;
                                                                    setCart(cart.map(i => i.inventario_id === item.inventario_id ? { ...i, precio_seleccionado: p } : i));
                                                                }}
                                                                step="0.01"
                                                                min="0"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeItem(item.inventario_id)}>
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
                                                <div className="flex items-center space-x-2 flex-1">
                                                    <RadioGroupItem value="Efectivo" id="efectivo" className="border-2" />
                                                    <Label htmlFor="efectivo" className="flex-1 cursor-pointer p-3 border-2 rounded-xl font-semibold hover:bg-muted/50 transition-colors">
                                                        💵 Efectivo
                                                    </Label>
                                                </div>
                                                <div className="flex items-center space-x-2 flex-1">
                                                    <RadioGroupItem value="QR" id="qr" className="border-2" />
                                                    <Label htmlFor="qr" className="flex-1 cursor-pointer p-3 border-2 rounded-xl font-semibold hover:bg-muted/50 transition-colors">
                                                        📱 QR
                                                    </Label>
                                                </div>
                                                <div className="flex items-center space-x-2 flex-1">
                                                    <RadioGroupItem value="Efectivo + QR" id="mixto" className="border-2" />
                                                    <Label htmlFor="mixto" className="flex-1 cursor-pointer p-3 border-2 rounded-xl font-semibold hover:bg-muted/50 transition-colors">
                                                        💵 + 📱 Mixto
                                                    </Label>
                                                </div>
                                            </RadioGroup>
                                        </div>

                                        {(data.tipo_pago === 'Efectivo' || data.tipo_pago === 'Efectivo + QR') && (
                                            <div className="space-y-2">
                                                <Label className="text-xs font-semibold text-muted-foreground">Monto en efectivo</Label>
                                                <Input
                                                    type="number"
                                                    className="h-12 text-lg rounded-xl bg-muted/40 border-none font-bold text-center"
                                                    value={data.efectivo}
                                                    onChange={e => setData('efectivo', parseFloat(e.target.value) || 0)}
                                                    min="0"
                                                    step="0.01"
                                                    placeholder="0.00"
                                                    required
                                                />
                                            </div>
                                        )}
                                        {(data.tipo_pago === 'QR' || data.tipo_pago === 'Efectivo + QR') && (
                                            <div className="space-y-2">
                                                <Label className="text-xs font-semibold text-muted-foreground">Monto por QR</Label>
                                                <Input
                                                    type="number"
                                                    className="h-12 text-lg rounded-xl bg-muted/40 border-none font-bold text-center"
                                                    value={data.qr}
                                                    onChange={e => setData('qr', parseFloat(e.target.value) || 0)}
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
