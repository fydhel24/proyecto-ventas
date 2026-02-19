import { useEffect, useRef } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import PublicLayout from '@/layouts/public-layout';
import { Button } from '@/components/ui/button';
import { ShoppingBag, ArrowRight, Heart, ChevronRight, LayoutGrid, Shield, Cross, Activity, Pill } from 'lucide-react';
import { type SharedData } from '@/types';
import gsap from 'gsap';
import { ProductCard } from '@/components/shop/ProductCard';
import { cn } from '@/lib/utils';

interface WelcomeProps {
    productos: any[];
    categorias: any[];
    laboratorios: any[];
    canRegister: boolean;
}

export default function Welcome({ productos, categorias, laboratorios = [], canRegister }: WelcomeProps) {
    const { auth, name } = usePage<SharedData>().props;

    // Refs para animaciones GSAP
    const heroRef = useRef<HTMLDivElement>(null);
    const leftColRef = useRef<HTMLDivElement>(null);
    const rightColRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

            // Entrada de la columna izquierda
            tl.from(".animate-left", {
                x: -50,
                opacity: 0,
                stagger: 0.1,
                duration: 1.2,
                delay: 0.2
            })
                // Entrada de la columna derecha (video content)
                .from(rightColRef.current, {
                    x: 50,
                    scale: 0.9,
                    opacity: 0,
                    duration: 1.5
                }, "-=1");

        }, heroRef);

        return () => ctx.revert();
    }, []);

    return (
        <PublicLayout>
            <Head title="Nexus Farma | Tu Salud en Buenas Manos" />

            <main className="flex-1 overflow-hidden" ref={heroRef}>
                {/* SPLIT HERO SECTION */}
                <section className="relative min-h-[85vh] flex items-center py-12 lg:py-20 bg-background overflow-hidden">
                    {/* Background Accents */}
                    <div className="absolute top-0 right-0 -z-10 h-[500px] w-[500px] bg-[var(--theme-primary)]/5 blur-[120px] rounded-full opacity-50" />
                    <div className="absolute bottom-0 left-0 -z-10 h-[300px] w-[300px] bg-emerald-500/5 blur-[100px] rounded-full opacity-30" />

                    <div className="container mx-auto px-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

                            {/* Left Column: Messaging & Branding */}
                            <div ref={leftColRef} className="z-10 flex flex-col items-start text-left">
                                <div className="animate-left flex items-center gap-3 px-4 py-2 rounded-2xl bg-muted border border-border/50 text-[var(--theme-primary)] text-[10px] font-black uppercase tracking-[0.3em] mb-8 shadow-sm">
                                    <Shield className="h-4 w-4" />
                                    <span>Salud y Cuidado Integral</span>
                                </div>

                                {/* Logo and Brand Name */}
                                <div className="animate-left flex items-center gap-4 mb-8">
                                    <div className="p-3 rounded-2xl bg-background border border-border shadow-xl">
                                        <Activity className="size-12 md:size-16 text-[var(--theme-primary)]" />
                                    </div>
                                    <div className="flex flex-col">
                                        <h2 className="text-3xl md:text-4xl font-black italic tracking-tighter  leading-none">Nexus Farma</h2>
                                        <p className="text-[10px] font-bold tracking-[0.4em] text-muted-foreground uppercase mt-1">Cuidamos tu Bienestar</p>
                                    </div>
                                </div>

                                <h1 className="animate-left text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8 leading-[0.9] italic uppercase">
                                    Cuida tu<br />
                                    <span className="text-[var(--theme-primary)] drop-shadow-[0_0_15px_var(--theme-primary)]">Salud.</span>
                                </h1>

                                <p className="animate-left text-lg md:text-xl text-muted-foreground mb-12 max-w-lg leading-relaxed font-medium">
                                    En Nexus Farma ofrecemos una curaduría de medicamentos y productos de cuidado personal diseñados para el bienestar de tu familia.
                                </p>

                                <div className="animate-left flex flex-col sm:flex-row gap-5 w-full sm:w-auto">
                                    <Button size="lg" className="h-16 px-10 rounded-2xl text-xl font-black group shadow-2xl shadow-[var(--theme-primary)]/20 hover:scale-105 transition-all bg-[var(--theme-primary)] text-white border-none" asChild>
                                        <Link href="/tienda">
                                            VER FARMACIA
                                            <Pill className="ml-3 h-6 w-6 transition-transform group-hover:rotate-12" />
                                        </Link>
                                    </Button>
                                    <Button size="lg" variant="outline" className="h-16 px-10 rounded-2xl text-xl font-black group border-2 hover:bg-muted transition-all" asChild>
                                        <Link href={auth.user ? "/dashboard" : "/login"}>
                                            {auth.user ? "DASHBOARD" : "INGRESAR"}
                                            <ArrowRight className="ml-3 h-6 w-6 transition-transform group-hover:translate-x-2" />
                                        </Link>
                                    </Button>
                                </div>
                            </div>

                            {/* Right Column: Contained Video Content */}
                            <div ref={rightColRef} className="relative flex justify-center">
                                <div className="relative w-full aspect-video lg:aspect-[4/3] max-w-[650px] group">
                                    {/* Frame / Border Effect */}
                                    <div className="absolute inset-x-4 -bottom-6 h-full bg-[var(--theme-primary)]/10 rounded-[3rem] -z-10 group-hover:-bottom-8 transition-all duration-500" />

                                    <div className="w-full h-full rounded-[3rem] border-4 border-white dark:border-white/10 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)] overflow-hidden relative bg-emerald-50 flex items-center justify-center">
                                        <div className="flex flex-col items-center gap-4 animate-pulse">
                                            <Activity className="size-32 text-[var(--theme-primary)] opacity-20" />
                                            <p className="text-[var(--theme-primary)] font-black text-xs tracking-widest uppercase opacity-30">Nexus Health Systems</p>
                                        </div>
                                        {/* Overlay para legibilidad y elegancia */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/10 via-transparent to-transparent opacity-60" />

                                        {/* Floating Badge in Video */}
                                        <div className="absolute top-8 right-8 bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-3xl animate-bounce duration-[3000ms]">
                                            <Heart className="h-6 w-6 text-[var(--theme-primary)] fill-[var(--theme-primary)] shadow-[0_0_10px_var(--theme-primary)]" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                    {/* Bottom Glow Line */}
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--theme-primary)]/40 to-transparent shadow-[0_0_10px_var(--theme-primary)] opacity-30" />
                </section>

                {/* SECCIÓN DE PRODUCTOS DESTACADOS */}
                <section className="container mx-auto px-6 py-24">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                        <div className="max-w-xl">
                            <h2 className="text-5xl md:text-6xl font-black tracking-tighter leading-none mb-4 italic uppercase text-foreground">Salud al Alcance</h2>
                            <p className="text-muted-foreground text-xl font-medium">Medicamentos de calidad garantizada para tu tranquilidad.</p>
                        </div>
                        <Button variant="link" className="font-black text-[var(--theme-primary)] text-xl h-auto p-0 group" asChild>
                            <Link href="/tienda" className="flex items-center gap-2">
                                Ver Catálogo <ChevronRight className="h-6 w-6 transition-transform group-hover:translate-x-2" />
                            </Link>
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                        {productos.map((prod) => (
                            <ProductCard key={prod.id} producto={prod} />
                        ))}
                    </div>
                </section>

                {/* SECCIÓN DE MARCAS (LABORATORIOS) */}
                <section className="container mx-auto px-6 py-24 bg-muted/30 rounded-[4rem] mb-16 border border-border/50 shadow-inner overflow-hidden relative">
                    <div className="absolute -top-20 -right-20 size-64 bg-[var(--theme-primary)]/5 rounded-full blur-[80px]" />
                    <div className="text-center mb-16 relative z-10">
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4 italic uppercase text-foreground">Laboratorios Aliados</h2>
                        <div className="h-1.5 w-24 bg-[var(--theme-primary)] mx-auto rounded-full" />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 relative z-10">
                        {laboratorios.map((lab) => (
                            <Link
                                key={lab.id}
                                href={`/tienda?laboratorio=${lab.id}`}
                                className="group p-8 rounded-[2.5rem] bg-card border border-border/50 hover:border-[var(--theme-primary)]/50 transition-all hover:shadow-2xl flex flex-col items-center justify-center text-center backdrop-blur-sm"
                            >
                                <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[var(--theme-primary)]/10 transition-all duration-500">
                                    <Cross className="h-8 w-8 text-muted-foreground group-hover:text-[var(--theme-primary)] transition-colors" />
                                </div>
                                <span className="font-black text-[10px] uppercase tracking-wider">{lab.nombre_lab}</span>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* SECCIÓN DE CATEGORÍAS */}
                <section className="container mx-auto px-6 py-24 mb-24">
                    <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-8 text-center md:text-left">
                        <div>
                            <h2 className="text-5xl font-black tracking-tight mb-4 italic uppercase leading-none text-foreground">Especialidades<br />Médicas</h2>
                            <p className="text-muted-foreground text-xl font-medium">Todo lo que tu cuerpo necesita, organizado por categoría.</p>
                        </div>
                        <Button variant="outline" className="rounded-2xl font-black h-14 px-8 border-2" asChild>
                            <Link href="/tienda">Todas las Categorías</Link>
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {categorias.map((cat) => (
                            <Link
                                key={cat.id}
                                href={`/tienda?categoria=${cat.id}`}
                                className="group relative p-10 rounded-[3rem] bg-card border border-border/50 hover:border-[var(--theme-primary)] transition-all hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden"
                            >
                                <div className="absolute -right-8 -bottom-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                                    <Pill className="h-48 w-48" />
                                </div>
                                <div className="h-14 w-14 rounded-2xl bg-[var(--theme-primary)]/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-all duration-500 border border-[var(--theme-primary)]/20 shadow-lg">
                                    <ShoppingBag className="h-7 w-7 text-[var(--theme-primary)]" />
                                </div>
                                <h3 className="font-black text-2xl leading-tight mb-2 uppercase italic text-foreground">{cat.nombre_cat}</h3>
                                <p className="text-muted-foreground font-black text-[10px] uppercase tracking-widest">Explorar selección</p>
                            </Link>
                        ))}
                    </div>
                </section>
            </main>
        </PublicLayout>
    );
}