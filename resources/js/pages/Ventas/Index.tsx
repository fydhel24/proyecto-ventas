import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { create, ticket } from '@/routes/ventas';
import { Plus, ShoppingCart, Eye, Calendar, User, CreditCard, DollarSign, History } from 'lucide-react';
import React from 'react';
import { cn } from '@/lib/utils';

interface Venta {
    id: number;
    cliente: string;
    tipo_pago: string;
    monto_total: number;
    estado: string;
    created_at: string;
    vendedor: { name: string };
}

interface Props {
    ventas: {
        data: Venta[];
        links: any[];
    };
}

const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Ventas', href: '/ventas' },
];

export default function Index({ ventas }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Ventas" />
            <div className="flex flex-1 flex-col gap-6 p-6 overflow-y-auto bg-slate-50/30 dark:bg-transparent">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                            <span className="p-2 bg-primary/10 rounded-xl">
                                <History className="w-8 h-8 text-primary" />
                            </span>
                            Historial de <span className="text-primary italic">Ventas</span>
                        </h1>
                        <p className="text-muted-foreground font-medium">Control y seguimiento de todas las transacciones realizadas</p>
                    </div>
                    <Button asChild className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 h-12 px-6 font-bold transition-all hover:scale-[1.02] active:scale-95">
                        <Link href={create().url}>
                            <Plus className="mr-2 h-5 w-5" />
                            Nueva Venta
                        </Link>
                    </Button>
                </div>

                <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white/80 backdrop-blur-md overflow-hidden">
                    <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-6 pt-6 px-6">
                        <CardTitle className="text-lg font-black flex items-center gap-2 text-slate-800">
                            <ShoppingCart className="h-5 w-5 text-primary" />
                            Registro Detallado
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-slate-50/80">
                                    <TableRow className="hover:bg-transparent border-b border-slate-100">
                                        <TableHead className="text-[11px] uppercase font-black tracking-widest text-slate-500 h-12">
                                            <div className="flex items-center gap-2 px-2">
                                                <Calendar className="h-3.5 w-3.5" />
                                                Fecha
                                            </div>
                                        </TableHead>
                                        <TableHead className="text-[11px] uppercase font-black tracking-widest text-slate-500 h-12">
                                            <div className="flex items-center gap-2">
                                                <User className="h-3.5 w-3.5" />
                                                Cliente
                                            </div>
                                        </TableHead>
                                        <TableHead className="text-[11px] uppercase font-black tracking-widest text-slate-500 h-12">Vendedor</TableHead>
                                        <TableHead className="text-[11px] uppercase font-black tracking-widest text-slate-500 h-12">
                                            <div className="flex items-center gap-2">
                                                <CreditCard className="h-3.5 w-3.5" />
                                                Pago
                                            </div>
                                        </TableHead>
                                        <TableHead className="text-[11px] uppercase font-black tracking-widest text-slate-500 h-12 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <DollarSign className="h-3.5 w-3.5" />
                                                Total
                                            </div>
                                        </TableHead>
                                        <TableHead className="text-[11px] uppercase font-black tracking-widest text-slate-500 h-12 text-center">Estado</TableHead>
                                        <TableHead className="text-[11px] uppercase font-black tracking-widest text-slate-500 h-12 text-right px-6">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {ventas.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-20 text-slate-400 font-medium italic">
                                                No hay ventas registradas en el sistema.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        ventas.data.map((venta) => (
                                            <TableRow key={venta.id} className="group hover:bg-primary/[0.02] transition-colors border-b border-slate-50">
                                                <TableCell className="text-sm font-medium py-4 px-4">
                                                    {new Date(venta.created_at).toLocaleDateString('es-BO', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric'
                                                    })}
                                                </TableCell>
                                                <TableCell className="font-bold text-slate-900 group-hover:text-primary transition-colors">{venta.cliente}</TableCell>
                                                <TableCell className="text-sm text-slate-600">{venta.vendedor?.name || 'N/A'}</TableCell>
                                                <TableCell className="text-xs font-bold uppercase tracking-tight">
                                                    <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-700">
                                                        {venta.tipo_pago}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-xl bg-primary/5 border border-primary/20 text-primary font-black text-sm shadow-sm">
                                                        <span className="text-[10px] mr-1 opacity-70">Bs</span> {Number(venta.monto_total).toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge
                                                        className={cn(
                                                            "font-bold px-3 py-1 rounded-full border-none shadow-sm",
                                                            venta.estado === 'completado'
                                                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                                                        )}
                                                    >
                                                        {venta.estado}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right py-4 px-6">
                                                    <div className="flex justify-end opacity-60 group-hover:opacity-100 transition-opacity">
                                                        <Link href={ticket(venta.id).url} target="_blank">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-10 w-10 text-primary hover:bg-primary/10 rounded-xl transition-all active:scale-90"
                                                                title="Ver Ticket PDF"
                                                            >
                                                                <Eye className="h-5 w-5" />
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
