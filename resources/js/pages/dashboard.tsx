'use client';

import AppLogo from '@/components/app-logo';
import { ColorThemeSelector } from '@/components/color-theme-selector';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    ChartConfig,
    ChartContainer,
    ChartStyle,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { SharedData, type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { AlertCircle, Package, ShoppingCart, TrendingUp } from 'lucide-react';
import * as React from 'react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Label,
    LabelList,
    Pie,
    PieChart,
    Sector,
    XAxis,
    YAxis,
} from 'recharts';
import { type PieSectorDataItem } from 'recharts/types/polar/Pie';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

interface DashboardProps {
    stats: {
        ventasHoy: number;
        mesasOcupadas: number;
        comandasPendientes: number;
        totalProductos: number;
        topPlatillos: Array<{ nombre_pro: string; total_vendido: number }>;
        weeklyRevenue: Array<{ date: string; revenue: number }>;
        statusDistribution: Array<{
            status: string;
            count: number;
            fill: string;
        }>;
        productsByCategory: Array<{ category: string; count: number }>;
    };
}

const statusChartConfig = {
    count: {
        label: 'Pedidos',
    },
    pendiente: {
        label: 'Pendiente',
        color: 'var(--chart-4)',
    },
    en_cocina: {
        label: 'En Cocina',
        color: 'var(--chart-1)',
    },
    listo: {
        label: 'Listo',
        color: 'var(--chart-3)',
    },
    entregado: {
        label: 'Entregado',
        color: 'var(--chart-2)',
    },
} satisfies ChartConfig;

const revenueChartConfig = {
    revenue: {
        label: 'Ingresos',
        color: 'var(--chart-2)',
    },
} satisfies ChartConfig;

const topDishesChartConfig = {
    total_vendido: {
        label: 'Vendido',
        color: 'var(--chart-1)',
    },
} satisfies ChartConfig;

