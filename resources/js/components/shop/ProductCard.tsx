import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ShoppingCart, Eye, Heart } from 'lucide-react';
import { Link, usePage } from '@inertiajs/react';
import { useCart } from '@/hooks/use-cart';
import { toast } from 'sonner';
import { type SharedData } from '@/types';
import { cn } from '@/lib/utils';
import { QuickView } from './QuickView';
import { useState } from 'react';

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
            icon: <Heart className={cn("h-4 w-4", added ? "fill-red-500 text-red-500" : "")} />,
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
            <Card className="group relative overflow-hidden rounded-2xl border-2 bg-card transition-all hover:shadow-xl hover:border-primary/50 flex flex-col h-full">
                {/* Image Section */}
                <Link
                    href={`/tienda/${producto.id}`}
                    className="w-full aspect-square relative overflow-hidden bg-muted flex-shrink-0"
                >
                    {producto.fotos?.[0] ? (
                        <img
                            src={`${app_url}/storage/${producto.fotos[0].url}`}
                            alt={producto.nombre}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center">
                            <ShoppingCart className="h-8 w-8 md:h-12 md:w-12 text-muted-foreground/20" />
                        </div>
                    )}

                    {/* Badge Stock */}
                    {producto.stock <= 5 && (
                        <div className="absolute top-2 left-2 z-20 rounded-full bg-red-500 px-2 py-0.5 text-[8px] md:text-[10px] font-black uppercase text-white shadow-lg">
                            {producto.stock} stock
                        </div>
                    )}

                    {/* Wishlist - Desktop only (top right) */}
                    <button
                        onClick={handleWishlist}
                        className="hidden md:block absolute top-4 right-4 z-20 bg-background/90 backdrop-blur-sm p-2.5 rounded-full text-muted-foreground hover:text-red-500 hover:bg-background transition-all shadow-lg"
                    >
                        <Heart className={cn("h-5 w-5", isInWishlist(producto.id) ? "fill-red-500 text-red-500" : "")} />
                    </button>
                </Link>

                {/* Content Section */}
                <div className="flex-1 flex flex-col p-3 md:p-5 min-w-0">
                    {/* Brand */}
                    <div className="flex justify-between items-center gap-2 mb-1.5 md:mb-2">
                        <p className="text-[9px] md:text-xs font-black uppercase tracking-wider text-primary/70 truncate">
                            {producto.marca?.nombre_marca || 'Miracode'}
                        </p>
                        {/* Wishlist - Mobile only */}
                        <button
                            onClick={handleWishlist}
                            className="md:hidden text-muted-foreground hover:text-red-500 transition-colors flex-shrink-0"
                        >
                            <Heart className={cn("h-4 w-4", isInWishlist(producto.id) ? "fill-red-500 text-red-500" : "")} />
                        </button>
                    </div>

                    {/* Unified Layout for Grid */}
                    <div className="flex flex-1 flex-col justify-between gap-1">
                        <Link href={`/tienda/${producto.id}`} className="min-w-0">
                            <h3 className="font-black text-xs md:text-lg leading-tight transition-colors hover:text-primary line-clamp-2 min-h-[2.5em]">
                                {producto.nombre}
                            </h3>
                        </Link>

                        <div className="mt-2">
                            <div className="flex items-end justify-between gap-2 md:block">
                                <div>
                                    <p className="text-sm md:text-2xl font-black text-primary leading-none">
                                        {formatPrice(producto.precio_1)}
                                    </p>
                                    <span className="text-[8px] md:text-[10px] font-bold uppercase text-muted-foreground hidden md:block mt-1">IVA Incluido</span>
                                </div>
                                <Button
                                    size="icon"
                                    className="md:hidden h-8 w-8 rounded-lg flex-shrink-0"
                                    onClick={handleAddToCart}
                                >
                                    <ShoppingCart className="h-3.5 w-3.5" />
                                </Button>
                            </div>

                            {/* Desktop Buttons */}
                            <div className="hidden md:flex items-center gap-2 mt-3">
                                <Button
                                    size="sm"
                                    className="flex-1 gap-2 rounded-xl h-11 font-black text-sm uppercase"
                                    onClick={handleAddToCart}
                                >
                                    <ShoppingCart className="h-4 w-4" />
                                    <span>Agregar</span>
                                </Button>
                                <Button
                                    variant="secondary"
                                    size="icon"
                                    className="rounded-xl h-11 w-11 flex-shrink-0"
                                    onClick={handleQuickView}
                                >
                                    <Eye className="h-4 w-4" />
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
