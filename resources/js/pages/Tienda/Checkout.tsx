import React, { useEffect, useState, useRef } from 'react';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCart } from '@/hooks/use-cart';
import {
    Truck, User, MapPin, ShoppingBag, ArrowRight,
    CheckCircle2, Smile, Heart, ShoppingCart, MessageCircle, Star, Pill
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { type SharedData } from '@/types';
import gsap from 'gsap';
import { ColorThemeSelector } from '@/components/color-theme-selector';

export default function Checkout() {
    const { items, subtotal, clearCart, formatPrice, itemCount } = useCart();
    const { app_url } = usePage<SharedData & { app_url: string }>().props;
    const [isFinished, setIsFinished] = useState(false);
    const containerRef = useRef(null);

    const { data, setData, post, processing, errors } = useForm({
        nombre: '',
        ci: '',
        celular: '',
        departamento: '',
        provincia: '',
        productos: items.map(item => ({
            producto_id: item.id,
            cantidad: item.cantidad,
            precio_venta: item.precio
        }))
    });

    useEffect(() => {
        setData('productos', items.map(item => ({
            producto_id: item.id,
            cantidad: item.cantidad,
            precio_venta: item.precio
        })));
    }, [items]);

    const { flash } = usePage<SharedData & { flash: any }>().props;

    useEffect(() => {
        if (flash?.pedido_resultado) {
            const res = flash.pedido_resultado;
            setIsFinished(true);
            clearCart();

            // Success animation
            gsap.fromTo('.success-bounce',
                { scale: 0, rotation: -180 },
                { scale: 1, rotation: 0, duration: 1.5, ease: "elastic.out(1, 0.3)" }
            );

            toast.success(res.message || '¡Pedido mágico realizado! ✨', {
                style: { background: '#10b981', color: 'white', borderRadius: '20px', fontWeight: 'bold' }
            });

            if (res.pdf_base64) {
                try {
                    const linkSource = `data:application/pdf;base64,${res.pdf_base64}`;
                    const downloadLink = document.createElement("a");
                    const fileName = `receta_magica_${res.id}.pdf`;
                    downloadLink.href = linkSource;
                    downloadLink.download = fileName;
                    downloadLink.click();
                    toast.success('Descargando tu comprobante sorpresa...');
                } catch (err) {
                    console.error('Error downloading PDF:', err);
                }
            }
        }
    }, [flash]);

    useEffect(() => {
        if (!isFinished && containerRef.current) {
            gsap.from(".checkout-anim", {
                y: 50,
                opacity: 0,
                scale: 0.9,
                duration: 0.8,
                stagger: 0.1,
                ease: "back.out(1.5)"
            });
        }
    }, [isFinished]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (items.length === 0) {
            toast.error('Tu bolsita mágica está vacía 🎈');
            return;
        }

        // Processing animation
        gsap.to('.submit-btn-icon', { x: 50, opacity: 0, duration: 0.5 });

        post('/cuadernos/pedidos', {
            preserveScroll: true,
            onError: (errs) => {
                console.error('Checkout errors:', errs);
                toast.error('Ups, algo rebotó mal. Intenta de nuevo.');
                gsap.to('.submit-btn-icon', { x: 0, opacity: 1, duration: 0.5 });
            }
        });
    };

    if (isFinished) {
        return (
            <div className="min-h-screen bg-[#F0FDF4] dark:bg-[#022C22] text-foreground font-sans selection:bg-emerald-300">
                <Head title="¡Pedido Exitoso! | Nexus Farma" />
                <div className="container mx-auto px-4 py-32 flex flex-col items-center justify-center text-center">
                    <div className="success-bounce size-48 bg-emerald-400 rounded-full flex items-center justify-center mb-10 shadow-[0_20px_0_rgb(4,120,87)] border-8 border-white">
                        <Smile className="size-24 text-white" />
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight text-emerald-600 dark:text-emerald-400">¡TODO LISTO! 🎉</h1>
                    <p className="text-2xl text-slate-600 dark:text-slate-300 max-w-lg mb-12 font-bold leading-relaxed">
                        Tu botiquín ya está en camino. Los súper doctores de Nexus te llamarán prontito para coordinar la entrega mágica. 🚀
                    </p>
                    <Link href="/">
                        <Button size="lg" className="h-20 px-12 rounded-full text-2xl font-black bg-orange-500 hover:bg-orange-600 text-white shadow-[0_8px_0_rgb(194,65,12)] hover:shadow-[0_4px_0_rgb(194,65,12)] hover:translate-y-1 active:shadow-none active:translate-y-2 transition-all">
                            Volver a Jugar
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F0FDF4] dark:bg-[#022C22] text-foreground transition-colors duration-500 font-sans overflow-x-hidden selection:bg-emerald-300" ref={containerRef}>
            <Head title="Finalizar Pedido | Nexus Farma" />

            {/* HEADER */}
            <header className="fixed top-4 left-4 right-4 z-50">
                <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-4 border-emerald-100 dark:border-emerald-900 shadow-2xl rounded-[2rem] px-6 h-20 flex items-center justify-between mx-auto max-w-7xl relative overflow-hidden">
                    <div className="absolute top-0 right-10 size-32 bg-yellow-300 rounded-full blur-3xl opacity-20 pointer-events-none" />
                    <Link href="/" className="flex items-center gap-3 cursor-pointer group relative z-10">
                        <div className="size-12 rounded-[1rem] bg-emerald-500 flex items-center justify-center shadow-md group-hover:-translate-y-1 group-hover:rotate-6 transition-all duration-300">
                            <Smile className="text-white size-8" />
                        </div>
                        <div className="flex flex-col leading-none">
                            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">NEXUS</span>
                            <span className="text-[12px] font-black tracking-widest text-orange-400 capitalize -mt-1">Checkout</span>
                        </div>
                    </Link>
                    <div className="flex items-center gap-3 relative z-10">
                        <ColorThemeSelector />
                        <Link href="/medicamentos">
                            <Button variant="outline" className="border-4 h-12 rounded-2xl font-black text-slate-500 hover:text-emerald-500 hover:border-emerald-200">
                                Volver a la Tienda
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 pt-40 pb-24 max-w-6xl">
                <div className="checkout-anim text-center mb-12">
                    <h1 className="text-5xl md:text-7xl font-black tracking-tight text-slate-800 dark:text-white mb-4">
                        ¡Casi tuyo! 🚀
                    </h1>
                    <p className="text-xl font-bold text-slate-500">Solo necesitamos saber a dónde volar con tu caja mágica.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

                    {/* FORM SECTION */}
                    <div className="lg:col-span-7 space-y-10">
                        <Card className="checkout-anim rounded-[3rem] border-8 border-white dark:border-slate-800 shadow-2xl overflow-visible bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm relative">
                            {/* Decorative Star */}
                            <div className="absolute -top-8 -left-8 size-16 bg-yellow-400 rounded-2xl rotate-12 flex items-center justify-center shadow-lg border-4 border-white">
                                <Star className="size-8 text-white fill-white" />
                            </div>

                            <CardHeader className="p-8 pb-4">
                                <CardTitle className="text-3xl font-black flex items-center gap-4 text-emerald-600 dark:text-emerald-400">
                                    <div className="h-14 w-14 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-inner">
                                        <User className="h-7 w-7" />
                                    </div>
                                    Tus Datos de Envío
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 pt-4">
                                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6" id="checkout-form">
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="nombre" className="text-sm font-black uppercase tracking-widest text-slate-500 ml-2">¿Cómo te llamas?</Label>
                                        <Input
                                            id="nombre"
                                            value={data.nombre}
                                            onChange={e => setData('nombre', e.target.value)}
                                            placeholder="Ej. Súper Juan"
                                            className="h-16 rounded-3xl border-4 border-slate-100 hover:border-emerald-200 focus:border-emerald-400 text-xl px-6 font-bold shadow-inner transition-colors"
                                            required
                                        />
                                        {errors.nombre && <p className="text-sm text-rose-500 font-bold ml-4">{errors.nombre}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="ci" className="text-sm font-black uppercase tracking-widest text-slate-500 ml-2">CI / NIT</Label>
                                        <Input
                                            id="ci"
                                            value={data.ci}
                                            onChange={e => setData('ci', e.target.value)}
                                            placeholder="Opcional"
                                            className="h-16 rounded-3xl border-4 border-slate-100 hover:border-emerald-200 focus:border-emerald-400 text-xl px-6 font-bold shadow-inner transition-colors"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="celular" className="text-sm font-black uppercase tracking-widest text-slate-500 ml-2">Celular</Label>
                                        <Input
                                            id="celular"
                                            value={data.celular}
                                            onChange={e => setData('celular', e.target.value)}
                                            placeholder="7000..."
                                            className="h-16 rounded-3xl border-4 border-slate-100 hover:border-emerald-200 focus:border-emerald-400 text-xl px-6 font-bold shadow-inner transition-colors"
                                            required
                                        />
                                        {errors.celular && <p className="text-sm text-rose-500 font-bold ml-4">{errors.celular}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="departamento" className="text-sm font-black uppercase tracking-widest text-slate-500 ml-2">Ciudad</Label>
                                        <Input
                                            id="departamento"
                                            value={data.departamento}
                                            onChange={e => setData('departamento', e.target.value)}
                                            placeholder="La Paz, Cochabamba..."
                                            className="h-16 rounded-3xl border-4 border-slate-100 hover:border-emerald-200 focus:border-emerald-400 text-xl px-6 font-bold shadow-inner transition-colors"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="provincia" className="text-sm font-black uppercase tracking-widest text-slate-500 ml-2">Zona / Letra Fina</Label>
                                        <Input
                                            id="provincia"
                                            value={data.provincia}
                                            onChange={e => setData('provincia', e.target.value)}
                                            placeholder="Zona Sur, Casa 3"
                                            className="h-16 rounded-3xl border-4 border-slate-100 hover:border-emerald-200 focus:border-emerald-400 text-xl px-6 font-bold shadow-inner transition-colors"
                                            required
                                        />
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 checkout-anim">
                            <div className="flex gap-4 p-6 rounded-[2rem] bg-orange-100 dark:bg-orange-900/30 border-4 border-orange-200 dark:border-orange-800 hover:scale-105 transition-transform">
                                <div className="size-16 rounded-full bg-orange-500 flex items-center justify-center text-white shrink-0 shadow-lg animate-bounce-slow">
                                    <Truck className="size-8" />
                                </div>
                                <div className="flex flex-col justify-center">
                                    <p className="font-black text-xl text-orange-700 dark:text-orange-400 leading-tight">Envío Cohete</p>
                                    <p className="text-sm font-bold text-orange-600/80 dark:text-orange-300">¡Llega volando a tu casa!</p>
                                </div>
                            </div>
                            <div className="flex gap-4 p-6 rounded-[2rem] bg-blue-100 dark:bg-blue-900/30 border-4 border-blue-200 dark:border-blue-800 hover:scale-105 transition-transform">
                                <div className="size-16 rounded-full bg-blue-500 flex items-center justify-center text-white shrink-0 shadow-lg">
                                    <ShoppingCart className="size-8" />
                                </div>
                                <div className="flex flex-col justify-center">
                                    <p className="font-black text-xl text-blue-700 dark:text-blue-400 leading-tight">Pago Seguro</p>
                                    <p className="text-sm font-bold text-blue-600/80 dark:text-blue-300">Pagas al recibir la cajita</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CART SUMMARY */}
                    <div className="lg:col-span-5 checkout-anim">
                        <Card className="rounded-[3rem] border-8 border-emerald-100 dark:border-emerald-900/50 shadow-2xl sticky top-32 overflow-hidden bg-white dark:bg-slate-800">
                            <div className="bg-emerald-500 p-8 text-white relative overflow-hidden">
                                <div className="absolute -right-10 -bottom-10 opacity-20">
                                    <Heart className="size-40" />
                                </div>
                                <CardTitle className="text-3xl font-black flex items-center gap-4 relative z-10">
                                    <ShoppingBag className="size-8" />
                                    Tu Resumen
                                </CardTitle>
                            </div>
                            <CardContent className="p-8 space-y-6">
                                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                                    {items.map((item) => (
                                        <div key={item.id} className="flex justify-between items-center group bg-slate-50 dark:bg-slate-900 p-3 rounded-2xl border-2 border-transparent hover:border-emerald-200 transition-colors">
                                            <div className="flex gap-4 items-center">
                                                <div className="size-14 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 overflow-hidden flex-shrink-0">
                                                    {item.foto ? (
                                                        <img src={`${app_url}/storage/${item.foto}`} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Pill className="size-8 m-3 text-slate-300" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-black text-sm line-clamp-1 text-slate-800 dark:text-white">{item.nombre}</p>
                                                    <p className="text-xs font-bold text-emerald-500 bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 rounded-md inline-block mt-1">
                                                        {item.cantidad} x {formatPrice(item.precio)}
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="font-black text-lg text-slate-900 dark:text-emerald-400 ml-2">{formatPrice(item.precio * item.cantidad)}</p>
                                        </div>
                                    ))}
                                    {items.length === 0 && (
                                        <div className="flex flex-col items-center py-12 space-y-4">
                                            <div className="size-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                                                <ShoppingBag className="size-12 text-slate-300 dark:text-slate-600" />
                                            </div>
                                            <p className="text-center text-slate-400 font-bold text-lg">Tu cajita está vacía</p>
                                        </div>
                                    )}
                                </div>

                                <Separator className="h-1 bg-slate-100 dark:bg-slate-700 rounded-full" />

                                <div className="space-y-3 bg-emerald-50 dark:bg-emerald-900/10 p-6 rounded-[2rem] border-2 border-emerald-100 dark:border-emerald-800/30">
                                    <div className="flex justify-between font-bold text-slate-500">
                                        <span>Costo de medicinas</span>
                                        <span>{formatPrice(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-orange-500">
                                        <span>Envío Sorpresa</span>
                                        <span>¡Gratis! 🎁</span>
                                    </div>
                                    <Separator className="h-0.5 bg-emerald-200 dark:bg-emerald-800 my-4" />
                                    <div className="flex justify-between items-end">
                                        <span className="text-xl font-black text-slate-800 dark:text-white">Total a Pagar</span>
                                        <span className="text-4xl font-black text-emerald-600 dark:text-emerald-400 leading-none">{formatPrice(subtotal)}</span>
                                    </div>
                                </div>

                                <Button
                                    form="checkout-form"
                                    type="submit"
                                    disabled={processing || items.length === 0}
                                    className="w-full h-20 rounded-[2rem] text-2xl font-black bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_8px_0_rgb(4,120,87)] hover:shadow-[0_4px_0_rgb(4,120,87)] hover:translate-y-1 active:shadow-none active:translate-y-2 transition-all mt-4 flex items-center justify-center gap-3 overflow-hidden group"
                                >
                                    {processing ? (
                                        <span className="animate-pulse">Empacando... 📦</span>
                                    ) : (
                                        <>
                                            <span>¡Enviar mi Pedido!</span>
                                            <ArrowRight className="submit-btn-icon size-8" />
                                        </>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Simple footer space */}
            <div className="pb-10 text-center">
                <p className="font-bold text-slate-400 text-sm">© {new Date().getFullYear()} Nexus Corporation. ¡Hecho con <Heart className="size-4 inline text-rose-400" /> para ti!</p>
            </div>
        </div>
    );
}
