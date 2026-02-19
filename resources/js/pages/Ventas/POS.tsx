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
    Receipt
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

export default function POS({ clientes, categorias }: any) {
    const [query, setQuery] = useState('');
    const [productos, setProductos] = useState<Producto[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [clienteId, setClienteId] = useState(clientes[0]?.id.toString() || '');
    const [metodoPago, setMetodoPago] = useState('efectivo');
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [pagado, setPagado] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [activeCategory, setActiveCategory] = useState('0');

    // Initial & Debounced Search
    useEffect(() => {
        // Carga inicial de productos (últimos 10)
        if (query.length === 0 && activeCategory === '0') {
            searchProducts();
        }

        const delayDebounceFn = setTimeout(() => {
            if (query.length > 2 || (activeCategory !== '0' && query.length === 0)) {
                searchProducts();
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [query, activeCategory]);

    const searchProducts = async () => {
        try {
            const response = await axios.get('/api/ventas/buscar-productos', {
                params: {
                    query,
                    categoria_id: activeCategory !== '0' ? activeCategory : null
                }
            });
            setProductos(response.data);
        } catch (error) {
            console.error("Error buscando productos", error);
        }
    };

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

    const total = useMemo(() => cart.reduce((acc, item) => acc + item.subtotal, 0), [cart]);
    const cambio = useMemo(() => Math.max(0, pagado - total), [pagado, total]);

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        setIsLoading(true);

        try {
            const response = await axios.post('/ventas', {
                cliente_id: parseInt(clienteId),
                tipo_pago: metodoPago,
                monto_total: total,
                pagado: pagado || total,
                cambio: cambio,
                items: cart.map(item => ({
                    producto_id: item.id,
                    cantidad: item.cantidad,
                    precio_unitario: item.precio
                }))
            });

            if (response.data.success) {
                toast.success("Venta autorizada y procesada");
                setCart([]);
                setIsCheckoutOpen(false);
                setPagado(0);

                // Open ticket PDF
                window.open(`/ventas/ticket/${response.data.venta_id}`, '_blank');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Error crítico del sistema de ventas");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AppLayout>
            <Head title="Punto de Venta Magistral - Nexus Farma" />

            <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-[#f8fafc] dark:bg-[#020617] font-sans">
                <main className="flex flex-1 overflow-hidden p-6 gap-6">

                    {/* Left Section: Product Management */}
                    <div className="flex flex-col flex-1 gap-6 overflow-hidden">
                        <Card className="border-none shadow-sm dark:bg-slate-900/50 backdrop-blur-sm overflow-hidden flex-shrink-0 border-b border-emerald-500/10">
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row gap-4 items-center">
                                    <div className="flex-shrink-0 flex items-center gap-3 pr-4 border-r border-slate-200 dark:border-slate-800">
                                        <div className="size-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                                            <Search className="size-5" />
                                        </div>
                                        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Despacho</h2>
                                    </div>
                                    <div className="relative flex-1 group">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors w-5 h-5" />
                                        <Input
                                            placeholder="Escriba nombre del principio activo o código de barras..."
                                            className="pl-12 h-14 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-emerald-500 rounded-2xl text-lg font-medium"
                                            value={query}
                                            onChange={(e) => setQuery(e.target.value)}
                                        />
                                    </div>
                                    <Select value={activeCategory} onValueChange={setActiveCategory}>
                                        <SelectTrigger className="w-[240px] h-14 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-2xl font-bold">
                                            <SelectValue placeholder="Todas las Líneas" />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-[400px]">
                                            <SelectItem value="0" className="font-bold">Todas las Líneas Médicas</SelectItem>
                                            {categorias.map((cat: any) => (
                                                <SelectItem key={cat.id} value={cat.id.toString()}>{cat.nombre_cat}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 pb-6">
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
                                            <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest text-emerald-500 border-emerald-500/20 bg-emerald-500/5">
                                                {p.laboratorio}
                                            </Badge>
                                            <div className={cn(
                                                "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                                p.stock <= 5 ? "bg-rose-500/10 text-rose-500" : "bg-emerald-500/10 text-emerald-500"
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
                                        <Button size="icon" className="size-12 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl shadow-emerald-500/50">
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

                    {/* Right Section: Digital Checkout */}
                    <div className="w-[480px] flex flex-col gap-6">
                        <Card className="flex-1 border-none shadow-2xl dark:bg-slate-900/80 backdrop-blur-xl flex flex-col overflow-hidden rounded-[40px] border border-white dark:border-slate-800">
                            <CardHeader className="p-8 border-b border-slate-100 dark:border-slate-800">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="size-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
                                            <ShoppingCart className="size-8" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-2xl font-black tracking-tighter">Mi Despacho</CardTitle>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{cart.length} productos seleccionados</p>
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
                                            <p className="text-xs font-bold text-emerald-500 uppercase tracking-tighter mt-1">{item.precio} BOB x ud.</p>
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
                                                {typeof item.subtotal === 'number' ? item.subtotal.toFixed(2) : Number(item.subtotal).toFixed(2)}
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

                            <CardFooter className="p-8 bg-slate-50/50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-6">
                                <div className="w-full space-y-4">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="font-bold text-slate-500 uppercase tracking-[0.1em]">Resumen de Venta</span>
                                        <span className="font-black text-slate-600 dark:text-slate-400">
                                            {typeof total === 'number' ? total.toFixed(2) : Number(total).toFixed(2)} BOB
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-[30px] border border-emerald-500/10 shadow-xl shadow-emerald-500/5">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black text-emerald-500 uppercase tracking-widest">Total Autorizado</span>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
                                                    {typeof total === 'number' ? total.toFixed(2) : Number(total).toFixed(2)}
                                                </span>
                                                <span className="text-lg font-bold text-slate-400">BOB</span>
                                            </div>
                                        </div>
                                        <div className="size-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                                            <Receipt className="size-8" />
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    className="w-full h-20 bg-emerald-600 hover:bg-emerald-700 text-white text-xl font-black rounded-[25px] shadow-2xl shadow-emerald-600/30 group transition-all"
                                    disabled={cart.length === 0}
                                    onClick={() => setIsCheckoutOpen(true)}
                                >
                                    PROCESAR TRANSACCIÓN
                                    <Activity className="size-6 ml-3 group-hover:animate-pulse" />
                                </Button>
                                <p className="text-[10px] text-center font-bold text-slate-400 uppercase tracking-widest">Nexus Farma POS v2.0 • Terminal Certificada</p>
                            </CardFooter>
                        </Card>
                    </div>
                </main>
            </div>

            {/* Checkout Dialog Premium */}
            <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
                <DialogContent className="sm:max-w-[600px] rounded-[40px] dark:bg-slate-950 border-slate-100 dark:border-slate-900 p-0 overflow-hidden shadow-3xl">
                    <div className="bg-emerald-600 p-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 size-40 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                        <div className="relative z-10 flex items-center gap-6">
                            <div className="size-20 bg-white/20 backdrop-blur-xl rounded-[30px] flex items-center justify-center border border-white/20">
                                <CreditCard className="size-10" />
                            </div>
                            <div>
                                <h3 className="text-3xl font-black tracking-tighter">Finalizar Venta</h3>
                                <p className="font-bold text-emerald-100 uppercase text-xs tracking-widest">Procedimiento de liquidación de despacho</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-10 space-y-8">
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                    <User className="size-3" />
                                    Información del Cliente
                                </label>
                                <Select value={clienteId} onValueChange={setClienteId}>
                                    <SelectTrigger className="h-14 rounded-2xl border-slate-200 dark:border-slate-800 font-bold bg-slate-50 dark:bg-slate-900/50">
                                        <SelectValue placeholder="Seleccionar cliente" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {clientes.map((c: any) => (
                                            <SelectItem key={c.id} value={c.id.toString()}>{c.nombre} <span className="text-xs opacity-40 ml-2">ID: {c.nit_ci}</span></SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
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
                                            metodoPago === 'efectivo' ? "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-500/20" : "bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800"
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
                                            metodoPago === 'qr' ? "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-500/20" : "bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800"
                                        )}
                                        onClick={() => setMetodoPago('qr')}
                                    >
                                        <QrCode className="size-4" />
                                        PAGO QR
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-slate-50 dark:bg-slate-900 rounded-[35px] border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="size-14 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-sm">
                                    <Info className="size-8 text-emerald-500" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Importe Total</p>
                                    <p className="text-4xl font-black text-slate-900 dark:text-white leading-none tracking-tighter">
                                        {typeof total === 'number' ? total.toFixed(2) : Number(total).toFixed(2)} BOB
                                    </p>
                                </div>
                            </div>
                            <div className="w-px h-12 bg-slate-200 dark:bg-slate-800" />
                            <div className="flex flex-col items-end">
                                <Badge className="bg-emerald-500 text-white border-none font-bold mb-1">AUDITADO</Badge>
                                <p className="text-[10px] font-bold text-slate-400">Terminal ID: {Math.floor(Math.random() * 10000)}</p>
                            </div>
                        </div>

                        {metodoPago === 'efectivo' && (
                            <div className="space-y-6">
                                <div className="grid gap-3 p-8 rounded-[35px] bg-emerald-500/5 border-2 border-emerald-500/10">
                                    <label className="text-sm font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Ingresar Monto Recibido</label>
                                    <div className="relative group">
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300 group-focus-within:text-emerald-500">BOB</div>
                                        <Input
                                            type="number"
                                            placeholder="00.00"
                                            className="h-20 text-5xl font-black pl-24 bg-white dark:bg-slate-900 border-emerald-500/20 focus-visible:ring-emerald-500 rounded-3xl tracking-tighter"
                                            value={pagado || ''}
                                            onChange={(e) => setPagado(parseFloat(e.target.value) || 0)}
                                        />
                                    </div>
                                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-emerald-500/10">
                                        <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Cambio a Entregar:</span>
                                        <span className={cn(
                                            "text-4xl font-black tracking-tighter",
                                            cambio > 0 ? "text-emerald-600" : "text-slate-300"
                                        )}>
                                            {typeof cambio === 'number' ? cambio.toFixed(2) : Number(cambio).toFixed(2)} <span className="text-xl">BOB</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-4">
                            <Button variant="ghost" className="h-16 rounded-2xl font-black text-slate-400 flex-1 hover:bg-slate-100 dark:hover:bg-slate-900" onClick={() => setIsCheckoutOpen(false)}>
                                CANCELAR
                            </Button>
                            <Button
                                className="h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black flex-[2] shadow-2xl shadow-emerald-600/30"
                                onClick={handleCheckout}
                                disabled={isLoading || (metodoPago === 'efectivo' && pagado < total)}
                            >
                                {isLoading ? (
                                    <Activity className="size-6 animate-spin" />
                                ) : (
                                    <>
                                        CONFIRMAR TRANSACCIÓN
                                        <Printer className="size-6 ml-3" />
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
