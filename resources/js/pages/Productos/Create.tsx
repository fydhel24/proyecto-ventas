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
  Activity,
  Calendar,
  ShieldCheck,
} from 'lucide-react';
import { useState } from 'react';

const today = new Date().toISOString().split('T')[0];

export default function Create({
  laboratorios: initialLaboratorios,
  categorias: initialCategorias,
}: {
  laboratorios: any[];
  categorias: any[];
}) {
  const { data, setData, post, processing, errors } = useForm({
    nombre: '',
    principio_activo: '',
    concentracion: '',
    caracteristicas: '',
    laboratorio_id: '',
    categoria_id: '',
    lote: '',
    fecha_vencimiento: '',
    registro_sanitario: '',
    estado: true,
    fecha: today,
    precio_compra: '',
    precio_1: '',
    precio_2: '',
    precio_3: '',
    fotos: [] as File[],
  });

  const [laboratorios, setLaboratorios] = useState(initialLaboratorios);
  const [categorias, setCategorias] = useState(initialCategorias);
  const [modalLaboratorioOpen, setModalLaboratorioOpen] = useState(false);
  const [modalCategoriaOpen, setModalCategoriaOpen] = useState(false);
  const [mostrarMasPrecios, setMostrarMasPrecios] = useState(false);
  const [laboratorioOpen, setLaboratorioOpen] = useState(false);
  const [categoriaOpen, setCategoriaOpen] = useState(false);

  const [nuevoLaboratorio, setNuevoLaboratorio] = useState('');
  const [nuevaCategoria, setNuevaCategoria] = useState('');
  const { props } = usePage();
  const csrfToken = (props as any).csrf_token;

  const handleCreateLaboratorio = async () => {
    if (!nuevoLaboratorio.trim()) return;
    const res = await fetch('/laboratorios', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': csrfToken || '',
      },
      body: JSON.stringify({ nombre_lab: nuevoLaboratorio.trim() }),
    });

    if (res.ok) {
      const json = await res.json();
      setLaboratorios((prev) => [...prev, json]);
      setNuevoLaboratorio('');
      setModalLaboratorioOpen(false);
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

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/productos', { forceFormData: true });
  };

  return (
    <AppLayout>
      {/* Modales */}
      <Dialog open={modalLaboratorioOpen} onOpenChange={setModalLaboratorioOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Landmark className="h-5 w-5" />
              Nuevo Laboratorio
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="lab-input" className="text-sm font-medium">
              Nombre del laboratorio
            </Label>
            <Input
              id="lab-input"
              placeholder="Ej. Bagó, Vita"
              value={nuevoLaboratorio}
              onChange={(e) => setNuevoLaboratorio(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateLaboratorio()}
              className="mt-1 h-10"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalLaboratorioOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateLaboratorio} disabled={!nuevoLaboratorio.trim()}>
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
            <Activity className="h-6 w-6 text-primary" />
            Nuevo Medicamento
          </CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Ingresa los datos del producto farmacéutico
          </p>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={submit} className="grid gap-6 md:grid-cols-2">
            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="nombre" className="flex items-center gap-1.5 text-sm font-medium">
                <Type className="h-4 w-4" />
                Nombre Comercial
              </Label>
              <Input
                id="nombre"
                placeholder="Ej. Paracetamol Bagó"
                value={data.nombre}
                onChange={(e) => setData('nombre', e.target.value)}
                className={`h-11 ${errors.nombre ? 'border-red-500' : ''}`}
              />
              {errors.nombre && <p className="text-xs text-red-500">{errors.nombre}</p>}
            </div>

            {/* Características */}
            <div className="space-y-2">
              <Label htmlFor="principio_activo" className="flex items-center gap-1.5 text-sm font-medium">
                <Activity className="h-4 w-4" />
                Principio Activo
              </Label>
              <Input
                id="principio_activo"
                placeholder="Ej. Paracetamol"
                value={data.principio_activo}
                onChange={(e) => setData('principio_activo', e.target.value)}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="concentracion" className="flex items-center gap-1.5 text-sm font-medium">
                <Activity className="h-4 w-4" />
                Concentración
              </Label>
              <Input
                id="concentracion"
                placeholder="Ej. 500mg"
                value={data.concentracion}
                onChange={(e) => setData('concentracion', e.target.value)}
                className="h-11"
              />
            </div>

            {/* Laboratorio */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-sm font-medium">
                <Landmark className="h-4 w-4" />
                Laboratorio
              </Label>
              <div className="flex gap-2">
                <Popover open={laboratorioOpen} onOpenChange={setLaboratorioOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={laboratorioOpen}
                      className="h-11 flex-1 justify-between"
                    >
                      {data.laboratorio_id
                        ? laboratorios.find((l) => l.id === Number(data.laboratorio_id))?.nombre_lab
                        : 'Seleccionar laboratorio'}
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start" sideOffset={6}>
                    <Command>
                      <CommandInput placeholder="Buscar laboratorio..." className="h-10" />
                      <CommandList className="max-h-60 overflow-y-auto">
                        <CommandEmpty>No se encontró el laboratorio.</CommandEmpty>
                        <CommandGroup>
                          {laboratorios.map((l) => (
                            <CommandItem
                              key={l.id}
                              value={l.nombre_lab}
                              onSelect={(currentValue) => {
                                const selected = laboratorios.find(
                                  (lab) => lab.nombre_lab === currentValue
                                );
                                if (selected) {
                                  setData('laboratorio_id', String(selected.id));
                                }
                                setLaboratorioOpen(false);
                              }}
                            >
                              {l.nombre_lab}
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
                  onClick={() => setModalLaboratorioOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {errors.laboratorio_id && <p className="text-xs text-red-500">{errors.laboratorio_id}</p>}
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
              {errors.categoria_id && <p className="text-xs text-red-500">{errors.categoria_id}</p>}
            </div>

            {/* Precio de compra */}
            <div className="space-y-2">
              <Label htmlFor="precio_compra" className="flex items-center gap-1.5 text-sm font-medium">
                <DollarSign className="h-4 w-4" />
                Precio de compra
              </Label>
              <Input
                id="precio_compra"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={data.precio_compra}
                onChange={(e) => setData('precio_compra', e.target.value)}
                className={`h-11 ${errors.precio_compra ? 'border-red-500' : ''}`}
              />
              {errors.precio_compra && <p className="text-xs text-red-500">{errors.precio_compra}</p>}
            </div>

            {/* Stock Inicial */}
            {/* <div className="space-y-2">
              <Label htmlFor="stock" className="flex items-center gap-1.5 text-sm font-medium">
                <Hash className="h-4 w-4" />
                Stock Inicial
              </Label>
              <Input
                id="stock"
                type="number"
                min="0"
                placeholder="0"
                value={data.stock}
                onChange={(e) => setData('stock', e.target.value)}
                className="h-11"
              />
            </div> */}

            {/* Lote */}
            <div className="space-y-2">
              <Label htmlFor="lote" className="flex items-center gap-1.5 text-sm font-medium">
                <Hash className="h-4 w-4" />
                Lote
              </Label>
              <Input
                id="lote"
                placeholder="Ej. L-123456"
                value={data.lote}
                onChange={(e) => setData('lote', e.target.value)}
                className="h-11"
              />
            </div>

            {/* Fecha Vencimiento */}
            <div className="space-y-2">
              <Label htmlFor="fecha_vencimiento" className="flex items-center gap-1.5 text-sm font-medium">
                <Calendar className="h-4 w-4" />
                Fecha de Vencimiento
              </Label>
              <Input
                id="fecha_vencimiento"
                type="date"
                value={data.fecha_vencimiento}
                onChange={(e) => setData('fecha_vencimiento', e.target.value)}
                className="h-11"
              />
            </div>

            {/* Registro Sanitario */}
            <div className="space-y-2">
              <Label htmlFor="registro_sanitario" className="flex items-center gap-1.5 text-sm font-medium">
                <ShieldCheck className="h-4 w-4" />
                Registro Sanitario
              </Label>
              <Input
                id="registro_sanitario"
                placeholder="Ej. NN-12345/2024"
                value={data.registro_sanitario}
                onChange={(e) => setData('registro_sanitario', e.target.value)}
                className="h-11"
              />
            </div>

            {/* Precio por unidad */}
            <div className="space-y-2">
              <Label htmlFor="precio_1" className="flex items-center gap-1.5 text-sm font-medium">
                <Tag className="h-4 w-4" />
                Precio de Venta (Unidad)
              </Label>
              <Input
                id="precio_1"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={data.precio_1}
                onChange={(e) => setData('precio_1', e.target.value)}
                className={`h-11 ${errors.precio_1 ? 'border-red-500' : ''}`}
              />
              {errors.precio_1 && <p className="text-xs text-red-500">{errors.precio_1}</p>}
            </div>


            {/* Botón precios adicionales */}
            <div className="md:col-span-2 flex items-center">
              <Button
                type="button"
                variant={mostrarMasPrecios ? 'secondary' : 'outline'}
                size="sm"
                className="h-9 px-3"
                onClick={() => setMostrarMasPrecios(!mostrarMasPrecios)}
              >
                {mostrarMasPrecios ? (
                  <Check className="mr-2 h-3.5 w-3.5" />
                ) : (
                  <X className="mr-2 h-3.5 w-3.5" />
                )}
                {mostrarMasPrecios
                  ? 'Ocultar precios adicionales'
                  : 'Asignar más precios'}
              </Button>
            </div>

            {/* Precios adicionales */}
            {mostrarMasPrecios && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="precio_2" className="flex items-center gap-1.5 text-sm font-medium">
                    <Tag className="h-4 w-4" />
                    Precio por docena
                  </Label>
                  <Input
                    id="precio_2"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={data.precio_2}
                    onChange={(e) => setData('precio_2', e.target.value)}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="precio_3" className="flex items-center gap-1.5 text-sm font-medium">
                    <Tag className="h-4 w-4" />
                    Precio por mayor
                  </Label>
                  <Input
                    id="precio_3"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={data.precio_3}
                    onChange={(e) => setData('precio_3', e.target.value)}
                    className="h-11"
                  />
                </div>
              </>
            )}

            {/* Fotos */}
            <div className="md:col-span-2">
              <Label className="mb-2 flex items-center gap-1.5 text-sm font-medium">
                <ImageIcon className="h-4 w-4" />
                Imágenes del producto
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
                    ? 'Arrastra imágenes aquí o haz clic para seleccionar'
                    : `${data.fotos.length} imagen(es) agregada(s)`}
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

              {data.fotos.length > 0 && (
                <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5">
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
              )}
            </div>

            {/* Botón guardar */}
            <div className="md:col-span-2 pt-2">
              <Button type="submit" disabled={processing} className="h-11 w-full bg-primary hover:bg-primary/90">
                {processing ? 'Guardando...' : 'Guardar Medicamento'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
