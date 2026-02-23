import React, { useEffect, useState } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
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

export default function Medicamentos({ productos, categorias }: any) {
    const { auth } = usePage().props as any;
    const { addToCart, itemCount } = useCart();

    // State
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [filteredProducts, setFilteredProducts] = useState(productos || []);

    useEffect(() => {
        let ctx = gsap.context(() => {
            // First ensure everything is visible in case of previous stuck animations
            gsap.set(".prod-card", { opacity: 1, y: 0, scale: 1 });

            // Then animate in from a safe state
            gsap.from(".prod-card", {
                y: 30,
                scale: 0.95,
                opacity: 0,
                duration: 0.5,
                stagger: 0.05,
                ease: "power2.out",
                clearProps: "all" // Important: clear properties after animation
            });
        });

        return () => ctx.revert();
    }, [filteredProducts]);

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

    const handleReservaClick = (prod: any) => {
        // Redirigir a la página principal a la sección de reservas con el producto pre-identificado
        const url = `/?reserva=${encodeURIComponent(prod.nombre)}#reservas`;
        router.visit(url);
    };

    const quickCategories = categorias?.slice(0, 6) || [];

    return (
        <div className="min-h-screen bg-[#F0FDF4] dark:bg-[#022C22] text-foreground transition-colors duration-500 font-sans overflow-x-hidden selection:bg-emerald-300">
            <Head title="Nexus Farma - Medicamentos" />

            {/* SUPER FUN HEADER */}
            <header className="fixed top-4 left-4 right-4 z-50">
                <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-4 border-emerald-100 dark:border-emerald-900 shadow-2xl rounded-[2rem] px-6 h-20 flex items-center justify-between mx-auto max-w-7xl">
                    <Link href="/" className="flex items-center gap-3 cursor-pointer group">
                        <div className="size-12 rounded-[1rem] bg-emerald-500 flex items-center justify-center shadow-lg group-hover:-translate-y-2 group-hover:rotate-12 transition-all duration-300">
                            <Smile className="text-white size-8" />
                        </div>
                        <div className="flex flex-col leading-none">
                            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">NEXUS</span>
                            <span className="text-[12px] font-black tracking-widest text-orange-400 capitalize -mt-1">Volver a Inicio</span>
                        </div>
                    </Link>

                    <nav className="hidden md:flex items-center gap-6">
                        <Link href="/#nosotros" className="text-base font-black text-slate-500 hover:text-emerald-500 hover:-translate-y-1 transition-all">Nosotros</Link>
                        <Link href="/medicamentos" className="text-base font-black text-emerald-500 hover:-translate-y-1 transition-all">
                            Medicamentos
                        </Link>
                        <Link href="/#reservas" className="text-base font-black text-slate-500 hover:text-emerald-500 hover:-translate-y-1 transition-all">Reservas</Link>

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
                {/* E-COMMERCE SECTION - "MEDICAMENTOS" */}
                <section className="py-10 relative z-20">
                    <div className="container mx-auto px-4 max-w-7xl">

                        {/* Section Header */}
                        <div className="bg-emerald-500 dark:bg-emerald-800 rounded-[3rem] p-8 md:p-12 shadow-2xl mb-12 relative overflow-hidden text-white border-4 border-emerald-400 dark:border-emerald-600">
                            <div className="absolute right-0 top-0 opacity-10">
                                <Pill className="size-[300px] -rotate-45 translate-x-10 -translate-y-10" />
                            </div>
                            <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                                <h1 className="text-5xl md:text-6xl font-black tracking-tight">¡Lleva tu Botiquín! 🛍️</h1>
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
                        <div className="flex flex-wrap justify-center gap-4 mb-12">
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
                                                <div className="flex flex-col items-start">
                                                    <span className="text-2xl font-black text-slate-900 dark:text-white">{Number(prod.precio_venta).toFixed(1)} <span className="text-sm text-slate-500">Bs</span></span>
                                                    <button
                                                        onClick={() => handleReservaClick(prod)}
                                                        className="text-[10px] font-black text-emerald-500 hover:underline uppercase tracking-widest mt-1"
                                                    >
                                                        O Reservar →
                                                    </button>
                                                </div>
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
