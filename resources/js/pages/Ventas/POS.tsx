import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { searchProductos, store, show } from '@/routes/ventas';
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
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        sucursal_id: currentSucursalId,
        cliente: 'CLIENTE GENERAL',
        ci: '',
        tipo_pago: 'Efectivo',
        carrito: [] as any[],
        monto_total: 0,
        pagado: 0,
        cambio: 0,
    } as VentaForm);

    // Cargar carrito desde LocalStorage
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

    // Guardar carrito en LocalStorage
    useEffect(() => {
        localStorage.setItem('nexus_pos_cart', JSON.stringify(cart));
    }, [cart]);

    useEffect(() => {
        if (currentSucursalId) fetchProducts(1);
    }, [selectedCategory, currentSucursalId]);

    useEffect(() => {
        const delaySearch = setTimeout(() => {
            if (currentSucursalId) fetchProducts(1);
        }, 500);
        return () => clearTimeout(delaySearch);
    }, [search]);

    const fetchProducts = async (page: number) => {
        setIsLoading(true);
        try {
            const response = await axios.get(searchProductos({
                query: {
                    query: search,
                    categoria_id: selectedCategory === 'all' ? null : selectedCategory,
                    sucursal_id: currentSucursalId,
                    page: page,
                    per_page: 12
                }
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
            cambio: Math.max(0, data.pagado - total)
        }));
    }, [cart, total, data.pagado, currentSucursalId]);

    const handleFinishVenta = (e: React.FormEvent) => {
        e.preventDefault();
        post(store().url, {
            onSuccess: (page) => {
                const flash = page.props.flash as any;
                if (flash.show_ticket) {
                    window.open(show(flash.show_ticket).url, '_blank');
                    setCart([]);
                    localStorage.removeItem('nexus_pos_cart');
                    reset();
                    setIsCheckoutOpen(false);
                }
            }
        });
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
            <div className="flex flex-col h-[calc(100vh-100px)] p-4 gap-4 overflow-hidden">

                <div className="flex flex-col lg:flex-row items-center justify-between bg-card p-4 rounded-2xl border shadow-sm gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary text-primary-foreground rounded-xl shadow-inner">
                            <ShoppingCart className="h-6 w-6" />
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-xl font-black tracking-tight">Venta Rápida</h1>
                            {isAdmin ? (
                                <Select value={currentSucursalId} onValueChange={setCurrentSucursalId}>
                                    <SelectTrigger className="h-7 border-none bg-transparent p-0 text-xs font-bold text-muted-foreground focus:ring-0">
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
                                <p className="text-[10px] text-muted-foreground uppercase font-black flex items-center gap-1">
                                    <Building2 className="h-3 w-3" /> {sucursal?.nombre_sucursal}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 w-full lg:w-auto">
                        <div className="relative flex-1 lg:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por nombre de producto..."
                                className="pl-9 h-11 rounded-full bg-muted/50 border-none ring-offset-background focus-visible:ring-primary"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                            <SelectTrigger className="w-[160px] h-11 rounded-full bg-muted/50 border-none font-medium">
                                <SelectValue placeholder="Todas las Categorías" />
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
                        className="relative rounded-2xl h-14 w-14 shadow-xl hover:scale-105 transition-transform"
                        onClick={() => setIsCartOpen(true)}
                    >
                        <ShoppingCart className="h-7 w-7" />
                        {cart.length > 0 && (
                            <Badge className="absolute -top-2 -right-2 h-7 w-7 flex items-center justify-center p-0 rounded-full border-2 border-background animate-bounce font-bold">
                                {cart.length}
                            </Badge>
                        )}
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                    {isLoading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 gap-4">
                            {[...Array(16)].map((_, i) => (
                                <Card key={i} className="animate-pulse h-60 bg-muted/20 border-none rounded-2xl" />
                            ))}
                        </div>
                    ) : items.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center opacity-20">
                            <Boxes className="h-24 w-24 mb-4" />
                            <p className="text-2xl font-black">CATÁLOGO VACÍO</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 gap-4 pb-12">
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
                                                <Badge variant="destructive" className="font-bold">AGOTADO</Badge>
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
                                                <span className="text-[9px] uppercase font-bold text-primary/70">{inv.producto.marca?.nombre || 'General'}</span>
                                                <span className="text-[8px] text-muted-foreground">•</span>
                                                <span className="text-[9px] uppercase font-medium text-muted-foreground">{inv.producto.categoria?.nombre_cat}</span>
                                            </div>
                                            <h3 className="text-xs font-bold line-clamp-2 min-h-[2rem] leading-tight group-hover:text-primary transition-colors">
                                                {inv.producto.nombre}
                                            </h3>
                                            <div className="mt-2 text-base font-black text-foreground">
                                                Bs. {inv.producto.precio_1}
                                            </div>
                                        </div>
                                    </CardContent>
                                    <div className="absolute bottom-2 right-2 transform scale-0 group-hover:scale-100 transition-transform">
                                        <Button size="icon" className="h-8 w-8 rounded-full shadow-lg">
                                            <ShoppingCart className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {pagination && pagination.last_page > 1 && (
                    <div className="flex items-center justify-center gap-4 bg-card/80 backdrop-blur-md p-3 rounded-2xl border shadow-lg">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-full px-4"
                            disabled={pagination.current_page === 1}
                            onClick={() => fetchProducts(pagination.current_page - 1)}
                        >
                            <Minus className="mr-2 h-4 w-4" /> Anterior
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
                                            className="h-8 w-8 rounded-full text-xs font-bold"
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
                            className="rounded-full px-4"
                            disabled={pagination.current_page === pagination.last_page}
                            onClick={() => fetchProducts(pagination.current_page + 1)}
                        >
                            Siguiente <Plus className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>

            <Dialog open={isCartOpen} onOpenChange={setIsCartOpen}>
                <DialogContent className="sm:max-w-[750px] h-[85vh] flex flex-col p-0 overflow-hidden rounded-[2rem] border-none shadow-2xl">
                    <DialogHeader className="p-8 pb-4 flex flex-row items-center justify-between">
                        <div className="flex flex-col gap-1">
                            <DialogTitle className="text-2xl font-black flex items-center gap-2">
                                <ShoppingCart className="h-6 w-6 text-primary" /> BOLSA DE COMPRA
                            </DialogTitle>
                            <DialogDescription className="font-medium">Total de productos: {cart.length}</DialogDescription>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setIsCartOpen(false)} className="rounded-full">
                            <X className="h-6 w-6" />
                        </Button>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto px-8 py-2 scrollbar-hide">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center opacity-30 gap-4">
                                <ShoppingCart className="h-20 w-20" />
                                <p className="text-xl font-bold">TU BOLSA ESTÁ VACÍA</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {cart.map((item) => (
                                    <div key={item.inventario_id} className="flex items-center gap-4 bg-muted/30 p-4 rounded-2xl border border-muted/50 group transition-all hover:bg-muted/50">
                                        <div className="h-20 w-20 rounded-xl overflow-hidden bg-background shrink-0 shadow-sm border">
                                            <img src={getImageUrl(item.producto.fotos)} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge variant="outline" className="text-[8px] uppercase">{item.producto.categoria?.nombre_cat}</Badge>
                                            </div>
                                            <h4 className="font-bold text-sm line-clamp-1">{item.producto.nombre}</h4>
                                            <div className="flex items-center gap-4 mt-2">
                                                <div className="flex items-center bg-background rounded-full border p-1 shadow-inner">
                                                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => updateQuantity(item.inventario_id, -1)}>
                                                        <Minus className="h-3 w-3" />
                                                    </Button>
                                                    <span className="w-10 text-center text-xs font-black">{item.cantidad}</span>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => updateQuantity(item.inventario_id, 1)}>
                                                        <Plus className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                                <Select
                                                    value={item.precio_seleccionado?.toString() || '0'}
                                                    onValueChange={(val) => {
                                                        const p = parseFloat(val);
                                                        setCart(cart.map(i => i.inventario_id === item.inventario_id ? { ...i, precio_seleccionado: p } : i));
                                                    }}
                                                >
                                                    <SelectTrigger className="h-9 w-28 rounded-full text-xs font-bold border-none bg-background shadow-inner">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value={(item.producto.precio_1 || 0).toString()}>P. Normal: {item.producto.precio_1 || 0}</SelectItem>
                                                        <SelectItem value={(item.producto.precio_2 || 0).toString()}>P. Mayor: {item.producto.precio_2 || 0}</SelectItem>
                                                        <SelectItem value={(item.producto.precio_3 || 0).toString()}>P. Oferta: {item.producto.precio_3 || 0}</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeItem(item.inventario_id)}>
                                                <X className="h-5 w-5" />
                                            </Button>
                                            <div className="text-lg font-black text-primary">Bs. {(item.cantidad * item.precio_seleccionado).toFixed(2)}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-8 border-t bg-muted/20 flex flex-col md:flex-row gap-6 items-center">
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Total Estimado</span>
                            <span className="text-4xl font-black text-primary tracking-tighter">Bs. {total.toFixed(2)}</span>
                        </div>
                        <div className="flex flex-1 items-center justify-end gap-3 w-full">
                            <Button variant="outline" onClick={() => { setCart([]); setIsCartOpen(false); }} className="h-14 font-black rounded-2xl hover:bg-destructive hover:text-white transition-colors gap-2 px-6">
                                <Trash2 className="h-5 w-5" /> VACIAR BOLSA
                            </Button>
                            <Button disabled={cart.length === 0} onClick={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }} className="h-14 px-12 font-black text-lg rounded-2xl shadow-xl shadow-primary/20 flex-1 md:flex-none">
                                CONTINUAR PAGO
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
                <DialogContent className="sm:max-w-2xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-3xl">
                    <div className="bg-primary p-8 text-primary-foreground">
                        <DialogTitle className="text-3xl font-black tracking-tighter">FINALIZAR TRANSACCIÓN</DialogTitle>
                        <p className="opacity-80 font-medium">Completa los datos para el ticket de venta.</p>
                    </div>

                    <form onSubmit={handleFinishVenta} className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase text-muted-foreground">Datos del Cliente</Label>
                                <div className="relative">
                                    <User2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        className="pl-10 h-12 rounded-2xl bg-muted/40 border-none font-bold"
                                        value={data.cliente}
                                        onChange={e => setData('cliente', e.target.value)}
                                        placeholder="CLIENTE GENERAL"
                                    />
                                </div>
                                {errors.cliente && <p className="text-[10px] text-red-500 font-bold">{errors.cliente}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase text-muted-foreground">NIT / CI</Label>
                                    <Input
                                        className="h-12 rounded-2xl bg-muted/40 border-none font-bold"
                                        value={data.ci}
                                        onChange={e => setData('ci', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase text-muted-foreground">Medio de Pago</Label>
                                    <Select value={data.tipo_pago} onValueChange={val => setData('tipo_pago', val)}>
                                        <SelectTrigger className="h-12 rounded-2xl bg-muted/40 border-none font-bold">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Efectivo">💵 Efectivo</SelectItem>
                                            <SelectItem value="QR">📱 QR / Transf.</SelectItem>
                                            <SelectItem value="Tarjeta">💳 Tarjeta</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Listado pequeño editable en checkout */}
                        <div className="max-h-60 overflow-y-auto border-y py-4 space-y-4">
                            {cart.map((item) => (
                                <div key={item.inventario_id} className="flex flex-col gap-2 p-2 bg-muted/20 rounded-xl group transition-all hover:bg-muted/40">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 font-bold text-xs truncate mr-4">{item.producto.nombre}</div>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeItem(item.inventario_id)}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-2 bg-background p-1 rounded-lg border shadow-inner">
                                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md" onClick={() => updateQuantity(item.inventario_id, -1)}>
                                                <Minus className="h-3 w-3" />
                                            </Button>
                                            <span className="font-black text-xs min-w-[1.5rem] text-center">{item.cantidad}</span>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md" onClick={() => updateQuantity(item.inventario_id, 1)}>
                                                <Plus className="h-3 w-3" />
                                            </Button>
                                        </div>
                                        <div className="flex items-center gap-3 flex-1 justify-end">
                                            <Select
                                                value={item.precio_seleccionado?.toString() || '0'}
                                                onValueChange={(val) => {
                                                    const p = parseFloat(val);
                                                    setCart(prev => prev.map(i => i.inventario_id === item.inventario_id ? { ...i, precio_seleccionado: p } : i));
                                                }}
                                            >
                                                <SelectTrigger className="h-8 w-24 rounded-lg text-[10px] font-bold border-none bg-background shadow-inner">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value={(item.producto.precio_1 || 0).toString()}>P1: {item.producto.precio_1 || 0}</SelectItem>
                                                    <SelectItem value={(item.producto.precio_2 || 0).toString()}>P2: {item.producto.precio_2 || 0}</SelectItem>
                                                    <SelectItem value={(item.producto.precio_3 || 0).toString()}>P3: {item.producto.precio_3 || 0}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <span className="w-16 text-right font-black text-xs text-primary">Bs. {(item.cantidad * item.precio_seleccionado).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-primary/5 rounded-[2rem] p-6 border border-primary/10 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                            <div className="space-y-1">
                                <span className="text-[10px] uppercase font-black text-muted-foreground">Monto Total</span>
                                <div className="text-4xl font-black text-primary tracking-tighter">Bs. {total.toFixed(2)}</div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-black text-primary">Ingreso en Efectivo</Label>
                                <Input
                                    type="number"
                                    className="h-16 text-4xl font-black text-center bg-white rounded-2xl shadow-inner border-none focus-visible:ring-primary"
                                    value={data.pagado}
                                    onChange={e => setData('pagado', parseFloat(e.target.value) || 0)}
                                />
                            </div>
                        </div>

                        {data.pagado >= total && (
                            <div className="py-4 px-6 bg-green-500/10 rounded-2xl border border-green-500/20 flex justify-between items-center animate-in slide-in-from-top-2">
                                <span className="text-green-600 font-black italic text-lg uppercase tracking-wider">Cambio para el cliente:</span>
                                <span className="text-3xl font-black text-green-600">Bs. {(data.pagado - total).toFixed(2)}</span>
                            </div>
                        )}

                        <div className="flex gap-4">
                            <Button type="button" variant="ghost" className="h-14 flex-1 rounded-2xl font-black" onClick={() => setIsCheckoutOpen(false)}>MOSTRAR DETALLES</Button>
                            <Button type="submit" disabled={processing || (data.pagado < total && data.tipo_pago === 'Efectivo')} className="h-16 flex-[2] rounded-2xl font-black text-xl shadow-2xl hover:scale-[1.02] transition-transform">
                                {processing ? 'GENERANDO TICKET...' : 'PROCESAR E IMPRIMIR'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

        </AppLayout>
    );
}
