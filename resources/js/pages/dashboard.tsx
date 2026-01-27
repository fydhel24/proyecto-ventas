"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartStyle } from '@/components/ui/chart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ColorThemeSelector } from '@/components/color-theme-selector';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { SharedData } from '@/types';
import * as React from 'react';
import AppLogo from '@/components/app-logo';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Label, LabelList, Line, LineChart, Pie, PieChart, ResponsiveContainer, Sector, XAxis, YAxis } from 'recharts';
import { type PieSectorDataItem } from "recharts/types/polar/Pie";
import { Package, ShoppingCart, AlertCircle, MessageSquare, TrendingUp } from 'lucide-react';

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
        color: "var(--chart-1)",
    },
    enviado: {
        label: "Enviado",
        color: "var(--chart-2)",
    },
    listo: {
        label: "Listo",
        color: "var(--chart-3)",
    },
    pendiente: {
        label: "Pendiente",
        color: "var(--chart-4)",
    },
} satisfies ChartConfig;

const categoryChartConfig = {
    count: {
        label: "Productos",
    },
    // We'll map these dynamically or use standard keys
} as ChartConfig;

const ordersChartConfig = {
    count: {
        label: "Pedidos",
        color: "var(--chart-2)",
    },
} satisfies ChartConfig;

const whatsappChartConfig = {
    enviados: {
        label: "Enviados",
        color: "var(--chart-1)",
    },
    fallidos: {
        label: "Fallidos",
        color: "var(--chart-5)",
    },
} satisfies ChartConfig;

