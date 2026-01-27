import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Producto {
    id: number;
    nombre: string;
    stock: number;
    precio_1?: number;
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
    const [openPopover, setOpenPopover] = useState(false);
    const [selectedProducto, setSelectedProducto] = useState<Producto | null>(
        null,
    );
    const [cantidad, setCantidad] = useState<string>('');
    const [precioVenta, setPrecioVenta] = useState<string>('');
    const [cantidadError, setCantidadError] = useState<string>('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProducto || !cantidad || !precioVenta) return;

        const cantidadNum = parseInt(cantidad);

        // Validar cantidad no exceda stock disponible
        if (cantidadNum > selectedProducto.stock) {
            setCantidadError(`Máximo disponible: ${selectedProducto.stock}`);
            return;
        }

        setCantidadError('');
        onSave(
            selectedProducto.id,
            cantidadNum,
            parseFloat(precioVenta),
        );
        setSelectedProducto(null);
        setCantidad('');
        setPrecioVenta('');
        onClose();
    };

    const handleCantidadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCantidad(e.target.value);
        if (selectedProducto) {
            const num = parseInt(e.target.value);
            if (num > selectedProducto.stock) {
                setCantidadError(`Máximo disponible: ${selectedProducto.stock}`);
            } else {
                setCantidadError('');
            }
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Agregar Producto</DialogTitle>
                    <DialogDescription>
                        Selecciona un producto del inventario para añadirlo a la lista.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <Label htmlFor="producto">Producto</Label>
                        <Popover
                            open={openPopover}
                            onOpenChange={setOpenPopover}
                        >
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={openPopover}
                                    className="w-full justify-between"
                                >
                                    {selectedProducto
                                        ? `${selectedProducto.nombre} (Stock: ${selectedProducto.stock})`
                                        : 'Busca un producto...'}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                                <Command>
                                    <CommandInput placeholder="Buscar producto..." className="h-9" />
                                    <CommandList>
                                        <CommandEmpty>No se encontró el producto.</CommandEmpty>
                                        <CommandGroup>
                                            {productos.map((producto) => (
                                                <CommandItem
                                                    key={producto.id}
                                                    value={producto.nombre}
                                                    onSelect={() => {
                                                        setSelectedProducto(producto);
                                                        setPrecioVenta(producto.precio_1?.toString() || '');
                                                        setOpenPopover(false);
                                                    }}
                                                >
                                                    <Check
                                                        className={cn(
                                                            'mr-2 h-4 w-4',
                                                            selectedProducto?.id ===
                                                                producto.id
                                                                ? 'opacity-100'
                                                                : 'opacity-0',
                                                        )}
                                                    />
                                                    <div className="flex flex-col">
                                                        <span>{producto.nombre}</span>
                                                        <span className="text-xs text-muted-foreground">
                                                            Stock: {producto.stock} {producto.precio_1 ? `| Precio: ${producto.precio_1} Bs` : ''}
                                                        </span>
                                                    </div>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="cantidad">Cantidad</Label>
                            <Input
                                id="cantidad"
                                type="number"
                                min="1"
                                max={selectedProducto?.stock}
                                value={cantidad}
                                onChange={handleCantidadChange}
                                placeholder="Cant."
                                className={cantidadError ? 'border-red-500' : ''}
                            />
                            {cantidadError && (
                                <div className="flex items-center gap-2 mt-1 text-xs text-red-500">
                                    <AlertCircle className="w-3 h-3" />
                                    {cantidadError}
                                </div>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="precio">Precio de Venta (Bs)</Label>
                            <Input
                                id="precio"
                                type="number"
                                step="0.01"
                                min="0"
                                value={precioVenta}
                                onChange={(e) => setPrecioVenta(e.target.value)}
                                placeholder="Precio"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={!selectedProducto || !!cantidadError || !cantidad || !precioVenta}
                        >
                            Agregar
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default AddProductoModal;
