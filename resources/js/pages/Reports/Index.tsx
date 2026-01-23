import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { BarChart3, BookOpenText, MessageCircle, Package, ArrowRight, CheckCircle2 } from 'lucide-react';
import React from 'react';

const reportCards = [
    {
        title: 'Ventas Confirmadas',
        description: 'Análisis unificado de todos los pedidos confirmados (Cuaderno y WhatsApp).',
        href: '/reports/orders',
        icon: CheckCircle2,
        color: 'text-primary',
        bgColor: 'bg-primary/5',
    },
    {
        title: 'Productos y Ventas',
        description: 'Rendimiento de productos, stock y cantidad de unidades vendidas.',
        href: '/reports/products',
        icon: Package,
        color: 'text-orange-500',
        bgColor: 'bg-orange-50',
    },
];

export default function ReportsIndex() {
    return (
        <AppLayout>
            <Head title="Panel de Reportes" />
            <div className="container mx-auto py-12 px-4 sm:px-6">
                <div className="flex flex-col gap-10">
                    <div className="text-center md:text-left">
                        <h1 className="text-4xl font-black tracking-tight text-slate-900">
                            Centro de <span className="text-primary italic">Analítica</span>
                        </h1>
                        <p className="text-lg text-muted-foreground mt-2 max-w-2xl font-medium">
                            Bienvenido al panel de reportes. Aquí puedes monitorear el pulso de tu negocio con datos precisos y filtrado inteligente.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {reportCards.map((card, i) => (
                            <Link key={i} href={card.href} className="group">
                                <Card className="h-full border-2 border-transparent transition-all duration-300 group-hover:border-primary/20 group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] group-hover:-translate-y-2 rounded-[2.5rem] overflow-hidden">
                                    <CardHeader className="p-8">
                                        <div className={`w-16 h-16 ${card.bgColor} ${card.color} rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 shadow-sm border border-transparent group-hover:border-current/10`}>
                                            <card.icon className="w-8 h-8" />
                                        </div>
                                        <CardTitle className="text-2xl font-black">{card.title}</CardTitle>
                                        <CardDescription className="text-base font-medium leading-relaxed mt-2">
                                            {card.description}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="px-8 pb-8 pt-0">
                                        <div className="flex items-center text-sm font-black uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                            Generar Reporte <ArrowRight className="w-4 h-4 ml-2" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>

                    <div className="mt-10 p-10 bg-slate-900 rounded-[3rem] text-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="text-center md:text-left">
                                <h2 className="text-2xl font-black mb-2">¿Necesitas un reporte personalizado?</h2>
                                <p className="text-slate-400 font-medium">Podemos exportar datos a Excel o PDF según tus necesidades logísticas.</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="px-6 py-3 rounded-2xl bg-white/10 font-bold text-sm backdrop-blur-sm">
                                    Exportación en camino
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
