import { ProductCard } from '@/components/shop/ProductCard';
import { Button } from '@/components/ui/button';
import PublicLayout from '@/layouts/public-layout';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import gsap from 'gsap';
import {
    ArrowRight,
    ChevronRight,
    Clock,
    MapPin,
    Star,
    Utensils,
    Wine,
} from 'lucide-react';
import { useEffect, useRef } from 'react';

interface WelcomeProps {
    productos: any[];
    categorias: any[];
    marcas: any[];
    canRegister: boolean;
}

export default function Welcome({
    productos,
    categorias,
    marcas = [],
    canRegister,
}: WelcomeProps) {
    const { auth, name } = usePage<SharedData>().props;

    // Refs para animaciones GSAP
    const heroRef = useRef<HTMLDivElement>(null);
    const leftColRef = useRef<HTMLDivElement>(null);
    const rightColRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

            // Entrada de la columna izquierda
            tl.from('.animate-left', {
                x: -50,
                opacity: 0,
                stagger: 0.1,
                duration: 1.2,
                delay: 0.2,
            })
                // Entrada de la columna derecha (video content)
                .from(
                    rightColRef.current,
                    {
                        x: 50,
                        scale: 0.9,
                        opacity: 0,
                        duration: 1.5,
                    },
                    '-=1',
                );
        }, heroRef);

        return () => ctx.revert();
    }, []);

    return (
        <PublicLayout>
            <Head title={`${name} | Experiencia Gastronómica`} />

            <main className="flex-1 overflow-hidden" ref={heroRef}>
                {/* SPLIT HERO SECTION */}
                <section className="relative flex min-h-[90vh] items-center overflow-hidden bg-background py-12 lg:py-20">
                    {/* Background Accents */}
                    <div className="absolute top-0 right-0 -z-10 h-[600px] w-[600px] rounded-full bg-[var(--theme-primary)]/10 opacity-60 blur-[130px]" />
                    <div className="absolute bottom-0 left-0 -z-10 h-[400px] w-[400px] rounded-full bg-orange-500/10 opacity-40 blur-[110px]" />

                    <div className="container mx-auto px-6">
                        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
                            {/* Left Column: Messaging & Branding */}
                            <div
                                ref={leftColRef}
                                className="z-10 flex flex-col items-start text-left"
                            >
                                <div className="animate-left mb-8 flex items-center gap-3 rounded-2xl border border-border/50 bg-muted px-4 py-2 text-[10px] font-black tracking-[0.3em] text-[var(--theme-primary)] uppercase shadow-sm">
                                    <Utensils className="h-4 w-4" />
                                    <span>Sabores Auténticos & Pasión</span>
                                </div>

                                {/* Logo and Brand Name */}
                                <div className="animate-left mb-8 flex items-center gap-4">
                                    <div className="rounded-2xl border border-border bg-background p-3 shadow-xl">
                                        <img
                                            src="/favicon.ico"
                                            className="size-12 md:size-16"
                                            alt="Logo"
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <h2 className="text-3xl leading-none font-black tracking-tighter italic md:text-4xl">
                                            {name}
                                        </h2>
                                        <p className="mt-1 text-[10px] font-bold tracking-[0.4em] text-muted-foreground uppercase">
                                            Gourmet Experience
                                        </p>
                                    </div>
                                </div>

                                <h1 className="animate-left mb-8 text-5xl leading-[0.85] font-black tracking-tight uppercase italic md:text-8xl lg:text-9xl">
                                    Sabor que
                                    <br />
                                    <span className="text-[var(--theme-primary)] drop-shadow-[0_0_15px_var(--theme-primary)]">
                                        Enamora.
                                    </span>
                                </h1>

                                <p className="animate-left mb-12 max-w-lg text-lg leading-relaxed font-medium text-muted-foreground md:text-2xl">
                                    Descubre una propuesta gastronómica única
                                    donde la tradición se encuentra con la
                                    innovación en cada plato.
                                </p>

                                <div className="animate-left flex w-full flex-col gap-5 sm:w-auto sm:flex-row">
                                    <Button
                                        size="lg"
                                        className="group h-16 rounded-2xl border-none bg-[var(--theme-primary)] px-10 text-xl font-black text-white shadow-[var(--theme-primary)]/20 shadow-2xl transition-all hover:scale-105"
                                        asChild
                                    >
                                        <Link href="/tienda">
                                            VER MENÚ
                                            <Utensils className="ml-3 h-6 w-6 transition-transform group-hover:rotate-12" />
                                        </Link>
                                    </Button>
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="group h-16 rounded-2xl border-2 px-10 text-xl font-black transition-all hover:bg-muted"
                                        asChild
                                    >
                                        <Link
                                            href={
                                                auth.user
                                                    ? '/dashboard'
                                                    : '/login'
                                            }
                                        >
                                            {auth.user ? 'PEDIDOS' : 'RESERVAR'}
                                            <ArrowRight className="ml-3 h-6 w-6 transition-transform group-hover:translate-x-2" />
                                        </Link>
                                    </Button>
                                </div>
                            </div>

                            {/* Right Column: Contained Video Content */}
                            <div
                                ref={rightColRef}
                                className="relative flex justify-center"
                            >
                                <div className="group relative aspect-video w-full max-w-[650px] lg:aspect-[4/3]">
                                    {/* Frame / Border Effect */}
                                    <div className="absolute inset-x-4 -bottom-6 -z-10 h-full rounded-[3rem] bg-[var(--theme-primary)]/10 transition-all duration-500 group-hover:-bottom-8" />

                                    <div className="relative h-full w-full overflow-hidden rounded-[3rem] border-4 border-white shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)] dark:border-white/10">
                                        <video
                                            autoPlay
                                            muted
                                            loop
                                            playsInline
                                            className="h-full w-full scale-[1.02] object-cover"
                                        >
                                            <source
                                                src="/videos/Ladologo.mp4"
                                                type="video/mp4"
                                            />
                                        </video>
                                        {/* Overlay para legibilidad y elegancia */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

                                        {/* Floating Badge in Video */}
                                        <div className="absolute top-8 right-8 animate-bounce rounded-3xl border border-white/20 bg-white/10 p-4 backdrop-blur-xl duration-[3000ms]">
                                            <Star className="h-6 w-6 fill-[var(--theme-primary)] text-[var(--theme-primary)] shadow-[0_0_10px_var(--theme-primary)]" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Bottom Glow Line */}
                    <div className="absolute right-0 bottom-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--theme-primary)]/40 to-transparent opacity-30 shadow-[0_0_10px_var(--theme-primary)]" />
                </section>

                {/* SECCIÓN DE PLATOS DESTACADOS */}
                <section className="container mx-auto px-6 py-24">
                    <div className="mb-16 flex flex-col justify-between gap-8 md:flex-row md:items-end">
                        <div className="max-w-xl">
                            <h2 className="mb-4 text-5xl leading-none font-black tracking-tighter uppercase italic md:text-7xl">
                                Sugerencias Chef
                            </h2>
                            <p className="text-xl font-medium text-muted-foreground">
                                Una selección exclusiva de nuestros platos más
                                galardonados.
                            </p>
                        </div>
                        <Button
                            variant="link"
                            className="group h-auto p-0 text-xl font-black text-[var(--theme-primary)]"
                            asChild
                        >
                            <Link
                                href="/tienda"
                                className="flex items-center gap-2"
                            >
                                Ver Carta Completa{' '}
                                <ChevronRight className="h-6 w-6 transition-transform group-hover:translate-x-2" />
                            </Link>
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
                        {productos.map((prod) => (
                            <ProductCard key={prod.id} producto={prod} />
                        ))}
                    </div>
                </section>

                {/* SECCIÓN DE EXPERIENCIA (Marcas -> Caracteristicas) */}
                <section className="relative container mx-auto mb-16 overflow-hidden rounded-[4rem] border border-border/50 bg-muted/30 px-6 py-24 shadow-inner">
                    <div className="absolute -top-20 -right-20 size-64 rounded-full bg-[var(--theme-primary)]/5 blur-[80px]" />
                    <div className="relative z-10 mb-16 text-center">
                        <h2 className="mb-4 text-4xl font-black tracking-tight uppercase italic md:text-6xl">
                            Vive la Experiencia
                        </h2>
                        <div className="mx-auto h-1.5 w-24 rounded-full bg-[var(--theme-primary)]" />
                    </div>
                    <div className="relative z-10 grid grid-cols-1 gap-8 md:grid-cols-3">
                        <div className="group flex flex-col items-center rounded-[3rem] border border-border/50 bg-card p-10 text-center transition-all hover:border-[var(--theme-primary)]">
                            <Wine className="mb-6 h-12 w-12 text-[var(--theme-primary)]" />
                            <h3 className="mb-2 text-2xl font-black uppercase italic">
                                Cava Premium
                            </h3>
                            <p className="text-muted-foreground">
                                Selección de vinos nacionales e internacionales
                                para el maridaje perfecto.
                            </p>
                        </div>
                        <div className="group flex flex-col items-center rounded-[3rem] border border-border/50 bg-card p-10 text-center transition-all hover:border-[var(--theme-primary)]">
                            <Clock className="mb-6 h-12 w-12 text-[var(--theme-primary)]" />
                            <h3 className="mb-2 text-2xl font-black uppercase italic">
                                Abierto Diario
                            </h3>
                            <p className="text-muted-foreground">
                                Listos para recibirte todos los días con la
                                mejor atención y calidez.
                            </p>
                        </div>
                        <div className="group flex flex-col items-center rounded-[3rem] border border-border/50 bg-card p-10 text-center transition-all hover:border-[var(--theme-primary)]">
                            <MapPin className="mb-6 h-12 w-12 text-[var(--theme-primary)]" />
                            <h3 className="mb-2 text-2xl font-black uppercase italic">
                                Ubicación Central
                            </h3>
                            <p className="text-muted-foreground">
                                Encuéntranos en el corazón de la ciudad, un
                                oasis gastronómico a tu alcance.
                            </p>
                        </div>
                    </div>
                </section>

                {/* SECCIÓN DE CATEGORÍAS */}
                <section className="container mx-auto mb-24 px-6 py-24">
                    <div className="mb-16 flex flex-col items-center justify-between gap-8 text-center md:flex-row md:text-left">
                        <div>
                            <h2 className="mb-4 text-5xl leading-none font-black tracking-tight uppercase italic md:text-7xl">
                                Nuestra
                                <br />
                                Propuesta
                            </h2>
                            <p className="text-xl font-medium text-muted-foreground">
                                Explora nuestra oferta organizada por momentos y
                                sabores.
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            className="h-14 rounded-2xl border-2 px-8 font-black"
                            asChild
                        >
                            <Link href="/tienda">Todas las Categorías</Link>
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {categorias.map((cat) => (
                            <Link
                                key={cat.id}
                                href={`/tienda?categoria=${cat.id}`}
                                className="group relative overflow-hidden rounded-[3rem] border border-border/50 bg-card p-10 transition-all hover:border-[var(--theme-primary)] hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)]"
                            >
                                <div className="absolute -right-8 -bottom-8 opacity-[0.03] transition-opacity group-hover:opacity-[0.08]">
                                    <Utensils className="h-48 w-48" />
                                </div>
                                <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--theme-primary)]/20 bg-[var(--theme-primary)]/10 shadow-lg transition-all duration-500 group-hover:scale-110">
                                    <Utensils className="h-7 w-7 text-[var(--theme-primary)]" />
                                </div>
                                <h3 className="mb-2 text-3xl leading-tight font-black uppercase italic">
                                    {cat.nombre_cat}
                                </h3>
                                <p className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                                    Descubrir platos
                                </p>
                            </Link>
                        ))}
                    </div>
                </section>
            </main>
        </PublicLayout>
    );
}
