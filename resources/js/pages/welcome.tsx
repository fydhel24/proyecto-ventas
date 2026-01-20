import { useEffect, useRef } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import PublicLayout from '@/layouts/public-layout';
import { Button } from '@/components/ui/button';
import { ShoppingBag, ArrowRight, Zap, ShieldCheck, Trophy, ChevronRight, LayoutGrid } from 'lucide-react';
import { type SharedData } from '@/types';
import gsap from 'gsap';
import { ProductCard } from '@/components/shop/ProductCard';

interface WelcomeProps {
    productos: any[];
    categorias: any[];
    marcas: any[];
    canRegister: boolean;
}

export default function Welcome({ productos, categorias, marcas = [], canRegister }: WelcomeProps) {
    const { auth } = usePage<SharedData>().props;

    // Refs para animaciones GSAP
    const heroRef = useRef<HTMLDivElement>(null);
    const textGroupRef = useRef<HTMLDivElement>(null);
    const imageContainerRef = useRef<HTMLDivElement>(null);
    const featuresRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

            // Entrada del texto
            tl.from(".animate-text", {
                y: 60,
                opacity: 0,
                stagger: 0.1,
                duration: 1.2
            })
                // Entrada de la imagen
                .from(imageContainerRef.current, {
                    x: 100,
                    opacity: 0,
                    duration: 1.5,
                    ease: "expo.out"
                }, "-=1")
                // Entrada de los iconos de confianza (features)
                .from(".feature-item", {
                    y: 20,
                    opacity: 0,
                    stagger: 0.1,
                    duration: 0.8
                }, "-=0.8");

            // Animación flotante para el producto principal
            gsap.to(".floating-img", {
                y: -20,
                duration: 3,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });
        }, heroRef);

        return () => ctx.revert();
    }, []);

    return (
        <PublicLayout>
            <Head title="Miracode | High-Performance Tech Gear" />

            <main className="flex-1 overflow-hidden" ref={heroRef}>
                {/* HERO SECTION */}
                <section className="relative pt-12 pb-20 lg:pt-24 lg:pb-32">
                    {/* Elementos decorativos de fondo */}
                    <div className="absolute top-0 right-0 -z-10 h-[600px] w-[600px] bg-primary/10 blur-[150px] rounded-full opacity-50" />
                    <div className="absolute bottom-0 left-0 -z-10 h-[400px] w-[400px] bg-blue-500/10 blur-[120px] rounded-full opacity-30" />

                    <div className="container mx-auto px-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                            {/* Información de Venta */}
                            <div ref={textGroupRef} className="z-10">
                                <div className="animate-text inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-primary/5 text-primary text-xs font-black uppercase tracking-[0.2em] mb-8 border border-primary/10 shadow-sm backdrop-blur-md">
                                    <Zap className="h-4 w-4 fill-primary" />
                                    <span>Nuevos Ingresos 2024</span>
                                </div>

                                <h1 className="animate-text text-6xl lg:text-8xl font-black tracking-tight mb-8 leading-[0.85] text-balance">
                                    Define tu <span className="text-primary italic">estilo</span> digital.
                                </h1>

                                <p className="animate-text text-xl text-muted-foreground mb-10 max-w-[520px] leading-relaxed font-medium">
                                    Curaduría exclusiva de hardware y periféricos diseñados para potenciar la creatividad y el rendimiento de élite.
                                </p>

                                <div className="animate-text flex flex-col sm:flex-row gap-5">
                                    <Button size="lg" className="h-16 px-10 rounded-[2rem] text-xl font-black group shadow-2xl shadow-primary/20 hover:scale-105 transition-all" asChild>
                                        <Link href="/tienda">
                                            Explorar Store
                                            <ShoppingBag className="ml-3 h-6 w-6 transition-transform group-hover:rotate-12" />
                                        </Link>
                                    </Button>
                                    <Button size="lg" variant="outline" className="h-16 px-10 rounded-[2rem] text-xl font-black group border-2 hover:bg-muted transition-all" asChild>
                                        <Link href="/tienda">
                                            Ver Catálogo
                                            <ArrowRight className="ml-3 h-6 w-6 transition-transform group-hover:translate-x-2" />
                                        </Link>
                                    </Button>
                                </div>

                                {/* Features / Confianza */}
                                <div ref={featuresRef} className="mt-16 grid grid-cols-3 gap-8 pt-10 border-t-2 border-border/30">
                                    {[
                                        { icon: ShieldCheck, label: "Garantía Elite" },
                                        { icon: Trophy, label: "Tech Curada" },
                                        { icon: Zap, label: "Envío Prioritario" }
                                    ].map((f, i) => (
                                        <div key={i} className="feature-item flex flex-col gap-2">
                                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-1">
                                                <f.icon className="h-6 w-6" />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-80">{f.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Imagen del Producto / Mockup */}
                            <div ref={imageContainerRef} className="relative flex justify-center">
                                <div className="floating-img relative w-full aspect-square max-w-[600px]">
                                    {/* Sombra proyectada en el suelo */}
                                    <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-[80%] h-12 bg-black/20 blur-3xl rounded-[100%]" />

                                    <div className="w-full h-full bg-gradient-to-br from-card to-muted rounded-[4rem] border-4 border-white/50 dark:border-white/5 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] overflow-hidden relative group">
                                        <img
                                            src="https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?q=80&w=2664&auto=format&fit=crop"
                                            alt="Miracode Premium Gear"
                                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                        />

                                        {/* Tag de precio flotante */}
                                        <div className="absolute bottom-10 left-10 bg-background/80 backdrop-blur-2xl p-6 rounded-[2.5rem] border-2 border-white/20 shadow-2xl animate-pulse">
                                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Setup Goal</p>
                                            <p className="text-4xl font-black text-primary tracking-tighter">$2,499.00</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </section>

                {/* SECCIÓN DE PRODUCTOS DESTACADOS */}
                <section className="container mx-auto px-6 py-24 bg-muted/30 rounded-[4rem] my-16 border-2 border-border/50 shadow-inner">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 px-4">
                        <div className="max-w-xl">
                            <h2 className="text-5xl md:text-6xl font-black tracking-tighter leading-none mb-4">Lo más deseado</h2>
                            <p className="text-muted-foreground text-xl font-medium">Equípate con las herramientas que están definiendo el futuro de la industria creativa.</p>
                        </div>
                        <Button variant="link" className="font-black text-primary text-xl h-auto p-0 group" asChild>
                            <Link href="/tienda" className="flex items-center gap-2">
                                Ver Catálogo Completo <ChevronRight className="h-6 w-6 transition-transform group-hover:translate-x-2" />
                            </Link>
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                        {productos.map((prod) => (
                            <ProductCard key={prod.id} producto={prod} />
                        ))}
                        {productos.length === 0 && (
                            <div className="col-span-full py-32 text-center bg-card rounded-[3rem] border-2 border-dashed">
                                <Zap className="h-16 w-16 mx-auto text-muted-foreground opacity-20 mb-6" />
                                <h3 className="text-2xl font-black mb-2">Renovando Stock</h3>
                                <p className="text-muted-foreground font-medium">Estamos preparando algo grande. Vuelve pronto.</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* SECCIÓN DE MARCAS */}
                <section className="container mx-auto px-6 py-24">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Marcas que Confían</h2>
                        <div className="h-1.5 w-24 bg-primary mx-auto rounded-full" />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
                        {marcas.map((marca) => (
                            <Link
                                key={marca.id}
                                href={`/tienda?marca=${marca.id}`}
                                className="group p-8 rounded-[2.5rem] bg-card border-2 border-border/50 hover:border-primary/50 transition-all hover:shadow-2xl flex flex-col items-center justify-center text-center backdrop-blur-sm"
                            >
                                <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-500">
                                    <Trophy className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                                </div>
                                <span className="font-black text-lg uppercase tracking-wider">{marca.nombre_marca}</span>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* SECCIÓN DE CATEGORÍAS */}
                <section className="container mx-auto px-6 py-24 bg-primary/5 rounded-[4rem] mb-24">
                    <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-8 text-center md:text-left">
                        <div>
                            <h2 className="text-5xl font-black tracking-tight mb-4">Navega por el Ecosistema</h2>
                            <p className="text-muted-foreground text-xl font-medium">Todo lo que necesitas, organizado por especialidad.</p>
                        </div>
                        <Button variant="outline" className="rounded-[1.5rem] font-black h-14 px-8 border-2" asChild>
                            <Link href="/tienda">Todas las Categorías</Link>
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {categorias.map((cat) => (
                            <Link
                                key={cat.id}
                                href={`/tienda?categoria=${cat.id}`}
                                className="group relative p-10 rounded-[3rem] bg-card border-2 border-border/50 hover:border-primary transition-all hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden"
                            >
                                <div className="absolute -right-8 -bottom-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                                    <LayoutGrid className="h-48 w-48" />
                                </div>
                                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-all duration-500 border border-primary/20">
                                    <ShoppingBag className="h-7 w-7 text-primary" />
                                </div>
                                <h3 className="font-black text-2xl leading-tight mb-2">{cat.nombre_cat}</h3>
                                <p className="text-muted-foreground font-medium">Explorar colección</p>
                            </Link>
                        ))}
                    </div>
                </section>
            </main>
        </PublicLayout>
    );
}