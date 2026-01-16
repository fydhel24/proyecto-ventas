// resources/js/components/AddProductoModal.tsx
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
import { Check, ChevronsUpDown } from 'lucide-react';
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
    const [openPopover, setOpenPopover] = useState(false);
    const [selectedProducto, setSelectedProducto] = useState<Producto | null>(
        null,
    );
    const [cantidad, setCantidad] = useState<string>('');
    const [precioVenta, setPrecioVenta] = useState<string>('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProducto || !cantidad || !precioVenta) return;

        onSave(
            selectedProducto.id,
            parseInt(cantidad),
            parseFloat(precioVenta),
        );
        setSelectedProducto(null);
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
                                        : 'Selecciona un producto...'}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                                <Command>
                                    <CommandInput placeholder="Buscar producto..." />
                                    <CommandList>
                                        <CommandEmpty>
                                            No se encontraron productos.
                                        </CommandEmpty>
                                        <CommandGroup>
                                            {productos.map((producto) => (
                                                <CommandItem
                                                    key={producto.id}
                                                    value={producto.nombre}
                                                    onSelect={() => {
                                                        setSelectedProducto(
                                                            producto,
                                                        );
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
                                                    {producto.nombre} (Stock:{' '}
                                                    {producto.stock})
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
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
