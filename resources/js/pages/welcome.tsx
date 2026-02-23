import React, { useEffect, useRef, useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    Activity, Clock, MapPin, MessageCircle, Pill,
    Search, ShieldCheck, HeartPulse, ShoppingCart,
    CheckCircle2, Star, Sparkles, Smile, Baby, Stethoscope, Heart,
    Truck, Store, Info, Phone, Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ColorThemeSelector } from '@/components/color-theme-selector';
import { useCart } from '@/hooks/use-cart';
import { CartDrawer } from '@/components/shop/CartDrawer';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { router } from '@inertiajs/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Welcome({ productos, categorias, laboratorios }: any) {
    const { auth } = usePage().props as any;
    const { itemCount } = useCart();

    // State
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [reservaForm, setReservaForm] = useState({
        nombre: '',
        celular: '',
        detalle: '',
        delivery: false
    });

    // Check for pre-filled reservation from query params
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const reservaProduct = params.get('reserva');
        if (reservaProduct) {
            setReservaForm(prev => ({
                ...prev,
                detalle: `Deseo reservar: ${reservaProduct}. `
            }));

            // Scroll to reservations section
            const element = document.getElementById('reservas');
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, []);

    // Refs for animations
    const heroRef = useRef(null);
    const floatiesRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let ctx = gsap.context(() => {
            // Intro Bouncy Animation
            gsap.from(".hero-bouncy > *", {
                y: 150,
                opacity: 0,
                scale: 0.5,
                duration: 1.5,
                stagger: 0.15,
                ease: "elastic.out(1, 0.4)",
                delay: 0.2
            });

            // Floating Background Bubbles
            if (floatiesRef.current) {
                const bubbles = floatiesRef.current.children;
                gsap.to(bubbles, {
                    y: "random(-50, 50)",
                    x: "random(-50, 50)",
                    rotation: "random(-20, 20)",
                    duration: "random(2, 5)",
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut",
                    stagger: {
                        amount: 2,
                        from: "random"
                    }
                });
            }

            // Scroll triggers for sections
            gsap.utils.toArray('.scroll-bounce').forEach((el: any) => {
                gsap.from(el, {
                    scrollTrigger: {
                        trigger: el,
                        start: "top 85%",
                    },
                    y: 80,
                    scale: 0.8,
                    opacity: 0,
                    duration: 1.2,
                    ease: "elastic.out(1, 0.5)"
                });
            });
        });

        return () => ctx.revert();
    }, []);

    const handleWhatsApp = (message = "¡Hola Familia Nexus! Quisiera consultar algo.") => {
        window.open(`https://wa.me/59122441122?text=${encodeURIComponent(message)}`, "_blank");
    };

    const handleReserva = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reservaForm.nombre || !reservaForm.celular) {
            toast.error("Por favor completa tu nombre y celular para contactarte.");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch('/cuadernos/reservas-publicas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || ''
                },
                body: JSON.stringify(reservaForm)
            });

            const data = await response.json();
            if (data.success) {
                toast.success(data.message);
                setReservaForm({ nombre: '', celular: '', detalle: '', delivery: false });
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error("Error al enviar la reserva.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F0FDF4] dark:bg-[#022C22] text-foreground transition-colors duration-500 font-sans overflow-x-hidden selection:bg-emerald-300">
            <Head title="Nexus Farma - ¡Tu Farmacia Feliz!" />

            {/* SUPER FUN HEADER */}
            <header className="fixed top-4 left-4 right-4 z-50">
                <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-4 border-emerald-100 dark:border-emerald-900 shadow-2xl rounded-[2rem] px-6 h-20 flex items-center justify-between mx-auto max-w-7xl">
                    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <div className="size-12 rounded-[1rem] bg-emerald-500 flex items-center justify-center shadow-lg group-hover:-translate-y-2 group-hover:rotate-12 transition-all duration-300">
                            <Smile className="text-white size-8" />
                        </div>
                        <div className="flex flex-col leading-none">
                            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">NEXUS</span>
                            <span className="text-[12px] font-black tracking-widest text-orange-400 capitalize -mt-1">Farma Family</span>
                        </div>
                    </div>

                    <nav className="hidden md:flex items-center gap-6">
                        <a href="#nosotros" className="text-base font-black text-slate-500 hover:text-emerald-500 hover:-translate-y-1 transition-all">Nosotros</a>
                        <Link href="/medicamentos" className="text-base font-black text-slate-500 hover:text-emerald-500 hover:-translate-y-1 transition-all">
                            Medicamentos
                        </Link>
                        <a href="#reservas" className="text-base font-black text-slate-500 hover:text-emerald-500 hover:-translate-y-1 transition-all">Reservas</a>

                        {auth.user ? (
                            <Link
                                href="/dashboard"
                                className="text-sm font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-4 py-2 rounded-xl border border-emerald-100 dark:border-emerald-800 hover:scale-105 transition-all flex items-center gap-2"
                            >
                                <Activity className="size-4" />
                                PANEL DE CONTROL
                            </Link>
                        ) : (
                            <Link
                                href="/login"
                                className="text-sm font-black text-slate-500 hover:text-emerald-500 hover:-translate-y-1 transition-all flex items-center gap-2"
                            >
                                <ShieldCheck className="size-4" />
                                INGRESAR
                            </Link>
                        )}
                    </nav>

                    <div className="flex items-center gap-3">
                        <ColorThemeSelector />

                        <Button
                            variant="default"
                            className="relative size-12 rounded-[1rem] bg-orange-400 hover:bg-orange-500 text-white shadow-xl hover:shadow-orange-400/50 hover:scale-110 active:scale-95 transition-all border-b-4 border-orange-600"
                            onClick={() => setIsCartOpen(true)}
                        >
                            <ShoppingCart className="size-6" />
                            {itemCount > 0 && (
                                <span className="absolute -top-2 -right-2 size-6 rounded-full bg-rose-500 border-2 border-white text-white text-xs font-black flex items-center justify-center animate-bounce">
                                    {itemCount}
                                </span>
                            )}
                        </Button>

                        <Button
                            className="rounded-[1rem] px-6 h-12 shadow-xl bg-emerald-500 hover:bg-emerald-600 border-b-4 border-emerald-700 hover:-translate-y-1 hover:scale-105 active:scale-95 transition-all hidden sm:flex font-black text-white"
                            onClick={() => handleWhatsApp()}
                        >
                            <MessageCircle className="size-5 mr-2 animate-pulse" />
                            Charla con nosotros
                        </Button>
                    </div>
                </div>
            </header>

            <CartDrawer open={isCartOpen} onOpenChange={setIsCartOpen} />

            <main className="pt-32 pb-20">
                {/* HERO SECTION - PLAYFUL & BOUNCY */}
                <section ref={heroRef} className="relative min-h-[85vh] flex items-center pt-10">
                    {/* Floating Background Shapes */}
                    <div ref={floatiesRef} className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                        <div className="absolute top-[10%] left-[5%] size-32 bg-yellow-300 rounded-[3rem] opacity-40 blur-xl" />
                        <div className="absolute top-[30%] right-[10%] size-48 bg-emerald-400 rounded-full opacity-30 blur-2xl" />
                        <div className="absolute bottom-[20%] left-[15%] size-40 bg-pink-400 rounded-full opacity-30 blur-2xl" />
                        <div className="absolute top-[60%] right-[25%] size-24 bg-blue-400 rounded-full opacity-40 blur-xl" />
                    </div>

                    <div className="container mx-auto px-6 relative z-10 w-full">
                        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
                            <div className="hero-bouncy space-y-8 flex flex-col items-center lg:items-start text-center lg:text-left">
                                <Badge className="bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 border-2 border-emerald-100 dark:border-emerald-800 px-6 py-2 rounded-full text-sm font-black shadow-lg uppercase tracking-widest flex items-center gap-2">
                                    <Sparkles className="size-4 text-orange-400" />
                                    ¡Para toda la familia!
                                </Badge>

                                <h1 className="text-6xl sm:text-7xl lg:text-[5.5rem] font-black leading-[0.9] text-slate-800 dark:text-white tracking-tighter drop-shadow-sm">
                                    SALUD QUE <br />
                                    <span className="text-emerald-500 relative inline-block">
                                        TE HACE FELIZ
                                        <svg className="absolute w-full h-4 -bottom-1 left-0 text-orange-400 opacity-70" viewBox="0 0 100 20" preserveAspectRatio="none">
                                            <path d="M0,10 Q50,20 100,10" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
                                        </svg>
                                    </span>
                                </h1>

                                <p className="text-xl text-slate-600 dark:text-slate-300 font-bold max-w-lg leading-relaxed">
                                    La farmacia más divertida, segura y rápida. Desde vitaminas para los peques hasta el cuidado para los abuelos. ¡Todo con envío veloz! 🚀
                                </p>

                                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-4">
                                    <Link href="/medicamentos" className="w-full sm:w-auto">
                                        <Button
                                            className="h-16 px-10 text-xl rounded-[2rem] bg-orange-500 hover:bg-orange-600 text-white font-black shadow-[0_8px_0_rgb(194,65,12)] hover:shadow-[0_4px_0_rgb(194,65,12)] hover:translate-y-1 active:shadow-none active:translate-y-2 transition-all w-full flex items-center justify-center gap-3"
                                        >
                                            <ShoppingCart className="size-6" />
                                            Ir a Comprar
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="outline"
                                        className="h-16 px-10 text-xl rounded-[2rem] border-4 border-white bg-white/50 dark:bg-slate-800/50 hover:bg-white text-slate-700 font-black shadow-lg hover:scale-105 active:scale-95 transition-transform w-full sm:w-auto"
                                        onClick={() => handleWhatsApp('¡Quiero que me asesoren para comprar!')}
                                    >
                                        Consultar Experto
                                    </Button>
                                </div>
                            </div>

                            <div className="hero-bouncy relative lg:h-[600px] flex justify-center lg:justify-end perspective-1000 mt-10 lg:mt-0">
                                {/* Playful Image Container */}
                                <div className="relative w-full max-w-md h-[400px] lg:h-[500px] z-10">
                                    {/* Blob shape clipping path for image */}
                                    <div className="w-full h-full bg-emerald-400 rounded-[40%_60%_70%_30%_/_40%_50%_60%_50%] overflow-hidden shadow-2xl border-8 border-white dark:border-slate-800 animate-[blob_8s_infinite] relative">
                                        <img
                                            src="https://images.unsplash.com/photo-1576089172869-4f5f6f315620?q=80&w=800&auto=format&fit=crop"
                                            alt="Doctor and Child"
                                            className="w-full h-full object-cover scale-110"
                                        />
                                    </div>

                                    {/* Floating badges */}
                                    <div className="absolute -top-6 -right-6 bg-white dark:bg-slate-800 p-4 rounded-[1.5rem] shadow-xl border-4 border-yellow-100 flex items-center gap-3 rotate-12 hover:rotate-0 transition-transform cursor-pointer">
                                        <div className="size-12 bg-yellow-400 rounded-xl flex items-center justify-center text-white"><Star className="size-6 fill-white" /></div>
                                        <div>
                                            <p className="font-black text-sm leading-tight text-slate-800 dark:text-white">Para Niños</p>
                                            <p className="text-xs font-bold text-slate-500">100% Seguros</p>
                                        </div>
                                    </div>

                                    <div className="absolute -bottom-10 -left-6 bg-white dark:bg-slate-800 p-4 rounded-[1.5rem] shadow-xl border-4 border-pink-100 flex items-center gap-3 -rotate-6 hover:rotate-0 transition-transform cursor-pointer">
                                        <div className="size-12 bg-pink-400 rounded-xl flex items-center justify-center text-white"><HeartPulse className="size-6" /></div>
                                        <div>
                                            <p className="font-black text-sm leading-tight text-slate-800 dark:text-white">Amor & Cuidado</p>
                                            <p className="text-xs font-bold text-slate-500">24 horas</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* PHARMACY SERVICES MINI-BAR */}
                <section className="container mx-auto px-6 -mt-10 relative z-20">
                    <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { icon: <Clock className="size-6" />, label: "Abierto 24/7", desc: "Turno permanente", color: "bg-emerald-500" },
                            { icon: <Truck className="size-6" />, label: "Envío Veloz", desc: "Toda la ciudad", color: "bg-orange-500" },
                            { icon: <Store className="size-6" />, label: "3 Sucursales", desc: "Cerca de ti", color: "bg-blue-500" },
                            { icon: <ShieldCheck className="size-6" />, label: "Certificados", desc: "Garantía total", color: "bg-rose-500" }
                        ].map((srv, i) => (
                            <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-xl border-4 border-slate-50 dark:border-slate-800 hover:-translate-y-2 transition-all group">
                                <div className={`size-12 rounded-2xl ${srv.color} text-white flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform shadow-lg`}>
                                    {srv.icon}
                                </div>
                                <h4 className="font-black text-slate-800 dark:text-white leading-none mb-1">{srv.label}</h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{srv.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* RESERVATIONS & LOCATIONS */}
                <section id="reservas" className="py-20 scroll-bounce">
                    <div className="container mx-auto px-6 max-w-7xl">
                        <div className="grid lg:grid-cols-5 gap-8">
                            {/* RESERVATION FORM */}
                            <div className="lg:col-span-3 bg-white dark:bg-slate-800 rounded-[3rem] p-8 md:p-12 shadow-2xl border-4 border-emerald-100 dark:border-emerald-900/30 relative overflow-hidden">
                                <div className="relative z-10">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="size-16 bg-emerald-100 dark:bg-emerald-950 rounded-[1.5rem] flex items-center justify-center text-emerald-600">
                                            <Calendar className="size-8" />
                                        </div>
                                        <div>
                                            <h3 className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter">Reserva tu Medicamento</h3>
                                            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Asegura tu salud antes de que se agote</p>
                                        </div>
                                    </div>

                                    <form onSubmit={handleReserva} className="space-y-6">
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                                    <Info className="size-3" /> Tu Nombre Completo
                                                </label>
                                                <Input
                                                    placeholder="Ej. Maria Lopez"
                                                    className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-900 border-none font-bold"
                                                    value={reservaForm.nombre}
                                                    onChange={e => setReservaForm({ ...reservaForm, nombre: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                                    <Phone className="size-3" /> WhatsApp de Contacto
                                                </label>
                                                <Input
                                                    placeholder="Ej. 78945612"
                                                    className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-900 border-none font-bold"
                                                    value={reservaForm.celular}
                                                    onChange={e => setReservaForm({ ...reservaForm, celular: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                                <Pill className="size-3" /> ¿Qué necesitas reservar?
                                            </label>
                                            <Textarea
                                                placeholder="Escribe los nombres de los medicamentos y cualquier detalle especial (ej. 'lo recojo por la tarde')"
                                                className="min-h-[120px] rounded-3xl bg-slate-50 dark:bg-slate-900 border-none font-bold p-6"
                                                value={reservaForm.detalle}
                                                onChange={e => setReservaForm({ ...reservaForm, detalle: e.target.value })}
                                            />
                                        </div>

                                        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl">
                                            <input
                                                type="checkbox"
                                                id="delivery"
                                                className="size-5 rounded-lg border-2 border-emerald-500"
                                                checked={reservaForm.delivery}
                                                onChange={e => setReservaForm({ ...reservaForm, delivery: e.target.checked })}
                                            />
                                            <label htmlFor="delivery" className="text-sm font-black text-slate-600 dark:text-slate-300">¡Necesito envío a domicilio (Delivery)! 🛵</label>
                                        </div>

                                        <Button
                                            disabled={isSubmitting}
                                            className="w-full h-16 rounded-[2rem] bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xl shadow-[0_8px_0_rgb(4,120,87)] border-b-4 border-emerald-700 hover:translate-y-1 active:translate-y-2 transition-all"
                                        >
                                            {isSubmitting ? 'PROCESANDO...' : 'RESERVAR AHORA 💖'}
                                        </Button>
                                    </form>
                                </div>
                            </div>

                            {/* BRANCHES LIST */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="bg-orange-500 rounded-[3rem] p-8 text-white relative overflow-hidden shadow-2xl h-full flex flex-col">
                                    <div className="absolute -bottom-10 -right-10 size-40 bg-white/10 rounded-full blur-3xl" />
                                    <div className="relative z-10 flex-1">
                                        <div className="flex items-center gap-4 mb-8">
                                            <div className="size-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                                                <MapPin className="size-8" />
                                            </div>
                                            <h3 className="text-2xl font-black italic tracking-tighter">Nuestras Casas</h3>
                                        </div>

                                        <div className="space-y-4">
                                            {[
                                                { name: "Nexus Central", addr: "Av. Principal esq. Calle 5, El Alto", time: "24 Horas" },
                                                { name: "Nexus Norte", addr: "Calle Comercial Nro 45, La Paz", time: "08:00 - 22:00" },
                                                { name: "Nexus Sur", addr: "Plaza Abaroa Edif. Salud, La Paz", time: "08:00 - 20:00" }
                                            ].map((loc, i) => (
                                                <div key={i} className="bg-white/10 backdrop-blur-sm p-5 rounded-2xl border border-white/20 hover:bg-white/20 cursor-pointer transition-all">
                                                    <h5 className="font-black text-lg">{loc.name}</h5>
                                                    <p className="text-[10px] font-bold opacity-80 uppercase mb-2">{loc.addr}</p>
                                                    <div className="flex items-center justify-between">
                                                        <Badge variant="outline" className="text-white border-white/30 text-[10px]">{loc.time}</Badge>
                                                        <span className="text-[10px] font-black underline underline-offset-4">Ver en Mapa</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mt-8 pt-8 border-t border-white/20">
                                        <p className="text-xs font-bold opacity-80 text-center uppercase tracking-[0.2em]">Más de 10 años cuidando de ti</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* TRUST / ABOUT NOSOTROS SECTION */}
                <section id="nosotros" className="py-20 mt-10 scroll-bounce">
                    <div className="container mx-auto px-6 max-w-6xl">
                        <div className="bg-white dark:bg-slate-800 rounded-[3rem] p-8 md:p-14 shadow-2xl border-4 border-slate-100 dark:border-slate-700 relative overflow-hidden">
                            <div className="absolute -top-20 -right-20 size-64 bg-yellow-300 rounded-full opacity-20 blur-3xl pointer-events-none" />
                            <div className="absolute -bottom-20 -left-20 size-80 bg-pink-400 rounded-full opacity-20 blur-3xl pointer-events-none" />

                            <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
                                <div className="space-y-6">
                                    <Badge className="bg-orange-100 text-orange-600 border-none px-4 py-1 font-black text-sm rounded-full">💖 Sobre Nosotros</Badge>
                                    <h3 className="text-4xl md:text-5xl font-black text-slate-800 dark:text-white leading-tight">MÁS QUE FARMACIA, <br /> UNA FAMILIA.</h3>
                                    <p className="text-lg font-bold text-slate-500 leading-relaxed">
                                        En Nexus, nos preocupamos por la sonrisa de los tuyos. Seleccionamos productos rigurosamente, mantenemos precios justos y tenemos a los doctores más amables listos para atenderte desde casa.
                                    </p>
                                    <ul className="space-y-4 pt-4">
                                        {['Calidad certificada, sin riesgos.', 'Entrega volando hasta tu puerta.', 'Farmacéuticos felices 24/7.'].map((item, i) => (
                                            <li key={i} className="flex items-center gap-4 text-slate-700 dark:text-slate-300 font-black">
                                                <div className="size-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-500 flex items-center justify-center shrink-0">
                                                    <CheckCircle2 className="size-5" />
                                                </div>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="h-[400px] bg-slate-100 dark:bg-slate-700 rounded-[2rem] overflow-hidden border-8 border-white dark:border-slate-600 shadow-xl rotate-3 hover:rotate-0 transition-transform duration-500">
                                    <img src="https://images.unsplash.com/photo-1550989460-0adf9ea622e2?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover" alt="Family Shopping" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* SUPER SIMPLE AND FUN FOOTER */}
            <footer className="bg-white dark:bg-slate-900 border-t-8 border-emerald-500 pt-16 pb-10 rounded-t-[4rem] px-6 mt-10">
                <div className="container mx-auto max-w-6xl flex flex-col items-center justify-center text-center space-y-8">
                    <div className="size-20 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_8px_0_rgb(4,120,87)] border-4 border-white dark:border-slate-800 -mt-24 mb-4">
                        <Smile className="text-white size-10" />
                    </div>

                    <h3 className="text-3xl font-black text-slate-800 dark:text-white">NEXUS FARMA</h3>
                    <p className="font-bold text-slate-500 max-w-md">Tu farmacia feliz en Bolivia. Compras fáciles, entregas rápidas y mucho amor.</p>

                    <div className="flex gap-4">
                        <Button className="rounded-full font-black px-8 bg-slate-100 text-slate-600 hover:bg-slate-200 border-none shadow-sm h-12">Facebook</Button>
                        <Button className="rounded-full font-black px-8 bg-slate-100 text-slate-600 hover:bg-slate-200 border-none shadow-sm h-12">Instagram</Button>
                    </div>

                    <div className="w-full border-t border-slate-200 dark:border-slate-700 pt-8 mt-8 flex flex-col sm:flex-row justify-between items-center text-sm font-bold text-slate-400 gap-4">
                        <p>© {new Date().getFullYear()} Nexus Corporation. ¡Hecho con <Heart className="size-4 inline text-rose-400" /> para tu familia!</p>
                        <Link href="/login" className="hover:text-emerald-500 underline underline-offset-4 decoration-2">Área Personal</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
