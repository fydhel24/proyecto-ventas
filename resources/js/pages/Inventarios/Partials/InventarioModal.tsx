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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import inventariosRoutes from '@/routes/inventarios';
import { useForm } from '@inertiajs/react';
import { Check, ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';

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
    mode?: 'ingreso' | 'reparticion';
    onClose: () => void;
}

export default function InventarioModal({
    inventarios,
    productos,
    sucursales,
    open,
    onClose,
    mode = 'ingreso',
}: Props) {
    const [productoOpen, setProductoOpen] = useState(false);
    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm({
            sucursal_id: '',
            sucursal_origen_id: '',
            producto_id: '',
            cantidad: '',
            descripcion: '',
        });

    const isReparticion = mode === 'reparticion';

    const currentStockDestino =
        inventarios.find(
            (inv) =>
                inv.sucursal.id === Number(data.sucursal_id) &&
                inv.producto.id === Number(data.producto_id),
        )?.stock || 0;

    const currentStockOrigen =
        inventarios.find(
            (inv) =>
                inv.sucursal.id === Number(data.sucursal_origen_id) &&
                inv.producto.id === Number(data.producto_id),
        )?.stock || 0;

    const newStockDestino = currentStockDestino + (Number(data.cantidad) || 0);
    const newStockOrigen = currentStockOrigen - (Number(data.cantidad) || 0);

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
            <DialogContent className="sm:max-w-[450px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black tracking-tight uppercase italic">
                            {isReparticion
                                ? 'Repartir Platillos'
                                : 'Asignar Platillos'}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-5 py-6">
                        {isReparticion && (
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="sucursal_origen"
                                    className="text-[10px] font-bold tracking-widest text-primary uppercase"
                                >
                                    Sucursal Origen (Donde están los platos)
                                </Label>
                                <Select
                                    value={data.sucursal_origen_id}
                                    onValueChange={(value) =>
                                        setData('sucursal_origen_id', value)
                                    }
                                >
                                    <SelectTrigger
                                        id="sucursal_origen"
                                        className="h-11 rounded-xl border-2"
                                    >
                                        <SelectValue placeholder="Seleccionar origen" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sucursales.map((s) => (
                                            <SelectItem
                                                key={s.id}
                                                value={s.id.toString()}
                                            >
                                                {s.nombre_sucursal}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.sucursal_origen_id && (
                                    <p className="text-sm text-red-500">
                                        {errors.sucursal_origen_id}
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="grid gap-2">
                            <Label
                                htmlFor="producto"
                                className="text-[10px] font-bold tracking-widest uppercase"
                            >
                                Platillo / Preparación
                            </Label>
                            <Popover
                                open={productoOpen}
                                onOpenChange={setProductoOpen}
                            >
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={productoOpen}
                                        className="h-11 w-full justify-between rounded-xl border-2 font-bold"
                                    >
                                        {data.producto_id
                                            ? productos.find(
                                                  (p) =>
                                                      p.id ===
                                                      Number(data.producto_id),
                                              )?.nombre
                                            : 'Seleccionar platillo...'}
                                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                                    <Command>
                                        <CommandInput
                                            placeholder="Buscar platillo..."
                                            className="h-9"
                                        />
                                        <CommandList>
                                            <CommandEmpty>
                                                No se encontró el platillo.
                                            </CommandEmpty>
                                            <CommandGroup>
                                                {productos.map((p) => (
                                                    <CommandItem
                                                        key={p.id}
                                                        value={p.nombre}
                                                        onSelect={(
                                                            currentValue,
                                                        ) => {
                                                            const selected =
                                                                productos.find(
                                                                    (prod) =>
                                                                        prod.nombre ===
                                                                        currentValue,
                                                                );
                                                            if (selected) {
                                                                setData(
                                                                    'producto_id',
                                                                    String(
                                                                        selected.id,
                                                                    ),
                                                                );
                                                            }
                                                            setProductoOpen(
                                                                false,
                                                            );
                                                        }}
                                                    >
                                                        <Check
                                                            className={`mr-2 h-4 w-4 ${
                                                                data.producto_id ===
                                                                String(p.id)
                                                                    ? 'opacity-100'
                                                                    : 'opacity-0'
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
                            {errors.producto_id && (
                                <p className="text-sm text-red-500">
                                    {errors.producto_id}
                                </p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label
                                htmlFor="sucursal"
                                className="text-[10px] font-bold tracking-widest text-primary uppercase"
                            >
                                Sucursal Destino
                            </Label>
                            <Select
                                value={data.sucursal_id}
                                onValueChange={(value) =>
                                    setData('sucursal_id', value)
                                }
                            >
                                <SelectTrigger
                                    id="sucursal"
                                    className="h-11 rounded-xl border-2"
                                >
                                    <SelectValue placeholder="Seleccionar destino" />
                                </SelectTrigger>
                                <SelectContent>
                                    {sucursales
                                        .filter(
                                            (s) =>
                                                s.id.toString() !==
                                                data.sucursal_origen_id,
                                        )
                                        .map((s) => (
                                            <SelectItem
                                                key={s.id}
                                                value={s.id.toString()}
                                            >
                                                {s.nombre_sucursal}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                            {errors.sucursal_id && (
                                <p className="text-sm text-red-500">
                                    {errors.sucursal_id}
                                </p>
                            )}
                        </div>

                        {data.sucursal_id && data.producto_id && (
                            <div className="grid gap-3 rounded-2xl border-2 border-dashed border-border/60 bg-muted/30 p-4">
                                {isReparticion && data.sucursal_origen_id && (
                                    <div className="grid grid-cols-2 gap-4 border-b border-border/40 pb-3">
                                        <div className="space-y-1">
                                            <p className="text-[9px] leading-none font-black tracking-widest text-muted-foreground uppercase">
                                                Disponible Origen
                                            </p>
                                            <p className="text-sm font-bold">
                                                {currentStockOrigen} platos
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[9px] leading-none font-black tracking-widest text-red-500 uppercase">
                                                Quedará en
                                            </p>
                                            <p className="text-sm font-bold text-red-500">
                                                {newStockOrigen < 0
                                                    ? 'Insuficiente'
                                                    : newStockOrigen +
                                                      ' platos'}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-[9px] leading-none font-black tracking-widest text-muted-foreground uppercase">
                                            En Destino Hoy
                                        </p>
                                        <p className="text-sm font-bold">
                                            {currentStockDestino} platos
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] leading-none font-black tracking-widest text-primary uppercase">
                                            Recibirá hasta
                                        </p>
                                        <p className="text-sm font-bold text-primary">
                                            {newStockDestino} platos
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid gap-2">
                            <Label
                                htmlFor="cantidad"
                                className="text-[10px] font-bold tracking-widest uppercase"
                            >
                                Cantidad a Repartir
                            </Label>
                            <Input
                                id="cantidad"
                                type="number"
                                value={data.cantidad}
                                onChange={(e) =>
                                    setData('cantidad', e.target.value)
                                }
                                placeholder="0"
                                min="1"
                                className="h-11 rounded-xl border-2 text-lg font-black"
                            />
                            {errors.cantidad && (
                                <p className="text-sm text-red-500">
                                    {errors.cantidad}
                                </p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label
                                htmlFor="descripcion"
                                className="text-[10px] font-bold tracking-widest text-muted-foreground/60 uppercase"
                            >
                                Nota (Opcional)
                            </Label>
                            <Textarea
                                id="descripcion"
                                value={data.descripcion}
                                onChange={(e) =>
                                    setData('descripcion', e.target.value)
                                }
                                placeholder="Ej. Lote mediodía, producción extra..."
                                className="min-h-[80px] rounded-xl border-2"
                            />
                            {errors.descripcion && (
                                <p className="text-sm text-red-500">
                                    {errors.descripcion}
                                </p>
                            )}
                        </div>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="h-11 rounded-xl px-6 text-[10px] font-bold uppercase"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={
                                processing ||
                                (isReparticion && newStockOrigen < 0)
                            }
                            className="h-11 rounded-xl px-8 text-[10px] font-black uppercase shadow-lg shadow-primary/20"
                        >
                            {isReparticion
                                ? 'Confirmar Repartición'
                                : 'Confirmar Asignación'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
