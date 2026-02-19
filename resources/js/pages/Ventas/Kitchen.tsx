import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { CheckCircle2, Clock, PlayCircle, Utensils } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Pedido {
    id: number;
    cliente: string;
    mesa?: { nombre_mesa: string };
    estado_comanda: string;
    created_at: string;
    detalles: {
        id: number;
        cantidad: number;
        inventario: {
            producto: {
                nombre: string;
            };
        };
    }[];
}

interface Props {
    pedidos: Pedido[];
}

export default function Kitchen({ pedidos }: Props) {
    const [filter, setFilter] = useState('active');

    const updateStatus = (id: number, status: string) => {
        router.patch(
            `/ventas/${id}/status`,
            {
                estado_comanda: status,
            },
            {
                onSuccess: () => toast.success('Estado actualizado'),
                preserveScroll: true,
            },
        );
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pendiente':
                return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
            case 'en_cocina':
                return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
            case 'listo':
                return 'bg-green-500/10 text-green-600 border-green-500/20';
            default:
                return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
        }
    };

    const getStatusTitle = (status: string) => {
        switch (status) {
            case 'pendiente':
                return 'PENDIENTE';
            case 'en_cocina':
                return 'EN PREPARACIÓN';
            case 'listo':
                return '¡LISTO PARA ENTREGAR!';
            default:
                return status.toUpperCase();
        }
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Ventas', href: '/ventas' },
                { title: 'Cocina', href: '/ventas/cocina' },
            ]}
        >
            <Head title="Monitor de Cocina" />

            <div className="mx-auto max-w-7xl space-y-8 p-6">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div className="flex items-center gap-4">
                        <div className="rounded-2xl bg-orange-500 p-3 text-white shadow-lg shadow-orange-500/20">
                            <Utensils className="h-8 w-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black tracking-tight uppercase italic">
                                Monitor de Cocina
                            </h1>
                            <p className="font-medium text-muted-foreground">
                                Gestión de comandas y platos en tiempo real.
                            </p>
                        </div>
                    </div>
                </div>

                {pedidos.length === 0 ? (
                    <div className="flex h-[60vh] flex-col items-center justify-center text-center opacity-30">
                        <Utensils className="mb-6 h-24 w-24" />
                        <h2 className="text-3xl font-black uppercase italic">
                            Sin órdenes pendientes
                        </h2>
                        <p className="text-lg">¡La cocina está al día!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {pedidos.map((pedido) => (
                            <Card
                                key={pedido.id}
                                className={cn(
                                    'overflow-hidden rounded-[2rem] border-2 transition-all hover:shadow-2xl',
                                    pedido.estado_comanda === 'en_cocina'
                                        ? 'rotate-1 border-orange-500 shadow-xl shadow-orange-500/5'
                                        : 'border-border',
                                )}
                            >
                                <CardHeader
                                    className={cn(
                                        'border-b p-6 pb-4',
                                        pedido.estado_comanda === 'en_cocina'
                                            ? 'bg-orange-500/5'
                                            : 'bg-muted/30',
                                    )}
                                >
                                    <div className="mb-2 flex items-start justify-between">
                                        <Badge
                                            className={cn(
                                                'rounded-full border px-3 py-1 font-black italic shadow-sm',
                                                getStatusColor(
                                                    pedido.estado_comanda,
                                                ),
                                            )}
                                        >
                                            {getStatusTitle(
                                                pedido.estado_comanda,
                                            )}
                                        </Badge>
                                        <div className="flex items-center gap-1.5 text-muted-foreground">
                                            <Clock className="h-4 w-4" />
                                            <span className="text-xs font-bold">
                                                {new Date(
                                                    pedido.created_at,
                                                ).toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                    <CardTitle className="truncate text-2xl font-black tracking-tight uppercase italic">
                                        {pedido.mesa
                                            ? `📍 ${pedido.mesa.nombre_mesa}`
                                            : '🥡 PARA LLEVAR'}
                                    </CardTitle>
                                    <p className="text-sm font-bold text-muted-foreground uppercase opacity-70">
                                        {pedido.cliente} • Order #{pedido.id}
                                    </p>
                                </CardHeader>
                                <CardContent className="space-y-4 p-6">
                                    <div className="space-y-3">
                                        {pedido.detalles.map((detalle) => (
                                            <div
                                                key={detalle.id}
                                                className="flex items-center justify-between rounded-xl border border-border/50 bg-muted/30 p-3"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border bg-background text-lg font-black text-primary">
                                                        {detalle.cantidad}
                                                    </div>
                                                    <span className="text-sm leading-tight font-bold uppercase">
                                                        {
                                                            detalle.inventario
                                                                .producto.nombre
                                                        }
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-1 gap-2 pt-4">
                                        {pedido.estado_comanda ===
                                            'pendiente' && (
                                            <Button
                                                className="h-12 rounded-xl bg-orange-500 font-black shadow-lg shadow-orange-500/20 hover:bg-orange-600"
                                                onClick={() =>
                                                    updateStatus(
                                                        pedido.id,
                                                        'en_cocina',
                                                    )
                                                }
                                            >
                                                <PlayCircle className="mr-2 h-5 w-5" />{' '}
                                                COMENZAR PREPARACIÓN
                                            </Button>
                                        )}
                                        {pedido.estado_comanda ===
                                            'en_cocina' && (
                                            <Button
                                                className="h-12 rounded-xl bg-green-600 font-black shadow-lg shadow-green-500/20 hover:bg-green-700"
                                                onClick={() =>
                                                    updateStatus(
                                                        pedido.id,
                                                        'listo',
                                                    )
                                                }
                                            >
                                                <CheckCircle2 className="mr-2 h-5 w-5" />{' '}
                                                MARCAR COMO LISTO
                                            </Button>
                                        )}
                                        {pedido.estado_comanda === 'listo' && (
                                            <div className="flex flex-col gap-2">
                                                <Button
                                                    variant="outline"
                                                    className="h-12 rounded-xl border-2 border-green-600 font-black text-green-600 hover:bg-green-50"
                                                    onClick={() =>
                                                        updateStatus(
                                                            pedido.id,
                                                            'entregado',
                                                        )
                                                    }
                                                >
                                                    <CheckCircle2 className="mr-2 h-5 w-5" />{' '}
                                                    ENTREGAR PEDIDO
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-[10px] font-black uppercase opacity-50"
                                                    onClick={() =>
                                                        updateStatus(
                                                            pedido.id,
                                                            'en_cocina',
                                                        )
                                                    }
                                                >
                                                    Revertir a cocina
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}
