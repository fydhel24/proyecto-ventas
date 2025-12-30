import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import productosRoutes from '@/routes/productos'; // <- Tus rutas Wayfinder
import { Link, router } from '@inertiajs/react';

export default function Index({ productos }: any) {
    const eliminar = (id: number) => {
        if (confirm('¿Eliminar este producto?')) {
            router.delete(productosRoutes.destroy(id));
        }
    };

    return (
        <AppLayout>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Productos</CardTitle>
                    <Link href={productosRoutes.create()}>
                        <Button>Nuevo Producto</Button>
                    </Link>
                </CardHeader>

                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Marca</TableHead>
                                <TableHead>Categoría</TableHead>
                                <TableHead>Stock</TableHead>
                                <TableHead>Precio</TableHead>
                                <TableHead className="text-right">
                                    Acciones
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {productos.data.map((p: any) => (
                                <TableRow key={p.id}>
                                    <TableCell>{p.nombre}</TableCell>
                                    <TableCell>
                                        {p.marca?.nombre_marca}
                                    </TableCell>
                                    <TableCell>
                                        {p.categoria?.nombre_cat}
                                    </TableCell>
                                    <TableCell>{p.stock}</TableCell>
                                    <TableCell>{p.precio_1}</TableCell>
                                    <TableCell className="space-x-2 text-right">
                                        <Link href={productosRoutes.edit(p.id)}>
                                            <Button variant="outline" size="sm">
                                                Editar
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => eliminar(p.id)}
                                        >
                                            Eliminar
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
                
            </Card>
        </AppLayout>
    );
}
