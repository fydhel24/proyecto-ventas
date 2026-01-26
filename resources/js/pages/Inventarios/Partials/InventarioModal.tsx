import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from '@inertiajs/react';
import inventariosRoutes from '@/routes/inventarios';
import { useEffect } from 'react';

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

export default function InventarioModal({ productos, sucursales, open, onClose }: Props) {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        sucursal_id: '',
        producto_id: '',
        cantidad: '',
        descripcion: '',
    });

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
                            <Select
                                value={data.producto_id}
                                onValueChange={(value) => setData('producto_id', value)}
                            >
                                <SelectTrigger id="producto">
                                    <SelectValue placeholder="Seleccionar producto" />
                                </SelectTrigger>
                                <SelectContent>
                                    {productos.map((p) => (
                                        <SelectItem key={p.id} value={p.id.toString()}>
                                            {p.nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.producto_id && <p className="text-sm text-red-500">{errors.producto_id}</p>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="cantidad">Cantidad</Label>
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
