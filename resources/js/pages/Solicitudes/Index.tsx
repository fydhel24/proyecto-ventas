import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Plus, Send, Search, Clock, CheckCircle2, AlertCircle, ArrowDownLeft, ArrowUpRight, Inbox, Package } from 'lucide-react';
import { useState, useEffect } from 'react';
import SolicitudModal from './Partials/SolicitudModal';
import { Badge } from '@/components/ui/badge';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
    PaginationEllipsis
} from '@/components/ui/pagination';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import solicitudesRoutes from '@/routes/solicitudes';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from 'sonner';

interface MovimientoInventario {
    id: number;
    inventario: {
        producto: { nombre: string };
        sucursal: { nombre_sucursal: string };
    };
    cantidad_movimiento: number;
}

interface Solicitud {
    id: number;
    tipo: string;
    estado: string;
    descripcion: string;
    created_at: string;
    user_origen: {
        name: string;
        sucursal?: { nombre_sucursal: string };
    };
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
    recibidas: PaginatedData<Solicitud>;
    enviadas: PaginatedData<Solicitud>;
    productos: { id: number; nombre: string }[];
    sucursales: { id: number; nombre_sucursal: string }[];
    filters: { search?: string };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Inventarios', href: '/inventarios' },
    { title: 'Solicitudes', href: '/solicitudes' },
];

