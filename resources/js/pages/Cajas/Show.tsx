import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { update, history } from '@/routes/cajas';
import { ArrowLeft, User, Calendar, DollarSign, Wallet, AlertTriangle, CheckCircle } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';
import { usePermissions } from '@/hooks/use-permissions';

interface Caja {
    id: number;
    fecha_apertura: string;
    fecha_cierre?: string;
    efectivo_inicial: number;
    qr_inicial: number;
    monto_inicial: number;
    monto_final?: number;
    total_efectivo?: number;
    total_qr?: number;
    diferencia?: number;
    estado: string;
    sucursal: { id: number, nombre_sucursal: string };
    usuario_apertura: { name: string };
    usuario_cierre?: { name: string };
}

interface Props {
    caja: Caja;
    totalVentas: number;
    totalEfectivo: number;
    totalQr: number;
}

const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Cajas', href: '/cajas' },
    { title: 'Detalle', href: '#' },
];

export default function Show({ caja, totalVentas, totalEfectivo, totalQr }: Props) {
    // Calcular esperado
    const efectivoEsperado = Number(caja.efectivo_inicial) + Number(totalEfectivo);
    const { hasPermission } = usePermissions();

    // Setup form for put request (even if empty) to handle loading state
    const { put: putClose, processing: processingClose } = useForm({});

    const handleCloseBox = () => {
        toast('¿Seguro que deseas cerrar esta caja?', {
            description: "Se calcularán los montos automáticamente.",
            action: {
                label: 'Confirmar',
                onClick: () => {
                    putClose(update(caja.id).url, {
                        onSuccess: () => {
                            toast.success('Caja cerrada correctamente');
                        },
                        onError: () => toast.error('Error al cerrar la caja')
                    });
                }
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Caja #${caja.id}`} />
            <div className="flex flex-1 flex-col gap-6 p-6 overflow-y-auto max-w-5xl mx-auto w-full">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={history(caja.sucursal.id).url}>
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                            Caja #{caja.id}
                            <Badge variant={caja.estado === 'abierta' ? 'default' : 'secondary'} className={caja.estado === 'abierta' ? 'bg-green-500 text-lg py-1' : 'text-lg py-1'}>
                                {caja.estado.toUpperCase()}
                            </Badge>
                        </h1>
                        <p className="text-muted-foreground">{caja.sucursal.nombre_sucursal}</p>
                    </div>
                    {caja.estado === 'abierta' && hasPermission('cerrar cajas') && (
                        <Button variant="destructive" className="ml-auto" onClick={handleCloseBox} disabled={processingClose}>
                            Cerrar Caja
                        </Button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Información General */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-muted-foreground" />
                                Información de Apertura
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                                <span className="text-sm font-medium text-muted-foreground">Fecha Apertura</span>
                                <span className="font-bold">{new Date(caja.fecha_apertura).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                                <span className="text-sm font-medium text-muted-foreground">Responsable</span>
                                <span className="font-bold flex items-center gap-2">
                                    <User className="h-4 w-4" /> {caja.usuario_apertura.name}
                                </span>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center p-2 bg-green-50/50 dark:bg-green-900/10 border border-green-100 dark:border-green-900 rounded-lg">
                                    <span className="text-xs font-semibold text-green-700 dark:text-green-300">Efectivo Inicial</span>
                                    <span className="text-base font-bold text-green-700 dark:text-green-300">Bs. {caja.efectivo_inicial}</span>
                                </div>
                                <div className="flex justify-between items-center p-2 bg-purple-50/50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900 rounded-lg">
                                    <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">QR Inicial</span>
                                    <span className="text-base font-bold text-purple-700 dark:text-purple-300">Bs. {caja.qr_inicial}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-blue-50/50 dark:bg-blue-900/10 border-2 border-blue-200 dark:border-blue-800 rounded-lg">
                                    <span className="text-sm font-bold text-blue-700 dark:text-blue-300">Monto Inicial Total</span>
                                    <span className="text-xl font-bold text-blue-700 dark:text-blue-300">Bs. {caja.monto_inicial}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Resumen de Ventas (Calculado al momento) */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <DollarSign className="h-5 w-5 text-muted-foreground" />
                                Resumen de Ventas
                            </CardTitle>
                            <CardDescription>Ventas registradas durante este turno</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-green-50/50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900">
                                    <div className="text-xs font-bold text-green-700 dark:text-green-300 mb-1">VENTAS EFECTIVO</div>
                                    <div className="text-lg font-bold">Bs. {caja.estado === 'cerrada' ? caja.total_efectivo : totalEfectivo.toFixed(2)}</div>
                                </div>
                                <div className="p-3 bg-purple-50/50 dark:bg-purple-900/10 rounded-lg border border-purple-100 dark:border-purple-900">
                                    <div className="text-xs font-bold text-purple-700 dark:text-purple-300 mb-1">VENTAS QR</div>
                                    <div className="text-lg font-bold">Bs. {caja.estado === 'cerrada' ? caja.total_qr : totalQr.toFixed(2)}</div>
                                </div>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg border-t-2 border-primary">
                                <span className="text-base font-bold">TOTAL VENTAS</span>
                                <span className="text-2xl font-black">Bs. {caja.estado === 'cerrada' ? caja.monto_final : totalVentas.toFixed(2)}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Arqueo de Caja (Solo visible al cerrar o pre-visualización) */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Wallet className="h-5 w-5 text-muted-foreground" />
                                Arqueo de Caja
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Esperado en Caja (Efectivo)</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Efectivo Inicial:</span>
                                            <span>Bs. {caja.efectivo_inicial}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span>+ Ventas Efectivo:</span>
                                            <span className="text-green-600 font-bold">Bs. {caja.estado === 'cerrada' ? caja.total_efectivo : totalEfectivo.toFixed(2)}</span>
                                        </div>
                                        <div className="border-t pt-2 flex justify-between font-bold text-lg">
                                            <span>Total Esperado:</span>
                                            <span>Bs. {(Number(caja.efectivo_inicial) + (caja.estado === 'cerrada' ? Number(caja.total_efectivo) : totalEfectivo)).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="md:col-span-2 space-y-4">
                                    {caja.estado === 'cerrada' ? (
                                        <>
                                            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Resultado del Cierre</h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-4 bg-muted rounded-xl flex flex-col justify-center">
                                                    <span className="text-sm text-muted-foreground">Monto Declarado en Cierre</span>
                                                    <span className="text-3xl font-bold">Bs. {caja.monto_final}</span>
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        Cerrado por: {caja.usuario_cierre?.name} <br />
                                                        {new Date(caja.fecha_cierre!).toLocaleString()}
                                                    </div>
                                                </div>
                                                <div className={`p-4 rounded-xl flex flex-col justify-center border-2 ${Number(caja.diferencia) === 0 ? 'bg-green-50/50 border-green-200' : 'bg-red-50/50 border-red-200'}`}>
                                                    <span className="text-sm font-bold flex items-center gap-2">
                                                        Diferencia
                                                        {Number(caja.diferencia) === 0 ? <CheckCircle className="w-4 h-4 text-green-600" /> : <AlertTriangle className="w-4 h-4 text-red-600" />}
                                                    </span>
                                                    <span className={`text-3xl font-bold ${Number(caja.diferencia) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                                        {Number(caja.diferencia) > 0 ? '+' : ''}Bs. {caja.diferencia}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground mt-1">
                                                        {Number(caja.diferencia) === 0 ? 'Cuadre perfecto' : (Number(caja.diferencia) > 0 ? 'Sobrante en caja' : 'Faltante en caja')}
                                                    </span>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center p-6 bg-muted/20 border-2 border-dashed rounded-xl text-center">
                                            <Wallet className="h-10 w-10 text-muted-foreground mb-2" />
                                            <h3 className="font-semibold">Caja en curso</h3>
                                            <p className="text-sm text-muted-foreground">El arqueo definitivo se calculará al cerrar la caja.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
