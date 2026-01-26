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

            <div className="p-4 sm:p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                            <FileText className="h-8 w-8 text-primary" />
                            Reporte de Ventas
                        </h1>
                        <p className="text-muted-foreground mt-1">Visualiza y analiza las ventas de tu negocio</p>
                    </div>
                    <Button
                        onClick={exportarPDF}
                        disabled={isExporting || ventas.total === 0}
                        className="h-12 px-6 rounded-xl font-bold shadow-lg"
                    >
                        {isExporting ? (
                            <>Generando PDF...</>
                        ) : (
                            <>
                                <Download className="mr-2 h-5 w-5" />
                                Descargar PDF
                            </>
                        )}
                    </Button>
                </div>

                {/* Filtros */}
                <Card className="border-none shadow-lg">
                    <CardHeader className="bg-muted/30">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Filter className="h-5 w-5" />
                            Filtros de búsqueda
                        </CardTitle>
                        <CardDescription>Personaliza tu reporte aplicando filtros</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                                    <Calendar className="h-3 w-3" /> Fecha inicio
                                </Label>
                                <Input
                                    type="date"
                                    value={fechaInicio}
                                    onChange={e => setFechaInicio(e.target.value)}
                                    className="h-11 rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                                    <Calendar className="h-3 w-3" /> Fecha fin
                                </Label>
                                <Input
                                    type="date"
                                    value={fechaFin}
                                    onChange={e => setFechaFin(e.target.value)}
                                    className="h-11 rounded-xl"
                                />
                            </div>
                            {isAdmin && (
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-muted-foreground">Sucursal</Label>
                                    <Select value={sucursalId} onValueChange={setSucursalId}>
                                        <SelectTrigger className="h-11 rounded-xl">
                                            <SelectValue placeholder="Todas las sucursales" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todas</SelectItem>
                                            {sucursales.map(s => (
                                                <SelectItem key={s.id} value={s.id.toString()}>{s.nombre_sucursal}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                                    <Search className="h-3 w-3" /> Buscar producto
                                </Label>
                                <Input
                                    placeholder="Nombre del producto..."
                                    value={query}
                                    onChange={e => setQuery(e.target.value)}
                                    className="h-11 rounded-xl"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-muted-foreground">Métodos de pago</Label>
                            <div className="flex flex-wrap gap-3">
                                {['Efectivo', 'QR', 'Efectivo + QR', 'Tarjeta'].map(tipo => (
                                    <div key={tipo} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={tipo}
                                            checked={tiposPago.includes(tipo)}
                                            onCheckedChange={() => toggleTipoPago(tipo)}
                                        />
                                        <Label htmlFor={tipo} className="cursor-pointer font-medium">
                                            {tipo}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button onClick={aplicarFiltros} className="flex-1 h-11 rounded-xl font-bold">
                                <Filter className="mr-2 h-4 w-4" />
                                Aplicar filtros
                            </Button>
                            <Button onClick={limpiarFiltros} variant="outline" className="h-11 px-6 rounded-xl font-semibold">
                                Limpiar
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Estadísticas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="border-none shadow-md hover:shadow-xl transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold text-muted-foreground uppercase">Total ventas</p>
                                    <p className="text-3xl font-black text-primary mt-1">Bs. {estadisticas.total_ventas.toFixed(2)}</p>
                                </div>
                                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                                    <TrendingUp className="h-7 w-7 text-primary" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-md hover:shadow-xl transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold text-muted-foreground uppercase">Efectivo</p>
                                    <p className="text-3xl font-black text-green-600 mt-1">Bs. {estadisticas.total_efectivo.toFixed(2)}</p>
                                </div>
                                <div className="h-14 w-14 rounded-2xl bg-green-100 flex items-center justify-center">
                                    <DollarSign className="h-7 w-7 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-md hover:shadow-xl transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold text-muted-foreground uppercase">QR / Transferencia</p>
                                    <p className="text-3xl font-black text-blue-600 mt-1">Bs. {estadisticas.total_qr.toFixed(2)}</p>
                                </div>
                                <div className="h-14 w-14 rounded-2xl bg-blue-100 flex items-center justify-center">
                                    <Smartphone className="h-7 w-7 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-md hover:shadow-xl transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold text-muted-foreground uppercase">Transacciones</p>
                                    <p className="text-3xl font-black text-orange-600 mt-1">{estadisticas.total_transacciones}</p>
                                    <p className="text-xs text-muted-foreground mt-1">Promedio: Bs. {estadisticas.promedio_venta.toFixed(2)}</p>
                                </div>
                                <div className="h-14 w-14 rounded-2xl bg-orange-100 flex items-center justify-center">
                                    <CreditCard className="h-7 w-7 text-orange-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabla */}
                <Card className="border-none shadow-lg">
                    <CardHeader className="bg-muted/30">
                        <CardTitle className="text-lg">
                            Listado de ventas ({ventas.total} registros)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead className="font-bold">Fecha</TableHead>
                                        <TableHead className="font-bold">Ticket</TableHead>
                                        <TableHead className="font-bold">Cliente</TableHead>
                                        <TableHead className="font-bold">Productos</TableHead>
                                        <TableHead className="font-bold">Tipo Pago</TableHead>
                                        <TableHead className="font-bold text-right">Total</TableHead>
                                        {isAdmin && <TableHead className="font-bold">Sucursal</TableHead>}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {ventas.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={isAdmin ? 7 : 6} className="text-center py-12 text-muted-foreground">
                                                No se encontraron ventas con los filtros aplicados
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        ventas.data.map((venta) => (
                                            <TableRow key={venta.id} className="hover:bg-muted/30">
                                                <TableCell className="font-medium">
                                                    {new Date(venta.created_at).toLocaleDateString('es-BO', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric'
                                                    })}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="font-mono">
                                                        #{String(venta.id).padStart(6, '0')}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="font-semibold">{venta.cliente}</TableCell>
                                                <TableCell>
                                                    <div className="max-w-xs">
                                                        {venta.detalles.slice(0, 2).map((d, i) => (
                                                            <span key={i} className="text-xs text-muted-foreground">
                                                                {d.inventario.producto.nombre}
                                                                {i < 1 && venta.detalles.length > 1 ? ', ' : ''}
                                                            </span>
                                                        ))}
                                                        {venta.detalles.length > 2 && (
                                                            <Badge variant="secondary" className="ml-1 text-xs">
                                                                +{venta.detalles.length - 2}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={
                                                        venta.tipo_pago === 'Efectivo' ? 'bg-green-500' :
                                                            venta.tipo_pago === 'QR' ? 'bg-blue-500' :
                                                                'bg-purple-500'
                                                    }>
                                                        {venta.tipo_pago}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right font-black text-primary">
                                                    Bs. {Number(venta.monto_total).toFixed(2)}
                                                </TableCell>
                                                {isAdmin && (
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        {venta.sucursal.nombre_sucursal}
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Paginación */}
                {ventas.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2 sm:gap-4 bg-card p-4 rounded-xl border shadow-sm">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-full px-3 sm:px-4"
                            disabled={ventas.current_page === 1}
                            onClick={() => irAPagina(ventas.current_page - 1)}
                        >
                            <Minus className="mr-1 sm:mr-2 h-4 w-4" /> Anterior
                        </Button>
                        <div className="flex items-center gap-1">
                            {[...Array(Math.min(ventas.last_page, 7))].map((_, i) => {
                                let page;
                                if (ventas.last_page <= 7) {
                                    page = i + 1;
                                } else if (ventas.current_page <= 4) {
                                    page = i + 1;
                                } else if (ventas.current_page >= ventas.last_page - 3) {
                                    page = ventas.last_page - 6 + i;
                                } else {
                                    page = ventas.current_page - 3 + i;
                                }

                                if (page < 1 || page > ventas.last_page) return null;

                                return (
                                    <Button
                                        key={page}
                                        variant={ventas.current_page === page ? "default" : "ghost"}
                                        size="icon"
                                        className="h-9 w-9 rounded-full text-xs font-bold"
                                        onClick={() => irAPagina(page)}
                                    >
                                        {page}
                                    </Button>
                                );
                            })}
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-full px-3 sm:px-4"
                            disabled={ventas.current_page === ventas.last_page}
                            onClick={() => irAPagina(ventas.current_page + 1)}
                        >
                            Siguiente <Plus className="ml-1 sm:ml-2 h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
