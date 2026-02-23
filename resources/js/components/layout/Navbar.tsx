import { ColorThemeSelector } from '@/components/color-theme-selector';
import { CartDrawer } from '@/components/shop/CartDrawer';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/SearchInput';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useCart } from '@/hooks/use-cart';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { Menu, Search, ShoppingCart, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export function Navbar({ auth }: { auth: { user?: any } }) {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);

    const { itemCount } = useCart();
    const navRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            <nav
                ref={navRef}
                className={cn(
                    'fixed top-0 z-50 w-full border-b p-2 backdrop-blur-md transition-all duration-300',
                    scrolled
                        ? 'h-16 border-border bg-background/80 shadow-sm'
                        : 'h-20 border-transparent bg-background',
                )}
            >
                <div className="container mx-auto flex h-full items-center justify-between gap-4">
                    {/* Logo */}
                    <div className="flex items-center gap-10">
                        <Link
                            href="/"
                            className="group flex items-center space-x-2"
                        >
                            <div className="flex h-10 w-10 items-center justify-center bg-transparent transition-transform group-hover:scale-110">
                                <img
                                    src="/favicon.ico"
                                    className="h-10 w-10 object-contain"
                                    alt="Logo"
                                />
                            </div>
                            <span className="hidden text-2xl font-black tracking-tighter uppercase sm:inline-block">
                                Restaurant Miracode
                            </span>
                        </Link>

                        {/* Links con Texto XL */}
                        <div className="hidden items-center gap-8 lg:flex">
                            {[
                                { name: 'Inicio', path: '/' },
                                { name: 'La Carta', path: '/tienda' },
                                { name: 'Mi Reserva', path: '/tienda/checkout' },
                            ].map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.path}
                                    className="group relative text-xl font-bold text-muted-foreground transition-colors hover:text-primary"
                                >
                                    {item.name}
                                    <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-primary transition-all group-hover:w-full" />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Derecha: Buscador y Acciones */}
                    <div className="flex flex-1 items-center justify-end gap-2">
                        {/* Buscador */}
                        <div className="flex flex-1 items-center justify-end md:flex-initial">
                            <div
                                className={cn(
                                    'w-full transition-all md:w-auto',
                                    isSearchOpen
                                        ? 'fixed top-20 right-0 left-0 z-[60] md:relative md:top-auto md:max-w-sm'
                                        : 'hidden md:block md:max-w-sm',
                                )}
                            >
                                <div
                                    className={cn(
                                        'w-full px-2 md:p-0',
                                        isSearchOpen &&
                                            'rounded-b-xl bg-background/95 p-2 backdrop-blur-sm md:bg-transparent',
                                    )}
                                >
                                    <SearchInput
                                        onClose={() => setIsSearchOpen(false)}
                                        autoFocus={isSearchOpen}
                                        className="w-full"
                                    />
                                </div>
                            </div>

                            {!isSearchOpen && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-11 w-11 md:hidden"
                                    onClick={() => setIsSearchOpen(true)}
                                >
                                    <Search className="h-6 w-6" />
                                </Button>
                            )}
                        </div>

                        <div className="flex items-center gap-1">
                            <ColorThemeSelector />

                            <Button
                                variant="ghost"
                                size="icon"
                                className="relative h-11 w-11"
                                onClick={() => setIsCartOpen(true)}
                            >
                                <ShoppingCart className="h-6 w-6" />
                                {itemCount > 0 && (
                                    <span className="absolute top-1 right-1 flex h-5 w-5 animate-in items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground zoom-in">
                                        {itemCount}
                                    </span>
                                )}
                            </Button>

                            <div className="mx-2 hidden h-8 w-[1px] bg-border sm:block" />

                            <div className="hidden items-center gap-2 sm:flex">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-11 w-11"
                                >
                                    <User className="h-6 w-6" />
                                </Button>
                                <Button
                                    asChild
                                    className="h-10 rounded-xl px-6 font-bold"
                                >
                                    <Link
                                        href={
                                            auth.user ? '/dashboard' : '/login'
                                        }
                                    >
                                        {auth.user
                                            ? 'Sistema'
                                            : 'Iniciar sesión'}
                                    </Link>
                                </Button>
                            </div>

                            {/* Mobile Menu */}
                            <div className="lg:hidden">
                                <Sheet>
                                    <SheetTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-11 w-11"
                                        >
                                            <Menu className="h-7 w-7" />
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent>
                                        <nav className="mt-12 flex flex-col gap-6">
                                            {[
                                                { name: 'Inicio', path: '/' },
                                                {
                                                    name: 'Tienda',
                                                    path: '/tienda',
                                                },
                                                {
                                                    name: 'Pedidos',
                                                    path: '/pedido',
                                                },
                                                {
                                                    name: 'Verificar pedido',
                                                    path: '/qr',
                                                },
                                                {
                                                    name: auth.user
                                                        ? 'Dashboard'
                                                        : 'Iniciar sesión',
                                                    path: auth.user
                                                        ? '/dashboard'
                                                        : '/login',
                                                },
                                            ].map((item) => (
                                                <Link
                                                    key={item.name}
                                                    href={item.path}
                                                    className="border-b pb-2 text-2xl font-black"
                                                >
                                                    {item.name}
                                                </Link>
                                            ))}
                                        </nav>
                                    </SheetContent>
                                </Sheet>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <CartDrawer open={isCartOpen} onOpenChange={setIsCartOpen} />
        </>
    );
}
