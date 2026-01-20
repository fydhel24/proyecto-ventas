import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ShoppingCart, Eye } from 'lucide-react';
import { Link, usePage } from '@inertiajs/react';
import { useCart } from '@/hooks/use-cart';
import { toast } from 'sonner';
import { type SharedData } from '@/types';

interface ProductCardProps {
    producto: any;
}

export function ProductCard({ producto }: ProductCardProps) {
    const { addToCart } = useCart();
    const { app_url } = usePage<SharedData & { app_url: string }>().props;

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(producto);
        toast.success(`${producto.nombre} agregado al carrito`, {
            description: 'Puedes ver tu pedido en el icono del carrito.',
        });
    };

    return (
        <Card className="group relative overflow-hidden rounded-2xl border bg-card transition-all hover:shadow-2xl hover:border-primary/50">
            <Link href={`/tienda/${producto.id}`}>
                <div className="relative aspect-[4/5] overflow-hidden">
                    {producto.fotos?.[0] ? (
                        <img
                            src={`${app_url}/storage/${producto.fotos[0].url}`}
                            alt={producto.nombre}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-muted">
                            <ShoppingCart className="h-12 w-12 text-muted-foreground/20" />
                        </div>
                    )}

                    {/* Overlay Actions */}
                    <div className="absolute inset-0 z-10 hidden items-center justify-center gap-3 bg-black/40 opacity-0 transition-opacity group-hover:flex group-hover:opacity-100">
                        <Button size="icon" variant="secondary" className="rounded-full h-12 w-12 shadow-xl hover:scale-110 transition-transform">
                            <Eye className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Badge Stock */}
                    {producto.stock <= 5 && (
                        <div className="absolute top-4 left-4 z-20 rounded-full bg-red-500 px-3 py-1 text-[10px] font-black uppercase text-white shadow-lg">
                            Últimas {producto.stock} unidades
                        </div>
                    )}
                </div>
            </Link>

            <CardContent className="p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 mb-1">
                    {producto.marca?.nombre_marca || 'Sin Marca'}
                </p>
                <Link href={`/tienda/${producto.id}`}>
                    <h3 className="font-black text-lg leading-tight transition-colors hover:text-primary line-clamp-1 mb-2">
                        {producto.nombre}
                    </h3>
                </Link>
                <div className="flex items-end justify-between">
                    <div className="space-y-0.5">
                        <p className="text-2xl font-black text-primary">${Number(producto.precio_1).toLocaleString()}</p>
                    </div>
                    <span className="text-[10px] font-bold uppercase text-muted-foreground">IVA Incluido</span>
                </div>
            </CardContent>

            <CardFooter className="px-5 pb-5 pt-0">
                <Button
                    className="w-full gap-2 rounded-xl h-11 font-bold group"
                    onClick={handleAddToCart}
                >
                    <ShoppingCart className="h-4 w-4 transition-transform group-hover:scale-110" />
                    Agregar
                </Button>
            </CardFooter>
        </Card>
    );
}
