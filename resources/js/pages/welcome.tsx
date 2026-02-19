import React, { useEffect, useRef } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    Plus,
    ShoppingBag,
    PhoneCall,
    Clock,
    MapPin,
    ShieldCheck,
    Zap,
    Heart,
    Search,
    ChevronRight,
    ArrowRight,
    MessageCircle,
    Pill,
    Stethoscope,
    Microscope,
    Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Welcome({ productos, categorias, laboratorios }: any) {
    const heroRef = useRef(null);
    const productsRef = useRef(null);
    const servicesRef = useRef(null);
    const promoRef = useRef(null);

    useEffect(() => {
        // Hero Animations
        const ctx = gsap.context(() => {
            gsap.from(".hero-content > *", {
                y: 50,
                opacity: 0,
                duration: 1,
                stagger: 0.2,
                ease: "power4.out"
            });

            gsap.from(".hero-image", {
                scale: 0.8,
                opacity: 0,
                duration: 1.5,
                ease: "power2.out"
            });

            // Services Animations
            gsap.from(".service-card", {
                scrollTrigger: {
                    trigger: servicesRef.current,
                    start: "top 80%",
                },
                y: 60,
                opacity: 0,
                duration: 0.8,
                stagger: 0.15,
                ease: "back.out(1.7)"
            });

            // Products Animations
            gsap.from(".product-card", {
                scrollTrigger: {
                    trigger: productsRef.current,
                    start: "top 80%",
                },
                scale: 0.9,
                opacity: 0,
                duration: 0.7,
                stagger: 0.1,
                ease: "power2.out"
            });
        });

        return () => ctx.revert();
    }, []);

    const handleWhatsApp = () => {
        const message = encodeURIComponent("Hola Nexus Farma, quisiera consultar sobre la disponibilidad de un medicamento.");
        window.open(`https://wa.me/59122441122?text=${message}`, "_blank");
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#f8fafc] dark:bg-[#020617] transition-colors duration-500 font-sans selection:bg-emerald-500 selection:text-white">
            <Head title="Nexus Farma - Excelencia Médica y Farmacéutica" />

            {/* Navbar Premium */}
            <header className="fixed top-0 z-[100] w-full border-b border-emerald-500/10 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl">
                <div className="container flex items-center justify-between h-20 px-6 mx-auto">
                    <div className="flex items-center gap-3 group cursor-pointer">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20 group-hover:rotate-[360deg] transition-transform duration-700">
                            <Pill className="size-6 text-white" />
                        </div>
                        <div className="flex flex-col leading-none">
                            <span className="text-xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic">
                                NEXUS
                            </span>
                            <span className="text-[10px] font-bold tracking-[0.3em] text-emerald-500 uppercase ml-0.5">
                                FARMA
                            </span>
                        </div>
                    </div>

                    <nav className="items-center hidden gap-10 lg:flex">
                        {['Servicios', 'Catálogo', 'Laboratorios', 'Sucursales'].map((item) => (
                            <a
                                key={item}
                                href={`#${item.toLowerCase()}`}
                                className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-all hover:tracking-widest uppercase tracking-tight"
                            >
                                {item}
                            </a>
                        ))}
                    </nav>

                    <div className="flex items-center gap-4">
                        <Link href="/login">
                            <Button variant="ghost" className="hidden sm:flex font-bold hover:bg-emerald-500/10 hover:text-emerald-600">
                                Acceso Personal
                            </Button>
                        </Link>
                        <Button
                            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 px-6 rounded-full font-bold h-11 group transition-all"
                            onClick={handleWhatsApp}
                        >
                            <MessageCircle className="size-4 mr-2 group-hover:animate-bounce" />
                            WhatsApp 24/7
                        </Button>
                    </div>
                </div>
            </header>

            <main className="flex-1 pt-20">
                {/* Hero Section - High End */}
                <section ref={heroRef} className="relative min-h-[90vh] flex items-center overflow-hidden bg-slate-50 dark:bg-slate-950/50 py-20">
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-emerald-500/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-teal-500/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />

                    <div className="container relative z-10 px-6 mx-auto">
                        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
                            <div className="hero-content space-y-10">
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 shadow-sm animate-pulse">
                                    <Activity className="size-4" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Salud Certificada de Clase Mundial</span>
                                </div>
                                <h1 className="text-6xl font-black leading-[0.9] text-slate-900 dark:text-white md:text-7xl lg:text-8xl tracking-tighter">
                                    LA CIENCIA <br />
                                    <span className="text-emerald-500 italic">DEL CUIDADO.</span>
                                </h1>
                                <p className="max-w-[550px] text-xl text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                                    Nexus Farma combina tecnología farmacéutica avanzada con atención humana excepcional. Medicamentos éticos, certificados y accesibles para cada etapa de tu vida.
                                </p>
                                <div className="flex flex-col gap-5 sm:flex-row pt-4">
                                    <a href="#catálogo" className="sm:flex-1">
                                        <Button size="lg" className="h-16 px-10 text-lg bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl w-full shadow-2xl shadow-emerald-600/30 group">
                                            Explorar Farmacia
                                            <ArrowRight className="size-5 ml-2 group-hover:translate-x-2 transition-transform" />
                                        </Button>
                                    </a>
                                    <a href="#sucursales" className="sm:flex-1">
                                        <Button size="lg" variant="outline" className="h-16 px-10 text-lg rounded-2xl w-full border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 font-bold">
                                            Localizar Sedes
                                        </Button>
                                    </a>
                                </div>
                                <div className="flex items-center gap-10 pt-8 border-t border-slate-200 dark:border-slate-900">
                                    {[
                                        { icon: ShieldCheck, label: "Ética Médica" },
                                        { icon: Clock, label: "Turnos 24/7" },
                                        { icon: Zap, label: "Delivery VIP" }
                                    ].map((feat, i) => (
                                        <div key={i} className="flex flex-col gap-1">
                                            <feat.icon className="size-5 text-emerald-500" />
                                            <span className="text-xs font-black uppercase tracking-widest text-slate-400">{feat.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="hero-image relative hidden lg:block">
                                <div className="relative z-10 w-full aspect-square rounded-[60px] overflow-hidden border-[16px] border-white dark:border-slate-900 shadow-2xl skew-y-3 hover:skew-y-0 transition-transform duration-700">
                                    <img
                                        src="https://images.unsplash.com/photo-1587854692152-cbe660dbbb88?auto=format&fit=crop&q=80&w=1000"
                                        alt="Investigación Farmacéutica"
                                        className="w-full h-full object-cover scale-110 hover:scale-100 transition-transform duration-1000"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/40 to-transparent" />
                                </div>
                                {/* Floating Badges */}
                                <div className="absolute -top-10 -right-10 z-20 bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-2xl border border-emerald-500/10">
                                    <div className="flex items-center gap-4">
                                        <div className="size-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
                                            <Microscope className="size-8" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Laboratorios</p>
                                            <p className="text-xl font-black text-slate-900 dark:text-white leading-none">Certificados</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Categories / Services Section */}
                <section id="servicios" ref={servicesRef} className="py-32 bg-white dark:bg-[#020617]">
                    <div className="container px-6 mx-auto">
                        <div className="max-w-3xl mb-24">
                            <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none font-black text-[10px] tracking-[0.3em] uppercase mb-4">Ecosistema Nexus</Badge>
                            <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-none mb-6">ESPECIALIDADES <br /><span className="text-emerald-500">A TU ALCANCE.</span></h2>
                            <p className="text-lg text-slate-500 dark:text-slate-400 max-w-xl">Dividimos nuestra excelencia en áreas críticas de cuidado para garantizar que recibas exactamente lo que tu cuerpo necesita.</p>
                        </div>
                        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                            {[
                                { title: "Farmacia Ética", icon: Pill, color: "bg-blue-500" },
                                { title: "Dermatología", icon: Activity, color: "bg-emerald-500" },
                                { title: "Pediatría", icon: Heart, color: "bg-rose-500" },
                                { title: "Biotecnología", icon: Microscope, color: "bg-purple-500" }
                            ].map((service, i) => (
                                <div key={i} className="service-card group relative p-10 bg-slate-50 dark:bg-slate-900/50 rounded-[40px] hover:bg-emerald-600 transition-all duration-500 cursor-pointer overflow-hidden border border-slate-100 dark:border-slate-800">
                                    <div className={`size-16 ${service.color} rounded-2xl mb-8 flex items-center justify-center text-white shadow-xl group-hover:bg-white group-hover:text-emerald-600 transition-colors`}>
                                        <service.icon className="size-8" />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-white transition-colors mb-3 leading-tight">{service.title}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 group-hover:text-emerald-50 transition-colors">Productos seleccionados bajo rigurosos estándares de bioequivalencia.</p>
                                    <div className="absolute -bottom-10 -right-10 size-40 bg-white/5 rounded-full blur-2xl group-hover:bg-emerald-400/20 transition-all" />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Product Catalog - Optimized */}
                <section id="catálogo" ref={productsRef} className="py-32 bg-slate-50 dark:bg-slate-950/50">
                    <div className="container px-6 mx-auto">
                        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-20">
                            <div className="space-y-4">
                                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none font-black text-[10px] tracking-[0.3em] uppercase">Catálogo Premium</Badge>
                                <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">FARMACOPEA <br /><span className="text-emerald-500 italic">VIGENTE.</span></h2>
                            </div>
                            <Button variant="outline" className="rounded-full font-black text-xs uppercase tracking-widest px-8 border-emerald-500/20 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all">Ver Inventario Total</Button>
                        </div>
                        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
                            {productos.map((prod: any, i: number) => (
                                <div key={i} className="product-card group bg-white dark:bg-slate-900 rounded-[35px] shadow-sm hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 overflow-hidden border border-slate-100 dark:border-slate-800">
                                    <div className="aspect-[4/5] relative overflow-hidden bg-slate-100 dark:bg-slate-800">
                                        <img
                                            src={prod.fotos && prod.fotos.length > 0 ? `/storage/${prod.fotos[0].url}` : `https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=600`}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                            alt={prod.nombre}
                                        />
                                        <div className="absolute top-6 left-6">
                                            <div className="px-4 py-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl shadow-xl">
                                                <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 tracking-tighter">{prod.precio_venta} BOB</span>
                                            </div>
                                        </div>
                                        <button className="absolute bottom-6 right-6 size-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-xl opacity-0 translate-y-10 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 hover:bg-emerald-600">
                                            <Plus className="size-6" />
                                        </button>
                                    </div>
                                    <div className="p-8 space-y-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{prod.laboratorio?.nombre_lab || 'Nexus Lab'}</span>
                                            <div className="size-1 rounded-full bg-slate-200 dark:bg-slate-700" />
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">{prod.categorias?.[0]?.nombre_cat || 'Gral.'}</span>
                                        </div>
                                        <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight line-clamp-1">{prod.nombre}</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-medium">
                                            {prod.principio_activo || "Principio activo certificado"} - {prod.concentracion || "Concentración estándar"}
                                        </p>
                                        <Button
                                            variant="ghost"
                                            className="w-full text-emerald-600 dark:text-emerald-400 font-black text-xs uppercase tracking-widest hover:bg-emerald-500/10 rounded-xl"
                                            onClick={handleWhatsApp}
                                        >
                                            Consultar Stock
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Corporate Promotion - Premium Blue */}
                <section ref={promoRef} className="relative py-40 overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-800 text-white">
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                    <div className="container relative z-10 px-6 mx-auto text-center space-y-10">
                        <div className="size-20 bg-white/10 backdrop-blur-xl rounded-full mx-auto flex items-center justify-center border border-white/20">
                            <Stethoscope className="size-10" />
                        </div>
                        <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-none uppercase italic underline decoration-white/20 underline-offset-[15px]">
                            SOLUCIONES MÉDICAS <br /> DE VANGUARDIA.
                        </h2>
                        <p className="max-w-[850px] mx-auto text-xl font-medium opacity-80 leading-relaxed">
                            En Nexus Farma, no solo vendemos medicamentos; proveemos tranquilidad. Nuestra red de farmacias opera bajo estándares ISO para la gestión de fármacos críticos.
                        </p>
                        <div className="flex justify-center pt-10">
                            <Button
                                size="lg"
                                className="h-20 px-16 text-2xl bg-white text-emerald-600 hover:scale-105 active:scale-95 transition-all rounded-[30px] font-black shadow-2xl shadow-emerald-950/50"
                                onClick={handleWhatsApp}
                            >
                                <PhoneCall className="size-7 mr-4" />
                                Línea Prioritaria
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Sucursales - Modern Layout */}
                <section id="sucursales" className="py-40 bg-white dark:bg-[#020617] relative overflow-hidden">
                    <div className="container px-6 mx-auto">
                        <div className="grid gap-24 lg:grid-cols-5 items-center">
                            <div className="lg:col-span-2 space-y-10">
                                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none font-black text-[10px] tracking-[0.3em] uppercase">Red de Sedes</Badge>
                                <h2 className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">PRESENCIA LOCAL, <br /><span className="text-emerald-500">MÁXIMO ALCANCE.</span></h2>
                                <div className="space-y-8">
                                    {[
                                        { title: "Sede Central", address: "Av. 16 de Julio #123, El Prado, La Paz", icon: MapPin },
                                        { title: "Emergencias Nacional", address: "Call Center +591 2 2441122", icon: PhoneCall },
                                        { title: "Atención Digital", address: "nexusfarma.com.bo / Shop Online", icon: Activity }
                                    ].map((suc, i) => (
                                        <div key={i} className="flex gap-6 group cursor-pointer p-6 rounded-3xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                                            <div className="flex-shrink-0 size-16 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                                                <suc.icon className="size-8" />
                                            </div>
                                            <div>
                                                <h4 className="text-xl font-black text-slate-900 dark:text-white">{suc.title}</h4>
                                                <p className="text-slate-500 dark:text-slate-400 font-medium">{suc.address}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <Button className="bg-slate-900 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white rounded-2xl px-12 h-16 font-black text-sm uppercase tracking-widest shadow-xl">
                                    Explorar Mapa Interactivo
                                </Button>
                            </div>
                            <div className="lg:col-span-3 h-[600px] bg-slate-100 dark:bg-slate-900 rounded-[60px] overflow-hidden shadow-2xl relative border-[20px] border-slate-50 dark:border-slate-950">
                                <img
                                    src="https://images.unsplash.com/photo-1526948128573-703ee1aeb6fa?auto=format&fit=crop&q=80&w=1200"
                                    alt="Nexus Farma Location"
                                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000 opacity-60 dark:opacity-40"
                                />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                    <div className="size-20 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-3xl animate-bounce border-8 border-white dark:border-slate-900">
                                        <Plus className="size-10" />
                                    </div>
                                    <div className="absolute inset-0 bg-emerald-500/20 blur-3xl animate-pulse rounded-full" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer Senior */}
            <footer className="py-24 bg-slate-950 text-slate-500 border-t border-white/5">
                <div className="container px-6 mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-20 mb-20">
                        <div className="col-span-1 md:col-span-2 space-y-8">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
                                    <Pill className="size-6" />
                                </div>
                                <span className="font-black text-white text-2xl tracking-tighter uppercase italic">NEXUS FARMA</span>
                            </div>
                            <p className="max-w-md text-lg leading-relaxed font-medium">Liderando la transformación digital de la salud en Bolivia. Calidad certificada, trazabilidad total y precios éticos para nuestra comunidad.</p>
                            <div className="flex gap-4">
                                {['Twitter', 'LinkedIn', 'Instagram'].map(social => (
                                    <div key={social} className="size-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all cursor-pointer border border-white/5">
                                        <Zap className="size-5" />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-6">
                            <h4 className="text-white font-black text-xs uppercase tracking-[0.3em]">Operaciones</h4>
                            <ul className="text-sm font-bold space-y-4">
                                {['Sobre Nosotros', 'Red de Farmacias', 'Farmacovigilancia', 'Ética y Compliance'].map(link => (
                                    <li key={link}><a href="#" className="hover:text-emerald-500 transition-colors uppercase tracking-tight">{link}</a></li>
                                ))}
                            </ul>
                        </div>
                        <div className="space-y-6">
                            <h4 className="text-white font-black text-xs uppercase tracking-[0.3em]">Soporte Clínico</h4>
                            <p className="text-sm font-medium leading-relaxed">Central de Pedidos: <br /><span className="text-white font-black">+591 2 2441122</span> <br /> Calle Capitán Ravelo Edif. Nexus #1234, La Paz, Bolivia.</p>
                        </div>
                    </div>
                    <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">© 2026 Nexus Farma Corporation. Todos los Derechos Reservados. Sistemas Nexus ERP v2.0 Premium.</p>
                        <div className="flex gap-8 items-center grayscale opacity-30 hover:grayscale-0 hover:opacity-100 transition-all">
                            <ShieldCheck className="size-6" />
                            <Zap className="size-6" />
                            <Activity className="size-6" />
                        </div>
                    </div>
                </div>
            </footer>

            {/* Floating Action Button Premium */}
            <div className="fixed bottom-10 right-10 z-[100]">
                <button
                    onClick={handleWhatsApp}
                    className="flex items-center justify-center size-20 bg-emerald-500 text-white rounded-[25px] shadow-3xl shadow-emerald-500/40 hover:scale-110 active:scale-95 transition-all animate-[bounce_3s_infinite] group relative"
                >
                    <MessageCircle className="size-10 group-hover:rotate-12 transition-transform" />
                    <div className="absolute -top-1 -right-1 size-5 bg-rose-500 border-4 border-white dark:border-slate-950 rounded-full animate-ping" />
                </button>
            </div>
        </div>
    );
}

