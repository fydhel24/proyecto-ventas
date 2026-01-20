import { Head, router, usePage } from '@inertiajs/react';
import PublicLayout from '@/layouts/public-layout';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { ProductCard } from '@/components/shop/ProductCard';
import {
    ChevronLeft,
    ShoppingCart,
    ShieldCheck,
    Truck,
    RotateCcw,
    Plus,
    Minus,
    Check
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { type SharedData } from '@/types';

interface Props {
    producto: any;
    sugerencias: any[];
}

export default function Show({ producto, sugerencias }: Props) {
    const { addToCart } = useCart();
    const { app_url } = usePage<SharedData & { app_url: string }>().props;
    const [cantidad, setCantidad] = useState(1);
    const [activeImg, setActiveImg] = useState(0);

    const contentRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(".animate-in", {
                x: 40,
                opacity: 0,
                stagger: 0.1,
                duration: 0.8,
                ease: "power3.out"
            });
            gsap.from(imageRef.current, {
                scale: 0.9,
                opacity: 0,
                duration: 1,
                ease: "expo.out"
            });
        }, contentRef);
        return () => ctx.revert();
    }, [producto.id]);

    const handleAddToCart = () => {
        addToCart(producto, cantidad);
        toast.success(`${producto.nombre} agregado`, {
            description: `${cantidad} unidad(es) añadidas al carrito.`
        });
    };

    const images = producto.fotos?.length > 0
        ? producto.fotos.map((f: any) => `${app_url}/storage/${f.url}`)
        : ['/images/placeholder.png'];

    return (
        <PublicLayout>
            <Head title={`${producto.nombre} | Miracode Shop`} />

            <div className="container mx-auto px-4 py-8 md:py-16" ref={contentRef}>
                {/* Back Button */}
                <Button
                    variant="ghost"
                    className="mb-8 font-black gap-2 hover:bg-transparent hover:text-primary transition-all p-0 text-lg group leading-none"
                    onClick={() => window.history.back()}
                >
                    <ChevronLeft className="h-6 w-6 transition-transform group-hover:-translate-x-1" />
                    Volver al catálogo
                </Button>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

                    {/* Gallery */}
                    <div className="lg:col-span-7 space-y-6">
                        <div
                            ref={imageRef}
                            className="relative aspect-square md:aspect-[4/3] rounded-[3rem] overflow-hidden bg-muted border-4 border-border/50 shadow-2xl"
                        >
                            <img
                                src={images[activeImg]}
                                alt={producto.nombre}
                                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                            />

                            {producto.stock <= 5 && (
                                <div className="absolute top-8 left-8 bg-red-500 text-white px-6 py-2 rounded-full font-black text-xs uppercase shadow-2xl">
                                    ¡Quedan pocas unidades! ({producto.stock})
                                </div>
                            )}
                        </div>

                        {images.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide">
                                {images.map((img: string, i: number) => (
                                    <button
                                        key={i}
                                        className={`relative h-28 w-28 flex-shrink-0 rounded-[1.5rem] overflow-hidden border-4 transition-all ${activeImg === i ? 'border-primary ring-4 ring-primary/20' : 'border-transparent opacity-60 hover:opacity-100 hover:scale-105'
                                            }`}
                                        onClick={() => setActiveImg(i)}
                                    >
                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="lg:col-span-5 space-y-10">
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 animate-in">
                                <Badge className="rounded-xl font-black uppercase tracking-tighter text-xs px-4 py-1.5 bg-primary/10 text-primary border-none">
                                    {producto.categoria?.nombre_cat}
                                </Badge>
                                <div className="h-1.5 w-1.5 rounded-full bg-border" />
                                <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">
                                    {producto.marca?.nombre_marca}
                                </span>
                            </div>

                            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[0.9] animate-in">
                                {producto.nombre}
                            </h1>

                            <div className="flex items-center gap-6 animate-in">
                                <p className="text-5xl font-black text-primary">
                                    ${Number(producto.precio_1).toLocaleString()}
                                </p>
                                <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-2xl font-black text-sm">
                                    <Check className="h-4 w-4" /> En Stock
                                </div>
                            </div>
                        </div>

                        <p className="text-muted-foreground leading-relaxed text-xl animate-in font-medium">
                            {producto.caracteristicas || 'Este producto representa la excelencia en nuestra curaduría de tecnología de alto standing.'}
                        </p>

                        <Separator className="animate-in h-1 bg-border/50 rounded-full" />

                        <div className="space-y-8 animate-in">
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2 bg-muted rounded-[2rem] p-3 border-2 border-border shadow-inner">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-12 w-12 rounded-2xl hover:bg-background shadow-md transition-all active:scale-90"
                                        onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                                    >
                                        <Minus className="h-5 w-5" />
                                    </Button>
                                    <span className="w-16 text-center text-2xl font-black">{cantidad}</span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-12 w-12 rounded-2xl hover:bg-background shadow-md transition-all active:scale-90"
                                        onClick={() => setCantidad(Math.min(producto.stock, cantidad + 1))}
                                    >
                                        <Plus className="h-5 w-5" />
                                    </Button>
                                </div>

                                <Button
                                    size="lg"
                                    className="flex-1 h-20 rounded-[2rem] text-xl font-black gap-4 shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all active:scale-95 group"
                                    onClick={handleAddToCart}
                                >
                                    <ShoppingCart className="h-7 w-7 transition-all group-hover:scale-110" />
                                    Lo quiero ahora
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[
                                    { icon: Truck, label: 'Envío Prioritario', sub: 'Llega en menos de 24h' },
                                    { icon: ShieldCheck, label: 'Garantía Total', sub: 'Certificado oficial Miracode' },
                                ].map((f, i) => (
                                    <div key={i} className="flex gap-5 p-6 rounded-[2rem] bg-muted/50 border-2 border-border/50 hover:bg-muted transition-colors">
                                        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
                                            <f.icon className="h-7 w-7" />
                                        </div>
                                        <div className="flex flex-col justify-center">
                                            <p className="font-black text-base">{f.label}</p>
                                            <p className="text-[11px] text-muted-foreground font-black uppercase tracking-tighter opacity-80">{f.sub}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Suggestions */}
                {sugerencias.length > 0 && (
                    <div className="mt-32 space-y-12">
                        <div className="flex items-center justify-between border-b-2 border-border/50 pb-8">
                            <h2 className="text-4xl font-black tracking-tight">Vistos recientemente</h2>
                            <Button variant="link" className="font-black text-primary text-xl" onClick={() => router.get('/tienda')}>Explorar más</Button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                            {sugerencias.map((s) => (
                                <ProductCard key={s.id} producto={s} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </PublicLayout>
    );
}
