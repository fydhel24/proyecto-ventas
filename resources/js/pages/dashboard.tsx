"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import * as React from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, LabelList, Line, LineChart, Pie, PieChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { Package, ShoppingCart, AlertCircle, MessageSquare } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

interface DashboardProps {
    stats: {
        totalProductos: number;
        totalPedidos: number;
        pedidosHoy: number;
        stockBajo: number;
        statusDistribution: Array<{ status: string; count: number; fill: string }>;
        ordersOverTime: Array<{ date: string; count: number }>;
        productsByCategory: Array<{ category: string; count: number }>;
        whatsappStats: Array<{ day: string; enviados: number; fallidos: number }>;
    };
}

const statusChartConfig = {
    count: {
        label: "Pedidos",
    },
    la_paz: {
        label: "La Paz",
        color: "hsl(var(--chart-1))",
    },
    enviado: {
        label: "Enviado",
        color: "hsl(var(--chart-2))",
    },
    listo: {
        label: "Listo",
        color: "hsl(var(--chart-3))",
    },
    pendiente: {
        label: "Pendiente",
        color: "hsl(var(--chart-4))",
    },
} satisfies ChartConfig;

const categoryChartConfig = {
    count: {
        label: "Productos",
        color: "hsl(var(--chart-1))",
    },
} satisfies ChartConfig;

const ordersChartConfig = {
    count: {
        label: "Pedidos",
        color: "hsl(var(--chart-2))",
    },
} satisfies ChartConfig;

const whatsappChartConfig = {
    enviados: {
        label: "Enviados",
        color: "hsl(var(--chart-1))",
    },
    fallidos: {
        label: "Fallidos",
        color: "hsl(var(--chart-5))",
    },
} satisfies ChartConfig;

