import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, router, Link } from '@inertiajs/react';
import {
    History,
    Plus,
    Search,
    Eye,
    ShoppingCart,
    Calendar,
    User,
    Building
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';

export default function ComprasIndex({ compras }: any) {
    return (
        <AppLayout>
            <Head title="Historial de Compras - Nexus Farma" />

            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Registro de Compras</h1>
                        <p className="text-slate-500">Gestión de abastecimiento y entrada de mercadería.</p>
                    </div>
                    <Link href="/compras/create">
                        <Button className="bg-[#16A34A] hover:bg-[#15803d]">
                            <Plus className="w-4 h-4 mr-2" />
                            Nueva Compra (Abastecer)
                        </Button>
                    </Link>
                </div>

                <Card className="border-none shadow-sm">
                    <CardHeader className="p-4 border-b bg-slate-50/50">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <History className="w-5 h-5 text-[#16A34A]" />
                            Últimos Movimientos
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Proveedor</TableHead>
                                    <TableHead>Registrado por</TableHead>
                                    <TableHead>Monto Total</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {compras.data.map((compra: any) => (
                                    <TableRow key={compra.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-slate-400" />
                                                {new Date(compra.fecha).toLocaleDateString()}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Building className="w-4 h-4 text-slate-400" />
                                                {compra.proveedor?.nombre}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-xs">
                                                <User className="w-3 h-3 text-slate-400" />
                                                {compra.usuario?.name}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-bold text-[#16A34A]">
                                            {compra.monto_total} BOB
                                        </TableCell>
                                        <TableCell>
                                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">
                                                {compra.estado}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Link href={`/compras/${compra.id}`}>
                                                <Button variant="ghost" size="sm" className="h-8 gap-1">
                                                    <Eye className="w-4 h-4" /> Ver Detalle
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