export default function Index({ recibidas, enviadas, productos, sucursales, filters }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [search, setSearch] = useState(filters?.search || '');

    const handleConfirm = (id: number) => {
        if (confirm('¿Estás seguro de confirmar esta solicitud?')) {
            router.patch(solicitudesRoutes.confirm(id).url, {}, {
                preserveScroll: true,
                onSuccess: (page) => {
                    const flash = (page.props as any).flash;
                    if (flash?.success) {
                        toast.success(flash.success);
                        // Abrir PDF en nueva pestaña
                        window.open(solicitudesRoutes.voucher(id).url, '_blank');
                    } else if (flash?.error) {
                        toast.error(flash.error);
                    } else {
                        toast.success('Solicitud confirmada correctamente.');
                        window.open(solicitudesRoutes.voucher(id).url, '_blank');
                    }
                },
                onError: (errors) => {
                    const errorMsg = Object.values(errors)[0] || 'Error al confirmar la solicitud.';
                    toast.error(errorMsg);
                }
            });
        }
    };

    const handleRevert = (id: number) => {
        if (confirm('¿Estás seguro de REVERTIR esta solicitud? El stock será devuelto a la sucursal de origen.')) {
            router.patch(solicitudesRoutes.revert(id).url, {}, {
                preserveScroll: true,
                onSuccess: (page) => {
                    const flash = (page.props as any).flash;
                    if (flash?.success) {
                        toast.success(flash.success);
                    } else if (flash?.error) {
                        toast.error(flash.error);
                    } else {
                        toast.success('Solicitud revertida correctamente.');
                    }
                },
                onError: (errors) => {
                    const errorMsg = Object.values(errors)[0] || 'Error al revertir la solicitud.';
                    toast.error(errorMsg);
                }
            });
        }
    };

    const handlePageClick = (url: string | null) => {
        if (url) router.get(url, { search }, { preserveState: true });
    };

    const renderPagination = (paginated: PaginatedData<any>) => (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 border-t bg-muted/20">
            <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest bg-background/50 px-4 py-2 rounded-full border">
                {paginated.from || 0}-{paginated.to || 0} de {paginated.total} registros
            </div>
            <Pagination className="w-auto mx-0">
                <PaginationContent className="gap-1">
                    {paginated.links.map((link, i) => (
                        <PaginationItem key={i}>
                            <Button
                                variant={link.active ? "default" : "outline"}
                                size="sm"
                                disabled={!link.url}
                                onClick={() => handlePageClick(link.url)}
                                className="h-8 min-w-[32px]"
                            >
                                <span dangerouslySetInnerHTML={{ __html: link.label.replace('&laquo;', '').replace('&raquo;', '') }} />
                            </Button>
                        </PaginationItem>
                    ))}
                </PaginationContent>
            </Pagination>
        </div>
    );

    const renderTable = (data: Solicitud[], type: 'recibidas' | 'enviadas') => (
        <Table>
            <TableHeader className="bg-muted/30">
                <TableRow>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest px-6">Info</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest">
                        {type === 'recibidas' ? 'Solicitante' : 'Hacia'}
                    </TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest">Detalle del Pedido</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-center">Estado</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-right px-6">Acción</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={5} className="h-32 text-center opacity-40 italic">No hay registros.</TableCell>
                    </TableRow>
                ) : (
                    data.map((sol) => {
                        const item = sol.movimiento_inventarios[0];
                        return (
                            <TableRow key={sol.id} className="group hover:bg-muted/40 transition-colors">
                                <TableCell className="px-6">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase leading-none mb-1">
                                            #{sol.id}
                                        </span>
                                        <span className="text-xs font-medium">
                                            {new Date(sol.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-black text-sm uppercase text-foreground truncate max-w-[150px]">
                                            {type === 'recibidas' ? sol.user_origen.name : item?.inventario?.sucursal?.nombre_sucursal}
                                        </span>
                                        <span className="text-[9px] font-bold text-primary uppercase tracking-tighter">
                                            {type === 'recibidas' ? sol.user_origen.sucursal?.nombre_sucursal : 'Sucursal Destino'}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/5 rounded-lg border border-primary/10">
                                            <Package className="w-4 h-4 text-primary" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm leading-none mb-1">{item?.inventario?.producto?.nombre}</span>
                                            <span className="text-xs text-muted-foreground">Cantidad: <span className="font-black text-foreground">{item?.cantidad_movimiento}</span></span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-center">
                                    <Badge variant={sol.estado === 'PENDIENTE' ? 'secondary' : 'default'} className={cn(
                                        "px-3 py-1 font-black text-[9px] uppercase tracking-widest",
                                        sol.estado === 'PENDIENTE' ? "bg-orange-500/10 text-orange-600" : "bg-green-500/10 text-green-600"
                                    )}>
                                        {sol.estado}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right px-6">
                                    {type === 'recibidas' && sol.estado === 'PENDIENTE' && (
                                        <Button
                                            size="sm"
                                            onClick={() => handleConfirm(sol.id)}
                                            className="bg-green-600 hover:bg-green-700 text-white font-black text-[10px] uppercase tracking-widest h-8"
                                        >
                                            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Confirmar
                                        </Button>
                                    )}
                                    {sol.estado === 'CONFIRMADO' && (
                                        <div className="flex gap-2 justify-end">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => window.open(solicitudesRoutes.voucher(sol.id).url, '_blank')}
                                                className="font-black text-[10px] uppercase tracking-widest h-8"
                                            >
                                                <Package className="w-3.5 h-3.5 mr-1.5" /> Ficha PDF
                                            </Button>
                                            {/* Solo mostrar revertir en recibidas (la sucursal que confirmó es la que puede revertir) */}
                                            {type === 'recibidas' && (
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleRevert(sol.id)}
                                                    className="font-black text-[10px] uppercase tracking-widest h-8 bg-red-100 text-red-600 hover:bg-red-200 border-red-200"
                                                >
                                                    <AlertCircle className="w-3.5 h-3.5 mr-1.5" /> Revertir
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </TableCell>
                            </TableRow>
                        );
                    })
                )}
            </TableBody>
        </Table>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Solicitudes Inter-sucursales" />

            <div className="p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <h1 className="text-4xl font-black tracking-tight text-foreground flex items-center gap-3">
                                <span className="p-2 bg-primary/10 rounded-2xl">
                                    <Inbox className="w-9 h-9 text-primary rotate-[-10deg]" />
                                </span>
                                Panel de <span className="text-primary italic">Solicitudes</span>
                            </h1>
                            <p className="text-muted-foreground text-sm font-medium">Buzón de pedidos de mercadería entre sucursales.</p>
                        </div>
                        <Button onClick={() => setIsModalOpen(true)} className="h-12 px-8 font-black uppercase tracking-widest text-xs shadow-xl rounded-xl">
                            <Plus className="mr-2 h-5 w-5 stroke-[3]" /> Nueva Petición
                        </Button>
                    </div>

                    <Tabs defaultValue="recibidas" className="w-full">
                        <div className="flex items-center justify-between mb-6 gap-4">
                            <TabsList className="bg-muted/50 p-1 rounded-2xl border-2">
                                <TabsTrigger value="recibidas" className="rounded-xl px-6 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-lg transition-all">
                                    <ArrowDownLeft className="w-4 h-4 mr-2 text-blue-500" /> Recibidas
                                </TabsTrigger>
                                <TabsTrigger value="enviadas" className="rounded-xl px-4 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-lg transition-all">
                                    <ArrowUpRight className="w-4 h-4 mr-2 text-orange-500" /> Enviadas por Mí
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="recibidas">
                            <Card className="border-2 shadow-2xl rounded-3xl overflow-hidden">
                                <CardHeader className="bg-blue-500/[0.03] border-b">
                                    <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-blue-600">Pedidos Entrantes</CardTitle>
                                    <CardDescription>Mercadería que otras sucursales te están solicitando.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-0">
                                    {renderTable(recibidas.data, 'recibidas')}
                                    {renderPagination(recibidas)}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="enviadas">
                            <Card className="border-2 shadow-2xl rounded-3xl overflow-hidden">
                                <CardHeader className="bg-orange-500/[0.03] border-b">
                                    <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-orange-600">Tus Peticiones</CardTitle>
                                    <CardDescription>Seguimiento de pedidos que has realizado a otras sucursales.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-0">
                                    {renderTable(enviadas.data, 'enviadas')}
                                    {renderPagination(enviadas)}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            <SolicitudModal open={isModalOpen} productos={productos} sucursales={sucursales} onClose={() => setIsModalOpen(false)} />
        </AppLayout>
    );
}
