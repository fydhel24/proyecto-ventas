import React, { useState, useEffect } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import {
    Smile, ShoppingBag, User, Phone, MapPin,
    Calendar, CheckCircle2, ChevronLeft, Truck, Package,
    ArrowRight, MessageCircle, Heart, ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/hooks/use-cart';
import { toast } from 'sonner';

export default function Reservar() {
    const { items, subtotal, formatPrice, clearCart } = useCart();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        nombre: '',
        ci: '',
        celular: '',
        departamento: 'La Paz',
        provincia: '',
        detalle: '',
        delivery: false
    });

    // If cart is empty, redirect back to shop after a moment
    useEffect(() => {
        if (items.length === 0) {
            const timer = setTimeout(() => {
                router.visit('/medicamentos');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [items]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.nombre || !formData.celular) {
            toast.error("Por favor completa tu nombre y WhatsApp.");
            return;
        }

        setIsSubmitting(true);

        router.post('/cuadernos/reservas-publicas', {
            ...formData,
            productos: items.map(i => ({
                id: i.id,
                cantidad: i.cantidad,
                precio_venta: i.precio
            }))
        }, {
            onSuccess: (page) => {
                const flash = (page.props as any).flash;
                if (flash?.success) {
                    toast.success(flash.success);
                } else {
                    toast.success("¡Reserva Registrada Exitosamente! Nos contactaremos contigo pronto. 💖");
                }
                clearCart();
                setTimeout(() => router.visit('/'), 2000);
            },
            onError: (errors) => {
                const firstError = Object.values(errors)[0];
                toast.error(typeof firstError === 'string' ? firstError : "Error al registrar la reserva.");
                setIsSubmitting(false);
            },
            onFinish: () => {
                // We keep submitting true if success to avoid re-clicks while redirecting
            }
        });
    };

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-emerald-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
                <div className="size-24 bg-white dark:bg-slate-900 rounded-[2rem] flex items-center justify-center shadow-xl mb-6">
                    <ShoppingBag className="size-12 text-emerald-500" />
                </div>
                <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-2">¡Tu bolsa está vacía!</h2>
                <p className="text-slate-500 font-bold mb-8">Agrega algunos medicamentos para reservarlos.</p>
                <Button asChild className="h-16 px-8 rounded-2xl bg-emerald-500 hover:bg-emerald-600 font-black text-lg">
                    <Link href="/medicamentos">Ir a la Tienda</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] font-sans selection:bg-emerald-200">
            <Head title="Finalizar Reserva - Nexus Farma" />

            {/* HEADER CORTO */}
            <header className="bg-white dark:bg-slate-900 border-b-4 border-emerald-100 dark:border-emerald-900/50 h-20 flex items-center shadow-sm">
                <div className="container mx-auto px-6 max-w-5xl flex items-center justify-between">
                    <Link href="/medicamentos" className="flex items-center gap-2 text-slate-500 font-black hover:text-emerald-500 transition-colors group">
                        <ChevronLeft className="size-6 group-hover:-translate-x-1 transition-transform" />
                        <span className="hidden sm:inline">Volver a Tienda</span>
                    </Link>

                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg">
                            <Smile className="text-white size-6" />
                        </div>
                        <span className="text-xl font-black text-slate-800 dark:text-white tracking-tighter">NEXUS <span className="text-emerald-500">FARMA</span></span>
                    </div>

                    <div className="w-24 hidden sm:block"></div> { /* Spacer */}
                </div>
            </header>

            <main className="container mx-auto px-6 py-12 max-w-5xl">
                <div className="grid lg:grid-cols-2 gap-12 items-start">

                    {/* COLUMNA IZQUIERDA: RESUMEN PRODUCTOS */}
                    <div className="space-y-8 animate-in fade-in slide-in-from-left duration-700">
                        <div className="flex items-center gap-4">
                            <div className="size-12 bg-orange-100 dark:bg-orange-950/50 rounded-2xl flex items-center justify-center text-orange-600">
                                <Package className="size-6" />
                            </div>
                            <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Tu Pedido</h2>
                        </div>

                        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border-4 border-slate-50 dark:border-slate-800 shadow-xl overflow-hidden">
                            <div className="p-6 md:p-8 space-y-6">
                                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
                                    {items.map((item) => (
                                        <div key={item.id} className="flex gap-4 items-center group">
                                            <div className="size-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex-shrink-0 flex items-center justify-center border-2 border-slate-100 dark:border-slate-700 overflow-hidden">
                                                {item.foto ? (
                                                    <img src={`/storage/${item.foto}`} alt={item.nombre} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                                ) : (
                                                    <ShoppingBag className="size-6 text-slate-300" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-black text-slate-800 dark:text-white line-clamp-1">{item.nombre}</h4>
                                                <p className="text-sm font-bold text-slate-400 capitalize">{item.cantidad} unidad(es)</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-black text-emerald-600 dark:text-emerald-400">{formatPrice(item.precio * item.cantidad)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <Separator className="bg-slate-100 dark:bg-slate-800 h-1 rounded-full" />

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-slate-500 font-bold">
                                        <span>Subtotal</span>
                                        <span>{formatPrice(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2 text-slate-500 font-bold">
                                            <span>Envío</span>
                                            <Badge variant="outline" className="text-[10px] text-emerald-500 border-emerald-500/30">PENDIENTE</Badge>
                                        </div>
                                        <span className="text-xs font-black text-slate-400 italic">Se coordina por WhatsApp</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2">
                                        <span className="text-2xl font-black text-slate-800 dark:text-white">Total aprox.</span>
                                        <span className="text-3xl font-black text-emerald-500">{formatPrice(subtotal)}</span>
                                    </div>
                                </div>

                                <div className="bg-emerald-50 dark:bg-emerald-950/30 p-4 rounded-2xl flex items-center gap-3 border border-emerald-100 dark:border-emerald-900/50">
                                    <CheckCircle2 className="size-5 text-emerald-500 shrink-0" />
                                    <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 leading-tight">
                                        ¡Excelente elección! Al reservar, aseguramos tu stock y puedes pagar al momento de recoger o recibir tu pedido.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* COLUMNA DERECHA: FORMULARIO */}
                    <div className="space-y-8 animate-in fade-in slide-in-from-right duration-700 delay-200">
                        <div className="flex items-center gap-4">
                            <div className="size-12 bg-emerald-100 dark:bg-emerald-950/50 rounded-2xl flex items-center justify-center text-emerald-600">
                                <User className="size-6" />
                            </div>
                            <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Tus Datos</h2>
                        </div>

                        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-10 border-4 border-slate-50 dark:border-slate-800 shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <Heart className="size-32 text-emerald-500 fill-emerald-500" />
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-2">¿A nombre de quién?</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-300" />
                                            <Input
                                                placeholder="Tu nombre completo"
                                                className="h-16 pl-12 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-lg focus-visible:ring-2 focus-visible:ring-emerald-400"
                                                value={formData.nombre}
                                                onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-2">C.I. / Documento</label>
                                        <div className="relative">
                                            <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-300" />
                                            <Input
                                                placeholder="Tu número de C.I."
                                                className="h-16 pl-12 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-lg focus-visible:ring-2 focus-visible:ring-emerald-400"
                                                value={formData.ci}
                                                onChange={e => setFormData({ ...formData, ci: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-2">WhatsApp de contacto</label>
                                        <div className="relative">
                                            <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-emerald-400 fill-emerald-400/10" />
                                            <Input
                                                placeholder="Ej. 78945612"
                                                className="h-16 pl-12 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-lg focus-visible:ring-2 focus-visible:ring-emerald-400"
                                                value={formData.celular}
                                                onChange={e => setFormData({ ...formData, celular: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-2">Departamento / Ciudad</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-rose-400" />
                                            <Input
                                                placeholder="Ej. La Paz"
                                                className="h-16 pl-12 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-lg focus-visible:ring-2 focus-visible:ring-emerald-400"
                                                value={formData.departamento}
                                                onChange={e => setFormData({ ...formData, departamento: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-2">Ciudad / Provincia</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-rose-400" />
                                            <Input
                                                placeholder="Ej. Murillo"
                                                className="h-16 pl-12 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-lg focus-visible:ring-2 focus-visible:ring-emerald-400"
                                                value={formData.provincia}
                                                onChange={e => setFormData({ ...formData, provincia: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <p className="text-[10px] text-slate-400 font-bold ml-2 -mt-4">Te escribiremos por aquí para confirmar tu pedido 📱</p>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-2">Instrucciones extra</label>
                                    <Textarea
                                        placeholder="Ej. 'Cerca de la plaza central, reja blanca' o 'Recogeré a las 6 pm'"
                                        className="min-h-[120px] rounded-3xl bg-slate-50 dark:bg-slate-800 border-none font-bold p-6 focus-visible:ring-2 focus-visible:ring-emerald-400"
                                        value={formData.detalle}
                                        onChange={e => setFormData({ ...formData, detalle: e.target.value })}
                                    />
                                </div>

                                <div className="flex items-center gap-4 bg-orange-50 dark:bg-orange-900/10 p-5 rounded-2xl border-2 border-orange-100 dark:border-orange-900/30 cursor-pointer hover:bg-orange-100 transition-colors"
                                    onClick={() => setFormData({ ...formData, delivery: !formData.delivery })}>
                                    <div className={`size-6 rounded-lg border-2 flex items-center justify-center transition-all ${formData.delivery ? 'bg-orange-500 border-orange-500' : 'border-orange-300 bg-white dark:bg-slate-800'}`}>
                                        {formData.delivery && <CheckCircle2 className="size-4 text-white" />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-black text-slate-800 dark:text-white leading-tight">¿Prefieres envío a domicilio?</p>
                                        <p className="text-xs font-bold text-orange-600 dark:text-orange-400">Solicitar Delivery por 10 Bs</p>
                                    </div>
                                    <Truck className="size-8 text-orange-400 opacity-50" />
                                </div>

                                <Button
                                    disabled={isSubmitting}
                                    className="w-full h-20 rounded-[2.5rem] bg-emerald-500 hover:bg-emerald-600 text-white font-black text-2xl shadow-[0_8px_0_rgb(4,120,87)] border-b-4 border-emerald-700 hover:translate-y-1 active:translate-y-2 transition-all relative overflow-hidden group"
                                >
                                    <span className="relative z-10 flex items-center gap-3">
                                        {isSubmitting ? 'REGISTRANDO...' : 'RESERVAR AHORA 💖'}
                                        <ArrowRight className="size-6 group-hover:translate-x-2 transition-transform" />
                                    </span>
                                    {isSubmitting && (
                                        <div className="absolute inset-0 bg-emerald-600/50 flex items-center justify-center">
                                            <div className="size-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                                        </div>
                                    )}
                                </Button>

                                <div className="flex items-center justify-center gap-2 text-slate-400">
                                    <Heart className="size-3 fill-rose-400 text-rose-400" />
                                    <span className="text-[10px] font-black tracking-widest uppercase">Nexus Farma Cuida de Ti</span>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>

            {/* DECORACIONES */}
            <div className="fixed -bottom-20 -left-20 size-80 bg-emerald-400/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="fixed -top-20 -right-20 size-80 bg-orange-400/10 rounded-full blur-[100px] pointer-events-none" />
        </div>
    );
}
