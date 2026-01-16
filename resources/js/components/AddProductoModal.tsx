// resources/js/components/AddProductoModal.tsx
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';

interface Producto {
    id: number;
    nombre: string;
    stock: number;
}

interface AddProductoModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (productoId: number, cantidad: number, precioVenta: number) => void;
    productos: Producto[];
}

function AddProductoModal({
    open,
    onClose,
    onSave,
    productos,
}: AddProductoModalProps) {
    const [productoId, setProductoId] = useState<string>('');
    const [cantidad, setCantidad] = useState<string>('');
    const [precioVenta, setPrecioVenta] = useState<string>('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!productoId || !cantidad || !precioVenta) return;

        onSave(
            parseInt(productoId),
            parseInt(cantidad),
            parseFloat(precioVenta),
        );
        setProductoId('');
        setCantidad('');
        setPrecioVenta('');
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Agregar Producto</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <Label htmlFor="producto">Producto</Label>
                        <Select
                            value={productoId}
                            onValueChange={setProductoId}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona un producto" />
                            </SelectTrigger>
                            <SelectContent>
                                {productos.map((producto) => (
                                    <SelectItem
                                        key={producto.id}
                                        value={producto.id.toString()}
                                    >
                                        {producto.nombre} (Stock:{' '}
                                        {producto.stock})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="cantidad">Cantidad</Label>
                        <Input
                            id="cantidad"
                            type="number"
                            min="1"
                            value={cantidad}
                            onChange={(e) => setCantidad(e.target.value)}
                            placeholder="Cantidad"
                        />
                    </div>
                    <div>
                        <Label htmlFor="precio">Precio de Venta</Label>
                        <Input
                            id="precio"
                            type="number"
                            step="0.01"
                            min="0"
                            value={precioVenta}
                            onChange={(e) => setPrecioVenta(e.target.value)}
                            placeholder="Precio de venta"
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit">Agregar</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default AddProductoModal;
