import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useForm } from '@inertiajs/react';
import sucursalesRoutes from '@/routes/sucursales';
import { useEffect } from 'react';

interface Sucursal {
    id?: number;
    nombre_sucursal: string;
    direccion: string;
    estado: boolean;
}

interface Props {
    sucursal?: Sucursal | null;
    open: boolean;
    onClose: () => void;
}

export default function SucursalModal({ sucursal, open, onClose }: Props) {
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        nombre_sucursal: '',
        direccion: '',
        estado: true,
    });

    useEffect(() => {
        if (sucursal) {
            setData({
                nombre_sucursal: sucursal.nombre_sucursal,
                direccion: sucursal.direccion || '',
                estado: sucursal.estado ?? true,
            });
        } else {
            reset();
        }
        clearErrors();
    }, [sucursal, open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (sucursal && sucursal.id) {
            put(sucursalesRoutes.update(sucursal.id).url, {
                onSuccess: () => onClose(),
            });
        } else {
            post(sucursalesRoutes.store().url, {
                onSuccess: () => onClose(),
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{sucursal ? 'Editar Sucursal' : 'Nueva Sucursal'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="nombre_sucursal">Nombre de la Sucursal</Label>
                            <Input
                                id="nombre_sucursal"
                                value={data.nombre_sucursal}
                                onChange={(e) => setData('nombre_sucursal', e.target.value)}
                                placeholder="Ej. Sucursal Central"
                            />
                            {errors.nombre_sucursal && <p className="text-sm text-red-500">{errors.nombre_sucursal}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="direccion">Dirección</Label>
                            <Input
                                id="direccion"
                                value={data.direccion}
                                onChange={(e) => setData('direccion', e.target.value)}
                                placeholder="Ej. Calle 123, Zona Sur"
                            />
                            {errors.direccion && <p className="text-sm text-red-500">{errors.direccion}</p>}
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="estado"
                                checked={data.estado}
                                onCheckedChange={(checked) => setData('estado', checked)}
                            />
                            <Label htmlFor="estado">Activo</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {sucursal ? 'Actualizar' : 'Crear'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
