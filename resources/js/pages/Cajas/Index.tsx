import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import cajas, { history, openAll, closeAll } from '@/routes/cajas';
import { Building2, ArrowRight, Wallet, Lock, Unlock, User, UnlockKeyhole, LockKeyhole } from 'lucide-react';
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface Caja {
    id: number;
    fecha_apertura: string;
    monto_inicial: number;
    usuario_apertura: { name: string };
}

interface Sucursal {
    id: number;
    nombre_sucursal: string;
    direccion: string;
    caja_abierta: Caja | null;
}

interface Props {
    sucursales: Sucursal[];
    isAdmin: boolean;
}

const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Cajas', href: '/cajas' },
];

export default function Index({ sucursales, isAdmin }: Props) {
    const [isOpenAllModalOpen, setIsOpenAllModalOpen] = useState(false);
    const [isCloseAllModalOpen, setIsCloseAllModalOpen] = useState(false);
    const [selectedSucursal, setSelectedSucursal] = useState<Sucursal | null>(null);
    const [isOpenModalOpen, setIsOpenModalOpen] = useState(false);
    const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);

    const { data: openAllData, setData: setOpenAllData, post: postOpenAll, processing: processingOpenAll, errors: errorsOpenAll, reset: resetOpenAll } = useForm({
        efectivo_inicial: '',
        qr_inicial: '',
    });

    const { data: closeAllData, setData: setCloseAllData, post: postCloseAll, processing: processingCloseAll, errors: errorsCloseAll, reset: resetCloseAll } = useForm({
        monto_final: '',
    });

    const { data: openData, setData: setOpenData, post: postOpen, processing: processingOpen, errors: errorsOpen, reset: resetOpen } = useForm({
        sucursal_id: 0,
        efectivo_inicial: '',
        qr_inicial: '',
    });

    const { data: closeData, setData: setCloseData, put: putClose, processing: processingClose, errors: errorsClose, reset: resetClose } = useForm({
        monto_final: '',
    });

    const handleOpenAll = (e: React.FormEvent) => {
        e.preventDefault();
        postOpenAll(openAll().url, {
            onSuccess: () => {
                setIsOpenAllModalOpen(false);
                resetOpenAll();
                toast.success('Cajas abiertas correctamente');
            },
            onError: () => toast.error('Error al abrir las cajas')
        });
    };

    const handleCloseAll = (e: React.FormEvent) => {
        e.preventDefault();
        postCloseAll(closeAll().url, {
            onSuccess: () => {
                setIsCloseAllModalOpen(false);
                resetCloseAll();
                toast.success('Cajas cerradas correctamente');
            },
            onError: () => toast.error('Error al cerrar las cajas')
        });
    };

    const handleOpenBox = (e: React.FormEvent) => {
        e.preventDefault();
        postOpen(cajas.store().url, {
            onSuccess: () => {
                setIsOpenModalOpen(false);
                resetOpen();
                setSelectedSucursal(null);
                toast.success('Caja abierta correctamente');
            },
            onError: () => toast.error('Error al abrir la caja')
        });
    };

    const handleCloseBox = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSucursal?.caja_abierta) return;

        putClose(cajas.update(selectedSucursal.caja_abierta.id).url, {
            onSuccess: () => {
                setIsCloseModalOpen(false);
                resetClose();
                setSelectedSucursal(null);
                toast.success('Caja cerrada correctamente');
            },
            onError: () => toast.error('Error al cerrar la caja')
        });
    };

    const openBoxModal = (sucursal: Sucursal) => {
        setSelectedSucursal(sucursal);
        setOpenData('sucursal_id', sucursal.id);
        setIsOpenModalOpen(true);
    };

    const closeBoxModal = (sucursal: Sucursal) => {
        setSelectedSucursal(sucursal);
        setIsCloseModalOpen(true);
    };

    const hasOpenBoxes = sucursales.some(s => s.caja_abierta !== null);
    const hasClosedBoxes = sucursales.some(s => s.caja_abierta === null);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Cajas - Sucursales" />
            <div className="flex flex-1 flex-col gap-6 p-6 overflow-y-auto">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Gestión de Cajas</h1>
                        <p className="text-muted-foreground mt-1">Selecciona una sucursal para gestionar su caja</p>
                    </div>
                    {isAdmin && (
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setIsOpenAllModalOpen(true)}
                                disabled={!hasClosedBoxes}
                            >
                                <UnlockKeyhole className="mr-2 h-4 w-4" /> Abrir Todas
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => setIsCloseAllModalOpen(true)}
                                disabled={!hasOpenBoxes}
                            >
                                <LockKeyhole className="mr-2 h-4 w-4" /> Cerrar Todas
                            </Button>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sucursales.map((sucursal) => (
                        <Card key={sucursal.id} className="group hover:shadow-lg transition-all border-l-4 border-l-primary/20 hover:border-l-primary">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <div className="p-2 bg-primary/5 rounded-lg">
                                        <Building2 className="h-6 w-6 text-primary" />
                                    </div>
                                    <Badge variant={sucursal.caja_abierta ? 'default' : 'outline'} className={sucursal.caja_abierta ? 'bg-green-500 hover:bg-green-600' : 'text-muted-foreground'}>
                                        {sucursal.caja_abierta ? (
                                            <span className="flex items-center gap-1"><Unlock className="w-3 h-3" /> ABIERTA</span>
                                        ) : (
                                            <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> CERRADA</span>
                                        )}
                                    </Badge>
                                </div>
                                <CardTitle className="mt-4 text-xl">{sucursal.nombre_sucursal}</CardTitle>
                                <CardDescription className="line-clamp-1">{sucursal.direccion || 'Sin dirección registrada'}</CardDescription>
                            </CardHeader>
                            <CardContent className="pb-3">
                                {sucursal.caja_abierta ? (
                                    <div className="space-y-3">
                                        <div className="p-3 bg-muted/40 rounded-lg space-y-1">
                                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Monto Inicial</span>
                                            <div className="flex items-center gap-2">
                                                <Wallet className="w-4 h-4 text-primary" />
                                                <span className="font-bold text-lg">Bs. {sucursal.caja_abierta.monto_inicial}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <User className="w-4 h-4" />
                                            <span>{sucursal.caja_abierta.usuario_apertura.name}</span>
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            Abierta: {new Date(sucursal.caja_abierta.fecha_apertura).toLocaleString()}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-28 flex flex-col items-center justify-center text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
                                        <Lock className="w-6 h-6 mb-2 opacity-50" />
                                        <span className="text-sm font-medium">Caja cerrada</span>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="pt-3 border-t flex gap-2">
                                {sucursal.caja_abierta ? (
                                    <>
                                        <Button
                                            className="flex-1"
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => closeBoxModal(sucursal)}
                                        >
                                            <Lock className="mr-2 w-4 h-4" /> Cerrar Caja
                                        </Button>
                                        <Button className="flex-1" variant="outline" size="sm" asChild>
                                            <Link href={history(sucursal.id).url}>
                                                Ver Detalles <ArrowRight className="ml-2 w-4 h-4" />
                                            </Link>
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Button
                                            className="flex-1"
                                            variant="default"
                                            size="sm"
                                            onClick={() => openBoxModal(sucursal)}
                                        >
                                            <Unlock className="mr-2 w-4 h-4" /> Abrir Caja
                                        </Button>
                                        <Button className="flex-1" variant="outline" size="sm" asChild>
                                            <Link href={history(sucursal.id).url}>
                                                Ver Historial <ArrowRight className="ml-2 w-4 h-4" />
                                            </Link>
                                        </Button>
                                    </>
                                )}
                            </CardFooter>
                        </Card>
                    ))}

                    {sucursales.length === 0 && (
                        <div className="col-span-full py-12 text-center text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
                            <Building2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p className="text-lg font-medium">No se encontraron sucursales disponibles</p>
                        </div>
                    )}
                </div>

                {/* Open All Modal */}
                <Dialog open={isOpenAllModalOpen} onOpenChange={setIsOpenAllModalOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Abrir Todas las Cajas</DialogTitle>
                            <DialogDescription>
                                Se abrirán cajas para todas las sucursales que no tengan una caja abierta.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleOpenAll} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="efectivo_inicial_all">Efectivo Inicial</Label>
                                    <Input
                                        id="efectivo_inicial_all"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="0.00"
                                        value={openAllData.efectivo_inicial}
                                        onChange={(e) => setOpenAllData('efectivo_inicial', e.target.value)}
                                    />
                                    {errorsOpenAll.efectivo_inicial && <span className="text-sm text-destructive">{errorsOpenAll.efectivo_inicial}</span>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="qr_inicial_all">QR Inicial</Label>
                                    <Input
                                        id="qr_inicial_all"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="0.00"
                                        value={openAllData.qr_inicial}
                                        onChange={(e) => setOpenAllData('qr_inicial', e.target.value)}
                                    />
                                    {errorsOpenAll.qr_inicial && <span className="text-sm text-destructive">{errorsOpenAll.qr_inicial}</span>}
                                </div>
                            </div>
                            <div className="p-4 bg-muted/50 rounded-lg border">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-semibold">Monto Inicial Total:</span>
                                    <span className="text-xl font-bold">
                                        Bs. {((parseFloat(openAllData.efectivo_inicial) || 0) + (parseFloat(openAllData.qr_inicial) || 0)).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsOpenAllModalOpen(false)}>Cancelar</Button>
                                <Button type="submit" disabled={processingOpenAll}>Abrir Todas</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Close All Modal */}
                <Dialog open={isCloseAllModalOpen} onOpenChange={setIsCloseAllModalOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Cerrar Todas las Cajas</DialogTitle>
                            <DialogDescription>
                                Se cerrarán todas las cajas abiertas. Ingresa el monto final en efectivo.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCloseAll} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="monto_final_all">Monto Final en Efectivo</Label>
                                <Input
                                    id="monto_final_all"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="0.00"
                                    value={closeAllData.monto_final}
                                    onChange={(e) => setCloseAllData('monto_final', e.target.value)}
                                    required
                                    autoFocus
                                    className="text-lg font-bold"
                                />
                                {errorsCloseAll.monto_final && <span className="text-sm text-destructive">{errorsCloseAll.monto_final}</span>}
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsCloseAllModalOpen(false)}>Cancelar</Button>
                                <Button type="submit" variant="destructive" disabled={processingCloseAll}>Cerrar Todas</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Individual Open Box Modal */}
                <Dialog open={isOpenModalOpen} onOpenChange={setIsOpenModalOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Abrir Caja</DialogTitle>
                            <DialogDescription>
                                {selectedSucursal?.nombre_sucursal}
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

                {/* Individual Close Box Modal */}
                <Dialog open={isCloseModalOpen} onOpenChange={setIsCloseModalOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Cerrar Caja</DialogTitle>
                            <DialogDescription>
                                {selectedSucursal?.nombre_sucursal}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCloseBox} className="space-y-4">
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
                                    className="text-lg font-bold"
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
