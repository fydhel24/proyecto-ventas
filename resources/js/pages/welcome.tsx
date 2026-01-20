import { useEffect, useRef } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { ShoppingBag, ArrowRight, Zap, ShieldCheck, Trophy } from 'lucide-react';
import { type SharedData } from '@/types';
import gsap from 'gsap';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;
    
    // Refs para animaciones GSAP
    const heroRef = useRef<HTMLDivElement>(null);
    const textGroupRef = useRef<HTMLDivElement>(null);
    const imageContainerRef = useRef<HTMLDivElement>(null);
    const featuresRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

            // Entrada del texto
            tl.from(".animate-text", {
                y: 40,
                opacity: 0,
                stagger: 0.15,
                duration: 1
            })
            // Entrada de la imagen
            .from(imageContainerRef.current, {
                scale: 0.8,
                opacity: 0,
                duration: 1.2,
                ease: "expo.out"
            }, "-=0.8")
            // Entrada de los iconos de confianza (features)
            .from(".feature-item", {
                y: 20,
                opacity: 0,
                stagger: 0.1,
                duration: 0.8
            }, "-=0.5");

            // Animación flotante para el producto principal
            gsap.to(".floating-img", {
                y: -15,
                duration: 2.5,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });
        }, heroRef);

        return () => ctx.revert();
    }, []);

    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary/20">
            <Head title="Miracode Shop | Tecnología Premium" />
            
            <Navbar auth={auth} />

            <main className="flex-1" ref={heroRef}>
                {/* HERO SECTION */}
                <section className="relative overflow-hidden pt-20 pb-16 lg:pt-32 lg:pb-24">
                    {/* Elementos decorativos de fondo */}
                    <div className="absolute top-0 right-0 -z-10 h-[500px] w-[500px] bg-primary/5 blur-[120px] rounded-full" />
                    <div className="absolute bottom-0 left-0 -z-10 h-[300px] w-[300px] bg-blue-500/5 blur-[100px] rounded-full" />

                    <div className="container mx-auto px-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                            
                            {/* Información de Venta */}
                            <div ref={textGroupRef} className="z-10">
                                <div className="animate-text inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-6 border border-primary/20">
                                    <Zap className="h-3 w-3" />
                                    <span>Nuevos Ingresos 2024</span>
                                </div>
                                
                                <h1 className="animate-text text-5xl lg:text-7xl font-black tracking-tight mb-6 leading-[0.95]">
                                    Eleva tu Setup con <span className="text-primary">Miracode.</span>
                                </h1>

                                <p className="animate-text text-lg text-muted-foreground mb-8 max-w-[480px] leading-relaxed">
                                    Equipamiento de alto rendimiento para desarrolladores y creativos que no aceptan menos de lo mejor.
                                </p>
                                
                                <div className="animate-text flex flex-col sm:flex-row gap-4">
                                    <Button size="lg" className="h-14 px-8 rounded-full text-lg font-bold group">
                                        Comprar Ahora
                                        <ShoppingBag className="ml-2 h-5 w-5 transition-transform group-hover:scale-110" />
                                    </Button>
                                    <Button size="lg" variant="outline" className="h-14 px-8 rounded-full text-lg font-semibold group">
                                        Ver Catálogo
                                        <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                    </Button>
                                </div>

                                {/* Features / Confianza */}
                                <div ref={featuresRef} className="mt-12 grid grid-cols-3 gap-4 pt-8 border-t border-border/50">
                                    {[
                                        { icon: ShieldCheck, label: "Garantía Global" },
                                        { icon: Trophy, label: "Top Calidad" },
                                        { icon: Zap, label: "Envío Flash" }
                                    ].map((f, i) => (
                                        <div key={i} className="feature-item flex flex-col gap-1">
                                            <f.icon className="h-5 w-5 text-primary" />
                                            <span className="text-xs font-bold uppercase tracking-tight text-muted-foreground">{f.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Imagen del Producto / Mockup */}
                            <div ref={imageContainerRef} className="relative flex justify-center">
                                <div className="floating-img relative w-full aspect-square max-w-[550px]">
                                    {/* Sombra proyectada en el suelo */}
                                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[70%] h-10 bg-black/10 blur-2xl rounded-[100%]" />
                                    
                                    <div className="w-full h-full bg-gradient-to-br from-card to-muted rounded-[2.5rem] border shadow-2xl overflow-hidden relative group">
                                        <img 
                                            src="https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=1470&auto=format&fit=crop" 
                                            alt="Producto Miracode"
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        
                                        {/* Tag de precio flotante */}
                                        <div className="absolute top-6 right-6 bg-background/90 backdrop-blur-md p-4 rounded-2xl border shadow-xl animate-bounce">
                                            <p className="text-xs font-bold text-muted-foreground uppercase">Desde</p>
                                            <p className="text-2xl font-black text-primary">$199.00</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </section>

                {/* SECCIÓN DE CATEGORÍAS (Rápida con Shadcn Cards) */}
                <section className="container mx-auto px-6 py-12">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold">Explorar Categorías</h2>
                        <Button variant="link" className="text-primary font-bold">Ver todas</Button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {['Teclados', 'Monitores', 'Audio', 'Sillas'].map((cat) => (
                            <div key={cat} className="group cursor-pointer p-6 rounded-2xl bg-card border hover:border-primary/50 transition-all hover:shadow-lg">
                                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <div className="h-6 w-6 bg-primary rounded-sm" />
                                </div>
                                <span className="font-bold text-lg">{cat}</span>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}