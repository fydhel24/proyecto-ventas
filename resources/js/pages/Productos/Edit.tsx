import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { useForm, usePage } from '@inertiajs/react';
import {
  Check,
  ChevronDown,
  DollarSign,
  Hash,
  Image as ImageIcon,
  Landmark,
  Layers,
  Package,
  Plus,
  Tag,
  Type,
  X,
} from 'lucide-react';
import { useState } from 'react';

export default function Edit({
  producto,
  marcas: initialMarcas,
  categorias: initialCategorias,
  fotos: initialFotos,
}: {
  producto: any;
  marcas: any[];
  categorias: any[];
  fotos: any[];
}) {
  // ✅ Usa `post` y añade `_method: 'PUT'`
  const { data, setData, post, processing } = useForm({
    nombre: producto.nombre || '',
    caracteristicas: producto.caracteristicas || '',
    marca_id: String(producto.marca_id) || '',
    categoria_id: String(producto.categoria_id) || '',
    estado: producto.estado ?? true,
    fecha: producto.fecha ? new Date(producto.fecha).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    precio_compra: String(producto.precio_compra) || '',
    precio_1: String(producto.precio_1) || '',
    precio_2: producto.precio_2 ? String(producto.precio_2) : '',
    precio_3: producto.precio_3 ? String(producto.precio_3) : '',
    // stock removed
    fotos: [] as File[],
    _method: 'PUT', // 👈 Simula una petición PUT
  });

  const [marcas, setMarcas] = useState(initialMarcas);
  const [categorias, setCategorias] = useState(initialCategorias);
  const [modalMarcaOpen, setModalMarcaOpen] = useState(false);
  const [modalCategoriaOpen, setModalCategoriaOpen] = useState(false);
  const [mostrarMasPrecios, setMostrarMasPrecios] = useState(!!(producto.precio_2 || producto.precio_3));
  const [marcaOpen, setMarcaOpen] = useState(false);
  const [categoriaOpen, setCategoriaOpen] = useState(false);
  const [nuevaMarca, setNuevaMarca] = useState('');
  const [nuevaCategoria, setNuevaCategoria] = useState('');
  const { props } = usePage();
  const csrfToken = (props as any).csrf_token;

  const handleCreateMarca = async () => {
    if (!nuevaMarca.trim()) return;
    const res = await fetch('/marcas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': csrfToken || '',
      },
      body: JSON.stringify({ nombre_marca: nuevaMarca.trim() }),
    });

    if (res.ok) {
      const json = await res.json();
      setMarcas((prev) => [...prev, json.marca]);
      setNuevaMarca('');
      setModalMarcaOpen(false);
    }
  };

  const handleCreateCategoria = async () => {
    if (!nuevaCategoria.trim()) return;
    const res = await fetch('/categorias', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': csrfToken || '',
      },
      body: JSON.stringify({ nombre_cat: nuevaCategoria.trim() }),
    });

    if (res.ok) {
      const json = await res.json();
      setCategorias((prev) => [...prev, json.categoria]);
      setNuevaCategoria('');
      setModalCategoriaOpen(false);
    }
  };

  // ✅ Usa `post` (igual que en Create)
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    post(`/productos/${producto.id}`, { forceFormData: true });
  };

  return (
    <AppLayout>
      {/* Modales */}
      <Dialog open={modalMarcaOpen} onOpenChange={setModalMarcaOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Landmark className="h-5 w-5" />
              Nueva Marca
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="marca-input" className="text-sm font-medium">
              Nombre de la marca
            </Label>
            <Input
              id="marca-input"
              placeholder="Ej. Samsung, Apple"
              value={nuevaMarca}
              onChange={(e) => setNuevaMarca(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateMarca()}
              className="mt-1 h-10"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalMarcaOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateMarca} disabled={!nuevaMarca.trim()}>
              <Plus className="mr-2 h-4 w-4" />
              Agregar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={modalCategoriaOpen} onOpenChange={setModalCategoriaOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              Nueva Categoría
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="categoria-input" className="text-sm font-medium">
              Nombre de la categoría
            </Label>
            <Input
              id="categoria-input"
              placeholder="Ej. Electrónica, Ropa"
              value={nuevaCategoria}
              onChange={(e) => setNuevaCategoria(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateCategoria()}
              className="mt-1 h-10"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalCategoriaOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateCategoria} disabled={!nuevaCategoria.trim()}>
              <Plus className="mr-2 h-4 w-4" />
              Agregar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="mx-auto w-full max-w-4xl shadow-lg">
        <CardHeader className="border-b pb-6">
          <CardTitle className="flex items-center gap-2 text-2xl font-bold">
            <Package className="h-6 w-6" />
            Editar Producto
          </CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Modifica los datos del producto
          </p>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={submit} className="grid gap-6 md:grid-cols-2">
            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="nombre" className="flex items-center gap-1.5 text-sm font-medium">
                <Type className="h-4 w-4" />
                Nombre
              </Label>
              <Input
                id="nombre"
                placeholder="Nombre del producto"
                value={data.nombre}
                onChange={(e) => setData('nombre', e.target.value)}
                className="h-11"
              />
            </div>

            {/* Características */}
            <div className="space-y-2">
              <Label htmlFor="caracteristicas" className="flex items-center gap-1.5 text-sm font-medium">
                <Type className="h-4 w-4" />
                Características
              </Label>
              <Textarea
                id="caracteristicas"
                placeholder="Describe las características clave"
                value={data.caracteristicas}
                onChange={(e) => setData('caracteristicas', e.target.value)}
                className="h-11 min-h-[44px] resize-none"
              />
            </div>

            {/* Marca */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-sm font-medium">
                <Landmark className="h-4 w-4" />
                Marca
              </Label>
              <div className="flex gap-2">
                <Popover open={marcaOpen} onOpenChange={setMarcaOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={marcaOpen}
                      className="h-11 flex-1 justify-between"
                    >
                      {data.marca_id
                        ? marcas.find((m) => m.id === Number(data.marca_id))?.nombre_marca
                        : 'Seleccionar marca'}
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start" sideOffset={6}>
                    <Command>
                      <CommandInput placeholder="Buscar marca..." className="h-10" />
                      <CommandList className="max-h-60 overflow-y-auto">
                        <CommandEmpty>No se encontró la marca.</CommandEmpty>
                        <CommandGroup>
                          {marcas.map((m) => (
                            <CommandItem
                              key={m.id}
                              value={m.nombre_marca}
                              onSelect={(currentValue) => {
                                const selected = marcas.find(
                                  (marca) => marca.nombre_marca === currentValue
                                );
                                if (selected) {
                                  setData('marca_id', String(selected.id));
                                }
                                setMarcaOpen(false);
                              }}
                            >
                              {m.nombre_marca}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="h-11 w-11"
                  onClick={() => setModalMarcaOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Categoría */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-sm font-medium">
                <Layers className="h-4 w-4" />
                Categoría
              </Label>
              <div className="flex gap-2">
                <Popover open={categoriaOpen} onOpenChange={setCategoriaOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={categoriaOpen}
                      className="h-11 flex-1 justify-between"
                    >
                      {data.categoria_id
                        ? categorias.find((c) => c.id === Number(data.categoria_id))?.nombre_cat
                        : 'Seleccionar categoría'}
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start" sideOffset={6}>
                    <Command>
                      <CommandInput placeholder="Buscar categoría..." className="h-10" />
                      <CommandList className="max-h-60 overflow-y-auto">
                        <CommandEmpty>No se encontró la categoría.</CommandEmpty>
                        <CommandGroup>
                          {categorias.map((c) => (
                            <CommandItem
                              key={c.id}
                              value={c.nombre_cat}
                              onSelect={(currentValue) => {
                                const selected = categorias.find(
                                  (cat) => cat.nombre_cat === currentValue
                                );
                                if (selected) {
                                  setData('categoria_id', String(selected.id));
                                }
                                setCategoriaOpen(false);
                              }}
                            >
                              {c.nombre_cat}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="h-11 w-11"
                  onClick={() => setModalCategoriaOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Precio por unidad */}
            <div className="space-y-2">
              <Label htmlFor="precio_1" className="flex items-center gap-1.5 text-sm font-medium">
                <Tag className="h-4 w-4" />
                Precio
              </Label>
              <Input
                id="precio_1"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={data.precio_1}
                onChange={(e) => setData('precio_1', e.target.value)}
                className="h-11"
              />
            </div>
            {/* Fotos */}
            <div className="md:col-span-2">
              <Label className="mb-2 flex items-center gap-1.5 text-sm font-medium">
                <ImageIcon className="h-4 w-4" />
                Imágenes 
              </Label>
              <div
                className={`cursor-pointer rounded-lg border-2 border-dashed p-5 text-center transition-colors ${data.fotos.length > 0
                  ? 'border-primary/30 bg-primary/5'
                  : 'border-gray-300 hover:border-primary/50'
                  }`}
                onDrop={(e) => {
                  e.preventDefault();
                  const files = Array.from(e.dataTransfer.files).filter((file) =>
                    file.type.startsWith('image/')
                  );
                  if (files.length > 0) {
                    const newFiles = [...data.fotos, ...files];
                    setData('fotos', newFiles);
                  }
                }}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <ImageIcon className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {data.fotos.length === 0
                    ? 'Arrastra nuevas imágenes o haz clic para seleccionar'
                    : `${data.fotos.length} imagen(es) nueva(s) seleccionada(s)`}
                </p>
                <Input
                  id="file-input"
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    const validFiles = files.filter((file) => file.type.startsWith('image/'));
                    const newFiles = [...data.fotos, ...validFiles];
                    setData('fotos', newFiles);
                  }}
                />
              </div>

              {/* Mostrar fotos existentes */}
              {initialFotos.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Fotos actuales:</p>
                  <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
                    {initialFotos.map((foto: any) => (
                      <div key={foto.id} className="aspect-square overflow-hidden rounded-md border bg-muted">
                        <img
                          src={`/storage/${foto.url}`}
                          alt={`foto-${foto.id}`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {data.fotos.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Nuevas fotos a subir:</p>
                  <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
                    {data.fotos.map((file, index) => {
                      const url = URL.createObjectURL(file);
                      return (
                        <div key={index} className="group relative aspect-square overflow-hidden rounded-md border bg-muted">
                          <img
                            src={url}
                            alt={`preview-${index}`}
                            className="h-full w-full object-cover"
                            onLoad={() => URL.revokeObjectURL(url)}
                          />
                          <button
                            type="button"
                            className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white opacity-0 shadow transition-opacity group-hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              const updated = data.fotos.filter((_, i) => i !== index);
                              setData('fotos', updated);
                            }}
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Botón guardar */}
            <div className="md:col-span-2 pt-2">
              <Button type="submit" disabled={processing} className="h-11 w-full">
                {processing ? 'Guardando...' : 'Actualizar Producto'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
