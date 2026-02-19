import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCart } from '@/hooks/use-cart';
import { cn } from '@/lib/utils';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Eye, Heart, ShoppingCart, Utensils } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { QuickView } from './QuickView';

interface ProductCardProps {
    producto: any;
}

export function ProductCard({ producto }: ProductCardProps) {
    const { addToCart, toggleWishlist, isInWishlist, formatPrice } = useCart();
    const { app_url } = usePage<SharedData & { app_url: string }>().props;
    const [quickViewOpen, setQuickViewOpen] = useState(false);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(producto);
        toast.success(`${producto.nombre} agregado al carrito`);
    };

    const handleWishlist = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(producto.id);
        const added = !isInWishlist(producto.id);
        toast(added ? 'Agregado a deseos' : 'Eliminado de deseos', {
            icon: (
                <Heart
                    className={cn(
                        'h-4 w-4',
                        added ? 'fill-red-500 text-red-500' : '',
                    )}
                />
            ),
        });
    };

    const handleQuickView = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setQuickViewOpen(true);
    };

    return (
        <>
            {/* Mobile: Vertical Grid Item | Desktop: Vertical */}
            <Card className="group relative flex h-full flex-col overflow-hidden rounded-2xl border-2 bg-card transition-all hover:border-primary/50 hover:shadow-xl">
                {/* Image Section */}
                <Link
                    href={`/tienda/${producto.id}`}
                    className="relative aspect-square w-full flex-shrink-0 overflow-hidden bg-muted"
                >
                    {producto.fotos?.[0] ? (
                        <img
                            src={`${app_url}/storage/${producto.fotos[0].url}`}
                            alt={producto.nombre}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center">
                            <ShoppingCart className="h-8 w-8 text-muted-foreground/20 md:h-12 md:w-12" />
                        </div>
                    )}

                    {/* Badge Stock */}
                    {producto.stock <= 5 && (
                        <div className="absolute top-2 left-2 z-20 rounded-full bg-red-500 px-2 py-0.5 text-[8px] font-black text-white uppercase shadow-lg md:text-[10px]">
                            {producto.stock} stock
                        </div>
                    )}

                    {/* Wishlist - Desktop only (top right) */}
                    <button
                        onClick={handleWishlist}
                        className="absolute top-4 right-4 z-20 hidden rounded-full bg-background/90 p-2.5 text-muted-foreground shadow-lg backdrop-blur-sm transition-all hover:bg-background hover:text-red-500 md:block"
                    >
                        <Heart
                            className={cn(
                                'h-5 w-5',
                                isInWishlist(producto.id)
                                    ? 'fill-red-500 text-red-500'
                                    : '',
                            )}
                        />
                    </button>
                </Link>

                {/* Content Section */}
                <div className="flex min-w-0 flex-1 flex-col p-3 md:p-5">
                    {/* Brand */}
                    <div className="mb-1.5 flex items-center justify-between gap-2 md:mb-2">
                        <p className="truncate text-[9px] font-black tracking-wider text-primary/70 uppercase md:text-xs">
                            {producto.marca?.nombre_marca || 'Miracode'}
                        </p>
                        {/* Wishlist - Mobile only */}
                        <button
                            onClick={handleWishlist}
                            className="flex-shrink-0 text-muted-foreground transition-colors hover:text-red-500 md:hidden"
                        >
                            <Heart
                                className={cn(
                                    'h-4 w-4',
                                    isInWishlist(producto.id)
                                        ? 'fill-red-500 text-red-500'
                                        : '',
                                )}
                            />
                        </button>
                    </div>

                    {/* Unified Layout for Grid */}
                    <div className="flex flex-1 flex-col justify-between gap-1">
                        <Link
                            href={`/tienda/${producto.id}`}
                            className="min-w-0"
                        >
                            <h3 className="line-clamp-2 min-h-[2.5em] text-xs leading-tight font-black transition-colors hover:text-primary md:text-lg">
                                {producto.nombre}
                            </h3>
                        </Link>

                        <div className="mt-2">
                            <div className="flex items-end justify-between gap-2 md:block">
                                <div>
                                    <p className="text-sm leading-none font-black text-primary md:text-2xl">
                                        {formatPrice(producto.precio_1)}
                                    </p>
                                </div>
                                <Button
                                    size="icon"
                                    className="h-10 w-10 flex-shrink-0 rounded-full bg-[var(--theme-primary)] md:hidden"
                                    onClick={handleAddToCart}
                                >
                                    <Utensils className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* Desktop Buttons */}
                            <div className="mt-4 hidden items-center gap-2 md:flex">
                                <Button
                                    size="sm"
                                    className="h-12 flex-1 gap-2 rounded-2xl bg-[var(--theme-primary)] text-sm font-black uppercase transition-transform hover:scale-105"
                                    onClick={handleAddToCart}
                                >
                                    <Utensils className="h-4 w-4" />
                                    <span>AGREGRAR AL PEDIDO</span>
                                </Button>
                                <Button
                                    variant="secondary"
                                    size="icon"
                                    className="h-12 w-12 flex-shrink-0 rounded-2xl border-2"
                                    onClick={handleQuickView}
                                >
                                    <Eye className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            <QuickView
                producto={producto}
                open={quickViewOpen}
                onOpenChange={setQuickViewOpen}
            />
        </>
    );
}