export default function Dashboard({ stats }: DashboardProps) {
    const [timeRange, setTimeRange] = React.useState("30d");

    const filteredData = React.useMemo(() => {
        const referenceDate = new Date();
        let daysToSubtract = 30;
        if (timeRange === "90d") daysToSubtract = 90;
        else if (timeRange === "7d") daysToSubtract = 7;

        const startDate = new Date();
        startDate.setDate(referenceDate.getDate() - daysToSubtract);

        return stats.ordersOverTime.filter((item) => {
            const date = new Date(item.date);
            return date >= startDate;
        });
    }, [timeRange, stats.ordersOverTime]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex flex-1 flex-col gap-6 p-6 overflow-y-auto">
                {/* Metrics Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-none shadow-sm bg-blue-50/50 dark:bg-blue-950/20">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
                            <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalProductos}</div>
                            <p className="text-xs text-muted-foreground mt-1">En el inventario</p>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm bg-green-50/50 dark:bg-green-950/20">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Pedidos</CardTitle>
                            <ShoppingCart className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalPedidos}</div>
                            <p className="text-xs text-muted-foreground mt-1">Acumulados</p>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm bg-purple-50/50 dark:bg-purple-950/20">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pedidos Hoy</CardTitle>
                            <ShoppingCart className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.pedidosHoy}</div>
                            <p className="text-xs text-muted-foreground mt-1">Nuevos pedidos</p>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm bg-orange-50/50 dark:bg-orange-950/20">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
                            <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.stockBajo}</div>
                            <p className="text-xs text-muted-foreground mt-1">Menos de 5 unidades</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    {/* Orders Over Time Interactive Area Chart */}
                    <Card className="lg:col-span-4 border-none shadow-sm pt-0">
                        <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
                            <div className="grid flex-1 gap-1">
                                <CardTitle>Crecimiento de Pedidos</CardTitle>
                                <CardDescription>
                                    Tendencia de registros en el tiempo
                                </CardDescription>
                            </div>
                            <Select value={timeRange} onValueChange={setTimeRange}>
                                <SelectTrigger
                                    className="w-[160px] rounded-lg sm:ml-auto"
                                    aria-label="Seleccionar rango"
                                >
                                    <SelectValue placeholder="Rango de tiempo" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="90d" className="rounded-lg">
                                        Últimos 3 meses
                                    </SelectItem>
                                    <SelectItem value="30d" className="rounded-lg">
                                        Últimos 30 días
                                    </SelectItem>
                                    <SelectItem value="7d" className="rounded-lg">
                                        Últimos 7 días
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </CardHeader>
                        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                            <ChartContainer config={ordersChartConfig} className="aspect-auto h-[250px] w-full">
                                <AreaChart data={filteredData}>
                                    <defs>
                                        <linearGradient id="fillOrders" x1="0" y1="0" x2="0" y2="1">
                                            <stop
                                                offset="5%"
                                                stopColor="var(--color-count)"
                                                stopOpacity={0.8}
                                            />
                                            <stop
                                                offset="95%"
                                                stopColor="var(--color-count)"
                                                stopOpacity={0.1}
                                            />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                        minTickGap={32}
                                        tickFormatter={(value) => {
                                            const date = new Date(value);
                                            return date.toLocaleDateString("es-ES", {
                                                month: "short",
                                                day: "numeric",
                                            });
                                        }}
                                    />
                                    <ChartTooltip
                                        cursor={false}
                                        content={
                                            <ChartTooltipContent
                                                labelFormatter={(value) => {
                                                    return new Date(value).toLocaleDateString("es-ES", {
                                                        month: "long",
                                                        day: "numeric",
                                                        year: "numeric",
                                                    });
                                                }}
                                                indicator="dot"
                                            />
                                        }
                                    />
                                    <Area
                                        dataKey="count"
                                        type="natural"
                                        fill="url(#fillOrders)"
                                        stroke="var(--color-count)"
                                        stackId="a"
                                    />
                                    <ChartLegend content={<ChartLegendContent />} />
                                </AreaChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                    {/* Status Distribution Pie Chart */}
                    <Card className="lg:col-span-3 border-none shadow-sm h-full">
                        <CardHeader>
                            <CardTitle>Estado de Pedidos</CardTitle>
                            <CardDescription>Distribución actual</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 pb-0 flex flex-col justify-center">
                            <ChartContainer config={statusChartConfig} className="mx-auto aspect-square max-h-[250px]">
                                <PieChart>
                                    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                                    <Pie
                                        data={stats.statusDistribution}
                                        dataKey="count"
                                        nameKey="status"
                                        innerRadius={60}
                                        strokeWidth={5}
                                    >
                                        {stats.statusDistribution.map((entry, index) => {
                                            // Map status labels to config keys for color consistency
                                            const configKey = entry.status.toLowerCase().replace(/\s+/g, '_');
                                            const color = statusChartConfig[configKey as keyof typeof statusChartConfig]?.color || entry.fill;
                                            return <Cell key={`cell-${index}`} fill={color} />;
                                        })}
                                    </Pie>
                                </PieChart>
                            </ChartContainer>
                            <div className="grid grid-cols-2 gap-2 mt-4 text-xs pb-4">
                                {stats.statusDistribution.map((item) => (
                                    <div key={item.status} className="flex items-center gap-1">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }} />
                                        <span>{item.status}: {item.count}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    {/* Products by Category Bar Chart */}
                    <Card className="lg:col-span-4 border-none shadow-sm">
                        <CardHeader>
                            <CardTitle>Productos por Categoría</CardTitle>
                            <CardDescription>Stock por tipo</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={categoryChartConfig} className="h-[300px] w-full">
                                <BarChart data={stats.productsByCategory} layout="vertical" margin={{ left: -20 }}>
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="category"
                                        type="category"
                                        tickLine={false}
                                        tickMargin={10}
                                        axisLine={false}
                                    />
                                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                                    <Bar dataKey="count" fill="var(--color-count)" radius={5}>
                                        <LabelList dataKey="count" position="right" offset={8} className="fill-foreground" fontSize={12} />
                                    </Bar>
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                    {/* WhatsApp Bot Stats Bar Chart */}
                    <Card className="lg:col-span-3 border-none shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MessageSquare className="h-5 w-5 text-green-500" />
                                WhatsApp Bot
                            </CardTitle>
                            <CardDescription>Actividad semanal</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={whatsappChartConfig} className="h-[250px] w-full">
                                <BarChart data={stats.whatsappStats}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis
                                        dataKey="day"
                                        tickLine={false}
                                        tickMargin={10}
                                        axisLine={false}
                                    />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Bar dataKey="enviados" fill="var(--color-enviados)" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="fallidos" fill="var(--color-fallidos)" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ChartContainer>
                            <div className="flex items-center justify-center gap-4 mt-4 text-xs">
                                <div className="flex items-center gap-1">
                                    <div className="w-3 h-3 rounded-full bg-[hsl(var(--chart-1))]" />
                                    <span>Enviados</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="w-3 h-3 rounded-full bg-[hsl(var(--chart-5))]" />
                                    <span>Fallidos</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
