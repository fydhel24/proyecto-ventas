// resources/js/Pages/Cuadernos/Index.tsx
import { PageProps } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useState, useEffect } from 'react';

interface Producto {
  id: number;
  nombre: string;
  marca?: { nombre: string };
  categoria?: { nombre: string };
  color?: { nombre: string };
}

interface Cuaderno {
  id: number;
  nombre: string;
  ci: string;
  celular: string;
  departamento: string;
  provincia: string;
  tipo: string;
  estado: string;
  detalle: string | null;
  la_paz: boolean;
  enviado: boolean;
  p_listo: boolean;
  p_pendiente: boolean;
  created_at: string;
  productos: Producto[];
}

// Estado local para optimizar la UX
type LocalState = Record<number, Partial<Cuaderno>>;

export default function CuadernosIndex({ cuadernos }: PageProps<{ cuadernos: Cuaderno[] }>) {
  const [localState, setLocalState] = useState<LocalState>({});

  // Sincroniza el estado local con los datos iniciales
  useEffect(() => {
    const initialState: LocalState = {};
    cuadernos.forEach(c => {
      initialState[c.id] = {
        la_paz: c.la_paz,
        enviado: c.enviado,
        p_listo: c.p_listo,
        p_pendiente: c.p_pendiente,
      };
    });
    setLocalState(initialState);
  }, [cuadernos]);

  const updateCuadernoField = (id: number, field: keyof Cuaderno, value: boolean) => {
    // 1. Actualiza el estado local inmediatamente (optimistic UI)
    setLocalState(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));

    // 2. Envía al servidor
    router.patch(
      `/cuadernos/${id}`,
      { [field]: value },
      {
        preserveState: true,
        preserveScroll: true,
        // Si falla, revertimos el cambio
        onError: () => {
          setLocalState(prev => ({
            ...prev,
            [id]: {
              ...prev[id],
              [field]: !value, // revertir
            },
          }));
        },
        // Opcional: si quieres asegurar que el estado del servidor se impone
        // onSuccess: () => {}, // no es necesario si usas preserveState
      }
    );
  };

  return (
    <AppLayout>
      <Head title="Cuadernos" />
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Cuadernos Registrados</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>La Paz</TableHead>
                  <TableHead>Enviado</TableHead>
                  <TableHead>P. Listo</TableHead>
                  <TableHead>P. Pendiente</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>CI</TableHead>
                  <TableHead>Celular</TableHead>
                  <TableHead>Departamento</TableHead>
                  <TableHead>Productos</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cuadernos.length > 0 ? (
                  cuadernos.map((cuaderno) => {
                    const local = localState[cuaderno.id] || {};
                    const la_paz = local.la_paz ?? cuaderno.la_paz;
                    const enviado = local.enviado ?? cuaderno.enviado;
                    const p_listo = local.p_listo ?? cuaderno.p_listo;
                    const p_pendiente = local.p_pendiente ?? cuaderno.p_pendiente;

                    return (
                      <TableRow key={cuaderno.id}>
                        <TableCell>{cuaderno.id}</TableCell>

                        <TableCell>
                          <Checkbox
                            checked={la_paz}
                            onCheckedChange={(checked) => {
                              updateCuadernoField(cuaderno.id, 'la_paz', Boolean(checked));
                            }}
                          />
                        </TableCell>

                        <TableCell>
                          <Checkbox
                            checked={enviado}
                            onCheckedChange={(checked) => {
                              updateCuadernoField(cuaderno.id, 'enviado', Boolean(checked));
                            }}
                          />
                        </TableCell>

                        <TableCell>
                          <Checkbox
                            checked={p_listo}
                            onCheckedChange={(checked) => {
                              updateCuadernoField(cuaderno.id, 'p_listo', Boolean(checked));
                            }}
                          />
                        </TableCell>

                        <TableCell>
                          <Checkbox
                            checked={p_pendiente}
                            onCheckedChange={(checked) => {
                              updateCuadernoField(cuaderno.id, 'p_pendiente', Boolean(checked));
                            }}
                          />
                        </TableCell>

                        <TableCell>{cuaderno.nombre}</TableCell>
                        <TableCell>{cuaderno.ci}</TableCell>
                        <TableCell>{cuaderno.celular}</TableCell>
                        <TableCell>{cuaderno.departamento}</TableCell>
                        <TableCell>
                          {cuaderno.productos.map((p) => (
                            <div key={p.id} className="text-sm">
                              {p.nombre} ({p.marca?.nombre || 'Sin marca'})
                            </div>
                          ))}
                        </TableCell>
                        <TableCell>{cuaderno.estado}</TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center">
                      No hay cuadernos registrados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}