import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { searchProductos, store } from '@/routes/ventas';
import axios from 'axios';
import { Minus, Plus, Search, Trash2, ShoppingCart } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Sucursal {
    id: number;
    nombre_sucursal: string;
}

interface Producto {
    id: number;
    nombre: string;
    precio_1: number;
    precio_2: number;
    precio_3: number;
}

interface Inventario {
    id: number;
    producto: Producto;
    stock: number;
}

interface CarritoItem {
    inventario_id: number;
    producto_nombre: string;
    cantidad: number;
    precio_venta: number;
    precios: number[]; // precios disponibles [p1, p2, p3]
    stock_max: number;
}

interface Props {
    sucursales: Sucursal[];
}

const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Ventas', href: '/ventas' },
    { title: 'Nueva Venta', href: '/ventas/create' },
];

interface VentaFormData {
    sucursal_id: string;
    cliente: string;
    ci: string;
    tipo_pago: string;
    carrito: CarritoItem[];
    monto_total: number;
    pagado: number;
    cambio: number;
}

export default function Create({ sucursales }: Props) {
    const [selectedSucursal, setSelectedSucursal] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Inventario[]>([]);
    const [carrito, setCarrito] = useState<CarritoItem[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const { data, setData, post, processing, errors } = useForm<VentaFormData>({
        sucursal_id: '',
        cliente: 'CLIENTE GENERAL',
        ci: '',
        tipo_pago: 'Efectivo',
        carrito: [],
        monto_total: 0,
        pagado: 0,
        cambio: 0,
    });

    useEffect(() => {
        if (selectedSucursal && searchQuery.length > 2) {
            const delayDebounceFn = setTimeout(() => {
                buscarProductos();
            }, 300);
            return () => clearTimeout(delayDebounceFn);
        } else {
            setSearchResults([]);
        }
    }, [searchQuery, selectedSucursal]);

    const buscarProductos = async () => {
        setIsSearching(true);
        try {
            const response = await axios.get(searchProductos({ query: { sucursal_id: selectedSucursal, query: searchQuery } }).url);
            setSearchResults(response.data);
        } catch (error) {
            console.error('Error buscando productos', error);
        } finally {
            setIsSearching(false);
        }
    };

    const agregarAlCarrito = (inventario: Inventario) => {
        const existe = carrito.find((item) => item.inventario_id === inventario.id);
        if (existe) {
            toast.error('El producto ya está en el carrito');
            return;
        }

        if (inventario.stock <= 0) {
            toast.error('No hay stock disponible');
            return;
        }

        const nuevoItem: CarritoItem = {
            inventario_id: inventario.id,
            producto_nombre: inventario.producto.nombre,
            cantidad: 1,
            precio_venta: inventario.producto.precio_1,
            precios: [inventario.producto.precio_1, inventario.producto.precio_2, inventario.producto.precio_3],
            stock_max: inventario.stock,
        };

        setCarrito([...carrito, nuevoItem]);
        setSearchQuery('');
        setSearchResults([]);
        toast.success('Producto agregado');
    };

    const actualizarCantidad = (id: number, delta: number) => {
        setCarrito(
            carrito.map((item) => {
                if (item.inventario_id === id) {
                    const nuevaCant = Math.min(Math.max(1, item.cantidad + delta), item.stock_max);
                    if (nuevaCant === item.stock_max && delta > 0) {
                        toast.warning('Has alcanzado el límite de stock');
                    }
                    return { ...item, cantidad: nuevaCant };
                }
                return item;
            })
        );
    };

    const actualizarPrecio = (id: number, precio: number) => {
        setCarrito(
            carrito.map((item) => (item.inventario_id === id ? { ...item, precio_venta: precio } : item))
        );
    };

    const eliminarDelCarrito = (id: number) => {
        setCarrito(carrito.filter((item) => item.inventario_id !== id));
    };

    const total = carrito.reduce((acc, item) => acc + item.cantidad * item.precio_venta, 0);

    useEffect(() => {
        setData((prev) => ({
            ...prev,
            carrito: carrito,
            monto_total: total,
            cambio: Math.max(0, data.pagado - total),
            sucursal_id: selectedSucursal
        }));
    }, [carrito, total, data.pagado, selectedSucursal]);

    const handleSumbit = (e: React.FormEvent) => {
        e.preventDefault();
        if (carrito.length === 0) {
            toast.error('El carrito está vacío');
            return;
        }
        post(store().url);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nueva Venta" />
            <div className="flex flex-1 flex-col gap-6 p-6 overflow-y-auto">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">Registro de Venta</h1>
                </div>

                <form onSubmit={handleSumbit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Panel Izquierdo: Configuración y Buscador */}
                    <div className="md:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <ShoppingCart className="h-5 w-5" />
                                    Detalles de la Venta
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Sucursal</Label>
                                        <Select value={selectedSucursal} onValueChange={setSelectedSucursal}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccione sucursal" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {sucursales.map((s) => (
                                                    <SelectItem key={s.id} value={s.id.toString()}>
                                                        {s.nombre_sucursal}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.sucursal_id && <p className="text-xs text-red-500">{errors.sucursal_id}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Cliente</Label>
                                        <Input
                                            value={data.cliente}
                                            onChange={(e) => setData('cliente', e.target.value)}
                                            placeholder="Nombre del cliente"
                                        />
                                    </div>
                                </div>

                                <div className="relative">
                                    <Label>Buscar Producto</Label>
                                    <div className="relative mt-1">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            disabled={!selectedSucursal}
                                            placeholder={selectedSucursal ? "Buscar por nombre..." : "Primero seleccione una sucursal"}
                                            className="pl-9"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>

                                    {searchResults.length > 0 && (
                                        <Card className="absolute z-10 w-full mt-1 shadow-lg max-h-60 overflow-y-auto">
                                            <Table>
                                                <TableBody>
                                                    {searchResults.map((inv) => (
                                                        <TableRow
                                                            key={inv.id}
                                                            className="cursor-pointer hover:bg-accent"
                                                            onClick={() => agregarAlCarrito(inv)}
                                                        >
                                                            <TableCell className="font-medium">{inv.producto.nombre}</TableCell>
                                                            <TableCell className="text-right">Stock: {inv.stock}</TableCell>
                                                            <TableCell className="text-right font-bold text-primary">
                                                                Bs. {inv.producto.precio_1}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </Card>
                                    )}
                                    {isSearching && (
                                        <div className="absolute right-3 top-[34px]">
                                            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Carrito de Compras */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Productos en Carrito</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Producto</TableHead>
                                            <TableHead className="w-32">Precio</TableHead>
                                            <TableHead className="w-32">Cantidad</TableHead>
                                            <TableHead className="text-right">Subtotal</TableHead>
                                            <TableHead className="w-10"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {carrito.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                    El carrito está vacío
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            carrito.map((item) => (
                                                <TableRow key={item.inventario_id}>
                                                    <TableCell className="font-medium">{item.producto_nombre}</TableCell>
                                                    <TableCell>
                                                        <Select
                                                            value={item.precio_venta.toString()}
                                                            onValueChange={(val) => actualizarPrecio(item.inventario_id, parseFloat(val))}
                                                        >
                                                            <SelectTrigger className="h-8">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {item.precios.map((p, idx) => (
                                                                    <SelectItem key={idx} value={p.toString()}>
                                                                        Bs. {p}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="icon"
                                                                className="h-7 w-7"
                                                                onClick={() => actualizarCantidad(item.inventario_id, -1)}
                                                            >
                                                                <Minus className="h-3 w-3" />
                                                            </Button>
                                                            <span className="w-6 text-center text-sm">{item.cantidad}</span>
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="icon"
                                                                className="h-7 w-7"
                                                                onClick={() => actualizarCantidad(item.inventario_id, 1)}
                                                                disabled={item.cantidad >= item.stock_max}
                                                            >
                                                                <Plus className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        Bs. {(item.cantidad * item.precio_venta).toFixed(2)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-destructive h-8 w-8"
                                                            onClick={() => eliminarDelCarrito(item.inventario_id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Panel Derecho: Totales y Pago */}
                    <div className="space-y-6">
                        <Card className="bg-primary/5 border-primary/20">
                            <CardHeader>
                                <CardTitle className="text-lg">Resumen de Pago</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label>Tipo de Pago</Label>
                                    <Select value={data.tipo_pago} onValueChange={(val) => setData('tipo_pago', val)}>
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

                                <div className="space-y-2">
                                    <Label>NIT / CI (Opcional)</Label>
                                    <Input value={data.ci} onChange={(e) => setData('ci', e.target.value)} />
                                </div>

                                <div className="pt-4 border-t space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground font-medium">Subtotal</span>
                                        <span>Bs. {total.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xl font-bold">
                                        <span>Total a Pagar</span>
                                        <span className="text-primary">Bs. {total.toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="space-y-2 pt-2">
                                    <Label className="text-primary font-bold">Monto Pagado</Label>
                                    <Input
                                        type="number"
                                        className="text-lg font-bold"
                                        value={data.pagado}
                                        onChange={(e) => setData('pagado', parseFloat(e.target.value) || 0)}
                                    />
                                </div>

                                {data.pagado > total && (
                                    <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                                        <span className="text-green-600 font-bold italic">Cambio:</span>
                                        <span className="text-xl font-black text-green-600">Bs. {(data.pagado - total).toFixed(2)}</span>
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    className="w-full text-lg h-12 mt-4"
                                    disabled={processing || carrito.length === 0}
                                >
                                    {processing ? 'Procesando...' : 'Finalizar Venta'}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
