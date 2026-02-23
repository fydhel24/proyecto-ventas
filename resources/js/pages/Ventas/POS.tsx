import React, { useState, useEffect, useMemo } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import {
    Search,
    Plus,
    Minus,
    Trash2,
    ShoppingCart,
    User,
    CreditCard,
    QrCode,
    Printer,
    X,
    CheckCircle2,
    AlertCircle,
    Pill,
    Activity,
    Info,
    Receipt,
    Landmark,
    FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from '@/components/ui/dialog';
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';
import axios from 'axios';
import { cn } from '@/lib/utils';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

interface Producto {
    id: number;
    nombre: string;
    principio_activo: string;
    concentracion: string;
    precio: number;
    stock: number;
    categoria: string;
    laboratorio: string;
    fotos?: { url: string }[];
}

interface CartItem extends Producto {
    cantidad: number;
    subtotal: number;
}

export default function POS({ clientes, categorias, sucursales, user_sucursal_id, is_admin, caja_abierta }: any) {
    const [query, setQuery] = useState('');
    const [selectedSucursal, setSelectedSucursal] = useState(user_sucursal_id?.toString() || '1');
    const [productos, setProductos] = useState<Producto[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [clienteNombre, setClienteNombre] = useState('Consumidor Final');
    const [clienteCI, setClienteCI] = useState('0');
    const [metodoPago, setMetodoPago] = useState('efectivo');
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [pagado, setPagado] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [activeCategory, setActiveCategory] = useState('0');
    const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

    // Unified Search Effect
    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get('/ventas/search-productos', {
                    params: {
                        query: query,
                        categoria_id: activeCategory !== '0' ? activeCategory : null,
                        sucursal_id: selectedSucursal
                    }
                });
                setProductos(response.data);
            } catch (error) {
                toast.error("Error al cargar productos");
            } finally {
                setIsLoading(false);
            }
        };

        const timeoutId = setTimeout(fetchProducts, query ? 300 : 0);
        return () => clearTimeout(timeoutId);
    }, [query, activeCategory, selectedSucursal]);

    const addToCart = (producto: Producto) => {
        if (producto.stock <= 0) {
            toast.error("Producto sin stock crítico");
            return;
        }

        setCart(prev => {
            const existing = prev.find(item => item.id === producto.id);
            if (existing) {
                if (existing.cantidad >= producto.stock) {
                    toast.error("Stock máximo de inventario alcanzado");
                    return prev;
                }
                return prev.map(item =>
                    item.id === producto.id
                        ? { ...item, cantidad: item.cantidad + 1, subtotal: (item.cantidad + 1) * item.precio }
                        : item
                );
            }
            return [...prev, { ...producto, cantidad: 1, subtotal: producto.precio }];
        });
        toast.success(`${producto.nombre} añadido al despacho`);
    };

    const updateQuantity = (id: number, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = Math.max(0, item.cantidad + delta);
                if (newQty > item.stock) {
                    toast.error("Excede el stock físico disponible");
                    return item;
                }
                return { ...item, cantidad: newQty, subtotal: newQty * item.precio };
            }
            return item;
        }).filter(item => item.cantidad > 0));
    };

    const removeFromCart = (id: number) => {
        setCart(prev => prev.filter(item => item.id !== id));
    };

    const total = useMemo(() => cart.reduce((acc, item) => acc + (Number(item.subtotal) || 0), 0), [cart]);
    const cambio = useMemo(() => Math.max(0, (Number(pagado) || 0) - total), [pagado, total]);

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        setIsLoading(true);

        try {
            const data = {
                cliente_nombre: clienteNombre,
                cliente_ci: clienteCI,
                sucursal_id: parseInt(selectedSucursal),
                tipo_pago: metodoPago,
                monto_total: Number(total),
                pagado: metodoPago === 'efectivo' ? Number(pagado) : Number(total),
                cambio: metodoPago === 'efectivo' ? Number(cambio) : 0,
                items: cart.map(item => ({
                    producto_id: item.id,
                    cantidad: item.cantidad,
                    precio_unitario: Number(item.precio),
                    subtotal: Number(item.subtotal)
                }))
            };

            const response = await axios.post('/ventas', data);

            if (response.data.success) {
                toast.success("Venta autorizada y procesada");
                setCart([]);
                setClienteNombre('Consumidor Final');
                setClienteCI('0');
                setIsCheckoutOpen(false);
                setPagado(0);

                // Open ticket PDF
                window.open(`/ventas/ticket/${response.data.venta_id}`, '_blank');
            }
        } catch (error: any) {
            console.error("Error 422 Detection:", error.response?.data);
            const messages = error.response?.data?.errors
                ? Object.values(error.response.data.errors).flat().join(", ")
                : error.response?.data?.error || "Error crítico del sistema de ventas";
            toast.error(messages);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AppLayout>
            <Head title="Punto de Venta Magistral - Nexus Farma" />

            <div className="flex flex-col lg:h-[calc(100vh-64px)] lg:overflow-hidden bg-[#f8fafc] dark:bg-[#020617] font-sans pb-0 lg:pb-0">
                <main className="flex flex-col lg:flex-row flex-1 overflow-y-auto lg:overflow-hidden p-4 lg:p-6 gap-6 relative">

                    {/* Left Section: Product Management */}
                    <div className="flex flex-col flex-1 gap-6 overflow-hidden">
                        <Card className="border-none shadow-sm dark:bg-slate-900/50 backdrop-blur-sm overflow-hidden flex-shrink-0 border-b border-primary/10">
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row gap-4 items-center">
                                    <div className="flex-shrink-0 flex items-center gap-3 pr-4 border-r border-slate-200 dark:border-slate-800">
                                        <div className="size-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                                            <Search className="size-5" />
                                        </div>
                                        <div className="flex flex-col">
                                            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Despacho</h2>
                                            {caja_abierta ? (
                                                <Badge variant="outline" className="text-[9px] border-emerald-500/30 text-emerald-600 bg-emerald-50/50 py-0 h-4">
                                                    Caja Abierta
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-[9px] border-amber-500/30 text-amber-600 bg-amber-50/50 py-0 h-4">
                                                    Admin Mode
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    <div className="relative flex-1 group">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors w-5 h-5" />
                                        <Input
                                            placeholder="Escriba nombre del principio activo o código de barras..."
                                            className="pl-12 h-14 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-primary rounded-2xl text-lg font-medium"
                                            value={query}
                                            onChange={(e) => setQuery(e.target.value)}
                                        />
                                    </div>
                                    <Select value={activeCategory} onValueChange={setActiveCategory}>
                                        <SelectTrigger className="h-12 w-full md:w-48 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl">
                                            <SelectValue placeholder="Categorías" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="0">Todas las Categorías</SelectItem>
                                            {categorias.map((c: any) => (
                                                <SelectItem key={c.id} value={c.id.toString()}>{c.nombre_cat}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    {is_admin && (
                                        <Select value={selectedSucursal} onValueChange={setSelectedSucursal}>
                                            <SelectTrigger className="h-12 w-full md:w-56 bg-primary/5 dark:bg-primary/20 border-primary/20 dark:border-primary/20 rounded-xl text-primary font-bold">
                                                <div className="flex items-center gap-2">
                                                    <Landmark className="size-4" />
                                                    <SelectValue placeholder="Sucursal" />
                                                </div>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {sucursales.map((s: any) => (
                                                    <SelectItem key={s.id} value={s.id.toString()}>{s.nombre_sucursal}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex-1 lg:overflow-y-auto pr-0 lg:pr-2 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6 pb-6">
                            {productos.map(p => (
                                <div
                                    key={p.id}
                                    className="group relative flex flex-col bg-white dark:bg-slate-900 rounded-[30px] shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer overflow-hidden border border-slate-100 dark:border-slate-800"
                                    onClick={() => addToCart(p)}
                                >
                                    <div className="aspect-[16/10] relative overflow-hidden bg-slate-50 dark:bg-slate-800/50">
                                        <img
                                            src={p.fotos && p.fotos.length > 0 ? `/storage/${p.fotos[0].url}` : `https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=600`}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                            alt={p.nombre}
                                        />
                                        <div className="absolute top-4 left-4">
                                            <Badge className="bg-white/90 dark:bg-slate-950/90 backdrop-blur-md text-emerald-600 dark:text-emerald-400 font-black text-lg px-4 py-1.5 rounded-2xl border-none shadow-xl">
                                                {p.precio} <span className="text-[10px] ml-1">BOB</span>
                                            </Badge>
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/20 to-transparent" />
                                    </div>

                                    <CardContent className="p-6 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest text-primary border-primary/20 bg-primary/5">
                                                {p.laboratorio}
                                            </Badge>
                                            <div className={cn(
                                                "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                                p.stock <= 5 ? "bg-rose-500/10 text-rose-500" : "bg-primary/10 text-primary"
                                            )}>
                                                <Activity className="size-3" />
                                                Stock: {p.stock}
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-slate-800 dark:text-white leading-tight line-clamp-1">{p.nombre}</h3>
                                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 italic">{p.principio_activo} • {p.concentracion}</p>
                                        </div>
                                    </CardContent>

                                    <div className="absolute bottom-4 right-4 translate-y-20 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                                        <Button size="icon" className="size-12 rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/30">
                                            <Plus className="size-6" />
                                        </Button>
                                    </div>
                                </div>
                            ))}

                            {productos.length === 0 && query.length > 2 && (
                                <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400 bg-white/50 dark:bg-slate-900/20 rounded-[40px] border-2 border-dashed border-slate-200 dark:border-slate-800">
                                    <div className="size-20 bg-slate-100 dark:bg-slate-900 rounded-3xl flex items-center justify-center mb-6 opacity-20">
                                        <Search className="size-10" />
                                    </div>
                                    <p className="text-lg font-bold">Medicamento no registrado en el sistema</p>
                                    <p className="text-sm">Verifique la ortografía o intente con una categoría diferente.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Section: Digital Checkout (Desktop Sidebar) */}
                    <div className="hidden lg:flex w-[480px] flex-col gap-6">
                        <Card className="flex-1 border-none shadow-2xl dark:bg-slate-900/80 backdrop-blur-xl flex flex-col overflow-hidden rounded-[40px] border border-white dark:border-slate-800">
                            <CardHeader className="p-6 lg:p-8 border-b border-slate-100 dark:border-slate-800">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 lg:gap-4">
                                        <div className="size-10 lg:size-14 bg-primary rounded-xl lg:rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/20">
                                            <ShoppingCart className="size-6 lg:size-8" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl lg:text-2xl font-black tracking-tighter">Mi Despacho</CardTitle>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{cart.length} productos</p>
                                        </div>
                                    </div>
                                    {cart.length > 0 && (
                                        <Button variant="ghost" size="icon" className="rounded-2xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10" onClick={() => setCart([])}>
                                            <Trash2 className="size-5" />
                                        </Button>
                                    )}
                                </div>
                            </CardHeader>

                            <CardContent className="flex-1 overflow-y-auto p-0">
                                {cart.map(item => (
                                    <div key={item.id} className="p-6 border-b border-slate-50 dark:border-slate-800/50 flex items-center gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 group transition-all">
                                        <div className="size-14 bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden shadow-inner">
                                            <img
                                                src={item.fotos && item.fotos.length > 0 ? `/storage/${item.fotos[0].url}` : `https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=100`}
                                                className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                                                alt={item.nombre}
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-lg font-black text-slate-800 dark:text-white leading-none truncate">{item.nombre}</h4>
                                            <p className="text-xs font-bold text-primary uppercase tracking-tighter mt-1">{item.precio} BOB x ud.</p>
                                        </div>
                                        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-white dark:hover:bg-slate-900 shadow-sm" onClick={() => updateQuantity(item.id, -1)}>
                                                <Minus className="size-3" />
                                            </Button>
                                            <span className="w-8 text-center text-sm font-black text-slate-900 dark:text-white">{item.cantidad}</span>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-white dark:hover:bg-slate-900 shadow-sm" onClick={() => updateQuantity(item.id, 1)}>
                                                <Plus className="size-3" />
                                            </Button>
                                        </div>
                                        <div className="w-24 text-right">
                                            <span className="text-lg font-black text-slate-900 dark:text-white leading-none">
                                                {(Number(item.subtotal) || 0).toFixed(2)}
                                            </span>
                                            <p className="text-[10px] font-bold text-slate-400">BOB</p>
                                        </div>
                                    </div>
                                ))}

                                {cart.length === 0 && (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-300 gap-6 p-12 text-center">
                                        <div className="size-24 bg-slate-50 dark:bg-slate-800 rounded-[40px] flex items-center justify-center opacity-40 animate-pulse">
                                            <Pill className="size-12" />
                                        </div>
                                        <div>
                                            <p className="text-xl font-black text-slate-400">Despacho Vacío</p>
                                            <p className="text-sm font-medium mt-1">Inicie la sesión de venta escaneando o buscando productos en el catálogo central.</p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>

                            <CardFooter className="p-6 lg:p-8 bg-slate-50/50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-4 lg:gap-6">
                                <div className="w-full space-y-3 lg:space-y-4">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="font-bold text-slate-500 uppercase tracking-[0.1em]">Total</span>
                                        <span className="font-black text-slate-600 dark:text-slate-400">
                                            {(Number(total) || 0).toFixed(2)} BOB
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 lg:p-6 rounded-[20px] lg:rounded-[30px] border border-primary/20 shadow-xl shadow-primary/5">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-primary uppercase tracking-widest">Total Autorizado</span>
                                            <div className="flex items-baseline gap-1 lg:gap-2">
                                                <span className="text-3xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
                                                    {(Number(total) || 0).toFixed(2)}
                                                </span>
                                                <span className="text-sm lg:text-lg font-bold text-slate-400">BOB</span>
                                            </div>
                                        </div>
                                        <div className="size-10 lg:size-14 bg-primary/10 rounded-xl lg:rounded-2xl flex items-center justify-center text-primary border border-primary/20">
                                            <Receipt className="size-6 lg:size-8" />
                                        </div>
                                    </div>
                                </div>
                                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-slate-950 border-t lg:relative lg:p-0 lg:bg-transparent lg:border-none z-50">
                                    <Button
                                        className="w-full h-16 lg:h-20 bg-primary hover:bg-primary/90 text-white text-lg lg:text-xl font-black rounded-xl lg:rounded-[25px] shadow-2xl shadow-primary/30 group transition-all"
                                        disabled={cart.length === 0}
                                        onClick={() => setIsCheckoutOpen(true)}
                                    >
                                        PROCESAR TRANSACCIÓN
                                        <Activity className="size-5 lg:size-6 ml-2 lg:ml-3 group-hover:animate-pulse" />
                                    </Button>
                                </div>
                                <p className="hidden lg:block text-[10px] text-center font-bold text-slate-400 uppercase tracking-widest">Nexus Farma POS v2.0 • Terminal Certificada</p>
                            </CardFooter>
                        </Card>
                    </div>

                    {/* Mobile Floating Cart Button */}
                    <div className="lg:hidden fixed bottom-6 right-6 z-50">
                        <Sheet open={isMobileCartOpen} onOpenChange={setIsMobileCartOpen}>
                            <SheetTrigger asChild>
                                <Button size="lg" className="h-16 px-6 rounded-2xl bg-primary shadow-2xl shadow-primary/40 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="relative">
                                        <ShoppingCart className="size-6 text-white" />
                                        {cart.length > 0 && (
                                            <span className="absolute -top-2 -right-2 size-5 bg-rose-500 text-[10px] font-black rounded-full flex items-center justify-center text-white border-2 border-primary">
                                                {cart.length}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex flex-col items-start pr-2">
                                        <span className="text-[10px] font-black uppercase text-white/70 leading-none">Mi Despacho</span>
                                        <span className="text-xl font-black text-white leading-tight">{(Number(total) || 0).toFixed(2)} <span className="text-xs">BOB</span></span>
                                    </div>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-full sm:max-w-md p-0 bg-slate-50 dark:bg-slate-950 border-none flex flex-col">
                                <SheetHeader className="p-6 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-4">
                                        <div className="size-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                            <ShoppingCart className="size-6" />
                                        </div>
                                        <div>
                                            <SheetTitle className="text-xl font-black tracking-tighter text-slate-900 dark:text-white">Mi Despacho</SheetTitle>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{cart.length} productos seleccionados</p>
                                        </div>
                                    </div>
                                </SheetHeader>

                                <div className="flex-1 overflow-y-auto">
                                    {cart.map(item => (
                                        <div key={item.id} className="p-4 border-b border-slate-100 dark:border-slate-800/50 flex items-center gap-3 bg-white dark:bg-slate-900/50">
                                            <div className="size-12 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden shadow-inner flex-shrink-0">
                                                <img
                                                    src={item.fotos && item.fotos.length > 0 ? `/storage/${item.fotos[0].url}` : `https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=100`}
                                                    className="w-full h-full object-cover"
                                                    alt={item.nombre}
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-bold text-slate-800 dark:text-white truncate">{item.nombre}</h4>
                                                <p className="text-[10px] font-bold text-primary uppercase">{item.precio} BOB x ud.</p>
                                            </div>
                                            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, -1)}>
                                                    <Minus className="size-2.5" />
                                                </Button>
                                                <span className="w-6 text-center text-xs font-black">{item.cantidad}</span>
                                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, 1)}>
                                                    <Plus className="size-2.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}

                                    {cart.length === 0 && (
                                        <div className="flex flex-col items-center justify-center h-full text-slate-300 gap-4 p-12 text-center">
                                            <Pill className="size-12 opacity-20" />
                                            <p className="text-sm font-bold text-slate-400 uppercase">Sin productos</p>
                                        </div>
                                    )}
                                </div>

                                <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 space-y-4">
                                    <div className="flex justify-between items-center bg-primary/5 p-4 rounded-2xl border border-primary/20">
                                        <span className="text-xs font-black text-primary uppercase tracking-widest">Total Autorizado</span>
                                        <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">
                                            {(Number(total) || 0).toFixed(2)} <span className="text-xs font-bold text-slate-400 uppercase">BOB</span>
                                        </span>
                                    </div>
                                    <Button
                                        className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-black rounded-xl shadow-xl shadow-primary/20"
                                        disabled={cart.length === 0}
                                        onClick={() => {
                                            setIsMobileCartOpen(false);
                                            setTimeout(() => setIsCheckoutOpen(true), 300);
                                        }}
                                    >
                                        PROCESAR TRANSACCIÓN
                                        <Activity className="size-4 ml-2" />
                                    </Button>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </main>
            </div>

            {/* Checkout Dialog Premium */}
            <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
                <DialogContent className="sm:max-w-[600px] rounded-[40px] dark:bg-slate-950 border-slate-100 dark:border-slate-900 p-0 overflow-hidden shadow-3xl">
                    <DialogHeader className="sr-only">
                        <DialogTitle>Finalización de Venta</DialogTitle>
                        <DialogDescription>Gestione el método de pago y los detalles del cliente para autorizar el despacho.</DialogDescription>
                    </DialogHeader>
                    <div className="bg-primary p-6 md:p-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 size-32 md:size-40 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                        <div className="relative z-10 flex items-center gap-4 md:gap-6">
                            <div className="size-14 md:size-20 bg-white/20 backdrop-blur-xl rounded-2xl md:rounded-[30px] flex items-center justify-center border border-white/20 flex-shrink-0">
                                <CreditCard className="size-8 md:size-10" />
                            </div>
                            <div>
                                <h3 className="text-xl md:text-3xl font-black tracking-tighter">Finalizar Venta</h3>
                                <p className="font-bold text-primary-foreground/80 uppercase text-[9px] md:text-xs tracking-widest">Procedimiento de liquidación</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 md:p-10 space-y-6 md:space-y-8 max-h-[70vh] md:max-h-none overflow-y-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                        <User className="size-3" />
                                        Nombre del Cliente
                                    </label>
                                    <Input
                                        placeholder="Ej. Juan Perez"
                                        className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 font-bold"
                                        value={clienteNombre}
                                        onChange={(e) => setClienteNombre(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                        <FileText className="size-3" />
                                        NIT / CI
                                    </label>
                                    <Input
                                        placeholder="Ej. 1234567"
                                        className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 font-bold"
                                        value={clienteCI}
                                        onChange={(e) => setClienteCI(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                    <CreditCard className="size-3" />
                                    Forma de Pago
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "h-14 rounded-2xl flex-col gap-1 font-black transition-all",
                                            metodoPago === 'efectivo' ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800"
                                        )}
                                        onClick={() => setMetodoPago('efectivo')}
                                    >
                                        <Plus className="size-4" />
                                        EFECTIVO
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "h-14 rounded-2xl flex-col gap-1 font-black transition-all",
                                            metodoPago === 'qr' ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800"
                                        )}
                                        onClick={() => setMetodoPago('qr')}
                                    >
                                        <QrCode className="size-4" />
                                        PAGO QR
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 md:p-8 bg-slate-50 dark:bg-slate-900 rounded-3xl md:rounded-[35px] border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <div className="size-12 md:size-14 bg-white dark:bg-slate-800 rounded-xl md:rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0">
                                    <Info className="size-6 md:size-8 text-primary" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Importe Total</p>
                                    <p className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white leading-none tracking-tighter">
                                        {(Number(total) || 0).toFixed(2)} BOB
                                    </p>
                                </div>
                            </div>
                            <div className="hidden md:block w-px h-12 bg-slate-200 dark:bg-slate-800" />
                            <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-200 dark:border-slate-800">
                                <Badge className="bg-primary text-white border-none font-bold">AUDITADO</Badge>
                                <p className="text-[10px] font-bold text-slate-400 md:mt-1">ID: {Math.floor(Math.random() * 10000)}</p>
                            </div>
                        </div>

                        {metodoPago === 'efectivo' && (
                            <div className="space-y-4 md:space-y-6">
                                <div className="grid gap-3 p-6 md:p-8 rounded-3xl md:rounded-[35px] bg-primary/5 border-2 border-primary/10">
                                    <label className="text-xs md:text-sm font-black text-primary uppercase tracking-widest">Monto Recibido</label>
                                    <div className="relative group">
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-xl md:text-2xl font-black text-slate-300 group-focus-within:text-primary">BOB</div>
                                        <Input
                                            type="number"
                                            placeholder="00.00"
                                            className="h-16 md:h-20 text-3xl md:text-5xl font-black pl-20 md:pl-24 bg-white dark:bg-slate-900 border-primary/20 focus-visible:ring-primary rounded-2xl md:rounded-3xl tracking-tighter"
                                            value={pagado || ''}
                                            onChange={(e) => setPagado(parseFloat(e.target.value) || 0)}
                                        />
                                    </div>
                                    <div className="flex justify-between items-center mt-2 md:mt-4 pt-4 border-t border-primary/10">
                                        <span className="text-[10px] md:text-sm font-black text-slate-400 uppercase tracking-widest">Cambio:</span>
                                        <span className={cn(
                                            "text-2xl md:text-4xl font-black tracking-tighter",
                                            cambio > 0 ? "text-primary" : "text-slate-300"
                                        )}>
                                            {(Number(cambio) || 0).toFixed(2)} <span className="text-lg">BOB</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-3 pt-4">
                            <Button
                                variant="ghost"
                                className="h-12 md:h-16 rounded-xl md:rounded-2xl font-black text-slate-400 w-full sm:flex-1 hover:bg-slate-100 dark:hover:bg-slate-900 order-2 sm:order-1"
                                onClick={() => setIsCheckoutOpen(false)}
                            >
                                CANCELAR
                            </Button>
                            <Button
                                className="h-14 md:h-16 rounded-xl md:rounded-2xl bg-primary hover:bg-primary/90 text-white font-black w-full sm:flex-[2] shadow-xl md:shadow-2xl shadow-primary/30 order-1 sm:order-2"
                                onClick={handleCheckout}
                                disabled={isLoading || (metodoPago === 'efectivo' && pagado < total)}
                            >
                                {isLoading ? (
                                    <Activity className="size-5 md:size-6 animate-spin" />
                                ) : (
                                    <>
                                        CONFIRMAR VENTA
                                        <Printer className="size-5 md:size-6 ml-3" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