export default function Dashboard({ stats }: DashboardProps) {
    const [timeRange, setTimeRange] = React.useState('7d');
    const [activeStatus, setActiveStatus] = React.useState(
        stats.statusDistribution[0]?.status || '',
    );

    const activeIndex = React.useMemo(
        () =>
            stats.statusDistribution.findIndex(
                (item) => item.status === activeStatus,
            ),
        [activeStatus, stats.statusDistribution],
    );

    const { auth } = usePage<SharedData>().props;
    const roles = auth.user.roles || [];
    const isAdmin = roles.includes('admin');

    if (!isAdmin) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Bienvenido" />
                <div className="flex h-full flex-1 flex-col gap-6 overflow-y-auto p-6">
                    {/* Header con selector de temas */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">
                                Bienvenido, {auth.user.name}
                            </h1>
                            <p className="mt-1 text-muted-foreground">
                                Panel de control
                            </p>
                        </div>
                        <ColorThemeSelector />
                    </div>

                    <div className="flex min-h-[60vh] flex-1 items-center justify-center">
                        <div className="max-w-2xl space-y-6 px-4 text-center">
                            <div className="relative flex flex-col items-center">
                                <div className="mb-6 transform transition-transform duration-300 hover:scale-110">
                                    <AppLogo />
                                </div>
                                <div className="absolute -inset-1 animate-pulse rounded-lg bg-gradient-to-r from-[var(--sidebar-primary)] to-[var(--sidebar-accent)] opacity-20 blur transition duration-1000 group-hover:opacity-100"></div>
                                <h2
                                    className="relative bg-gradient-to-r from-[var(--sidebar-foreground)] to-[var(--sidebar-primary)] bg-clip-text text-4xl font-extrabold tracking-tight text-transparent md:text-5xl"
                                    style={{
                                        textShadow:
                                            '0 0 30px rgba(var(--sidebar-primary-rgb), 0.1)',
                                    }}
                                >
                                    "Servir con pasión, gestionar con precisión"
                                </h2>
                            </div>
                            <p className="text-xl text-muted-foreground">
                                Tu sistema de restaurante está listo para un
                                gran servicio hoy.
                            </p>
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Restaurant Dashboard" />
            <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
                {/* Header con selector de temas */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Dashboard Restaurante
                        </h1>
                        <p className="mt-1 text-muted-foreground">
                            Monitoreo en tiempo real de ventas y cocina
                        </p>
                    </div>
                    <ColorThemeSelector />
                </div>

                {/* Metrics Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card
                        className="border-none shadow-sm"
                        style={{
                            backgroundColor: 'var(--accent-1-light)',
                            borderLeft: '4px solid var(--accent-1)',
                        }}
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Ventas Hoy
                            </CardTitle>
                            <TrendingUp className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                Bs. {stats.ventasHoy.toLocaleString()}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Ingresos acumulados hoy
                            </p>
                        </CardContent>
                    </Card>
                    <Card
                        className="border-none shadow-sm"
                        style={{
                            backgroundColor: 'var(--accent-2-light)',
                            borderLeft: '4px solid var(--accent-2)',
                        }}
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Mesas Ocupadas
                            </CardTitle>
                            <Package
                                className="h-4 w-4"
                                style={{ color: 'var(--accent-2)' }}
                            />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.mesasOcupadas}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Mesas en servicio actual
                            </p>
                        </CardContent>
                    </Card>
                    <Card
                        className="border-none shadow-sm"
                        style={{
                            backgroundColor: 'var(--accent-3-light)',
                            borderLeft: '4px solid var(--accent-3)',
                        }}
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Comandas Pendientes
                            </CardTitle>
                            <AlertCircle
                                className="h-4 w-4"
                                style={{ color: 'var(--accent-3)' }}
                            />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.comandasPendientes}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Pedidos por preparar o entregar
                            </p>
                        </CardContent>
                    </Card>
                    <Card
                        className="border-none shadow-sm"
                        style={{
                            backgroundColor: 'var(--accent-4-light)',
                            borderLeft: '4px solid var(--accent-4)',
                        }}
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Top Platillo
                            </CardTitle>
                            <ShoppingCart
                                className="h-4 w-4"
                                style={{ color: 'var(--accent-4)' }}
                            />
                        </CardHeader>
                        <CardContent>
                            <div className="truncate text-lg font-bold">
                                {stats.topPlatillos[0]?.nombre_pro || '---'}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Más vendido del periodo
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 lg:grid-cols-7">
                    {/* Weekly Revenue Area Chart */}
                    <Card className="border-none pt-0 shadow-sm md:col-span-1 lg:col-span-4">
                        <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
                            <div className="grid flex-1 gap-1">
                                <CardTitle>Ingresos Semanales</CardTitle>
                                <CardDescription>
                                    Tendencia de ventas de los últimos 7 días
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                            <ChartContainer
                                config={revenueChartConfig}
                                className="aspect-auto h-[250px] w-full"
                            >
                                <AreaChart data={stats.weeklyRevenue}>
                                    <defs>
                                        <linearGradient
                                            id="fillRevenue"
                                            x1="0"
                                            y1="0"
                                            x2="0"
                                            y2="1"
                                        >
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
                                        tickFormatter={(value) => {
                                            const date = new Date(value);
                                            return date.toLocaleDateString(
                                                'es-ES',
                                                { weekday: 'short' },
                                            );
                                        }}
                                    />
                                    <ChartTooltip
                                        cursor={false}
                                        content={
                                            <ChartTooltipContent indicator="dot" />
                                        }
                                    />
                                    <Area
                                        dataKey="revenue"
                                        type="natural"
                                        fill="url(#fillRevenue)"
                                        stroke="var(--chart-2)"
                                        stackId="a"
                                    />
                                </AreaChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                    {/* Order Status Distribution Pie Chart */}
                    <Card
                        data-chart="pie-interactive"
                        className="flex flex-col border-none pt-0 shadow-sm md:col-span-1 lg:col-span-3"
                    >
                        <ChartStyle
                            id="pie-interactive"
                            config={statusChartConfig}
                        />
                        <CardHeader className="flex-row items-start space-y-0 border-b py-5">
                            <div className="grid flex-1 gap-1">
                                <CardTitle>Estado de Comandas</CardTitle>
                                <CardDescription>
                                    Estado actual del servicio
                                </CardDescription>
                            </div>
                            <Select
                                value={activeStatus}
                                onValueChange={setActiveStatus}
                            >
                                <SelectTrigger className="ml-auto h-7 w-[130px] rounded-lg pl-2.5">
                                    <SelectValue placeholder="Estado" />
                                </SelectTrigger>
                                <SelectContent
                                    align="end"
                                    className="rounded-xl"
                                >
                                    {stats.statusDistribution.map((item) => (
                                        <SelectItem
                                            key={item.status}
                                            value={item.status}
                                            className="rounded-lg"
                                        >
                                            <div className="flex items-center gap-2 text-xs">
                                                <span
                                                    className="flex h-3 w-3 shrink-0 rounded-[2px]"
                                                    style={{
                                                        backgroundColor:
                                                            item.fill,
                                                    }}
                                                />
                                                {item.status}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </CardHeader>
                        <CardContent className="flex flex-1 justify-center pt-4 pb-0">
                            <ChartContainer
                                id="pie-interactive"
                                config={statusChartConfig}
                                className="mx-auto aspect-square w-full max-w-[250px]"
                            >
                                <PieChart>
                                    <ChartTooltip
                                        cursor={false}
                                        content={
                                            <ChartTooltipContent hideLabel />
                                        }
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
                                                <Sector
                                                    {...props}
                                                    outerRadius={
                                                        outerRadius + 10
                                                    }
                                                />
                                                <Sector
                                                    {...props}
                                                    outerRadius={
                                                        outerRadius + 20
                                                    }
                                                    innerRadius={
                                                        outerRadius + 12
                                                    }
                                                />
                                            </g>
                                        )}
                                    >
                                        {stats.statusDistribution.map(
                                            (entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={entry.fill}
                                                />
                                            ),
                                        )}
                                        <Label
                                            content={({ viewBox }) => {
                                                if (
                                                    viewBox &&
                                                    'cx' in viewBox &&
                                                    'cy' in viewBox
                                                ) {
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
                                                                {stats.statusDistribution[
                                                                    activeIndex
                                                                ]?.count.toLocaleString() ||
                                                                    0}
                                                            </tspan>
                                                            <tspan
                                                                x={viewBox.cx}
                                                                y={
                                                                    (viewBox.cy ||
                                                                        0) + 24
                                                                }
                                                                className="fill-muted-foreground text-xs"
                                                            >
                                                                Comandas
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
                    {/* Top Platillos Mixed Bar Chart */}
                    <Card className="border-none shadow-sm md:col-span-1 lg:col-span-4">
                        <CardHeader>
                            <CardTitle>Platillos más Vendidos</CardTitle>
                            <CardDescription>
                                Favoritos de los clientes
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer
                                config={topDishesChartConfig}
                                className="min-h-[300px] w-full"
                            >
                                <BarChart
                                    accessibilityLayer
                                    data={stats.topPlatillos.map(
                                        (item, index) => ({
                                            ...item,
                                            fill: `var(--chart-${(index % 5) + 1})`,
                                        }),
                                    )}
                                    layout="vertical"
                                    margin={{ left: 10, right: 20 }}
                                >
                                    <YAxis
                                        dataKey="nombre_pro"
                                        type="category"
                                        tickLine={false}
                                        tickMargin={10}
                                        axisLine={false}
                                        width={120}
                                    />
                                    <XAxis
                                        dataKey="total_vendido"
                                        type="number"
                                        hide
                                    />
                                    <ChartTooltip
                                        cursor={false}
                                        content={
                                            <ChartTooltipContent hideLabel />
                                        }
                                    />
                                    <Bar
                                        dataKey="total_vendido"
                                        layout="vertical"
                                        radius={5}
                                    >
                                        <LabelList
                                            dataKey="total_vendido"
                                            position="right"
                                            offset={8}
                                            className="fill-foreground"
                                            fontSize={12}
                                        />
                                    </Bar>
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                    {/* Categorías Table/Info */}
                    <Card className="border-none shadow-sm md:col-span-1 lg:col-span-3">
                        <CardHeader>
                            <CardTitle>Menu por Categorías</CardTitle>
                            <CardDescription>
                                Resumen del menú actual
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {stats.productsByCategory
                                    .slice(0, 6)
                                    .map((cat, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center justify-between"
                                        >
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="h-2 w-2 rounded-full"
                                                    style={{
                                                        backgroundColor: `var(--chart-${(i % 5) + 1})`,
                                                    }}
                                                />
                                                <span className="text-sm font-medium">
                                                    {cat.category}
                                                </span>
                                            </div>
                                            <span className="text-xs text-muted-foreground">
                                                {cat.count} platillos
                                            </span>
                                        </div>
                                    ))}
                            </div>
                        </CardContent>
                        <CardFooter className="border-t pt-4 text-xs text-muted-foreground">
                            Total de productos en el sistema:{' '}
                            {stats.totalProductos}
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
