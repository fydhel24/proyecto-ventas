import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Heart, X } from 'lucide-react';
import { usePage } from '@inertiajs/react';
import { useCart } from '@/hooks/use-cart';
import { toast } from 'sonner';
import { type SharedData } from '@/types';
import { cn } from '@/lib/utils';

interface QuickViewProps {
    producto: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function QuickView({ producto, open, onOpenChange }: QuickViewProps) {
    const { addToCart, toggleWishlist, isInWishlist, formatPrice } = useCart();
    const { app_url } = usePage<SharedData & { app_url: string }>().props;

    const handleAddToCart = () => {
        addToCart(producto);
        toast.success(`${producto.nombre} agregado al carrito`);
        onOpenChange(false);
    };

    const handleWishlist = () => {
        toggleWishlist(producto.id);
        const added = !isInWishlist(producto.id);
        toast(added ? 'Agregado a deseos' : 'Eliminado de deseos', {
            icon: <Heart className={cn("h-4 w-4", added ? "fill-red-500 text-red-500" : "")} />,
        });
    };

    if (!producto) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2rem] border-4 p-0">
                <div className="grid md:grid-cols-2 gap-0">
                    {/* Image Section */}
                    <div className="relative aspect-square bg-muted overflow-hidden">
                        {producto.fotos?.[0] ? (
                            <img
                                src={`${app_url}/storage/${producto.fotos[0].url}`}
                                alt={producto.nombre}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center">
                                <ShoppingCart className="h-20 w-20 text-muted-foreground/20" />
                            </div>
                        )}

                        {/* Stock Badge */}
                        {producto.stock <= 5 && (
                            <div className="absolute top-4 left-4 rounded-full bg-red-500 px-3 py-1 text-xs font-black uppercase text-white shadow-lg">
                                {producto.stock} en stock
                            </div>
                        )}
                    </div>

                    {/* Content Section */}
                    <div className="flex flex-col p-8 gap-6">
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-primary/70 mb-2">
                                {producto.marca?.nombre_marca || 'Miracode'}
                            </p>
                            <DialogTitle className="text-3xl font-black leading-tight mb-4">
                                {producto.nombre}
                            </DialogTitle>

                            {producto.caracteristicas && (
                                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
                                    {producto.caracteristicas}
                                </p>
                            )}
                        </div>

                        <div className="flex items-baseline gap-3 py-4 border-y">
                            <span className="text-4xl font-black text-primary">
                                {formatPrice(producto.precio_1)}
                            </span>
                            <span className="text-xs text-muted-foreground font-bold uppercase">IVA Incluido</span>
                        </div>

                        <div className="flex flex-col gap-3 mt-auto">
                            <Button
                                size="lg"
                                className="w-full gap-3 rounded-2xl h-14 font-black text-base"
                                onClick={handleAddToCart}
                            >
                                <ShoppingCart className="h-5 w-5" />
                                Agregar al Carrito
                            </Button>

                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="gap-2 rounded-2xl h-12 font-black border-2"
                                    onClick={handleWishlist}
                                >
                                    <Heart className={cn("h-4 w-4", isInWishlist(producto.id) ? "fill-red-500 text-red-500" : "")} />
                                    Deseos
                                </Button>
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="gap-2 rounded-2xl h-12 font-black border-2"
                                    asChild
                                >
                                    <a href={`/tienda/${producto.id}`}>
                                        Ver Detalles
                                    </a>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
