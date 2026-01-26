import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Plus, Truck, Package, ArrowUpRight } from 'lucide-react';
import { useState } from 'react';
import EnvioModal from './Partials/EnvioModal';
import { Badge } from '@/components/ui/badge';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
} from '@/components/ui/pagination';
import { cn } from '@/lib/utils';
import enviosRoutes from '@/routes/envios';

interface MovimientoInventario {
    id: number;
    inventario: {
        producto: { nombre: string };
        sucursal: { nombre_sucursal: string };
    };
    cantidad_movimiento: number;
}

interface Envio {
    id: number;
    tipo: string;
    estado: string;
    descripcion: string;
    created_at: string;
    movimiento_inventarios: MovimientoInventario[];
}

interface PaginatedData<T> {
    data: T[];
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
    total: number;
    from: number;
    to: number;
}

interface Props {
    envios: PaginatedData<Envio>;
    productos: { id: number; nombre: string }[];
    sucursales: { id: number; nombre_sucursal: string }[];
    filters: { search?: string };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Inventarios', href: '/inventarios' },
    { title: 'Envíos', href: '/envios' },
];

export default function Index({ envios, productos, sucursales, filters }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handlePageClick = (url: string | null) => {
        if (url) router.get(url, {}, { preserveState: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Envíos de Stock" />

            <div className="p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <h1 className="text-4xl font-black tracking-tight text-foreground flex items-center gap-3">
                                <span className="p-2 bg-blue-500/10 rounded-2xl">
                                    <Truck className="w-9 h-9 text-blue-600 rotate-[-10deg]" />
                                </span>
                                Panel de<span className="text-blue-600 italic">Envíos</span>
                            </h1>
                            <p className="text-muted-foreground text-sm font-medium">Gestiona y registra el traspaso de stock hacia otras sucursales.</p>
                        </div>
                        <Button onClick={() => setIsModalOpen(true)} className="h-12 px-8 font-black uppercase tracking-widest text-xs shadow-xl rounded-xl bg-blue-600 hover:bg-blue-700">
                            <Plus className="mr-2 h-5 w-5 stroke-[3]" /> Nuevo Envío
                        </Button>
                    </div>

                    <Card className="border-2 shadow-2xl rounded-3xl overflow-hidden">
                        <CardHeader className="bg-blue-500/[0.03] border-b">
                            <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-blue-600">Historial de Salidas</CardTitle>
                            <CardDescription>Registro de mercancía enviada desde esta sucursal.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-muted/30">
                                    <TableRow>
                                        <TableHead className="font-black text-[10px] uppercase tracking-widest px-6">Envío #</TableHead>
                                        <TableHead className="font-black text-[10px] uppercase tracking-widest">Destino</TableHead>
                                        <TableHead className="font-black text-[10px] uppercase tracking-widest">Resumen Prod.</TableHead>
                                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-center">Estado</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {envios.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-32 text-center opacity-40 italic">No hay envíos registrados.</TableCell>
                                        </TableRow>
                                    ) : (
                                        envios.data.map((envio) => {
                                            // Agrupamos items por destino (aunque en teoría un envío es a un solo destino, el controller usa first)
                                            const primerItem = envio.movimiento_inventarios[0];
                                            const destino = primerItem?.inventario?.sucursal?.nombre_sucursal || 'Desconocido';

                                            return (
                                                <TableRow key={envio.id} className="group hover:bg-muted/40 transition-colors">
                                                    <TableCell className="px-6">
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] font-bold text-muted-foreground uppercase leading-none mb-1">
                                                                #{envio.id}
                                                            </span>
                                                            <span className="text-xs font-medium">
                                                                {new Date(envio.created_at).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <ArrowUpRight className="w-4 h-4 text-orange-500" />
                                                            <span className="font-black text-sm uppercase text-foreground">
                                                                {destino}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col gap-1">
                                                            {envio.movimiento_inventarios.map((item, idx) => (
                                                                // Solo mostramos items que son 'entradas' en destino, o 'salidas' en origen?
                                                                // En EnvioController store, creamos MovimientoInventario vinculado al DESTINO (cantidad_movimiento)
                                                                // Si index trae SOLO los detalles de destino, perfecto.
                                                                // Pero ojo: MovimientoInventario se crea vinculado al destino en el controlador.
                                                                <div key={idx} className="flex items-center gap-2 text-xs">
                                                                    <Package className="w-3 h-3 text-muted-foreground" />
                                                                    <span className="font-bold">{item.inventario?.producto?.nombre}</span>
                                                                    <span className="text-muted-foreground">x {item.cantidad_movimiento}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge variant="default" className="bg-green-500/10 text-green-600 hover:bg-green-500/20 px-3 py-1 font-black text-[9px] uppercase tracking-widest">
                                                            {envio.estado}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                            <div className="flex items-center justify-between p-4 border-t bg-muted/20">
                                <div className="text-xs text-muted-foreground">
                                    Mostrando {envios.from}-{envios.to} de {envios.total}
                                </div>
                                <div className="flex gap-2">
                                    {envios.links.map((link, i) => (
                                        <Button
                                            key={i}
                                            variant={link.active ? "default" : "outline"}
                                            size="sm"
                                            className="h-8 w-8 p-0"
                                            disabled={!link.url}
                                            onClick={() => handlePageClick(link.url)}
                                        >
                                            <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <EnvioModal open={isModalOpen} productos={productos} sucursales={sucursales} onClose={() => setIsModalOpen(false)} />
        </AppLayout>
    );
}
