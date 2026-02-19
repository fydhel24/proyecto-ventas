import React, { useState, useMemo } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, router, Link } from '@inertiajs/react';
import {
    Plus,
    Trash2,
    Save,
    ChevronLeft,
    ShoppingCart,
    Calendar,
    Package,
    ArrowLeft
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { toast } from 'sonner';

export default function ComprasCreate({ proveedores, productos }: any) {
    const [proveedorId, setProveedorId] = useState('');
    const [items, setItems] = useState<any[]>([]);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Form for adding individual items
    const [tempItem, setTempItem] = useState({
        cantidad: 1,
        precio_compra: 0,
        numero_lote: '',
        fecha_vencimiento: ''
    });

    const addItem = () => {
        if (!selectedProduct || !tempItem.numero_lote || !tempItem.fecha_vencimiento) {
            toast.error("Complete todos los campos del producto");
            return;
        }

        const product = productos.find((p: any) => p.id.toString() === selectedProduct);

        setItems([...items, {
            ...tempItem,
            producto_id: parseInt(selectedProduct),
            nombre: product.nombre,
            subtotal: tempItem.cantidad * tempItem.precio_compra
        }]);

        // Reset temp
        setSelectedProduct('');
        setTempItem({ cantidad: 1, precio_compra: 0, numero_lote: '', fecha_vencimiento: '' });
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const total = useMemo(() => items.reduce((acc, item) => acc + item.subtotal, 0), [items]);

    const handleSubmit = () => {
        if (!proveedorId) {
            toast.error("Seleccione un proveedor");
            return;
        }
        if (items.length === 0) {
            toast.error("Agregue al menos un producto");
            return;
        }

        setIsLoading(true);
        router.post('/compras', {
            proveedor_id: parseInt(proveedorId),
            monto_total: total,
            items: items
        }, {
            onSuccess: () => toast.success("Compra registrada exitosamente"),
            onError: () => setIsLoading(false),
            onFinish: () => setIsLoading(false)
        });
    };

    return (
        <AppLayout>
            <Head title="Nueva Compra - Nexus Farma" />

            <div className="p-6 max-w-6xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/compras">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Nueva Entrada de Mercadería</h1>
                        <p className="text-slate-500">Registra compras a proveedores y abastece tu stock.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Formulario de Cabecera */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="border-none shadow-sm">
                            <CardHeader className="bg-slate-50/50 border-b">
                                <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">Información General</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold">Proveedor / Distribuidora</label>
                                    <Select value={proveedorId} onValueChange={setProveedorId}>
                                        <SelectTrigger className="h-11">
                                            <SelectValue placeholder="Seleccionar proveedor" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {proveedores.map((p: any) => (
                                                <SelectItem key={p.id} value={p.id.toString()}>{p.nombre}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="pt-4 border-t">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-slate-500">Total Compra</span>
                                        <span className="text-2xl font-black text-[#16A34A]">{total.toFixed(2)} BOB</span>
                                    </div>
                                    <Button
                                        className="w-full h-12 bg-[#16A34A] hover:bg-[#15803d] font-bold"
                                        disabled={items.length === 0 || isLoading}
                                        onClick={handleSubmit}
                                    >
                                        <Save className="w-4 h-4 mr-2" />
                                        {isLoading ? "Procesando..." : "Confirmar Ingreso"}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Selector de Productos e items */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="border-none shadow-sm">
                            <CardHeader className="bg-slate-50/50 border-b">
                                <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">Añadir Medicamentos</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold">Producto</label>
                                        <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                                            <SelectTrigger className="h-11">
                                                <SelectValue placeholder="Buscar producto..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {productos.map((p: any) => (
                                                    <SelectItem key={p.id} value={p.id.toString()}>{p.nombre} ({p.concentracion})</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold">Lote No.</label>
                                            <Input
                                                className="h-11"
                                                placeholder="Ej: AB123"
                                                value={tempItem.numero_lote}
                                                onChange={(e) => setTempItem({ ...tempItem, numero_lote: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold">Vencimiento</label>
                                            <Input
                                                type="date"
                                                className="h-11"
                                                value={tempItem.fecha_vencimiento}
                                                onChange={(e) => setTempItem({ ...tempItem, fecha_vencimiento: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold">Cantidad</label>
                                        <Input
                                            type="number"
                                            className="h-11"
                                            value={tempItem.cantidad}
                                            onChange={(e) => setTempItem({ ...tempItem, cantidad: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold">P. Compra (u)</label>
                                        <Input
                                            type="number"
                                            className="h-11"
                                            value={tempItem.precio_compra}
                                            onChange={(e) => setTempItem({ ...tempItem, precio_compra: parseFloat(e.target.value) || 0 })}
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <Button
                                            type="button"
                                            className="w-full h-11 bg-slate-100 text-slate-900 hover:bg-slate-200"
                                            onClick={addItem}
                                        >
                                            <Plus className="w-4 h-4 mr-2" /> Agregar a Lista
                                        </Button>
                                    </div>
                                </div>

                                <div className="border rounded-xl overflow-hidden">
                                    <Table>
                                        <TableHeader className="bg-slate-50">
                                            <TableRow>
                                                <TableHead>Producto</TableHead>
                                                <TableHead>Lote</TableHead>
                                                <TableHead>Cantidad</TableHead>
                                                <TableHead>Subtotal</TableHead>
                                                <TableHead className="w-[50px]"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {items.map((item, index) => (
                                                <TableRow key={index}>
                                                    <TableCell className="font-bold">{item.nombre}</TableCell>
                                                    <TableCell className="text-xs font-mono">{item.numero_lote}</TableCell>
                                                    <TableCell>{item.cantidad} uds.</TableCell>
                                                    <TableCell>{item.subtotal.toFixed(2)} BOB</TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-red-500 hover:text-red-700 h-8 w-8"
                                                            onClick={() => removeItem(index)}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            {items.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="text-center py-12 text-slate-300">
                                                        No hay productos en la lista.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
