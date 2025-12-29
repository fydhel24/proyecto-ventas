import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const today = new Date().toISOString().split('T')[0];

export default function Create({
    marcas: initialMarcas,
    categorias: initialCategorias,
}: {
    marcas: any[];
    categorias: any[];
}) {
    const { data, setData, post, processing } = useForm({
        nombre: '',
        caracteristicas: '',
        marca_id: '',
        categoria_id: '',
        stock: '',
        estado: true,
        fecha: today,
        precio_compra: '',
        precio_1: '',
        precio_2: '',
        precio_3: '',
        fotos: [] as File[],
    });

    const [marcas, setMarcas] = useState(initialMarcas);
    const [categorias, setCategorias] = useState(initialCategorias);
    const [modalMarcaOpen, setModalMarcaOpen] = useState(false);
    const [modalCategoriaOpen, setModalCategoriaOpen] = useState(false);

    // 🔍 Estados para la búsqueda
    const [marcaSearch, setMarcaSearch] = useState('');
    const [categoriaSearch, setCategoriaSearch] = useState('');

    const [nuevaMarca, setNuevaMarca] = useState('');
    const [nuevaCategoria, setNuevaCategoria] = useState('');

    useEffect(() => {
        if (
            marcas.length &&
            !marcas.find((m) => m.id === Number(data.marca_id))
        ) {
            setData('marca_id', String(marcas[marcas.length - 1].id));
        }
    }, [marcas]);

    useEffect(() => {
        if (
            categorias.length &&
            !categorias.find((c) => c.id === Number(data.categoria_id))
        ) {
            setData(
                'categoria_id',
                String(categorias[categorias.length - 1].id),
            );
        }
    }, [categorias]);

    const handleCreateMarca = async () => {
        if (!nuevaMarca.trim()) return;
        const res = await fetch('/marcas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN':
                    document
                        .querySelector('meta[name="csrf-token"]')
                        ?.getAttribute('content') || '',
            },
            body: JSON.stringify({ nombre_marca: nuevaMarca.trim() }),
        });

        if (res.ok) {
            const json = await res.json();
            setMarcas((prev) => [...prev, json.marca]);
            setNuevaMarca('');
            setModalMarcaOpen(false);
            setMarcaSearch(''); // Limpia la búsqueda al agregar
        }
    };

    const handleCreateCategoria = async () => {
        if (!nuevaCategoria.trim()) return;
        const res = await fetch('/categorias', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN':
                    document
                        .querySelector('meta[name="csrf-token"]')
                        ?.getAttribute('content') || '',
            },
            body: JSON.stringify({ nombre_cat: nuevaCategoria.trim() }),
        });

        if (res.ok) {
            const json = await res.json();
            setCategorias((prev) => [...prev, json.categoria]);
            setNuevaCategoria('');
            setModalCategoriaOpen(false);
            setCategoriaSearch(''); // Limpia la búsqueda al agregar
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/productos', { forceFormData: true });
    };

    return (
        <AppLayout>
            {/* Modal Nueva Marca */}
            <Dialog open={modalMarcaOpen} onOpenChange={setModalMarcaOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Nueva Marca</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Label
                            htmlFor="marca-input"
                            className="mb-2 block text-sm font-medium text-muted-foreground"
                        >
                            Nombre de la marca
                        </Label>
                        <Input
                            id="marca-input"
                            placeholder="Ej. Samsung, Apple"
                            value={nuevaMarca}
                            onChange={(e) => setNuevaMarca(e.target.value)}
                            onKeyDown={(e) =>
                                e.key === 'Enter' && handleCreateMarca()
                            }
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setModalMarcaOpen(false)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleCreateMarca}
                            disabled={!nuevaMarca.trim()}
                        >
                            Guardar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal Nueva Categoría */}
            <Dialog
                open={modalCategoriaOpen}
                onOpenChange={setModalCategoriaOpen}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Nueva Categoría</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Label
                            htmlFor="categoria-input"
                            className="mb-2 block text-sm font-medium text-muted-foreground"
                        >
                            Nombre de la categoría
                        </Label>
                        <Input
                            id="categoria-input"
                            placeholder="Ej. Electrónica, Ropa"
                            value={nuevaCategoria}
                            onChange={(e) => setNuevaCategoria(e.target.value)}
                            onKeyDown={(e) =>
                                e.key === 'Enter' && handleCreateCategoria()
                            }
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setModalCategoriaOpen(false)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleCreateCategoria}
                            disabled={!nuevaCategoria.trim()}
                        >
                            Guardar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

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

                        <Textarea
                            placeholder="Características"
                            value={data.caracteristicas}
                            onChange={(e) =>
                                setData('caracteristicas', e.target.value)
                            }
                            className="h-20"
                        />

                        {/* 🔍 Marca con búsqueda integrada */}
                        <div className="flex gap-2">
                            <Select
                                value={data.marca_id}
                                onValueChange={(v) => setData('marca_id', v)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Marca" />
                                </SelectTrigger>
                                <SelectContent>
                                    <div className="p-1">
                                        <Input
                                            placeholder="Buscar marca..."
                                            value={marcaSearch}
                                            onChange={(e) =>
                                                setMarcaSearch(e.target.value)
                                            }
                                            className="h-7 text-xs"
                                        />
                                    </div>
                                    {marcas
                                        .filter((m) =>
                                            m.nombre_marca
                                                .toLowerCase()
                                                .includes(
                                                    marcaSearch.toLowerCase(),
                                                ),
                                        )
                                        .map((m) => (
                                            <SelectItem
                                                key={m.id}
                                                value={String(m.id)}
                                            >
                                                {m.nombre_marca}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                            <Button
                                type="button"
                                size="sm"
                                onClick={() => setModalMarcaOpen(true)}
                            >
                                +
                            </Button>
                        </div>

                        {/* 🔍 Categoría con búsqueda integrada */}
                        <div className="flex gap-2">
                            <Select
                                value={data.categoria_id}
                                onValueChange={(v) =>
                                    setData('categoria_id', v)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Categoría" />
                                </SelectTrigger>
                                <SelectContent>
                                    <div className="p-1">
                                        <Input
                                            placeholder="Buscar categoría..."
                                            value={categoriaSearch}
                                            onChange={(e) =>
                                                setCategoriaSearch(
                                                    e.target.value,
                                                )
                                            }
                                            className="h-7 text-xs"
                                        />
                                    </div>
                                    {categorias
                                        .filter((c) =>
                                            c.nombre_cat
                                                .toLowerCase()
                                                .includes(
                                                    categoriaSearch.toLowerCase(),
                                                ),
                                        )
                                        .map((c) => (
                                            <SelectItem
                                                key={c.id}
                                                value={String(c.id)}
                                            >
                                                {c.nombre_cat}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                            <Button
                                type="button"
                                size="sm"
                                onClick={() => setModalCategoriaOpen(true)}
                            >
                                +
                            </Button>
                        </div>

                        <Input
                            type="number"
                            placeholder="Stock"
                            onChange={(e) => setData('stock', e.target.value)}
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

                        {/* Fotos */}
                        <div className="col-span-2">
                            <div
                                className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                                    data.fotos.length > 0
                                        ? 'border-green-500 bg-green-50'
                                        : 'border-gray-300 hover:border-gray-400'
                                }`}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    const files = Array.from(
                                        e.dataTransfer.files,
                                    ).filter((file) =>
                                        file.type.startsWith('image/'),
                                    );
                                    if (files.length > 0) {
                                        const newFiles = [
                                            ...data.fotos,
                                            ...files,
                                        ];
                                        setData('fotos', newFiles);
                                    }
                                }}
                                onDragOver={(e) => e.preventDefault()}
                                onClick={() =>
                                    document
                                        .getElementById('file-input')
                                        ?.click()
                                }
                            >
                                <p className="mb-2 text-sm text-gray-500">
                                    {data.fotos.length === 0
                                        ? 'Arrastra imágenes aquí o haz clic para seleccionar'
                                        : `${data.fotos.length} imagen(es) seleccionada(s)`}
                                </p>

                                <Input
                                    id="file-input"
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const files = Array.from(
                                            e.target.files || [],
                                        );
                                        const validFiles = files.filter(
                                            (file) =>
                                                file.type.startsWith('image/'),
                                        );
                                        const newFiles = [
                                            ...data.fotos,
                                            ...validFiles,
                                        ];
                                        setData('fotos', newFiles);
                                    }}
                                />

                                {data.fotos.length > 0 && (
                                    <div className="mt-4 grid max-h-40 grid-cols-4 gap-2 overflow-y-auto">
                                        {data.fotos.map((file, index) => {
                                            const url =
                                                URL.createObjectURL(file);
                                            return (
                                                <div
                                                    key={index}
                                                    className="group relative"
                                                >
                                                    <img
                                                        src={url}
                                                        alt={`preview-${index}`}
                                                        className="h-20 w-full rounded border object-cover"
                                                        onLoad={() =>
                                                            URL.revokeObjectURL(
                                                                url,
                                                            )
                                                        }
                                                    />
                                                    <button
                                                        type="button"
                                                        className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity group-hover:opacity-100"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const updated =
                                                                data.fotos.filter(
                                                                    (_, i) =>
                                                                        i !==
                                                                        index,
                                                                );
                                                            setData(
                                                                'fotos',
                                                                updated,
                                                            );
                                                        }}
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

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
