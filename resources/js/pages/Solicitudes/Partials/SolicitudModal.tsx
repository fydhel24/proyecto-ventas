import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { useForm } from '@inertiajs/react';
import solicitudesRoutes from '@/routes/solicitudes';
import { useEffect, useState } from 'react';
import { Check, ChevronDown, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Producto {
    id: number;
    nombre: string;
}

interface Sucursal {
    id: number;
    nombre_sucursal: string;
}

interface Props {
    productos: Producto[];
    sucursales: Sucursal[];
    open: boolean;
    onClose: () => void;
}

interface SolicitudItem {
    producto_id: string;
    cantidad: string;
    nombre_producto?: string;
}

export default function SolicitudModal({ productos, sucursales, open, onClose }: Props) {
    const [openComboboxIndex, setOpenComboboxIndex] = useState<number | null>(null);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        sucursal_origen_id: '',
        sucursal_destino_id: '',
        descripcion: '',
        productos: [] as SolicitudItem[],
    });

    useEffect(() => {
        if (open) {
            reset();
            clearErrors();
            setData('productos', [{ producto_id: '', cantidad: '' }]);
        }
    }, [open]);

    const handleAddItem = () => {
        setData('productos', [...data.productos, { producto_id: '', cantidad: '' }]);
    };

    const handleRemoveItem = (index: number) => {
        const newProductos = [...data.productos];
        newProductos.splice(index, 1);
        setData('productos', newProductos);
    };

    const updateItem = (index: number, field: keyof SolicitudItem, value: string) => {
        const newProductos = [...data.productos];
        newProductos[index] = { ...newProductos[index], [field]: value };

        if (field === 'producto_id') {
            const prod = productos.find(p => p.id === Number(value));
            newProductos[index].nombre_producto = prod?.nombre;
        }

        setData('productos', newProductos);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const isValid = data.productos.every(p => p.producto_id && Number(p.cantidad) > 0);
        if (!isValid) {
            toast.error('Por favor completa todos los productos y cantidades.');
            return;
        }

        post(solicitudesRoutes.store().url, {
            onSuccess: () => {
                toast.success('Solicitud enviada correctamente.');
                onClose();
                reset();
            },
            onError: (errors) => {
                const firstError = Object.values(errors)[0];
                toast.error(firstError || 'Error al enviar la solicitud.');
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[700px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Nueva Solicitud de Stock (Multi-producto)</DialogTitle>
                    </DialogHeader>

                    <div className="grid gap-6 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="sucursal_destino">Sucursal a la que se Pide (Destino)</Label>
                            <Select
                                value={data.sucursal_destino_id}
                                onValueChange={(value) => setData('sucursal_destino_id', value)}
                            >
                                <SelectTrigger id="sucursal_destino">
                                    <SelectValue placeholder="Seleccionar..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {sucursales
                                        .map((s) => (
                                            <SelectItem key={s.id} value={s.id.toString()}>
                                                {s.nombre_sucursal}
                                            </SelectItem>
                                        ))
                                    }
                                </SelectContent>
                            </Select>
                            {errors.sucursal_destino_id && <p className="text-sm text-red-500">{errors.sucursal_destino_id}</p>}
                        </div>

                        <div className="border rounded-xl p-4 bg-muted/30 space-y-4">
                            <div className="flex justify-between items-center">
                                <Label className="text-sm font-black uppercase text-muted-foreground">Productos Solicitados</Label>
                                <Button type="button" variant="outline" size="sm" onClick={handleAddItem} className="h-7 text-xs">
                                    <Plus className="w-3 h-3 mr-1" /> Agregar Fila
                                </Button>
                            </div>

                            <div className="space-y-3">
                                {data.productos.map((item, index) => (
                                    <div key={index} className="flex gap-3 items-start">
                                        <div className="flex-1">
                                            <Popover
                                                open={openComboboxIndex === index}
                                                onOpenChange={(isOpen) => setOpenComboboxIndex(isOpen ? index : null)}
                                            >
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        className="w-full justify-between font-normal"
                                                    >
                                                        {item.producto_id
                                                            ? productos.find((p) => p.id === Number(item.producto_id))?.nombre
                                                            : "Seleccionar producto..."}
                                                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[300px] p-0" align="start">
                                                    <Command>
                                                        <CommandInput placeholder="Buscar..." />
                                                        <CommandList>
                                                            <CommandEmpty>No encontrado.</CommandEmpty>
                                                            <CommandGroup>
                                                                {productos.map((p) => (
                                                                    <CommandItem
                                                                        key={p.id}
                                                                        value={p.nombre}
                                                                        onSelect={() => {
                                                                            updateItem(index, 'producto_id', String(p.id));
                                                                            setOpenComboboxIndex(null);
                                                                        }}
                                                                    >
                                                                        <Check
                                                                            className={`mr-2 h-4 w-4 ${item.producto_id === String(p.id) ? "opacity-100" : "opacity-0"}`}
                                                                        />
                                                                        {p.nombre}
                                                                    </CommandItem>
                                                                ))}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                        <div className="w-24">
                                            <Input
                                                type="number"
                                                placeholder="Cant."
                                                min="1"
                                                value={item.cantidad}
                                                onChange={(e) => updateItem(index, 'cantidad', e.target.value)}
                                            />
                                        </div>
                                        {data.productos.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => handleRemoveItem(index)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {errors.productos && <p className="text-sm text-red-500 m-1">{errors.productos}</p>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="descripcion">Motivo / Descripción</Label>
                            <Textarea
                                id="descripcion"
                                value={data.descripcion}
                                onChange={(e) => setData('descripcion', e.target.value)}
                                placeholder="Ej. Reposición de stock urgente"
                            />
                            {errors.descripcion && <p className="text-sm text-red-500">{errors.descripcion}</p>}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-700">
                            Enviar Solicitud
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
