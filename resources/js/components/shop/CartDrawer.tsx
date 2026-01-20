import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from '@/components/ui/sheet';
import { useCart } from '@/hooks/use-cart';
import { ShoppingCart, Trash2, Plus, Minus, PackageX } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { Separator } from '@/components/ui/separator';

interface CartDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
    const { items, removeFromCart, updateQuantity, subtotal, itemCount } = useCart();

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
                                <p className="text-xl font-bold">Tu carrito está vacío</p>
                                <p className="text-sm text-muted-foreground">
                                    ¡Explora nuestra tienda y encuentra algo increíble!
                                </p>
                            </div>
                            <Button onClick={() => onOpenChange(false)} asChild>
                                <Link href="/tienda">Ir a la tienda</Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="h-full overflow-y-auto pr-4 scrollbar-hide">
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
                                                    <h3 className="font-bold leading-tight line-clamp-1">{item.nombre}</h3>
                                                    <p className="font-black text-primary ml-2">
                                                        ${(item.precio * item.cantidad).toLocaleString()}
                                                    </p>
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Precio unitario: ${item.precio.toLocaleString()}
                                                </p>
                                            </div>

                                            <div className="flex items-center justify-between mt-2">
                                                <div className="flex items-center gap-1 bg-muted rounded-full p-1 border">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 rounded-full"
                                                        onClick={() => updateQuantity(item.id, item.cantidad - 1)}
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
                                                        onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                    </Button>
                                                </div>

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    onClick={() => removeFromCart(item.id)}
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
                                <span className="text-muted-foreground">Subtotal</span>
                                <span className="font-bold">${subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Envío</span>
                                <span className="font-medium text-green-600">Calculado en checkout</span>
                            </div>
                        </div>
                        <Separator />
                        <div className="flex justify-between text-xl font-black">
                            <span>Total</span>
                            <span className="text-primary">${subtotal.toLocaleString()}</span>
                        </div>
                        <SheetFooter className="mt-4 flex-col gap-2 sm:flex-col">
                            <Button size="lg" className="w-full text-lg font-bold" asChild onClick={() => onOpenChange(false)}>
                                <Link href="/checkout">Finalizar Pedido</Link>
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                className="w-full font-semibold"
                                onClick={() => onOpenChange(false)}
                            >
                                Continuar Comprando
                            </Button>
                        </SheetFooter>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}
