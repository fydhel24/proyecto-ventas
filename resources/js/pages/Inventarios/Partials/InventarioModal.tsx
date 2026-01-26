import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { useForm } from '@inertiajs/react';
import inventariosRoutes from '@/routes/inventarios';
import { useEffect, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

interface Inventario {
    id: number;
    producto: { id: number };
    sucursal: { id: number };
    stock: number;
}

interface Producto {
    id: number;
    nombre: string;
}

interface Sucursal {
    id: number;
    nombre_sucursal: string;
}

interface Props {
    inventarios: Inventario[];
    productos: Producto[];
    sucursales: Sucursal[];
    open: boolean;
    onClose: () => void;
}

export default function InventarioModal({ inventarios, productos, sucursales, open, onClose }: Props) {
    const [productoOpen, setProductoOpen] = useState(false);
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        sucursal_id: '',
        producto_id: '',
        cantidad: '',
        descripcion: '',
    });

    const currentStock = inventarios.find(
        (inv) => inv.sucursal.id === Number(data.sucursal_id) && inv.producto.id === Number(data.producto_id)
    )?.stock || 0;

    const newStock = currentStock + (Number(data.cantidad) || 0);

    useEffect(() => {
        if (open) {
            reset();
            clearErrors();
        }
    }, [open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(inventariosRoutes.store().url, {
            onSuccess: () => {
                onClose();
                reset();
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Ingreso de Stock</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="sucursal">Sucursal</Label>
                            <Select
                                value={data.sucursal_id}
                                onValueChange={(value) => setData('sucursal_id', value)}
                            >
                                <SelectTrigger id="sucursal">
                                    <SelectValue placeholder="Seleccionar sucursal" />
                                </SelectTrigger>
                                <SelectContent>
                                    {sucursales.map((s) => (
                                        <SelectItem key={s.id} value={s.id.toString()}>
                                            {s.nombre_sucursal}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.sucursal_id && <p className="text-sm text-red-500">{errors.sucursal_id}</p>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="producto">Producto</Label>
                            <Popover open={productoOpen} onOpenChange={setProductoOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={productoOpen}
                                        className="w-full justify-between font-normal"
                                    >
                                        {data.producto_id
                                            ? productos.find((p) => p.id === Number(data.producto_id))?.nombre
                                            : "Seleccionar producto..."}
                                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                                    <Command>
                                        <CommandInput placeholder="Buscar producto..." className="h-9" />
                                        <CommandList>
                                            <CommandEmpty>No se encontró el producto.</CommandEmpty>
                                            <CommandGroup>
                                                {productos.map((p) => (
                                                    <CommandItem
                                                        key={p.id}
                                                        value={p.nombre}
                                                        onSelect={(currentValue) => {
                                                            const selected = productos.find(
                                                                (prod) => prod.nombre === currentValue
                                                            );
                                                            if (selected) {
                                                                setData('producto_id', String(selected.id));
                                                            }
                                                            setProductoOpen(false);
                                                        }}
                                                    >
                                                        <Check
                                                            className={`mr-2 h-4 w-4 ${data.producto_id === String(p.id) ? "opacity-100" : "opacity-0"
                                                                }`}
                                                        />
                                                        {p.nombre}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                            {errors.producto_id && <p className="text-sm text-red-500">{errors.producto_id}</p>}
                        </div>

                        {(data.sucursal_id && data.producto_id) && (
                            <div className="grid grid-cols-2 gap-4 p-3 bg-muted/50 rounded-lg border border-border/40">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Stock Actual</p>
                                    <p className="text-lg font-bold text-foreground">{currentStock} <span className="text-xs font-normal opacity-70">Unid.</span></p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase text-primary tracking-widest">Nuevo Stock</p>
                                    <p className="text-lg font-bold text-primary">{newStock} <span className="text-xs font-normal opacity-70">Unid.</span></p>
                                </div>
                            </div>
                        )}

                        <div className="grid gap-2">
                            <Label htmlFor="cantidad">Cantidad a Ingresar</Label>
                            <Input
                                id="cantidad"
                                type="number"
                                value={data.cantidad}
                                onChange={(e) => setData('cantidad', e.target.value)}
                                placeholder="0"
                                min="1"
                            />
                            {errors.cantidad && <p className="text-sm text-red-500">{errors.cantidad}</p>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="descripcion">Descripción (Opcional)</Label>
                            <Textarea
                                id="descripcion"
                                value={data.descripcion}
                                onChange={(e) => setData('descripcion', e.target.value)}
                                placeholder="Ej. Según nota de entrega #123"
                            />
                            {errors.descripcion && <p className="text-sm text-red-500">{errors.descripcion}</p>}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={processing}>
                            Registrar Ingreso
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
