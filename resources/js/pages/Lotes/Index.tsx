import React, { useState, useMemo } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, router, Link } from '@inertiajs/react';
import {
    Search,
    Trash2,
    AlertTriangle,
    Clock,
    CheckCircle2,
    Filter
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
import { toast } from 'sonner';

export default function LotesIndex({ lotes, filters }: any) {
    const [search, setSearch] = useState(filters.search || '');
    const [activeFilter, setActiveFilter] = useState(filters.filter || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/lotes', { search, filter: activeFilter }, { preserveState: true });
    };

    const setFilter = (f: string) => {
        setActiveFilter(f);
        router.get('/lotes', { search, filter: f }, { preserveState: true });
    };

    const getStatusBadge = (expiryDate: string) => {
        const today = new Date();
        const expiry = new Date(expiryDate);
        const diffTime = expiry.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 0) {
            return <Badge variant="destructive" className="animate-pulse">VENCIDO</Badge>;
        } else if (diffDays <= 90) {
            return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-none">Próximo ({diffDays}d)</Badge>;
        }
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">Vigente</Badge>;
    };

    return (
        <AppLayout>
            <Head title="Control de Lotes - Nexus Farma" />

            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Control de Lotes y Vencimientos</h1>
                        <p className="text-slate-500">Monitorea el inventario por fecha de caducidad para evitar pérdidas.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant={activeFilter === '' ? 'default' : 'outline'} onClick={() => setFilter('')}>Todos</Button>
                        <Button variant={activeFilter === 'vencidos' ? 'destructive' : 'outline'} onClick={() => setFilter('vencidos')}>
                            <AlertTriangle className="w-4 h-4 mr-2" /> Vencidos
                        </Button>
                        <Button variant={activeFilter === 'proximos' ? 'default' : 'outline'} className={activeFilter === 'proximos' ? 'bg-orange-500 hover:bg-orange-600' : ''} onClick={() => setFilter('proximos')}>
                            <Clock className="w-4 h-4 mr-2" /> Próximos a Vencer
                        </Button>
                    </div>
                </div>

                <Card className="border-none shadow-sm">
                    <CardHeader className="p-4 border-b">
                        <form onSubmit={handleSearch} className="flex gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                <Input
                                    placeholder="Buscar por medicamente o número de lote..."
                                    className="pl-10 h-11"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <Button type="submit" variant="secondary" className="h-11">Buscar</Button>
                        </form>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Producto</TableHead>
                                    <TableHead>No. Lote</TableHead>
                                    <TableHead>Laboratorio</TableHead>
                                    <TableHead>Stock en Lote</TableHead>
                                    <TableHead>Vencimiento</TableHead>
                                    <TableHead>Estado</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {lotes.data.map((lote: any) => (
                                    <TableRow key={lote.id} className={new Date(lote.fecha_vencimiento) <= new Date() ? 'bg-red-50/30' : ''}>
                                        <TableCell className="font-bold text-slate-800">{lote.producto?.nombre}</TableCell>
                                        <TableCell className="font-mono text-xs">{lote.numero_lote}</TableCell>
                                        <TableCell className="text-xs text-slate-500">{lote.producto?.laboratorio?.nombre_lab}</TableCell>
                                        <TableCell>
                                            <span className={`font-bold ${lote.stock <= 5 ? 'text-red-500' : 'text-slate-600'}`}>
                                                {lote.stock} uds.
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(lote.fecha_vencimiento).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(lote.fecha_vencimiento)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {lotes.data.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-12 text-slate-400">
                                            No se encontraron lotes con los criterios activos.
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
