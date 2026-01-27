import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import cajas, { store, update } from '@/routes/cajas';
import { Plus, Wallet, Eye, Lock, Unlock, AlertCircle, ArrowLeft, Building2 } from 'lucide-react';
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface Caja {
    id: number;
    fecha_apertura: string;
    fecha_cierre?: string;
    monto_inicial: number;
    monto_final?: number;
    estado: string;
    sucursal: { id: number, nombre_sucursal: string };
    usuario_apertura: { name: string };
    usuario_cierre?: { name: string };
}

interface Props {
    sucursal: { id: number; nombre_sucursal: string };
    cajas: {
        data: Caja[];
        links: any[];
    };
    cajaAbierta?: Caja;
    isAdmin: boolean;
}

export default function History({ sucursal, cajas: cajasList, cajaAbierta, isAdmin }: Props) {
    const [isOpenModalOpen, setIsOpenModalOpen] = useState(false);
    const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
    const { user } = usePage().props.auth as any;

    const { data: openData, setData: setOpenData, post: postOpen, processing: processingOpen, errors: errorsOpen, reset: resetOpen } = useForm({
        sucursal_id: sucursal.id,
        efectivo_inicial: '',
        qr_inicial: '',
    });

    const { data: closeData, setData: setCloseData, put: putClose, processing: processingClose, errors: errorsClose, reset: resetClose } = useForm({
        monto_final: '',
    });

    const handleOpenBox = (e: React.FormEvent) => {
        e.preventDefault();
        postOpen(store().url, {
            onSuccess: () => {
                setIsOpenModalOpen(false);
                resetOpen();
                toast.success('Caja abierta correctamente');
            },
            onError: () => toast.error('Error al abrir la caja')
        });
    };

    const handleCloseBox = (e: React.FormEvent) => {
        e.preventDefault();
        if (!cajaAbierta) return;

        putClose(update(cajaAbierta.id).url, {
            onSuccess: () => {
                setIsCloseModalOpen(false);
                resetClose();
                toast.success('Caja cerrada correctamente');
            },
            onError: () => toast.error('Error al cerrar la caja')
        });
    };

    const breadcrumbs = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Cajas', href: '/cajas' },
        { title: sucursal.nombre_sucursal, href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Historial - ${sucursal.nombre_sucursal}`} />
            <div className="flex flex-1 flex-col gap-6 p-6 overflow-y-auto">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={cajas.index().url}>
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                            <Building2 className="h-8 w-8 text-muted-foreground" />
                            {sucursal.nombre_sucursal}
                        </h1>
                        <p className="text-muted-foreground mt-1">Historial de cajas y operaciones</p>
                    </div>
                </div>

                {/* Active Box Section */}
                {cajaAbierta ? (
                    <Card className="border-green-200 bg-green-50/50 dark:bg-green-900/10 dark:border-green-800">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <Badge className="bg-green-500 hover:bg-green-600">
                                            <Unlock className="w-3 h-3 mr-1" /> ABIERTA
                                        </Badge>
                                        <span className="text-sm text-muted-foreground font-medium">
                                            {new Date(cajaAbierta.fecha_apertura).toLocaleString()}
                                        </span>
                                    </div>
                                    <CardTitle className="mt-2 text-xl">Caja Actual</CardTitle>
                                    <CardDescription>Aperturada por {cajaAbierta.usuario_apertura?.name}</CardDescription>
                                </div>
                                <Button variant="destructive" onClick={() => setIsCloseModalOpen(true)}>
                                    <Lock className="mr-2 h-4 w-4" /> Cerrar Caja
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                                <div className="bg-background rounded-lg p-3 border shadow-sm">
                                    <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Monto Inicial</span>
                                    <div className="text-2xl font-bold text-foreground">Bs. {cajaAbierta.monto_inicial}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-10 gap-4 text-center">
                            <div className="p-4 rounded-full bg-muted">
                                <Wallet className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-semibold text-lg">No hay caja abierta</h3>
                                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                                    Abre una caja para comenzar a registrar ventas en esta sucursal.
                                </p>
                            </div>
                            <Button onClick={() => setIsOpenModalOpen(true)}>
                                <Unlock className="mr-2 h-4 w-4" /> Abrir Nueva Caja
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* History Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Wallet className="h-5 w-5" />
                            Historial
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Fecha Apertura</TableHead>
                                    <TableHead>Usuario Apertura</TableHead>
                                    <TableHead>Monto Inicial</TableHead>
                                    <TableHead>Fecha Cierre</TableHead>
                                    <TableHead>Usuario Cierre</TableHead>
                                    <TableHead>Monto Final</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {cajasList.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                            No hay registros de cajas.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    cajasList.data.map((caja) => (
                                        <TableRow key={caja.id}>
                                            <TableCell>{new Date(caja.fecha_apertura).toLocaleDateString()} {new Date(caja.fecha_apertura).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</TableCell>
                                            <TableCell>{caja.usuario_apertura?.name}</TableCell>
                                            <TableCell>Bs. {caja.monto_inicial}</TableCell>
                                            <TableCell>{caja.fecha_cierre ? `${new Date(caja.fecha_cierre).toLocaleDateString()} ${new Date(caja.fecha_cierre).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : '-'}</TableCell>
                                            <TableCell>{caja.usuario_cierre?.name || '-'}</TableCell>
                                            <TableCell>{caja.monto_final ? `Bs. ${caja.monto_final}` : '-'}</TableCell>
                                            <TableCell>
                                                <Badge variant={caja.estado === 'abierta' ? 'default' : 'secondary'} className={caja.estado === 'abierta' ? 'bg-green-500' : ''}>
                                                    {caja.estado.toUpperCase()}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" asChild>
                                                    <Link href={cajas.show(caja.id).url}>
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Open Box Modal */}
                <Dialog open={isOpenModalOpen} onOpenChange={setIsOpenModalOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Abrir Nueva Caja</DialogTitle>
                            <DialogDescription>
                                {sucursal.nombre_sucursal}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleOpenBox} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="efectivo_inicial">Efectivo Inicial</Label>
                                    <Input
                                        id="efectivo_inicial"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="0.00"
                                        value={openData.efectivo_inicial}
                                        onChange={(e) => setOpenData('efectivo_inicial', e.target.value)}
                                    />
                                    {errorsOpen.efectivo_inicial && <span className="text-sm text-destructive">{errorsOpen.efectivo_inicial}</span>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="qr_inicial">QR Inicial</Label>
                                    <Input
                                        id="qr_inicial"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="0.00"
                                        value={openData.qr_inicial}
                                        onChange={(e) => setOpenData('qr_inicial', e.target.value)}
                                    />
                                    {errorsOpen.qr_inicial && <span className="text-sm text-destructive">{errorsOpen.qr_inicial}</span>}
                                </div>
                            </div>
                            <div className="p-4 bg-muted/50 rounded-lg border">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-semibold">Monto Inicial Total:</span>
                                    <span className="text-xl font-bold">
                                        Bs. {((parseFloat(openData.efectivo_inicial) || 0) + (parseFloat(openData.qr_inicial) || 0)).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsOpenModalOpen(false)}>Cancelar</Button>
                                <Button type="submit" disabled={processingOpen}>Abrir Caja</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Close Box Modal */}
                <Dialog open={isCloseModalOpen} onOpenChange={setIsCloseModalOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Cerrar Caja</DialogTitle>
                            <DialogDescription>
                                Ingresa el monto total en efectivo contado en caja.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCloseBox} className="space-y-4">
                            <div className="p-4 bg-muted rounded-lg text-sm text-muted-foreground flex gap-2">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                <p>Al cerrar la caja, se calculará automáticamente la diferencia basada en las ventas registradas.</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="monto_final">Monto Final en Efectivo</Label>
                                <Input
                                    id="monto_final"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="0.00"
                                    value={closeData.monto_final}
                                    onChange={(e) => setCloseData('monto_final', e.target.value)}
                                    required
                                    autoFocus
                                />
                                {errorsClose.monto_final && <span className="text-sm text-destructive">{errorsClose.monto_final}</span>}
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsCloseModalOpen(false)}>Cancelar</Button>
                                <Button type="submit" variant="destructive" disabled={processingClose}>Cerrar Caja</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
