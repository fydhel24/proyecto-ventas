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
    AlertCircle
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

interface Producto {
    id: number;
    nombre: string;
    principio_activo: string;
    concentracion: string;
    precio: number;
    stock: number;
    categoria: string;
    laboratorio: string;
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

    // Debounced Search
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (query.length > 2 || activeCategory !== '0') {
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
            toast.error("Producto sin stock");
            return;
        }

        setCart(prev => {
            const existing = prev.find(item => item.id === producto.id);
            if (existing) {
                if (existing.cantidad >= producto.stock) {
                    toast.error("No hay más stock disponible");
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
        toast.success(`${producto.nombre} añadido`);
    };

    const updateQuantity = (id: number, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = Math.max(0, item.cantidad + delta);
                if (newQty > item.stock) {
                    toast.error("Stock máximo alcanzado");
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
                toast.success("Venta completada con éxito");
                setCart([]);
                setIsCheckoutOpen(false);
                setPagado(0);

                // Open ticket PDF
                window.open(`/ventas/ticket/${response.data.venta_id}`, '_blank');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Error al procesar la venta");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AppLayout>
            <Head title="Punto de Venta - Nexus Farma" />

            <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-slate-50">
                <div className="flex flex-1 overflow-hidden p-4 gap-4">

                    {/* Seccion Izquierda: Productos */}
                    <div className="flex flex-col flex-1 gap-4 overflow-hidden">
                        <Card className="border-none shadow-sm overflow-hidden flex-shrink-0">
                            <CardContent className="p-4">
                                <div className="flex gap-4">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                        <Input
                                            placeholder="Buscar por nombre, principio activo o barras..."
                                            className="pl-10 h-11 bg-white"
                                            value={query}
                                            onChange={(e) => setQuery(e.target.value)}
                                        />
                                    </div>
                                    <Select value={activeCategory} onValueChange={setActiveCategory}>
                                        <SelectTrigger className="w-[180px] h-11 bg-white">
                                            <SelectValue placeholder="Categoría" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="0">Todas las categorías</SelectItem>
                                            {categorias.map((cat: any) => (
                                                <SelectItem key={cat.id} value={cat.id.toString()}>{cat.nombre_cat}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {productos.map(p => (
                                <Card key={p.id} className="group border-none shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden border-b-4 border-b-transparent hover:border-b-[#16A34A]" onClick={() => addToCart(p)}>
                                    <CardContent className="p-4">
                                        <div className="flex flex-col h-full">
                                            <div className="flex justify-between items-start mb-2">
                                                <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-medium">
                                                    {p.laboratorio}
                                                </Badge>
                                                <span className="text-xl font-bold text-[#16A34A]">{p.precio} BOB</span>
                                            </div>
                                            <h3 className="font-bold text-slate-800 line-clamp-1">{p.nombre}</h3>
                                            <p className="text-xs text-slate-500 mb-2 truncate">{p.principio_activo} - {p.concentracion}</p>
                                            <div className="mt-auto flex justify-between items-center text-xs">
                                                <span className={`font-semibold ${p.stock <= 5 ? 'text-red-500' : 'text-slate-500'}`}>
                                                    Stock: {p.stock} uds.
                                                </span>
                                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full group-hover:bg-[#16A34A] group-hover:text-white transition-colors">
                                                    <Plus className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            {productos.length === 0 && query.length > 2 && (
                                <div className="col-span-full flex flex-col items-center justify-center py-12 text-slate-400">
                                    <Search className="w-12 h-12 mb-4 opacity-20" />
                                    <p>No se encontraron productos que coincidan.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Seccion Derecha: Carrito */}
                    <div className="w-[400px] flex flex-col gap-4">
                        <Card className="flex-1 border-none shadow-sm flex flex-col overflow-hidden">
                            <CardHeader className="bg-white border-b py-4">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <ShoppingCart className="w-5 h-5 text-[#16A34A]" />
                                        Carrito
                                    </CardTitle>
                                    <Badge variant="outline" className="rounded-full">
                                        {cart.length} items
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-y-auto p-0">
                                {cart.map(item => (
                                    <div key={item.id} className="p-4 border-b flex items-center gap-3 hover:bg-slate-50/50">
                                        <div className="flex-1">
                                            <h4 className="text-sm font-bold text-slate-800 leading-tight">{item.nombre}</h4>
                                            <p className="text-xs text-slate-500">{item.precio} BOB x ud.</p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Button variant="outline" size="icon" className="h-7 w-7 rounded-sm" onClick={() => updateQuantity(item.id, -1)}>
                                                <Minus className="w-3 h-3" />
                                            </Button>
                                            <span className="w-8 text-center text-sm font-bold">{item.cantidad}</span>
                                            <Button variant="outline" size="icon" className="h-7 w-7 rounded-sm" onClick={() => updateQuantity(item.id, 1)}>
                                                <Plus className="w-3 h-3" />
                                            </Button>
                                        </div>
                                        <div className="w-20 text-right">
                                            <span className="text-sm font-bold">{item.subtotal.toFixed(2)}</span>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-red-500" onClick={() => removeFromCart(item.id)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                                {cart.length === 0 && (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-300 gap-2 p-8 text-center">
                                        <ShoppingCart className="w-12 h-12 opacity-10" />
                                        <p className="text-sm">El carrito está vacío.<br />Selecciona productos para comenzar.</p>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="bg-slate-50 p-4 flex flex-col gap-3">
                                <div className="w-full space-y-2">
                                    <div className="flex justify-between text-sm text-slate-500">
                                        <span>Subtotal</span>
                                        <span>{total.toFixed(2)} BOB</span>
                                    </div>
                                    <div className="flex justify-between text-xl font-bold text-slate-900 border-t pt-2">
                                        <span>Total</span>
                                        <span>{total.toFixed(2)} BOB</span>
                                    </div>
                                </div>
                                <Button
                                    className="w-full h-12 bg-[#16A34A] hover:bg-[#15803d] text-lg font-bold shadow-lg shadow-green-200"
                                    disabled={cart.length === 0}
                                    onClick={() => setIsCheckoutOpen(true)}
                                >
                                    Cobrar Ahora
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Checkout Dialog */}
            <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
                <DialogContent className="sm:max-w-[500px] font-outfit">
                    <DialogHeader>
                        <DialogTitle className="text-2xl">Finalizar Venta</DialogTitle>
                        <DialogDescription>Completa la información de pago para generar el ticket.</DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 py-4">
                        <div className="space-y-4">
                            <div className="grid gap-2">
                                <label className="text-sm font-bold flex items-center gap-2">
                                    <User className="w-4 h-4 text-slate-400" />
                                    Cliente
                                </label>
                                <Select value={clienteId} onValueChange={setClienteId}>
                                    <SelectTrigger className="h-11">
                                        <SelectValue placeholder="Seleccionar cliente" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {clientes.map((c: any) => (
                                            <SelectItem key={c.id} value={c.id.toString()}>{c.nombre} ({c.nit_ci})</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <label className="text-sm font-bold flex items-center gap-2">
                                    <CreditCard className="w-4 h-4 text-slate-400" />
                                    Método de Pago
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <Button
                                        variant={metodoPago === 'efectivo' ? 'default' : 'outline'}
                                        className={`h-14 flex-col gap-1 ${metodoPago === 'efectivo' ? 'bg-[#16A34A] border-[#16A34A] shadow-md shadow-green-100' : ''}`}
                                        onClick={() => setMetodoPago('efectivo')}
                                    >
                                        <Plus className="w-4 h-4" />
                                        Efectivo
                                    </Button>
                                    <Button
                                        variant={metodoPago === 'qr' ? 'default' : 'outline'}
                                        className={`h-14 flex-col gap-1 ${metodoPago === 'qr' ? 'bg-[#16A34A] border-[#16A34A] shadow-md shadow-green-100' : ''}`}
                                        onClick={() => setMetodoPago('qr')}
                                    >
                                        <QrCode className="w-4 h-4" />
                                        Pago QR
                                    </Button>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-6 rounded-2xl flex flex-col items-center justify-center gap-2">
                                <span className="text-slate-500 text-sm font-medium uppercase tracking-wider">Total a Cobrar</span>
                                <span className="text-4xl font-black text-slate-900">{total.toFixed(2)} <span className="text-lg font-bold text-slate-400">BOB</span></span>
                            </div>

                            {metodoPago === 'efectivo' && (
                                <div className="grid gap-4 bg-green-50/50 p-4 rounded-xl border border-green-100">
                                    <div className="grid gap-2">
                                        <label className="text-sm font-bold">Monto Recibido</label>
                                        <div className="relative">
                                            <Input
                                                type="number"
                                                placeholder="0.00"
                                                className="h-12 text-xl font-bold pl-12"
                                                value={pagado || ''}
                                                onChange={(e) => setPagado(parseFloat(e.target.value) || 0)}
                                            />
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">Bs.</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-bold text-slate-500">Cambio a devolver:</span>
                                        <span className={`text-xl font-black ${cambio > 0 ? 'text-[#16A34A]' : 'text-slate-400'}`}>
                                            {cambio.toFixed(2)} BOB
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" className="h-12 px-6" onClick={() => setIsCheckoutOpen(false)}>Cancelar</Button>
                        <Button
                            className="h-12 px-8 bg-[#16A34A] hover:bg-[#15803d] font-bold"
                            onClick={handleCheckout}
                            disabled={isLoading || (metodoPago === 'efectivo' && pagado < total)}
                        >
                            {isLoading ? "Procesando..." : "Confirmar y Descargar Ticket"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
