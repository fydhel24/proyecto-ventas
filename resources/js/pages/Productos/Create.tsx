import ModalForm from '@/components/ModalForm';
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
import { useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Create({
    marcas: initialMarcas,
    categorias: initialCategorias,
    colores,
}: any) {
    const { data, setData, post, processing } = useForm({
        nombre: '',
        caracteristicas: '',
        marca_id: '',
        categoria_id: '',
        color_id: '',
        stock: '',
        estado: true,
        fecha: '',
        precio_compra: '',
        precio_1: '',
        precio_2: '',
        precio_3: '',
    });


    const [marcas, setMarcas] = useState(initialMarcas);
    const [categorias, setCategorias] = useState(initialCategorias);
    const [modalMarcaOpen, setModalMarcaOpen] = useState(false);
    const [modalCategoriaOpen, setModalCategoriaOpen] = useState(false);

    // useEffect para seleccionar automáticamente la última marca agregada
    useEffect(() => {
        if (marcas.length && !marcas.find(m => m.id === Number(data.marca_id))) {
            const ultimaMarca = marcas[marcas.length - 1];
            setData('marca_id', String(ultimaMarca.id));
        }
    }, [marcas]);

    // useEffect para seleccionar automáticamente la última categoría agregada
    useEffect(() => {
        if (categorias.length && !categorias.find(c => c.id === Number(data.categoria_id))) {
            const ultimaCategoria = categorias[categorias.length - 1];
            setData('categoria_id', String(ultimaCategoria.id));
        }
    }, [categorias]);

    const handleCreateMarca = async (nombre_marca: string) => {
        const res = await fetch('/marcas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
            body: JSON.stringify({ nombre_marca }),
        });

        const json = await res.json();
        setMarcas(prev => [...prev, json.marca]);
        setModalMarcaOpen(false);
    };

    const handleCreateCategoria = async (nombre_cat: string) => {
        const res = await fetch('/categorias', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
            body: JSON.stringify({ nombre_cat }),
        });

        const json = await res.json();
        setCategorias(prev => [...prev, json.categoria]);
        setModalCategoriaOpen(false);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/productos'); // Ajusta según tu ruta
    };

    return (
        <AppLayout>
            <ModalForm
                title="Nueva Marca"
                placeholder="Nombre de la Marca"
                open={modalMarcaOpen}
                onClose={() => setModalMarcaOpen(false)}
                onSave={handleCreateMarca}
            />
            <ModalForm
                title="Nueva Categoría"
                placeholder="Nombre de la Categoría"
                open={modalCategoriaOpen}
                onClose={() => setModalCategoriaOpen(false)}
                onSave={handleCreateCategoria}
            />

            <Card className="mx-auto max-w-4xl">
                <CardHeader>
                    <CardTitle>Crear Producto</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={submit} className="grid grid-cols-2 gap-4">
                        <Input
                            placeholder="Nombre"
                            value={data.nombre}
                            onChange={e => setData('nombre', e.target.value)}
                        />
                        <Input
                            placeholder="Características"
                            value={data.caracteristicas}
                            onChange={e => setData('caracteristicas', e.target.value)}
                        />

                        {/* Marca */}
                        <div className="flex items-center gap-2">
                            <Select
                                value={data.marca_id}
                                onValueChange={v => setData('marca_id', v)}
                                className="flex-1"
                            >
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
                            <Button type="button" size="sm" onClick={() => setModalMarcaOpen(true)}>+</Button>
                        </div>

                        {/* Categoría */}
                        <div className="flex items-center gap-2">
                            <Select
                                value={data.categoria_id}
                                onValueChange={v => setData('categoria_id', v)}
                                className="flex-1"
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
                            <Button type="button" size="sm" onClick={() => setModalCategoriaOpen(true)}>+</Button>
                        </div>

                        {/* Color */}
                        <Select onValueChange={v => setData('color_id', v)}>
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
                            onChange={e => setData('stock', Number(e.target.value))}
                        />
                        <Input
                            type="date"
                            value={data.fecha}
                            onChange={e => setData('fecha', e.target.value)}
                        />
                        <Input
                            placeholder="Precio compra"
                            onChange={e => setData('precio_compra', e.target.value)}
                        />
                        <Input
                            placeholder="Precio 1"
                            onChange={e => setData('precio_1', e.target.value)}
                        />
                        <Input
                            placeholder="Precio 2"
                            onChange={e => setData('precio_2', e.target.value)}
                        />
                        <Input
                            placeholder="Precio 3"
                            onChange={e => setData('precio_3', e.target.value)}
                        />

                        <div className="col-span-2">
                            <Button disabled={processing} className="w-full">Guardar</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
