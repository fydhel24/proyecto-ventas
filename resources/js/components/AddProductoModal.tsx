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
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
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
}

function AddProductoModal({
    open,
    onClose,
    onSave,
}: AddProductoModalProps) {
    const [openPopover, setOpenPopover] = useState(false);
    const [selectedProducto, setSelectedProducto] = useState<Producto | null>(
        null,
    );
    const [cantidad, setCantidad] = useState<string>('');
    const [precioVenta, setPrecioVenta] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');
    const [productos, setProductos] = useState<Producto[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!searchTerm) {
            setProductos([]);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`/api/productos/search?search=${encodeURIComponent(searchTerm)}`);
                const data = await response.json();
                setProductos(data);
            } catch (error) {
                console.error('Error searching products:', error);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

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
        setSearchTerm('');
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
                                        : 'Busca un producto...'}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[400px] p-0" align="start">
                                <Command shouldFilter={false}>
                                    <CommandInput 
                                        placeholder="Escribe para buscar..." 
                                        value={searchTerm}
                                        onValueChange={setSearchTerm}
                                    />
                                    <CommandList>
                                        {isLoading && (
                                            <div className="flex items-center justify-center py-6">
                                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                            </div>
                                        )}
                                        {!isLoading && searchTerm && productos.length === 0 && (
                                            <CommandEmpty>No se encontraron productos.</CommandEmpty>
                                        )}
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
                                                            Stock: {producto.stock} | Precio sugerido: {producto.precio_1} Bs
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
                                value={cantidad}
                                onChange={(e) => setCantidad(e.target.value)}
                                placeholder="Cant."
                            />
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
                        <Button type="submit" disabled={!selectedProducto}>Agregar</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default AddProductoModal;
