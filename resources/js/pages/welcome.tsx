import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import PublicLayout from '@/layouts/public-layout';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
    Calendar,
    ChevronRight,
    Clock,
    MapPin,
    MapPinned,
    Phone,
    ShoppingBag,
    Star,
    Utensils,
} from 'lucide-react';
import { useEffect, useRef } from 'react';

gsap.registerPlugin(ScrollTrigger);

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
    const { formatPrice } = useCart();

    // Refs para animaciones GSAP

    const heroRef = useRef<HTMLDivElement>(null);
    const sectionsRef = useRef<HTMLDivElement>(null);
    const carouselRef = useRef<HTMLDivElement>(null);

    const scrollCarousel = (direction: 'left' | 'right') => {
        if (!carouselRef.current) return;

        const scrollAmount = 300;
        const currentScroll = carouselRef.current.scrollLeft;
        const targetScroll =
            direction === 'left'
                ? currentScroll - scrollAmount
                : currentScroll + scrollAmount;

        gsap.to(carouselRef.current, {
            scrollLeft: targetScroll,
            duration: 0.8,
            ease: 'power2.out',
        });
    };

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Hero Animation
            const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
            tl.fromTo(
                '.hero-text',
                { y: 100, opacity: 0 },
                { y: 0, opacity: 1, duration: 1.5, stagger: 0.2 },
            ).fromTo(
                '.hero-image',
                { scale: 1.2, opacity: 0 },
                { scale: 1, opacity: 1, duration: 2 },
                '-=1',
            );

            // Scroll Animations for sections
            const sections = document.querySelectorAll('.animate-on-scroll');
            sections.forEach((section) => {
                gsap.fromTo(
                    section,
                    { y: 50, opacity: 0 },
                    {
                        y: 0,
                        opacity: 1,
                        duration: 1,
                        scrollTrigger: {
                            trigger: section,
                            start: 'top 80%',
                        },
                    },
                );
            });
        }, heroRef);

        return () => ctx.revert();
    }, []);

    const sucursales = [
        {
            nombre: 'Sucursal Central',
            direccion: 'Av. Las Américas 123',
            telefono: '+591 70000001',
            open: '08:00 - 23:00',
        },
        {
            nombre: 'Sucursal Norte',
            direccion: 'Calle Los Pinos #45',
            telefono: '+591 70000002',
            open: '10:00 - 00:00',
        },
    ];

    const promociones = [
        {
            title: '2x1 en Pastas',
            desc: 'Todos los martes y jueves',
            color: 'bg-orange-500',
        },
        {
            title: 'Cena Romántica',
            desc: 'Pack especial para parejas',
            color: 'bg-rose-500',
        },
        {
            title: 'Happy Hour',
            desc: '50% en coctelería de 18:00 a 20:00',
            color: 'bg-amber-500',
        },
    ];

    return (
        <PublicLayout>
            <Head title={`${name} | Experiencia Gastronómica Premium`} />

            <main
                className="flex-1 overflow-hidden bg-background"
                ref={heroRef}
            >
                {/* MODERN PREMIUM HERO SECTION */}
                <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-20">
                    <div className="hero-image absolute inset-0 z-0">
                        <img
                            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop"
                            className="h-full w-full scale-105 object-cover"
                            alt="Premium Dish"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                    </div>

                    <div className="relative z-10 container mx-auto grid items-center gap-12 px-6 lg:grid-cols-2">
                        <div className="text-white">
                            <div className="hero-text mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold tracking-widest uppercase backdrop-blur-md">
                                <Star className="size-4 fill-[var(--theme-primary)] text-[var(--theme-primary)]" />
                                <span>La mejor experiencia de la ciudad</span>
                            </div>
                            <h1 className="hero-text mb-8 text-6xl leading-none font-black tracking-tighter italic md:text-8xl lg:text-9xl">
                                ARTE EN <br />
                                <span className="text-[var(--theme-primary)]">
                                    CADA PLATO
                                </span>
                            </h1>
                            <p className="hero-text mb-12 max-w-xl text-xl leading-relaxed font-medium text-white/80 md:text-2xl">
                                Redescubre los sabores tradicionales con un
                                toque de innovación contemporánea. Ingredientes
                                frescos, pasión infinita.
                            </p>
                            <div className="hero-text flex flex-wrap gap-4">
                                <Button
                                    size="lg"
                                    className="h-16 rounded-2xl bg-[var(--theme-primary)] px-10 text-xl font-black shadow-[var(--theme-primary)]/20 shadow-2xl transition-transform hover:scale-105"
                                    asChild
                                >
                                    <Link href="/tienda">EXPLORAR MENÚ</Link>
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="h-16 rounded-2xl border-2 border-white/20 bg-white/5 px-10 text-xl font-black backdrop-blur-md transition-colors hover:bg-white/10"
                                    asChild
                                >
                                    <Link
                                        href={
                                            auth.user ? '/dashboard' : '/login'
                                        }
                                    >
                                        {auth.user
                                            ? 'MIS PEDIDOS'
                                            : 'RESERVAR MESA'}
                                    </Link>
                                </Button>
                            </div>
                        </div>

                        <div className="hidden justify-end pr-12 lg:flex">
                            <div className="hero-image group relative">
                                <div className="absolute inset-0 scale-150 animate-pulse rounded-full bg-[var(--theme-primary)]/20 blur-3xl" />
                                <div className="relative aspect-[3/4] w-80 overflow-hidden rounded-[4rem] border-4 border-white/10 shadow-2xl transition-transform duration-700 group-hover:rotate-2">
                                    <img
                                        src="https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=2069&auto=format&fit=crop"
                                        className="h-full w-full object-cover"
                                        alt="Featured dish"
                                    />
                                    <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 to-transparent p-8">
                                        <p className="mb-1 text-sm font-black tracking-widest text-[var(--theme-primary)] uppercase italic">
                                            Plato del Mes
                                        </p>
                                        <h3 className="text-2xl font-black text-white">
                                            Steak Gourmet
                                        </h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SUGERENCIAS DEL CHEF*/}
                <section className="animate-on-scroll py-24">
                    <div className="container mx-auto mb-16 px-6 text-center">
                        <span className="text-sm font-black tracking-[0.3em] text-[var(--theme-primary)] uppercase">
                            Selección Gourmet
                        </span>
                        <h2 className="mb-6 font-serif text-5xl font-black tracking-tighter uppercase italic md:text-7xl">
                            Sugerencias Chef
                        </h2>
                        <div className="mx-auto h-1.5 w-24 rounded-full bg-[var(--theme-primary)]" />
                    </div>

                    <div className="group/carousel relative">
                        <div ref={carouselRef} className="carousel-container">
                            {productos.slice(0, 8).map((prod) => (
                                <div
                                    key={prod.id}
                                    className="carousel-item circular-card"
                                >
                                    <Link
                                        href={`/tienda/${prod.id}`}
                                        className="group block"
                                    >
                                        <div className="circular-image-container relative">
                                            {prod.fotos?.[0]?.url ? (
                                                <img
                                                    src={`/storage/${prod.fotos[0].url}`}
                                                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                    alt={prod.nombre}
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center bg-muted">
                                                    <Utensils className="size-12 text-muted-foreground/30" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                                                <div className="scale-0 rounded-full bg-white p-3 text-black transition-transform duration-500 group-hover:scale-100">
                                                    <ShoppingBag className="size-6" />
                                                </div>
                                            </div>
                                        </div>
                                        <h3 className="mb-1 line-clamp-1 text-lg font-black uppercase">
                                            {prod.nombre}
                                        </h3>
                                        <p className="text-xl font-black text-[var(--theme-primary)] italic">
                                            {formatPrice(Number(prod.precio_1))}
                                        </p>
                                    </Link>
                                </div>
                            ))}
                        </div>

                        {/* Carousel Navigation Buttons */}
                        <div className="absolute top-1/2 left-4 z-10 hidden -translate-y-1/2 opacity-0 transition-opacity group-hover/carousel:opacity-100 md:block">
                            <Button
                                variant="outline"
                                size="icon"
                                className="size-12 rounded-full border-2 bg-background/80 backdrop-blur-sm"
                                onClick={() => scrollCarousel('left')}
                            >
                                <ChevronRight className="size-6 rotate-180" />
                            </Button>
                        </div>
                        <div className="absolute top-1/2 right-4 z-10 hidden -translate-y-1/2 opacity-0 transition-opacity group-hover/carousel:opacity-100 md:block">
                            <Button
                                variant="outline"
                                size="icon"
                                className="size-12 rounded-full border-2 bg-background/80 backdrop-blur-sm"
                                onClick={() => scrollCarousel('right')}
                            >
                                <ChevronRight className="size-6" />
                            </Button>
                        </div>
                    </div>

                    <div className="mt-20 flex justify-center">
                        <Button
                            variant="outline"
                            className="h-16 rounded-[2rem] border-2 px-12 text-lg font-black tracking-widest uppercase transition-all hover:bg-primary hover:text-white"
                            asChild
                        >
                            <Link
                                href="/tienda"
                                className="flex items-center gap-3"
                            >
                                Explorar toda la carta{' '}
                                <ChevronRight className="size-6" />
                            </Link>
                        </Button>
                    </div>
                </section>

                {/* SUCURSALES & UBICACIÓN */}
                <section className="animate-on-scroll container mx-auto px-6 py-32">
                    <div className="grid items-center gap-20 lg:grid-cols-2">
                        <div>
                            <span className="text-sm font-black tracking-widest text-[var(--theme-primary)] uppercase">
                                Encuéntranos
                            </span>
                            <h2 className="mb-12 text-5xl font-black tracking-tighter uppercase italic md:text-7xl">
                                Nuestras Casas
                            </h2>

                            <div className="space-y-8">
                                {sucursales.map((suc, i) => (
                                    <div
                                        key={i}
                                        className="group flex cursor-pointer items-start gap-6 rounded-[2.5rem] border-2 bg-card p-8 transition-all hover:border-[var(--theme-primary)]"
                                    >
                                        <div className="flex size-16 flex-shrink-0 items-center justify-center rounded-2xl bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] transition-transform group-hover:scale-110">
                                            <MapPin className="size-8" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="mb-2 text-2xl font-black italic">
                                                {suc.nombre}
                                            </h3>
                                            <p className="mb-4 flex items-center gap-2 font-medium text-muted-foreground">
                                                <MapPinned className="size-4" />{' '}
                                                {suc.direccion}
                                            </p>
                                            <div className="flex flex-wrap gap-6 text-sm">
                                                <div className="flex items-center gap-2 font-bold">
                                                    <Phone className="size-4 text-[var(--theme-primary)]" />{' '}
                                                    {suc.telefono}
                                                </div>
                                                <div className="flex items-center gap-2 font-bold">
                                                    <Clock className="size-4 text-[var(--theme-primary)]" />{' '}
                                                    {suc.open}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative">
                            <div className="aspect-square w-full overflow-hidden rounded-[4rem] border-8 border-white shadow-2xl dark:border-white/10">
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted p-12 text-center">
                                    <div className="mb-8 flex size-32 items-center justify-center rounded-full bg-primary/10">
                                        <MapPinned className="size-16 text-primary" />
                                    </div>
                                    <h3 className="mb-4 text-3xl font-black">
                                        MAPA INTERACTIVO
                                    </h3>
                                    <p className="mb-8 font-medium text-muted-foreground">
                                        Estamos en el centro neurálgico del
                                        sabor. Haz clic para obtener
                                        direcciones.
                                    </p>
                                    <Button className="h-14 rounded-full px-8 text-lg font-black">
                                        ABRIR EN GOOGLE MAPS
                                    </Button>
                                </div>
                                <img
                                    src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2070&auto=format&fit=crop"
                                    className="h-full w-full object-cover opacity-30 grayscale"
                                    alt="Map placeholder"
                                />
                            </div>

                            {/* Floating Badge */}
                            <div className="absolute -bottom-10 -left-10 animate-bounce rounded-[3rem] border-2 bg-white p-10 shadow-2xl duration-[5000ms] dark:bg-card">
                                <Calendar className="mb-4 size-10 text-[var(--theme-primary)]" />
                                <h4 className="text-xl font-black uppercase italic">
                                    RESERVAR
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    Asegura tu mesa hoy
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* EXPERIENCE CTA */}
                <section className="animate-on-scroll relative container mx-auto mb-24 flex h-[500px] items-center justify-center overflow-hidden rounded-[5rem] px-6">
                    <img
                        src="https://images.unsplash.com/photo-1473093226795-af9932fe5856?q=80&w=1994&auto=format&fit=crop"
                        className="absolute inset-0 h-full w-full scale-110 object-cover"
                        alt="CTA Background"
                    />
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />

                    <div className="relative z-10 max-w-2xl px-6 text-center text-white">
                        <ShoppingBag className="mx-auto mb-8 size-16 text-[var(--theme-primary)]" />
                        <h2 className="mb-6 text-5xl font-black tracking-tighter uppercase italic md:text-7xl">
                            EL SABOR EN TU CASA
                        </h2>
                        <p className="mb-12 text-xl font-medium text-white/80 md:text-2xl">
                            ¿Prefieres disfrutar de nuestra cocina en la
                            comodidad de tu hogar? Haz tu pedido online ahora.
                        </p>
                        <Button
                            className="h-20 rounded-[2rem] bg-[var(--theme-primary)] px-12 text-2xl font-black shadow-[var(--theme-primary)]/40 shadow-2xl transition-transform hover:scale-105"
                            asChild
                        >
                            <Link href="/tienda">ORDENAR AHORA</Link>
                        </Button>
                    </div>
                </section>
            </main>
        </PublicLayout>
    );
}
