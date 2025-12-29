import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import productosRoutes from '@/routes/productos'; // <- Importar rutas Wayfinder
import { useForm } from '@inertiajs/react';

export default function Create({ marcas, categorias, colores }: any) {
    const { data, setData, post, processing, errors } = useForm({
        nombre: '',
        caracteristicas: '',
        marca_id: '',
        categoria_id: '',
        color_id: '',
        stock: 0,
        estado: true,
        fecha: '',
        precio_compra: '',
        precio_1: '',
        precio_2: '',
        precio_3: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(productosRoutes.store());
    };

    return (
        <AppLayout>
            <Card className="mx-auto max-w-4xl">
                <CardHeader>
                    <CardTitle>Crear Producto</CardTitle>
                </CardHeader>

                <CardContent>
                    <form onSubmit={submit} className="grid grid-cols-2 gap-4">
                        <Input
                            placeholder="Nombre"
                            value={data.nombre}
                            onChange={(e) => setData('nombre', e.target.value)}
                        />
                        <Input
                            placeholder="Características"
                            value={data.caracteristicas}
                            onChange={(e) =>
                                setData('caracteristicas', e.target.value)
                            }
                        />

                        <Select onValueChange={(v) => setData('marca_id', v)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Marca" />
                            </SelectTrigger>
                            <SelectContent>
                                {marcas.map((m: any) => (
                                    <SelectItem key={m.id} value={String(m.id)}>
                                        {m.nombre_marca}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            onValueChange={(v) => setData('categoria_id', v)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Categoría" />
                            </SelectTrigger>
                            <SelectContent>
                                {categorias.map((c: any) => (
                                    <SelectItem key={c.id} value={String(c.id)}>
                                        {c.nombre_cat}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select onValueChange={(v) => setData('color_id', v)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Color" />
                            </SelectTrigger>
                            <SelectContent>
                                {colores.map((c: any) => (
                                    <SelectItem key={c.id} value={String(c.id)}>
                                        {c.codigo_color}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Input
                            type="number"
                            placeholder="Stock"
                            value={data.stock}
                            onChange={(e) =>
                                setData('stock', Number(e.target.value))
                            }
                        />
                        <Input
                            type="date"
                            value={data.fecha}
                            onChange={(e) => setData('fecha', e.target.value)}
                        />
                        <Input
                            placeholder="Precio compra"
                            onChange={(e) =>
                                setData('precio_compra', e.target.value)
                            }
                        />
                        <Input
                            placeholder="Precio 1"
                            onChange={(e) =>
                                setData('precio_1', e.target.value)
                            }
                        />
                        <Input
                            placeholder="Precio 2"
                            onChange={(e) =>
                                setData('precio_2', e.target.value)
                            }
                        />
                        <Input
                            placeholder="Precio 3"
                            onChange={(e) =>
                                setData('precio_3', e.target.value)
                            }
                        />

                        <div className="col-span-2">
                            <Button disabled={processing} className="w-full">
                                Guardar
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
