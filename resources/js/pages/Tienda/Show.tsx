import { ProductCard } from '@/components/shop/ProductCard';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import PublicLayout from '@/layouts/public-layout';
import { type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import gsap from 'gsap';
import {
    ChevronLeft,
    Minus,
    Plus,
    ShieldCheck,
    ShoppingCart,
    Truck,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface Props {
    producto: any;
    sugerencias: any[];
}

export default function Show({ producto, sugerencias }: Props) {
    const { addToCart, formatPrice } = useCart();
    const { app_url } = usePage<SharedData & { app_url: string }>().props;
    const [cantidad, setCantidad] = useState(1);
    const [activeImg, setActiveImg] = useState(0);

    const contentRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from('.animate-in', {
                x: 40,
                opacity: 0,
                stagger: 0.1,
                duration: 0.8,
                ease: 'power3.out',
            });
            gsap.from(imageRef.current, {
                scale: 0.9,
                opacity: 0,
                duration: 1,
                ease: 'expo.out',
            });
        }, contentRef);
        return () => ctx.revert();
    }, [producto.id]);

    const handleAddToCart = () => {
        addToCart(producto, cantidad);
        toast.success(`${producto.nombre} agregado`, {
            description: `${cantidad} unidad(es) añadidas al carrito.`,
        });
    };

    const images =
        producto.fotos?.length > 0
            ? producto.fotos.map((f: any) => `${app_url}/storage/${f.url}`)
            : ['/images/placeholder.png'];

    return (
        <PublicLayout>
            <Head title={`${producto.nombre} | Miracode Shop`} />

            <div
                className="container mx-auto px-4 py-8"
                ref={contentRef}
            >
                {/* Back Button */}
                <Button
                    variant="ghost"
                    className="group mb-8 gap-2 p-0 text-sm leading-none font-black tracking-widest uppercase transition-all hover:bg-transparent hover:text-[var(--theme-primary)] md:text-lg"
                    onClick={() => window.history.back()}
                >
                    <ChevronLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
                    Regresar
                </Button>

                <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-20">
                    {/* Gallery - Circular Style for Restaurant feel */}
                    <div className="space-y-6 lg:col-span-6">
                        <div
                            ref={imageRef}
                            className="relative aspect-square overflow-hidden rounded-[3rem] border-8 border-white bg-white shadow-2xl md:rounded-[5rem] dark:border-border/50 dark:bg-card"
                        >
                            <img
                                src={images[activeImg]}
                                alt={producto.nombre}
                                className="h-full w-full object-cover transition-transform duration-700 hover:scale-110"
                            />
                        </div>

                        {images.length > 1 && (
                            <div className="scrollbar-hide flex justify-center gap-3 overflow-x-auto py-4">
                                {images.map((img: string, i: number) => (
                                    <button
                                        key={i}
                                        className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-full border-4 transition-all md:h-24 md:w-24 ${
                                            activeImg === i
                                                ? 'scale-110 border-[var(--theme-primary)] shadow-lg'
                                                : 'border-white opacity-60 hover:opacity-100 dark:border-border/50'
                                        }`}
                                        onClick={() => setActiveImg(i)}
                                    >
                                        <img
                                            src={img}
                                            alt=""
                                            className="h-full w-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="space-y-8 md:space-y-12 lg:col-span-6">
                        <div className="space-y-4 md:space-y-6">
                            <div className="flex animate-in items-center gap-3">
                                <span className="text-[10px] font-black tracking-[0.3em] text-[var(--theme-primary)] uppercase md:text-xs">
                                    {producto.categoria?.nombre_cat}
                                </span>
                            </div>

                            <h1 className="animate-in text-4xl leading-none font-black tracking-tighter uppercase italic md:text-4xl lg:text-5xl">
                                {producto.nombre}
                            </h1>

                            <div className="flex animate-in items-center gap-6">
                                <p className="text-2xl font-black text-[var(--theme-primary)] italic md:text-4xl">
                                    {formatPrice(producto.precio_1)}
                                </p>
                            </div>
                        </div>

                        <p className="max-w-xl animate-in text-lg leading-relaxed font-medium text-muted-foreground md:text-2xl">
                            {producto.caracteristicas ||
                                'Una explosión de sabores cuidadosamente seleccionados para brindarte una experiencia gastronómica inigualable.'}
                        </p>

                        <div className="animate-in space-y-8">
                            <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
                                <div className="flex items-center justify-between gap-4 rounded-full border-2 border-border bg-muted/50 p-2 shadow-inner">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-12 w-12 rounded-full shadow-sm transition-all hover:bg-white active:scale-90 dark:hover:bg-card"
                                        onClick={() =>
                                            setCantidad(
                                                Math.max(1, cantidad - 1),
                                            )
                                        }
                                    >
                                        <Minus className="h-5 w-5" />
                                    </Button>
                                    <span className="w-12 text-center text-xl font-black">
                                        {cantidad}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-12 w-12 rounded-full shadow-sm transition-all hover:bg-white active:scale-90 dark:hover:bg-card"
                                        onClick={() =>
                                            setCantidad(
                                                Math.min(
                                                    producto.stock,
                                                    cantidad + 1,
                                                ),
                                            )
                                        }
                                    >
                                        <Plus className="h-5 w-5" />
                                    </Button>
                                </div>

                                <Button
                                    size="lg"
                                    className="group h-16 flex-1 gap-4 rounded-full bg-[var(--theme-primary)] text-lg font-black tracking-widest uppercase shadow-[var(--theme-primary)]/20 shadow-2xl transition-all hover:scale-[1.02] md:h-20 md:text-xl"
                                    onClick={handleAddToCart}
                                >
                                    <ShoppingCart className="h-6 w-6 transition-all group-hover:rotate-12" />
                                    Añadir al Pedido
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {[
                                    {
                                        icon: Truck,
                                        label: 'Envios por delivery',
                                        sub: 'Servicio prioritario',
                                    },
                                    {
                                        icon: ShieldCheck,
                                        label: 'Calidad',
                                        sub: 'Ingredientes seleccionados',
                                    },
                                ].map((f, i) => (
                                    <div
                                        key={i}
                                        className="group flex items-center gap-4 rounded-[2rem] border-2 border-border/50 bg-card p-5 transition-all hover:border-[var(--theme-primary)]"
                                    >
                                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] transition-transform group-hover:scale-110">
                                            <f.icon className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black tracking-tight uppercase">
                                                {f.label}
                                            </p>
                                            <p className="text-[10px] font-bold tracking-tighter text-muted-foreground uppercase opacity-70">
                                                {f.sub}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Suggestions */}
                {sugerencias.length > 0 && (
                    <div className="mt-32 space-y-16">
                        <div className="space-y-4 text-center">
                            <span className="text-xs font-black tracking-[0.4em] text-[var(--theme-primary)] uppercase">
                                Continuar explorando
                            </span>
                            <h2 className="text-4xl font-black tracking-tighter uppercase italic md:text-6xl">
                                Sugerencias de platos
                            </h2>
                            <div className="mx-auto h-1.5 w-24 rounded-full bg-[var(--theme-primary)]" />
                        </div>

                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:gap-8 lg:grid-cols-4">
                            {sugerencias.slice(0, 4).map((s) => (
                                <ProductCard key={s.id} producto={s} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </PublicLayout>
    );
}
