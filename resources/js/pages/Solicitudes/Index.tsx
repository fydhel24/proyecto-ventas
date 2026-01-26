import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Plus, Send, Search, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
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

interface Solicitud {
    id: number;
    tipo: string;
    estado: string;
    descripcion: string;
    created_at: string;
    user_origen: { name: string };
    user_destino?: { name: string };
}

interface Producto {
    id: number;
    nombre: string;
}

interface Sucursal {
    id: number;
    nombre_sucursal: string;
}

interface Props {
    solicitudes: {
        data: Solicitud[];
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
        total: number;
        from: number;
        to: number;
    };
    productos: Producto[];
    sucursales: Sucursal[];
    filters: {
        search?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Inventarios',
        href: '/inventarios',
    },
    {
        title: 'Solicitudes',
        href: '/solicitudes',
    },
];

export default function Index({ solicitudes, productos, sucursales, filters }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [search, setSearch] = useState(filters?.search || '');

    // Búsqueda con debounce
    useEffect(() => {
        const handler = setTimeout(() => {
            router.get(solicitudesRoutes.index().url, { search }, { preserveState: true, replace: true });
        }, 300);
        return () => clearTimeout(handler);
    }, [search]);

    const handlePageClick = (url: string | null) => {
        if (url) {
            router.get(url, { search }, { preserveState: true });
        }
    };

    const renderPaginationItems = () => {
        return solicitudes.links.map((link, index) => {
            const label = link.label
                .replace('&laquo;', 'Anterior')
                .replace('&raquo;', 'Siguiente')
                .replace('&hellip;', '...');

            const isPrevious = label === 'Anterior';
            const isNext = label === 'Siguiente';
            const isEllipsis = label === '...';
            const isActive = link.active;

            if (isPrevious) {
                return (
                    <PaginationItem key={index}>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-2"
                            onClick={() => handlePageClick(link.url)}
                            disabled={!link.url}
                        >
                            <PaginationPrevious className="h-4 w-4" />
                        </Button>
                    </PaginationItem>
                );
            }

            if (isNext) {
                return (
                    <PaginationItem key={index}>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-2"
                            onClick={() => handlePageClick(link.url)}
                            disabled={!link.url}
                        >
                            <PaginationNext className="h-4 w-4" />
                        </Button>
                    </PaginationItem>
                );
            }

            if (isEllipsis) {
                return (
                    <PaginationItem key={index}>
                        <PaginationEllipsis />
                    </PaginationItem>
                );
            }

            return (
                <PaginationItem key={index}>
                    <Button
                        variant={isActive ? 'default' : 'outline'}
                        size="sm"
                        className={cn(
                            'h-8 w-8 font-bold',
                            isActive
                                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                                : 'hover:bg-accent'
                        )}
                        onClick={() => handlePageClick(link.url)}
                        disabled={!link.url}
                    >
                        <span dangerouslySetInnerHTML={{ __html: label }} />
                    </Button>
                </PaginationItem>
            );
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Solicitudes de Stock" />

            <div className="p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col gap-8">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <h1 className="text-4xl font-black tracking-tight text-foreground flex items-center gap-3">
                                <span className="p-2 bg-primary/10 rounded-2xl">
                                    <Send className="w-9 h-9 text-primary rotate-[-20deg]" />
                                </span>
                                Solicitudes de <span className="text-primary italic">Stock</span>
                            </h1>
                            <p className="text-muted-foreground text-sm font-medium">
                                Gestiona pedidos de productos entre sucursales.
                            </p>
                        </div>
                        <Button
                            onClick={() => setIsModalOpen(true)}
                            className="h-12 px-8 font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 rounded-xl"
                        >
                            <Plus className="mr-2 h-5 w-5 stroke-[3]" /> Nueva Solicitud
                        </Button>
                    </div>

                    <Card className="border-border/40 shadow-2xl bg-background/50 backdrop-blur-md rounded-3xl border-2">
                        <CardHeader className="border-b bg-muted/20 pb-8 pt-8 px-8">
                            <div className="relative w-full md:w-[450px] group">
                                <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-all" />
                                <Input
                                    type="text"
                                    placeholder="Buscar solicitudes..."
                                    className="w-full pl-12 h-12 bg-background/80 border-2 rounded-2xl focus-visible:ring-primary/20"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-muted/30">
                                        <TableRow>
                                            <TableHead className="font-black text-[11px] uppercase tracking-widest px-8">Fecha</TableHead>
                                            <TableHead className="font-black text-[11px] uppercase tracking-widest">Usuario</TableHead>
                                            <TableHead className="font-black text-[11px] uppercase tracking-widest">Descripción / Detalle</TableHead>
                                            <TableHead className="font-black text-[11px] uppercase tracking-widest text-center">Estado</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {solicitudes.data.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="h-40 text-center opacity-40 italic">
                                                    No hay solicitudes registradas.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            solicitudes.data.map((sol) => (
                                                <TableRow key={sol.id} className="hover:bg-muted/50 transition-colors group">
                                                    <TableCell className="px-8 font-medium italic text-muted-foreground">
                                                        {new Date(sol.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span className="font-black uppercase tracking-tight text-foreground">{sol.user_origen.name}</span>
                                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Solicitante</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="max-w-md">
                                                        <div className="flex items-start gap-3 p-3 bg-muted/40 rounded-xl border border-transparent group-hover:border-primary/20 transition-all">
                                                            <div className="p-2 bg-background rounded-lg shadow-sm">
                                                                <AlertCircle className="w-4 h-4 text-primary" />
                                                            </div>
                                                            <p className="text-sm font-medium leading-relaxed italic">
                                                                {sol.descripcion}
                                                            </p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge
                                                            variant={sol.estado === 'PENDIENTE' ? 'secondary' : 'default'}
                                                            className={cn(
                                                                "px-4 py-1.5 rounded-full font-black text-[9px] uppercase tracking-widest border-2",
                                                                sol.estado === 'PENDIENTE' && "bg-orange-500/10 text-orange-600 border-orange-500/20"
                                                            )}
                                                        >
                                                            {sol.estado === 'PENDIENTE' ? <Clock className="w-3 h-3 mr-1.5" /> : <CheckCircle2 className="w-3 h-3 mr-1.5" />}
                                                            {sol.estado}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-10 border-t bg-muted/20">
                                <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] bg-background/50 px-5 py-2.5 rounded-full border-2">
                                    Registros del <span className="text-primary">{solicitudes.from || 0}</span> al <span className="text-primary">{solicitudes.to || 0}</span> de {solicitudes?.total || 0}
                                </div>
                                <Pagination className="w-auto mx-0">
                                    <PaginationContent className="gap-2">
                                        {renderPaginationItems()}
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <SolicitudModal
                open={isModalOpen}
                productos={productos}
                sucursales={sucursales}
                onClose={() => setIsModalOpen(false)}
            />
        </AppLayout>
    );
}
