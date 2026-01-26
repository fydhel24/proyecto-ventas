import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { searchProductos, store, show } from '@/routes/ventas';
import axios from 'axios';
import { Boxes, Eraser, Minus, Plus, Search, ShoppingCart, Trash2, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface VentaForm {
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
    categoria?: { nombre: string };
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
    sucursal: Sucursal;
    categorias: Category[];
}

export default function POS({ sucursal, categorias }: Props) {
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [items, setItems] = useState<Inventory[]>([]);
    const [pagination, setPagination] = useState<PaginationData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        cliente: 'CLIENTE GENERAL',
        ci: '',
        tipo_pago: 'Efectivo',
        carrito: [] as any[],
        monto_total: 0,
        pagado: 0,
        cambio: 0,
    } as VentaForm);

    useEffect(() => {
        fetchProducts(1);
    }, [selectedCategory]);

    useEffect(() => {
        const delaySearch = setTimeout(() => {
            fetchProducts(1);
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
        toast.success(`${inventory.producto.nombre} agregado`);
    };

    const updateQuantity = (id: number, delta: number) => {
        setCart(cart.map(item => {
            if (item.inventario_id === id) {
                const newQty = Math.min(Math.max(1, item.cantidad + delta), item.stock_max);
                if (newQty === item.stock_max && delta > 0) toast.warning('Límite de stock alcanzado');
                return { ...item, cantidad: newQty };
            }
            return item;
        }));
    };

    const removeItem = (id: number) => {
        setCart(cart.filter(i => i.inventario_id !== id));
    };

    const total = cart.reduce((acc, item) => acc + (item.cantidad * item.precio_seleccionado), 0);

    useEffect(() => {
        setData(prev => ({
            ...prev,
            carrito: cart.map(i => ({
                inventario_id: i.inventario_id,
                cantidad: i.cantidad,
                precio_venta: i.precio_seleccionado
            })),
            monto_total: total,
            cambio: Math.max(0, data.pagado - total)
        }));
    }, [cart, total, data.pagado]);

    const handleFinishVenta = (e: React.FormEvent) => {
        e.preventDefault();
        post(store().url, {
            onSuccess: (page) => {
                const flash = page.props.flash as any;
                if (flash.show_ticket) {
                    window.open(show(flash.show_ticket).url, '_blank');
                    setCart([]);
                    reset();
                    setIsCheckoutOpen(false);
                }
            }
        });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Ventas', href: '/ventas' }, { title: 'POS', href: '/ventas/create' }]}>
            <Head title="Punto de Venta" />
            <div className="flex flex-col h-[calc(100vh-120px)] p-4 gap-4 overflow-hidden">

                {/* Header POS */}
                <div className="flex flex-col md:flex-row items-center justify-between bg-card p-4 rounded-xl border shadow-sm gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <ShoppingCart className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">Venta Directa</h1>
                            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">{sucursal.nombre_sucursal}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <div className="relative flex-1 md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar producto..."
                                className="pl-9 h-10 rounded-full"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                            <SelectTrigger className="w-[150px] h-10 rounded-full">
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
                        className="relative rounded-full h-12 w-12 shadow-lg"
                        onClick={() => setIsCartOpen(true)}
                    >
                        <ShoppingCart className="h-6 w-6" />
                        {cart.length > 0 && (
                            <Badge className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0 rounded-full animate-in zoom-in">
                                {cart.length}
                            </Badge>
                        )}
                    </Button>
                </div>

                {/* Main Content: Catálogo */}
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    {isLoading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                            {[...Array(12)].map((_, i) => (
                                <Card key={i} className="animate-pulse h-64 bg-muted/20" />
                            ))}
                        </div>
                    ) : items.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center opacity-40">
                            <Boxes className="h-20 w-20 mb-4" />
                            <p className="text-xl font-medium">No se encontraron productos</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 pb-10">
                            {items.map((inv) => (
                                <Card
                                    key={inv.id}
                                    className="group hover:shadow-xl transition-all cursor-pointer overflow-hidden border-muted/60"
                                    onClick={() => addToCart(inv)}
                                >
                                    <div className="aspect-square relative overflow-hidden bg-muted/10">
                                        <img
                                            src={inv.producto.fotos.length > 0 ? inv.producto.fotos[0].url : '/images/placeholder-product.png'}
                                            alt={inv.producto.nombre}
                                            className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                                        />
                                        {inv.stock < 5 && (
                                            <Badge variant="destructive" className="absolute top-2 right-2 text-[10px]">
                                                Bajo Stock: {inv.stock}
                                            </Badge>
                                        )}
                                    </div>
                                    <CardHeader className="p-3 pb-0">
                                        <CardTitle className="text-sm line-clamp-1 leading-tight">{inv.producto.nombre}</CardTitle>
                                        <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground uppercase font-semibold">
                                            <span>{inv.producto.marca?.nombre}</span>
                                            <span>•</span>
                                            <span>{inv.producto.categoria?.nombre}</span>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-3 pt-2">
                                        <div className="text-lg font-black text-primary">Bs. {inv.producto.precio_1}</div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer: Paginación */}
                {pagination && pagination.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2 bg-card p-2 rounded-lg border shadow-sm">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={pagination.current_page === 1}
                            onClick={() => fetchProducts(pagination.current_page - 1)}
                        >
                            Anterior
                        </Button>
                        <span className="text-sm font-medium">Página {pagination.current_page} de {pagination.last_page}</span>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={pagination.current_page === pagination.last_page}
                            onClick={() => fetchProducts(pagination.current_page + 1)}
                        >
                            Siguiente
                        </Button>
                    </div>
                )}
            </div>

            {/* Modal de Carrito */}
            <Dialog open={isCartOpen} onOpenChange={setIsCartOpen}>
                <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col p-0 overflow-hidden">
                    <DialogHeader className="p-6 border-b">
                        <DialogTitle className="flex items-center gap-2">
                            <ShoppingCart className="h-5 w-5" /> Carrito de Compras
                        </DialogTitle>
                        <DialogDescription>Revisa los productos seleccionados antes de finalizar.</DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto p-0 scrollbar-hide">
                        <Table>
                            <TableHeader className="bg-muted/30 sticky top-0 z-10">
                                <TableRow>
                                    <TableHead className="w-[80px]"></TableHead>
                                    <TableHead>Producto</TableHead>
                                    <TableHead className="text-center">Cantidad</TableHead>
                                    <TableHead className="text-right">Precio</TableHead>
                                    <TableHead className="text-right">Subtotal</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {cart.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-40 text-center text-muted-foreground italic">
                                            El carrito está vacío
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    cart.map((item) => (
                                        <TableRow key={item.inventario_id}>
                                            <TableCell>
                                                <img
                                                    src={item.producto.fotos[0]?.url || '/images/placeholder.png'}
                                                    className="w-12 h-12 rounded-md object-cover border"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-bold text-sm">{item.producto.nombre}</div>
                                                <div className="text-[10px] text-muted-foreground italic">Stock: {item.stock_max}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-center gap-1">
                                                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.inventario_id, -1)}>
                                                        <Minus className="h-3 w-3" />
                                                    </Button>
                                                    <span className="w-8 text-center text-sm font-bold">{item.cantidad}</span>
                                                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.inventario_id, 1)}>
                                                        <Plus className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right text-sm">
                                                <Select
                                                    value={item.precio_seleccionado.toString()}
                                                    onValueChange={(val) => {
                                                        const p = parseFloat(val);
                                                        setCart(cart.map(i => i.inventario_id === item.inventario_id ? { ...i, precio_seleccionado: p } : i));
                                                    }}
                                                >
                                                    <SelectTrigger className="h-8 py-0">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value={item.producto.precio_1.toString()}>P1: {item.producto.precio_1}</SelectItem>
                                                        <SelectItem value={item.producto.precio_2.toString()}>P2: {item.producto.precio_2}</SelectItem>
                                                        <SelectItem value={item.producto.precio_3.toString()}>P3: {item.producto.precio_3}</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-primary">Bs. {(item.cantidad * item.precio_seleccionado).toFixed(2)}</TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeItem(item.inventario_id)}>
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="p-6 border-t bg-muted/40 grid grid-cols-2 gap-4">
                        <div className="flex flex-col">
                            <span className="text-sm text-muted-foreground">Total a pagar</span>
                            <span className="text-3xl font-black text-primary">Bs. {total.toFixed(2)}</span>
                        </div>
                        <div className="flex items-end justify-end gap-2">
                            <Button variant="ghost" onClick={() => { setCart([]); setIsCartOpen(false); }} className="text-destructive font-bold gap-2">
                                <Trash2 className="h-4 w-4" /> Vaciar
                            </Button>
                            <Button disabled={cart.length === 0} onClick={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }} className="h-12 px-8 font-bold text-lg rounded-full">
                                Cobrar
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Modal de Pago / Checkout */}
            <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Finalizar Venta</DialogTitle>
                        <DialogDescription>Ingrese los datos para la nota de venta.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleFinishVenta} className="space-y-4 pt-4">
                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <Label>Cliente</Label>
                                <Input value={data.cliente} onChange={e => setData('cliente', e.target.value)} />
                                {errors.cliente && <p className="text-xs text-red-500">{errors.cliente}</p>}
                            </div>
                            <div className="flex gap-4">
                                <div className="space-y-2 flex-1">
                                    <Label>NIT / CI</Label>
                                    <Input value={data.ci} onChange={e => setData('ci', e.target.value)} />
                                </div>
                                <div className="space-y-2 flex-1">
                                    <Label>Tipo de Pago</Label>
                                    <Select value={data.tipo_pago} onValueChange={val => setData('tipo_pago', val)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Efectivo">Efectivo</SelectItem>
                                            <SelectItem value="QR">QR / Transferencia</SelectItem>
                                            <SelectItem value="Tarjeta">Tarjeta</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 space-y-3 mt-2">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-medium">Total:</span>
                                    <span className="font-black text-xl text-primary">Bs. {total.toFixed(2)}</span>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs uppercase font-bold text-muted-foreground">Monto Pagado</Label>
                                    <Input
                                        type="number"
                                        className="h-12 text-2xl font-black text-center"
                                        value={data.pagado}
                                        onChange={e => setData('pagado', parseFloat(e.target.value) || 0)}
                                    />
                                </div>
                                {data.pagado > total && (
                                    <div className="flex justify-between items-center bg-green-500/10 p-2 rounded-lg border border-green-500/20">
                                        <span className="text-green-600 font-bold italic">Cambio:</span>
                                        <span className="text-xl font-black text-green-600">Bs. {(data.pagado - total).toFixed(2)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <DialogFooter className="mt-6">
                            <Button type="button" variant="ghost" onClick={() => setIsCheckoutOpen(false)}>Cancelar</Button>
                            <Button type="submit" disabled={processing} className="h-12 px-10 rounded-full font-bold text-lg">
                                {processing ? 'Procesando...' : 'Finalizar y Ticket'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

        </AppLayout>
    );
}
