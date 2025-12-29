import { useForm } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Edit({ producto, marcas, categorias, colores }: any) {
  const { data, setData, put, processing } = useForm({
    nombre: producto.nombre,
    caracteristicas: producto.caracteristicas ?? "",
    marca_id: String(producto.marca_id),
    categoria_id: String(producto.categoria_id),
    color_id: String(producto.color_id),
    stock: producto.stock,
    estado: producto.estado,
    fecha: producto.fecha,
    precio_compra: producto.precio_compra,
    precio_1: producto.precio_1,
    precio_2: producto.precio_2 ?? "",
    precio_3: producto.precio_3 ?? "",
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    put(route("productos.update", producto.id));
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Editar Producto</CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={submit} className="grid grid-cols-2 gap-4">
          <Input
            value={data.nombre}
            onChange={(e) => setData("nombre", e.target.value)}
          />
          <Input
            value={data.caracteristicas}
            onChange={(e) => setData("caracteristicas", e.target.value)}
          />

          <Select
            defaultValue={data.marca_id}
            onValueChange={(v) => setData("marca_id", v)}
          >
            <SelectTrigger>
              <SelectValue />
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
            defaultValue={data.categoria_id}
            onValueChange={(v) => setData("categoria_id", v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categorias.map((c: any) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.nombre_cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            defaultValue={data.color_id}
            onValueChange={(v) => setData("color_id", v)}
          >
            <SelectTrigger>
              <SelectValue />
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
            value={data.stock}
            onChange={(e) => setData("stock", Number(e.target.value))}
          />

          <Input
            type="date"
            value={data.fecha}
            onChange={(e) => setData("fecha", e.target.value)}
          />

          <Input onChange={(e) => setData("precio_compra", e.target.value)} />
          <Input onChange={(e) => setData("precio_1", e.target.value)} />
          <Input onChange={(e) => setData("precio_2", e.target.value)} />
          <Input onChange={(e) => setData("precio_3", e.target.value)} />

          <div className="col-span-2">
            <Button disabled={processing} className="w-full">
              Actualizar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
