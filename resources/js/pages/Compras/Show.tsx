import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    User,
    Building,
    Receipt,
    Package,
    Database,
    CheckCircle2,
    Clock
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

interface CompraDetalle {
    id: number;
    producto: {
        nombre: string;
        codigo_barras: string;
        principio_activo: string;
    };
    lote: {
        numero_lote: string;
        fecha_vencimiento: string;
    };
    cantidad: number;
    precio_compra: number;
    subtotal: number;
}

export default function ComprasShow({ compra }: { compra: any }) {
    return (
        <AppLayout>
            <Head title={`Detalle de Compra #${compra.id} - Nexus Farma`} />

            <div className="p-6 space-y-6 max-w-7xl mx-auto">
                <div className="flex items-center gap-4">
                    <Link href="/compras">
                        <Button variant="outline" size="icon" className="rounded-full">
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Detalle de Compra</h1>
                        <p className="text-slate-500">Documento de ingreso de mercadería #{compra.id}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Resumen Card */}
                    <Card className="border-none shadow-sm lg:col-span-1">
                        <CardHeader className="border-b bg-slate-50/50">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Receipt className="w-5 h-5 text-primary" />
                                Información General
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                <span className="text-slate-500 text-sm flex items-center gap-2">
                                    <Calendar className="w-4 h-4" /> Fecha
                                </span>
                                <span className="font-semibold">{new Date(compra.created_at).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                <span className="text-slate-500 text-sm flex items-center gap-2">
                                    <Building className="w-4 h-4" /> Proveedor
                                </span>
                                <span className="font-semibold">{compra.proveedor?.nombre || 'S/P'}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                <span className="text-slate-500 text-sm flex items-center gap-2">
                                    <User className="w-4 h-4" /> Registrado por
                                </span>
                                <span className="font-semibold">{compra.usuario?.name || 'S/U'}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                <span className="text-slate-500 text-sm flex items-center gap-2">
                                    <Clock className="w-4 h-4" /> Estado
                                </span>
                                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">
                                    {compra.estado}
                                </Badge>
                            </div>
                            <div className="pt-4">
                                <div className="bg-primary/5 rounded-2xl p-6 text-center border border-primary/10">
                                    <span className="text-xs font-bold text-primary uppercase tracking-widest block mb-1">Monto Total Invertido</span>
                                    <span className="text-4xl font-black text-slate-900">{parseFloat(compra.monto_total).toFixed(2)} <span className="text-lg">BOB</span></span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Items Card */}
                    <Card className="border-none shadow-sm lg:col-span-2">
                        <CardHeader className="border-b bg-slate-50/50">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Package className="w-5 h-5 text-primary" />
                                Administrar Stock e Items
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Producto</TableHead>
                                        <TableHead>Lote / Vence</TableHead>
                                        <TableHead className="text-center">Cantidad</TableHead>
                                        <TableHead className="text-right">P. Compra</TableHead>
                                        <TableHead className="text-right">Subtotal</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {compra.detalles?.map((detalle: CompraDetalle) => (
                                        <TableRow key={detalle.id}>
                                            <TableCell>
                                                <div className="font-bold text-slate-900">{detalle.producto.nombre}</div>
                                                <div className="text-[10px] text-slate-500 italic">{detalle.producto.principio_activo}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <Badge variant="outline" className="w-fit text-[10px] mb-1">
                                                        Lote: {detalle.lote?.numero_lote || 'N/A'}
                                                    </Badge>
                                                    <span className="text-[10px] text-slate-500">Vence: {detalle.lote?.fecha_vencimiento || 'N/A'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="inline-flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-full font-bold text-slate-700">
                                                    {detalle.cantidad}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right font-medium text-slate-600">
                                                {detalle.precio_compra} BOB
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-primary">
                                                {(detalle.cantidad * detalle.precio_compra).toFixed(2)} BOB
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            {(!compra.detalles || compra.detalles.length === 0) && (
                                <div className="p-10 text-center text-slate-400">
                                    <Database className="w-10 h-10 mx-auto mb-2 opacity-20" />
                                    No se encontraron detalles para esta compra.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
