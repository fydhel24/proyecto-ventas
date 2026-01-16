// resources/js/Pages/Cuadernos/Index.tsx
import { PageProps } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

export default function CuadernosIndex({ cuadernos }: PageProps<{ cuadernos: Cuaderno[] }>) {
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
                  cuadernos.map((cuaderno) => (
                    <TableRow key={cuaderno.id}>
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
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
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