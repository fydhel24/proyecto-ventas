import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Plus,
    TrendingUp,
    AlertTriangle,
    Clock,
    ShoppingBag,
    Package,
    Users,
    ChevronRight,
    ArrowUpRight,
    Calendar
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { Head, Link } from '@inertiajs/react';

interface MetricProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: string;
    color?: string;
    description?: string;
}

const MetricCard = ({ title, value, icon, trend, color, description }: MetricProps) => (
    <Card className="overflow-hidden border-none shadow-md transition-all hover:shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
            <div className={`p-2 rounded-lg ${color || 'bg-primary/10 text-primary'}`}>
                {icon}
            </div>
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            {trend && (
                <p className="flex items-center mt-1 text-xs text-green-600">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {trend}
                </p>
            )}
            {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
        </CardContent>
    </Card>
);

export default function Dashboard({ metrics, charts, recentSales }: any) {
    const COLORS = ['#16A34A', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

    return (
        <AppLayout>
            <Head title="Panel de Control - Nexus Farma" />

            <div className="flex-1 p-6 space-y-8 bg-slate-50/50">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-outfit">Panel de Control</h1>
                        <p className="text-muted-foreground">Bienvenido a Nexus Farma. Aquí tienes el resumen de hoy.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" className="hidden md:flex">
                            <Calendar className="w-4 h-4 mr-2" />
                            {new Date().toLocaleDateString('es-BO', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </Button>
                        <Link href="/ventas/create">
                            <Button className="bg-[#16A34A] hover:bg-[#15803d]">
                                <Plus className="w-4 h-4 mr-2" />
                                Nueva Venta
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Metricas Rapidas */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                    <MetricCard
                        title="Ventas del Día"
                        value={`${metrics.ventasHoy} BOB`}
                        icon={<ShoppingBag className="w-4 h-4" />}
                        trend="+12% vs ayer"
                    />
                    <MetricCard
                        title="Ventas Mensuales"
                        value={`${metrics.ventasMes} BOB`}
                        icon={<TrendingUp className="w-4 h-4" />}
                        color="bg-blue-100 text-blue-600"
                    />
                    <MetricCard
                        title="Bajo Stock"
                        value={metrics.bajoStock}
                        icon={<Package className="w-4 h-4" />}
                        color="bg-orange-100 text-orange-600"
                        description="Productos por agotar"
                    />
                    <MetricCard
                        title="Por Vencer"
                        value={metrics.vencimientos}
                        icon={<AlertTriangle className="w-4 h-4" />}
                        color="bg-red-100 text-red-600"
                        description="Próximos 30 días"
                    />
                    <MetricCard
                        title="Reservas"
                        value={metrics.reservas}
                        icon={<Clock className="w-4 h-4" />}
                        color="bg-purple-100 text-purple-600"
                        description="Pendientes"
                    />
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                    {/* Grafica de Ventas */}
                    <Card className="border-none shadow-md lg:col-span-4">
                        <CardHeader>
                            <CardTitle>Rendimiento Semanal</CardTitle>
                            <CardDescription>Ventas realizadas en los últimos 7 días</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={charts.ventasSemana}>
                                        <defs>
                                            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#16A34A" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                            formatter={(value) => [`${value} BOB`, 'Ventas']}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="total"
                                            stroke="#16A34A"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorTotal)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Categorias Pie Chart */}
                    <Card className="border-none shadow-md lg:col-span-3">
                        <CardHeader>
                            <CardTitle>Stock por Categoría</CardTitle>
                            <CardDescription>Distribución de productos</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center">
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={charts.categorias}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="count"
                                            nameKey="category"
                                        >
                                            {charts.categorias.map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-4 text-xs font-medium">
                                {charts.categorias.slice(0, 4).map((item: any, i: number) => (
                                    <div key={i} className="flex items-center">
                                        <div className="w-3 h-3 mr-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                                        <span className="truncate max-w-[100px]">{item.category}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Ultimas Ventas Table */}
                <Card className="border-none shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Últimas Ventas</CardTitle>
                            <CardDescription>Resumen de las transacciones más recientes</CardDescription>
                        </div>
                        <Link href="/ventas">
                            <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                                Ver todas <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs uppercase bg-slate-50 text-muted-foreground">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold">Venta ID</th>
                                        <th className="px-4 py-3 font-semibold">Cliente</th>
                                        <th className="px-4 py-3 font-semibold">Vendedor</th>
                                        <th className="px-4 py-3 font-semibold">Fecha</th>
                                        <th className="px-4 py-3 font-semibold text-right">Monto</th>
                                        <th className="px-4 py-3 font-semibold">Estado</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {recentSales.map((sale: any) => (
                                        <tr key={sale.id} className="transition-colors hover:bg-slate-50/50">
                                            <td className="px-4 py-4 font-medium">#{strPad(sale.id, 6)}</td>
                                            <td className="px-4 py-4">{sale.cliente?.nombre || 'General'}</td>
                                            <td className="px-4 py-4">{sale.vendedor?.name}</td>
                                            <td className="px-4 py-4 text-muted-foreground">{new Date(sale.created_at).toLocaleString()}</td>
                                            <td className="px-4 py-4 font-bold text-right">{sale.monto_total} BOB</td>
                                            <td className="px-4 py-4">
                                                <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">
                                                    {sale.estado}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                    {recentSales.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="py-8 text-center text-muted-foreground">No hay ventas registradas hoy.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

function strPad(n: number, width: number) {
    let s = n + '';
    while (s.length < width) s = '0' + s;
    return s;
}
