import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import { Calendar, Download, FileText, Filter, Search, TrendingUp, DollarSign, CreditCard, Smartphone, Plus, Minus } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface Venta {
    id: number;
    cliente: string;
    ci?: string;
    tipo_pago: string;
    monto_total: number;
    pagado: number;
    cambio: number;
    efectivo: number;
    qr: number;
    created_at: string;
    sucursal: {
        id: number;
        nombre_sucursal: string;
    };
    detalles: Array<{
        cantidad: number;
        precio_venta: number;
        subtotal: number;
        inventario: {
            producto: {
                nombre: string;
            };
        };
    }>;
}

interface Sucursal {
    id: number;
    nombre_sucursal: string;
}

interface PaginationData {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
    data: Venta[];
}

interface Estadisticas {
    total_ventas: number;
    total_transacciones: number;
    total_efectivo: number;
    total_qr: number;
    promedio_venta: number;
}

interface Props {
    ventas: PaginationData;
    estadisticas: Estadisticas;
    sucursales: Sucursal[];
    isAdmin: boolean;
    filtros: {
        query: string;
        fecha_inicio: string;
        fecha_fin: string;
        tipos_pago: string[];
        sucursal_id: string | null;
    };
}

export default function ReporteVentas({ ventas, estadisticas, sucursales, isAdmin, filtros }: Props) {
    const [query, setQuery] = useState(filtros.query);
    const [fechaInicio, setFechaInicio] = useState(filtros.fecha_inicio);
    const [fechaFin, setFechaFin] = useState(filtros.fecha_fin);
    const [tiposPago, setTiposPago] = useState<string[]>(filtros.tipos_pago);
    const [sucursalId, setSucursalId] = useState(filtros.sucursal_id || 'all');
    const [isExporting, setIsExporting] = useState(false);

    const toggleTipoPago = (tipo: string) => {
        setTiposPago(prev =>
            prev.includes(tipo) ? prev.filter(t => t !== tipo) : [...prev, tipo]
        );
    };

    const aplicarFiltros = () => {
        router.get('/reportes/ventas', {
            query,
            fecha_inicio: fechaInicio,
            fecha_fin: fechaFin,
            tipos_pago: tiposPago,
            sucursal_id: sucursalId === 'all' ? null : sucursalId,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const limpiarFiltros = () => {
        setQuery('');
        setFechaInicio(new Date().toISOString().split('T')[0].substring(0, 8) + '01');
        setFechaFin(new Date().toISOString().split('T')[0]);
        setTiposPago([]);
        setSucursalId('all');
    };

    const exportarPDF = async () => {
        setIsExporting(true);
        try {
            const response = await axios.post('/reportes/ventas/export', {
                query,
                fecha_inicio: fechaInicio,
                fecha_fin: fechaFin,
                tipos_pago: tiposPago,
                tiposPago,
                sucursal_id: sucursalId === 'all' ? null : sucursalId,
            }, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `reporte_ventas_${new Date().getTime()}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success('Reporte descargado exitosamente');
        } catch (error) {
            toast.error('Error al exportar el reporte');
        } finally {
            setIsExporting(false);
        }
    };

    const irAPagina = (page: number) => {
        router.get('/reportes/ventas', {
            query,
            fecha_inicio: fechaInicio,
            fecha_fin: fechaFin,
            tipos_pago: tiposPago,
            tiposPago,
            sucursal_id: sucursalId === 'all' ? null : sucursalId,
            page,
        }, {
            preserveState: true,
            preserveScroll: false,
        });
    };

    useEffect(() => {
        const delaySearch = setTimeout(() => {
            if (query !== filtros.query) {
                aplicarFiltros();
            }
        }, 500);
        return () => clearTimeout(delaySearch);
    }, [query]);

    return (
        <AppLayout breadcrumbs={[{ title: 'Reportes', href: '/reportes' }, { title: 'Ventas', href: '/reportes/ventas' }]}>
            <Head title="Reporte de Ventas" />

            <div className="p-4 sm:p-6 space-y-8 max-w-[1600px] mx-auto">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card p-6 rounded-2xl shadow-sm border">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight flex items-center gap-3 text-foreground">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <FileText className="h-8 w-8 text-primary" />
                            </div>
                            Reporte de Ventas
                        </h1>
                        <p className="text-muted-foreground mt-2 text-sm max-w-2xl">
                            Análisis detallado de transacciones <strong>completadas</strong>. Las ventas anuladas no se incluyen en estos cálculos.
                        </p>
                    </div>
                    <Button
                        onClick={exportarPDF}
                        disabled={isExporting || ventas.total === 0}
                        size="lg"
                        className="rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
                    >
                        {isExporting ? (
                            <>Generando...</>
                        ) : (
                            <>
                                <Download className="mr-2 h-5 w-5" />
                                Exportar PDF
                            </>
                        )}
                    </Button>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="border-none shadow-md bg-gradient-to-br from-primary/5 to-transparent">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-primary uppercase tracking-wider">Ingresos Totales</p>
                                    <p className="text-3xl font-black text-foreground">Bs. {estadisticas.total_ventas.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                </div>
                                <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
                                    <TrendingUp className="h-6 w-6 text-primary" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-md bg-gradient-to-br from-green-500/5 to-transparent">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-green-600 uppercase tracking-wider">Efectivo</p>
                                    <p className="text-3xl font-black text-foreground">Bs. {estadisticas.total_efectivo.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                </div>
                                <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center">
                                    <DollarSign className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-md bg-gradient-to-br from-blue-500/5 to-transparent">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">QR / Digital</p>
                                    <p className="text-3xl font-black text-foreground">Bs. {estadisticas.total_qr.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                </div>
                                <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                                    <Smartphone className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-md bg-gradient-to-br from-orange-500/5 to-transparent">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-orange-600 uppercase tracking-wider">Transacciones</p>
                                    <p className="text-3xl font-black text-foreground">{estadisticas.total_transacciones}</p>
                                    <p className="text-[10px] text-muted-foreground font-medium">Ticket Promedio: Bs. {estadisticas.promedio_venta.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                </div>
                                <div className="h-12 w-12 rounded-xl bg-orange-100 flex items-center justify-center">
                                    <CreditCard className="h-6 w-6 text-orange-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters & Data Section */}
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                    {/* Filters Sidebar */}
                    <div className="xl:col-span-1 space-y-6">
                        <Card className="border shadow-sm h-full">
                            <CardHeader className="bg-muted/40 pb-4">
                                <CardTitle className="flex items-center gap-2 text-base font-bold">
                                    <Filter className="h-4 w-4" />
                                    Filtros Avanzados
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-5 space-y-5">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-muted-foreground uppercase">Período</Label>
                                    <div className="grid gap-2">
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                type="datetime-local"
                                                value={fechaInicio}
                                                onChange={e => setFechaInicio(e.target.value)}
                                                className="pl-9 h-10 bg-background"
                                            />
                                        </div>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                type="datetime-local"
                                                value={fechaFin}
                                                onChange={e => setFechaFin(e.target.value)}
                                                className="pl-9 h-10 bg-background"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {isAdmin && (
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-muted-foreground uppercase">Sucursal</Label>
                                        <Select value={sucursalId} onValueChange={setSucursalId}>
                                            <SelectTrigger className="h-10">
                                                <SelectValue placeholder="Todas" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Todas las sucursales</SelectItem>
                                                {sucursales.map(s => (
                                                    <SelectItem key={s.id} value={s.id.toString()}>{s.nombre_sucursal}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-muted-foreground uppercase">Búsqueda</Label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Cliente, Ticket o Producto..."
                                            value={query}
                                            onChange={e => setQuery(e.target.value)}
                                            className="pl-9 h-10"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-xs font-bold text-muted-foreground uppercase">Método de Pago</Label>
                                    <div className="grid grid-cols-1 gap-2">
                                        {['Efectivo', 'QR', 'Efectivo + QR'].map(tipo => (
                                            <label key={tipo} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer border border-transparent hover:border-border">
                                                <Checkbox
                                                    id={tipo}
                                                    checked={tiposPago.includes(tipo)}
                                                    onCheckedChange={() => toggleTipoPago(tipo)}
                                                    className="rounded-[4px] data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                                />
                                                <span className="text-sm font-medium">{tipo}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-2 flex gap-2">
                                    <Button onClick={aplicarFiltros} className="flex-1 font-bold">
                                        Aplicar
                                    </Button>
                                    <Button onClick={limpiarFiltros} variant="secondary" className="px-3">
                                        Limpiar
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Data Table */}
                    <div className="xl:col-span-3">
                        <Card className="border shadow-sm h-full flex flex-col">
                            <CardHeader className="bg-muted/30 py-4 border-b">
                                <CardTitle className="text-sm font-medium flex justify-between items-center">
                                    <span>Transacciones Registradas</span>
                                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-md font-bold">
                                        Total: {ventas.total}
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0 flex-1">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/50 hover:bg-muted/50">
                                                <TableHead className="w-[100px] font-bold">Fecha</TableHead>
                                                <TableHead className="w-[80px] font-bold text-center">Ticket</TableHead>
                                                <TableHead className="min-w-[150px] font-bold">Cliente</TableHead>
                                                <TableHead className="min-w-[200px] font-bold">Detalle</TableHead>
                                                <TableHead className="w-[120px] font-bold">Pago</TableHead>
                                                <TableHead className="w-[120px] font-bold text-right">Total</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {ventas.data.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                                        No se encontraron resultados para los filtros seleccionados.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                ventas.data.map((venta) => (
                                                    <TableRow key={venta.id} className="hover:bg-muted/30 transition-colors">
                                                        <TableCell className="text-xs font-medium text-muted-foreground">
                                                            {new Date(venta.created_at).toLocaleDateString('es-BO', {
                                                                day: '2-digit',
                                                                month: '2-digit',
                                                                year: '2-digit'
                                                            })}
                                                            <div className="text-[10px] opacity-70">
                                                                {new Date(venta.created_at).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <Badge variant="outline" className="font-mono text-[10px] px-1 py-0 h-5">
                                                                #{String(venta.id).padStart(6, '0')}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="font-semibold text-sm truncate max-w-[140px]" title={venta.cliente}>
                                                                {venta.cliente}
                                                            </div>
                                                            {venta.ci && <div className="text-[10px] text-muted-foreground">NIT/CI: {venta.ci}</div>}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex flex-col gap-1 max-w-[220px]">
                                                                {venta.detalles.slice(0, 2).map((d, i) => (
                                                                    <div key={i} className="text-xs truncate flex items-center justify-between gap-2 border-b border-border/50 pb-0.5 last:border-0 last:pb-0">
                                                                        <span className="truncate flex-1">{d.inventario.producto.nombre}</span>
                                                                        <span className="font-mono text-muted-foreground text-[10px]">x{d.cantidad}</span>
                                                                    </div>
                                                                ))}
                                                                {venta.detalles.length > 2 && (
                                                                    <Badge variant="secondary" className="w-fit text-[9px] h-4">
                                                                        +{venta.detalles.length - 2} más
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge className={
                                                                venta.tipo_pago === 'Efectivo' ? 'bg-green-100 text-green-700 hover:bg-green-200 border-none shadow-none' :
                                                                    venta.tipo_pago === 'QR' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 border-none shadow-none' :
                                                                        'bg-purple-100 text-purple-700 hover:bg-purple-200 border-none shadow-none'
                                                            }>
                                                                {venta.tipo_pago}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right font-black text-sm">
                                                            Bs. {Number(venta.monto_total).toFixed(2)}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>

                            {/* Pagination Footer */}
                            {ventas.last_page > 1 && (
                                <div className="p-4 border-t bg-muted/20 flex items-center justify-between">
                                    <div className="text-xs text-muted-foreground hidden sm:block">
                                        Mostrando {ventas.data.length} de {ventas.total} resultados
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={ventas.current_page === 1}
                                            onClick={() => irAPagina(ventas.current_page - 1)}
                                            className="h-8 w-8 p-0"
                                        >
                                            <Minus className="h-4 w-4" />
                                        </Button>
                                        <div className="text-xs font-medium px-2">
                                            Página {ventas.current_page} de {ventas.last_page}
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={ventas.current_page === ventas.last_page}
                                            onClick={() => irAPagina(ventas.current_page + 1)}
                                            className="h-8 w-8 p-0"
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
