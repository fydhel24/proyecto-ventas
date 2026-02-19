import React, { useEffect, useRef, useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    Activity, Clock, MapPin, MessageCircle, Pill,
    Search, ShieldCheck, HeartPulse, ShoppingCart,
    CheckCircle2, Star, Sparkles, Smile, Baby, Stethoscope, Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ColorThemeSelector } from '@/components/color-theme-selector';
import { useCart } from '@/hooks/use-cart';
import { CartDrawer } from '@/components/shop/CartDrawer';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { toast } from 'sonner';

gsap.registerPlugin(ScrollTrigger);

export default function Welcome({ productos, categorias, laboratorios }: any) {
    const { auth } = usePage().props as any;
    const { addToCart, itemCount } = useCart();

    // State
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [filteredProducts, setFilteredProducts] = useState(productos || []);

    // Refs for animations
    const heroRef = useRef(null);
    const storeRef = useRef(null);
    const floatiesRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let ctx = gsap.context(() => {
            // Intro Bouncy Animation - Very playful!
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

            // Product Cards stagger
            gsap.from(".prod-card", {
                scrollTrigger: {
                    trigger: ".prod-grid",
                    start: "top 80%",
                },
                y: 50,
                scale: 0.8,
                opacity: 0,
                duration: 0.8,
                stagger: 0.1,
                ease: "back.out(1.7)"
            });

        });

        return () => ctx.revert();
    }, []);

    // Filter Logic
    useEffect(() => {
        let result = productos || [];

        if (selectedCategory) {
            result = result.filter((p: any) => p.categoria_id === selectedCategory);
        }

        if (searchQuery.trim() !== "") {
            const query = searchQuery.toLowerCase();
            result = result.filter((p: any) =>
                p.nombre.toLowerCase().includes(query) ||
                (p.principio_activo && p.principio_activo.toLowerCase().includes(query))
            );
        }

        setFilteredProducts(result);
    }, [searchQuery, selectedCategory, productos]);

    const handleAddToCart = (product: any, e: React.MouseEvent) => {
        e.stopPropagation();
        addToCart({
            id: product.id,
            nombre: product.nombre,
            precio_venta: product.precio_venta,
            fotos: product.fotos
        });

        // Fun mini animation on click
        const target = e.currentTarget as HTMLElement;
        gsap.timeline()
            .to(target, { scale: 1.2, duration: 0.1 })
            .to(target, { scale: 1, duration: 0.3, ease: "bounce.out" });

        toast.success(`¡${product.nombre} añadido a tu bolsita! ✨`, {
            style: { background: '#10b981', color: 'white', borderRadius: '20px', fontWeight: 'bold' }
        });
    };

    const handleWhatsApp = (message = "¡Hola Familia Nexus! Quisiera consultar algo.") => {
        window.open(`https://wa.me/59122441122?text=${encodeURIComponent(message)}`, "_blank");
    };

    // Derived distinct categories for quick filters
    const quickCategories = categorias?.slice(0, 6) || [];

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
                        {['Nosotros', 'Medicamentos', 'Ayuda'].map(item => (
                            <a key={item} href={`#${item.toLowerCase()}`} className="text-base font-black text-slate-500 hover:text-emerald-500 hover:-translate-y-1 transition-all">
                                {item}
                            </a>
                        ))}
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
                                    <Button
                                        className="h-16 px-10 text-xl rounded-[2rem] bg-orange-500 hover:bg-orange-600 text-white font-black shadow-[0_8px_0_rgb(194,65,12)] hover:shadow-[0_4px_0_rgb(194,65,12)] hover:translate-y-1 active:shadow-none active:translate-y-2 transition-all w-full sm:w-auto flex items-center justify-center gap-3"
                                        onClick={() => document.getElementById('medicamentos')?.scrollIntoView({ behavior: 'smooth' })}
                                    >
                                        <ShoppingCart className="size-6" />
                                        Ir a Comprar
                                    </Button>
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

                {/* E-COMMERCE SECTION - "MEDICAMENTOS" */}
                <section id="medicamentos" ref={storeRef} className="py-20 mt-10 scroll-bounce relative z-20">
                    <div className="container mx-auto px-4 max-w-7xl">

                        {/* Section Header */}
                        <div className="bg-emerald-500 dark:bg-emerald-800 rounded-[3rem] p-8 md:p-12 shadow-2xl mb-12 relative overflow-hidden text-white border-4 border-emerald-400 dark:border-emerald-600">
                            <div className="absolute right-0 top-0 opacity-10">
                                <Pill className="size-[300px] -rotate-45 translate-x-10 -translate-y-10" />
                            </div>
                            <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                                <h2 className="text-5xl md:text-6xl font-black tracking-tight">¡Lleva tu Botiquín! 🛍️</h2>
                                <p className="text-lg md:text-xl font-bold opacity-90 max-w-2xl">
                                    Encuentra rápida y fácilmente todo lo que tu familia necesita. Agrega, revisa y nosotros te lo llevamos a la velocidad de la luz.
                                </p>

                                {/* Big Playful Search Bar */}
                                <div className="w-full max-w-2xl relative mt-6">
                                    <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-slate-400">
                                        <Search className="size-8" />
                                    </div>
                                    <Input
                                        type="text"
                                        placeholder="Busca vitaminas, jarabes, pañales..."
                                        className="h-20 pl-20 pr-6 text-xl rounded-full bg-white dark:bg-slate-900 border-4 border-emerald-300 dark:border-emerald-600 shadow-xl text-slate-800 dark:text-white placeholder:text-slate-400 font-bold focus-visible:ring-emerald-400"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Category Filters - Fun Pills */}
                        <div className="flex flex-wrap justify-center gap-4 mb-12 scroll-bounce">
                            <Button
                                variant={selectedCategory === null ? "default" : "outline"}
                                className={`h-14 rounded-full px-8 text-lg font-black border-4 transition-all hover:scale-105 active:scale-95 ${selectedCategory === null ? 'bg-orange-500 hover:bg-orange-600 border-orange-500 text-white shadow-xl' : 'bg-white border-slate-200 text-slate-600 shadow-md'}`}
                                onClick={() => setSelectedCategory(null)}
                            >
                                <Sparkles className="size-5 mr-2" />
                                ¡Todo!
                            </Button>

                            {quickCategories.map((cat: any) => (
                                <Button
                                    key={cat.id}
                                    variant={selectedCategory === cat.id ? "default" : "outline"}
                                    className={`h-14 rounded-full px-6 text-lg font-black border-4 transition-all hover:scale-105 active:scale-95 ${selectedCategory === cat.id ? 'bg-emerald-500 hover:bg-emerald-600 border-emerald-500 text-white shadow-xl' : 'bg-white border-slate-200 text-slate-600 shadow-md'}`}
                                    onClick={() => setSelectedCategory(cat.id)}
                                >
                                    {/* Random icon based on ID for fun */}
                                    {cat.id % 2 === 0 ? <Baby className="size-5 mr-2" /> : <Stethoscope className="size-5 mr-2" />}
                                    {cat.nombre_cat}
                                </Button>
                            ))}
                        </div>

                        {/* Product Grid - E-commerce */}
                        <div className="prod-grid grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {filteredProducts.length > 0 ? (
                                filteredProducts.map((prod: any) => (
                                    <div key={prod.id} className="prod-card bg-white dark:bg-slate-800 rounded-[2.5rem] p-6 border-4 border-emerald-50 dark:border-slate-700 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group flex flex-col relative">
                                        {/* Tag */}
                                        <div className="absolute top-4 left-4 z-10">
                                            <span className="bg-yellow-400 text-slate-900 text-xs font-black px-3 py-1 rounded-full shadow-sm uppercase">Nuevo</span>
                                        </div>

                                        <div className="bg-slate-50 dark:bg-slate-900 rounded-[1.5rem] aspect-square p-4 mb-6 relative overflow-hidden flex items-center justify-center">
                                            <img
                                                src={prod.fotos?.length > 0 ? `/storage/${prod.fotos[0].url}` : `https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400`}
                                                alt={prod.nombre}
                                                className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal group-hover:scale-110 transition-transform duration-500 drop-shadow-md"
                                            />
                                        </div>

                                        <div className="flex-1 flex flex-col text-center px-2">
                                            <p className="text-[10px] uppercase font-black tracking-widest text-emerald-500 mb-1 line-clamp-1">{prod.laboratorio?.nombre_lab || 'LABORATORIO TOP'}</p>
                                            <h3 className="font-black text-xl text-slate-800 dark:text-white leading-tight mb-2 line-clamp-2" title={prod.nombre}>{prod.nombre}</h3>
                                            <p className="text-sm font-bold text-slate-400 line-clamp-1 mb-4">{prod.principio_activo || "Sano y seguro"}</p>

                                            <div className="mt-auto flex items-center justify-between gap-2 pt-4 border-t-2 border-slate-100 dark:border-slate-700">
                                                <span className="text-2xl font-black text-slate-900 dark:text-white">{Number(prod.precio_venta).toFixed(1)} <span className="text-sm text-slate-500">Bs</span></span>
                                                <Button
                                                    size="icon"
                                                    className="size-12 rounded-[1rem] bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/30 hover:scale-110 active:scale-95 transition-transform shrink-0"
                                                    onClick={(e) => handleAddToCart(prod, e)}
                                                >
                                                    <ShoppingCart className="size-6" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-1 sm:col-span-2 lg:col-span-4 text-center py-20 bg-white dark:bg-slate-800 rounded-[3rem] border-4 border-dashed border-slate-200 dark:border-slate-700">
                                    <div className="size-24 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Search className="size-10 text-slate-400" />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-700 dark:text-slate-300">¡Ups! No encontramos eso.</h3>
                                    <p className="text-slate-500 font-bold mt-2">Intenta buscar con otra palabra.</p>
                                </div>
                            )}
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
