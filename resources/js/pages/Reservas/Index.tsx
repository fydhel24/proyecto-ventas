import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, router, Link } from '@inertiajs/react';
import {
    CalendarClock,
    Plus,
    CheckCircle2,
    XCircle,
    History,
    ShoppingCart,
    User,
    Clock,
    ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function ReservasIndex({ reservas }: any) {

    const handleConvert = (id: number) => {
        if (confirm("¿Confirmar conversión de reserva a venta directa? Se imprimirá el ticket.")) {
            router.post(`/reservas/${id}/convertir`, {}, {
                onSuccess: () => toast.success("Venta procesada con éxito")
            });
        }
    };

    const handleCancel = (id: number) => {
        if (confirm("¿Estás seguro de cancelar esta reserva?")) {
            router.delete(`/reservas/${id}`, {
                onSuccess: () => toast.success("Reserva cancelada")
            });
        }
    };

    const getStatusBadge = (estado: string) => {
        switch (estado) {
            case 'pendiente': return <Badge variant="outline" className="border-orange-500 text-orange-500 bg-orange-50">Pendiente</Badge>;
            case 'completada': return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">Vendida</Badge>;
            case 'cancelada': return <Badge variant="destructive">Cancelada</Badge>;
            default: return <Badge>{estado}</Badge>;
        }
    };

    return (
        <AppLayout>
            <Head title="Reservas - Nexus Farma" />

            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Módulo de Reservas</h1>
                        <p className="text-slate-500">Gestión de apartados y pedidos pendientes de pago.</p>
                    </div>
                    <Link href="/ventas/create">
                        <Button className="bg-[#16A34A] hover:bg-[#15803d]">
                            <Plus className="w-4 h-4 mr-2" />
                            Nueva Reserva
                        </Button>
                    </Link>
                </div>

                <Card className="border-none shadow-sm">
                    <CardHeader className="p-4 border-b bg-slate-50/50">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <CalendarClock className="w-5 h-5 text-[#16A34A]" />
                            Reservas Activas
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>No. Reserva</TableHead>
                                    <TableHead>Cliente</TableHead>
                                    <TableHead>Monto</TableHead>
                                    <TableHead>Límite de Retiro</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {reservas.data.map((res: any) => (
                                    <TableRow key={res.id}>
                                        <TableCell className="font-mono text-xs">#RES-{res.id.toString().padStart(5, '0')}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4 text-slate-400" />
                                                {res.cliente?.nombre}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-bold">{res.monto_total} BOB</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-slate-400" />
                                                {new Date(res.fecha_vencimiento).toLocaleString()}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(res.estado)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {res.estado === 'pendiente' && (
                                                <div className="flex justify-end gap-2">
                                                    <Button size="sm" className="bg-[#16A34A] hover:bg-[#15803d]" onClick={() => handleConvert(res.id)}>
                                                        <ShoppingCart className="w-4 h-4 mr-2" /> Vender
                                                    </Button>
                                                    <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600" onClick={() => handleCancel(res.id)}>
                                                        <XCircle className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            )}
                                            {res.estado === 'completada' && (
                                                <Badge variant="outline" className="text-slate-400">Ver Ticket</Badge>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {reservas.data.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-12 text-slate-400">
                                            No hay reservas registradas.
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
