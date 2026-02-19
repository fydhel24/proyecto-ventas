import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
    Sheet,
    SheetContent,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { useCart } from '@/hooks/use-cart';
import { Link, router } from '@inertiajs/react';
import { Minus, PackageX, Plus, ShoppingCart, Trash2 } from 'lucide-react';

interface CartDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
    const {
        items,
        removeFromCart,
        updateQuantity,
        subtotal,
        itemCount,
        formatPrice,
    } = useCart();

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="flex w-full flex-col sm:max-w-md">
                <SheetHeader className="px-1">
                    <SheetTitle className="flex items-center gap-2 text-2xl font-bold">
                        <ShoppingCart className="h-6 w-6" />
                        Tu Carrito ({itemCount})
                    </SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-hidden py-6">
                    {items.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                            <div className="rounded-full bg-muted p-6">
                                <PackageX className="h-12 w-12 text-muted-foreground" />
                            </div>
                            <div>
                                <p className="text-xl font-bold">
                                    Tu carrito está vacío
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    ¡Explora nuestra tienda y encuentra algo
                                    increíble!
                                </p>
                            </div>
                            <Button onClick={() => onOpenChange(false)} asChild>
                                <Link href="/tienda">Ir a la tienda</Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="scrollbar-hide h-full overflow-y-auto pr-4">
                            <div className="space-y-5">
                                {items.map((item) => (
                                    <div key={item.id} className="flex gap-4">
                                        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border bg-muted">
                                            {item.foto ? (
                                                <img
                                                    src={`/storage/${item.foto}`}
                                                    alt={item.nombre}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center">
                                                    <ShoppingCart className="h-8 w-8 text-muted-foreground/20" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-1 flex-col justify-between py-0.5">
                                            <div>
                                                <div className="flex justify-between">
                                                    <h3 className="line-clamp-1 leading-tight font-bold">
                                                        {item.nombre}
                                                    </h3>
                                                    <p className="ml-2 font-black text-primary">
                                                        {formatPrice(
                                                            item.precio *
                                                                item.cantidad,
                                                        )}
                                                    </p>
                                                </div>
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    Precio unitario:{' '}
                                                    {formatPrice(item.precio)}
                                                </p>
                                            </div>

                                            <div className="mt-2 flex items-center justify-between">
                                                <div className="flex items-center gap-1 rounded-full border bg-muted p-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 rounded-full"
                                                        onClick={() =>
                                                            updateQuantity(
                                                                item.id,
                                                                item.cantidad -
                                                                    1,
                                                            )
                                                        }
                                                    >
                                                        <Minus className="h-3 w-3" />
                                                    </Button>
                                                    <span className="w-8 text-center text-sm font-bold">
                                                        {item.cantidad}
                                                    </span>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 rounded-full"
                                                        onClick={() =>
                                                            updateQuantity(
                                                                item.id,
                                                                item.cantidad +
                                                                    1,
                                                            )
                                                        }
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                    </Button>
                                                </div>

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                    onClick={() =>
                                                        removeFromCart(item.id)
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {items.length > 0 && (
                    <div className="space-y-4 pt-6">
                        <Separator />
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-base font-medium">
                                <span className="text-muted-foreground">
                                    Subtotal
                                </span>
                                <span className="font-bold">
                                    {formatPrice(subtotal)}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">
                                    Envío
                                </span>
                                <span className="font-medium text-green-600">
                                    Calculado en checkout
                                </span>
                            </div>
                        </div>
                        <Separator />
                        <div className="flex justify-between text-xl font-black">
                            <span>Total</span>
                            <span className="text-primary">
                                {formatPrice(subtotal)}
                            </span>
                        </div>
                        <SheetFooter className="mt-4 flex flex-col gap-2 sm:flex-col">
                            <Button
                                size="lg"
                                className="h-16 w-full rounded-2xl bg-[var(--theme-primary)] text-lg font-black shadow-xl transition-transform hover:scale-[1.02]"
                                onClick={() => {
                                    onOpenChange(false);
                                    router.visit('/tienda/checkout');
                                }}
                            >
                                FINALIZAR PEDIDO
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                className="h-16 w-full rounded-2xl border-2 font-black"
                                onClick={() => onOpenChange(false)}
                            >
                                CONTINUAR COMPRANDO
                            </Button>
                        </SheetFooter>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}
