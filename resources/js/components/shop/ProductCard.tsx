import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCart } from '@/hooks/use-cart';
import { cn } from '@/lib/utils';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Heart, ShoppingCart, Utensils } from 'lucide-react';
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

            <Card className="restaurant-card group">
                {/* Image Section - Circular */}
                <Link
                    href={`/tienda/${producto.id}`}
                    className="circular-image-wrapper block"
                >
                    {producto.fotos?.[0] ? (
                        <img
                            src={`${app_url}/storage/${producto.fotos[0].url}`}
                            alt={producto.nombre}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-muted">
                            <Utensils className="h-10 w-10 text-muted-foreground/20" />
                        </div>
                    )}

                    {/* Stock Badge - Small & Circular */}
                    {producto.stock <= 5 && (
                        <div className="absolute top-2 right-2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-[8px] font-black text-white uppercase shadow-lg">
                            {producto.stock}
                        </div>
                    )}

                    {/* Hover Overlay with Action */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                            size="icon"
                            className="h-12 w-12 scale-0 rounded-full bg-white text-black transition-transform duration-300 group-hover:scale-100 hover:bg-[var(--theme-primary)] hover:text-white"
                            onClick={handleAddToCart}
                        >
                            <ShoppingCart className="h-5 w-5" />
                        </Button>
                    </div>
                </Link>

                {/* Content Section */}
                <div className="mt-2">
                    <Link href={`/tienda/${producto.id}`}>
                        <h3 className="md:text-md line-clamp-2 px-2 text-sm">
                            {producto.nombre}
                        </h3>
                    </Link>
                    <p className="price-tag">
                        {formatPrice(producto.precio_1)}
                    </p>
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