export default function Dashboard({ stats }: DashboardProps) {
    const [timeRange, setTimeRange] = React.useState("30d");
    const [activeStatus, setActiveStatus] = React.useState(stats.statusDistribution[0]?.status || "");

    const activeIndex = React.useMemo(
        () => stats.statusDistribution.findIndex((item) => item.status === activeStatus),
        [activeStatus, stats.statusDistribution]
    );

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

    const { auth } = usePage<SharedData>().props;
    const roles = auth.user.roles || [];
    const isAdmin = roles.includes('admin');

    if (!isAdmin) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Bienvenido" />
                <div className="flex flex-1 flex-col gap-6 p-6 overflow-y-auto h-full">
                    {/* Header con selector de temas */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Bienvenido, {auth.user.name}</h1>
                            <p className="text-muted-foreground mt-1">Panel de control</p>
                        </div>
                        <ColorThemeSelector />
                    </div>

                    <div className="flex flex-1 items-center justify-center min-h-[60vh]">
                        <div className="text-center space-y-6 max-w-2xl px-4">
                            <div className="relative flex flex-col items-center">
                                <div className="mb-6 transform hover:scale-110 transition-transform duration-300">
                                    <AppLogo />
                                </div>
                                <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-[var(--sidebar-primary)] to-[var(--sidebar-accent)] opacity-20 blur transition duration-1000 group-hover:opacity-100 animate-pulse"></div>
                                <h2 className="relative text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[var(--sidebar-foreground)] to-[var(--sidebar-primary)]"
                                    style={{ textShadow: '0 0 30px rgba(var(--sidebar-primary-rgb), 0.1)' }}>
                                    "Empieza un día a comenzar tus ventas"
                                </h2>
                            </div>
                            <p className="text-xl text-muted-foreground">
                                Tu sistema de gestión de ventas está listo para ayudarte a alcanzar tus metas de hoy.
                            </p>
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex flex-1 flex-col gap-6 p-6 overflow-y-auto">
                {/* Header con selector de temas */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                        <p className="text-muted-foreground mt-1">Resumen de tu actividad y métricas clave</p>
                    </div>
                    <ColorThemeSelector />
                </div>

                {/* Metrics Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-none shadow-sm" style={{ backgroundColor: 'var(--accent-1-light)', borderLeft: '3px solid var(--accent-1)' }}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
                            <Package className="h-4 w-4" style={{ color: 'var(--accent-1)' }} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalProductos}</div>
                            <p className="text-xs text-muted-foreground mt-1">En el inventario</p>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm" style={{ backgroundColor: 'var(--accent-2-light)', borderLeft: '3px solid var(--accent-2)' }}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Pedidos</CardTitle>
                            <ShoppingCart className="h-4 w-4" style={{ color: 'var(--accent-2)' }} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalPedidos}</div>
                            <p className="text-xs text-muted-foreground mt-1">Acumulados</p>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm" style={{ backgroundColor: 'var(--accent-3-light)', borderLeft: '3px solid var(--accent-3)' }}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pedidos Hoy</CardTitle>
                            <ShoppingCart className="h-4 w-4" style={{ color: 'var(--accent-3)' }} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.pedidosHoy}</div>
                            <p className="text-xs text-muted-foreground mt-1">Nuevos pedidos</p>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm" style={{ backgroundColor: 'var(--accent-4-light)', borderLeft: '3px solid var(--accent-4)' }}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
                            <AlertCircle className="h-4 w-4" style={{ color: 'var(--accent-4)' }} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.stockBajo}</div>
                            <p className="text-xs text-muted-foreground mt-1">Menos de 5 unidades</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 lg:grid-cols-7">
                    {/* Orders Over Time Interactive Area Chart */}
                    <Card className="md:col-span-1 lg:col-span-4 border-none shadow-sm pt-0">
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
                                                stopColor="var(--chart-2)"
                                                stopOpacity={0.8}
                                            />
                                            <stop
                                                offset="95%"
                                                stopColor="var(--chart-2)"
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
                                        stroke="var(--chart-2)"
                                        stackId="a"
                                    />
                                    <ChartLegend content={<ChartLegendContent />} />
                                </AreaChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                    {/* Status Distribution Interactive Pie Chart */}
                    <Card data-chart="pie-interactive" className="md:col-span-1 lg:col-span-3 border-none shadow-sm flex flex-col pt-0">
                        <ChartStyle id="pie-interactive" config={statusChartConfig} />
                        <CardHeader className="flex-row items-start space-y-0 border-b py-5">
                            <div className="grid flex-1 gap-1">
                                <CardTitle>Estado de Pedidos</CardTitle>
                                <CardDescription>Distribución actual</CardDescription>
                            </div>
                            <Select value={activeStatus} onValueChange={setActiveStatus}>
                                <SelectTrigger
                                    className="ml-auto h-7 w-[130px] rounded-lg pl-2.5"
                                    aria-label="Seleccionar estado"
                                >
                                    <SelectValue placeholder="Estado" />
                                </SelectTrigger>
                                <SelectContent align="end" className="rounded-xl">
                                    {stats.statusDistribution.map((item) => {
                                        const configKey = item.status.toLowerCase().replace(/\s+/g, '_');
                                        const config = statusChartConfig[configKey as keyof typeof statusChartConfig];

                                        return (
                                            <SelectItem
                                                key={item.status}
                                                value={item.status}
                                                className="rounded-lg [&_span]:flex"
                                            >
                                                <div className="flex items-center gap-2 text-xs">
                                                    <span
                                                        className="flex h-3 w-3 shrink-0 rounded-[2px]"
                                                        style={{
                                                            backgroundColor: item.fill,
                                                        }}
                                                    />
                                                    {config?.label || item.status}
                                                </div>
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                        </CardHeader>
                        <CardContent className="flex flex-1 justify-center pb-0 pt-4">
                            <ChartContainer
                                id="pie-interactive"
                                config={statusChartConfig}
                                className="mx-auto aspect-square w-full max-w-[250px]"
                            >
                                <PieChart>
                                    <ChartTooltip
                                        cursor={false}
                                        content={<ChartTooltipContent hideLabel />}
                                    />
                                    <Pie
                                        data={stats.statusDistribution}
                                        dataKey="count"
                                        nameKey="status"
                                        innerRadius={60}
                                        strokeWidth={5}
                                        activeIndex={activeIndex}
                                        activeShape={({
                                            outerRadius = 0,
                                            ...props
                                        }: PieSectorDataItem) => (
                                            <g>
                                                <Sector {...props} outerRadius={outerRadius + 10} />
                                                <Sector
                                                    {...props}
                                                    outerRadius={outerRadius + 20}
                                                    innerRadius={outerRadius + 12}
                                                />
                                            </g>
                                        )}
                                    >
                                        {stats.statusDistribution.map((entry, index) => {
                                            const configKey = entry.status.toLowerCase().replace(/\s+/g, '_');
                                            // Fix: Use optional chaining correctly for config and check for color property
                                            const config = statusChartConfig[configKey as keyof typeof statusChartConfig];
                                            const color = (config && 'color' in config) ? config.color : entry.fill;
                                            return <Cell key={`cell-${index}`} fill={color} />;
                                        })}
                                        <Label
                                            content={({ viewBox }) => {
                                                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                                    return (
                                                        <text
                                                            x={viewBox.cx}
                                                            y={viewBox.cy}
                                                            textAnchor="middle"
                                                            dominantBaseline="middle"
                                                        >
                                                            <tspan
                                                                x={viewBox.cx}
                                                                y={viewBox.cy}
                                                                className="fill-foreground text-3xl font-bold"
                                                            >
                                                                {stats.statusDistribution[activeIndex].count.toLocaleString()}
                                                            </tspan>
                                                            <tspan
                                                                x={viewBox.cx}
                                                                y={(viewBox.cy || 0) + 24}
                                                                className="fill-muted-foreground text-xs"
                                                            >
                                                                Pedidos
                                                            </tspan>
                                                        </text>
                                                    );
                                                }
                                            }}
                                        />
                                    </Pie>
                                </PieChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 lg:grid-cols-7">
                    {/* Products by Category Mixed Bar Chart */}
                    <Card className="md:col-span-1 lg:col-span-4 border-none shadow-sm">
                        <CardHeader>
                            <CardTitle>Productos por Categoría</CardTitle>
                            <CardDescription>Stock por tipo</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={categoryChartConfig} className="min-h-[300px] w-full">
                                <BarChart
                                    accessibilityLayer
                                    data={stats.productsByCategory.map((item, index) => ({
                                        ...item,
                                        fill: `var(--chart-${(index % 5) + 1})`
                                    }))}
                                    layout="vertical"
                                    margin={{ left: 0 }}
                                >
                                    <YAxis
                                        dataKey="category"
                                        type="category"
                                        tickLine={false}
                                        tickMargin={10}
                                        axisLine={false}
                                        tickFormatter={(value) => value}
                                    />
                                    <XAxis dataKey="count" type="number" hide />
                                    <ChartTooltip
                                        cursor={false}
                                        content={<ChartTooltipContent hideLabel />}
                                    />
                                    <Bar dataKey="count" layout="vertical" radius={5}>
                                        <LabelList dataKey="count" position="right" offset={8} className="fill-foreground" fontSize={12} />
                                    </Bar>
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                        <CardFooter className="flex-col items-start gap-2 text-sm border-t pt-4">
                            <div className="flex gap-2 leading-none font-medium">
                                Tendencia al alza este mes <TrendingUp className="h-4 w-4" />
                            </div>
                            <div className="text-muted-foreground leading-none">
                                Mostrando el total de productos por cada categoría disponible
                            </div>
                        </CardFooter>
                    </Card>

                    {/* WhatsApp Bot Stats Bar Chart */}
                    <Card className="md:col-span-1 lg:col-span-3 border-none shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MessageSquare className="h-5 w-5 text-green-500" />
                                WhatsApp Bot
                            </CardTitle>
                            <CardDescription>Actividad semanal</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={whatsappChartConfig} className="min-h-[250px] w-full">
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
                            <div className="flex items-center justify-center gap-4 mt-4 text-xs pb-2">
                                <div className="flex items-center gap-1">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--chart-1)' }} />
                                    <span>Enviados</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--chart-5)' }} />
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
