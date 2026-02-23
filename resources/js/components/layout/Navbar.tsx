import { ColorThemeSelector } from '@/components/color-theme-selector';
import { CartDrawer } from '@/components/shop/CartDrawer';
import { Button } from '@/components/ui/button';
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useCart } from '@/hooks/use-cart';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { Menu, ShoppingCart, Utensils } from 'lucide-react';
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
                    'fixed top-0 z-50 w-full transition-all duration-500 ease-in-out',
                    scrolled
                        ? 'h-16 border-b border-border bg-background/60 shadow-[0_2px_20px_-10px_rgba(0,0,0,0.1)] backdrop-blur-xl'
                        : 'h-24 border-b border-transparent bg-transparent',
                )}
            >
                <div className="container mx-auto flex h-full items-center justify-between px-6">
                    {/* Brand / Logo - Left */}
                    <div className="flex-1">
                        <Link
                            href="/"
                            className="group flex w-fit items-center gap-3 transition-opacity hover:opacity-90"
                        >
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 transition-all duration-300 group-hover:scale-105 group-hover:bg-primary/20">
                                <Utensils className="h-6 w-6 text-primary" />
                            </div>
                            <div className="flex flex-col leading-none">
                                <span className="text-xl font-black tracking-tighter uppercase italic">
                                    Miracode
                                </span>
                                <span className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">
                                    Gourmet
                                </span>
                            </div>
                        </Link>
                    </div>

                    {/* Navigation Menu - Center */}
                    <div className="hidden flex-1 justify-center lg:flex">
                        <NavigationMenu>
                            <NavigationMenuList className="gap-2">
                                {[
                                    { name: 'Inicio', path: '/' },
                                    { name: 'La Carta', path: '/tienda' },
                                    {
                                        name: 'Mi Reserva',
                                        path: '/tienda/checkout',
                                    },
                                ].map((item) => (
                                    <NavigationMenuItem key={item.name}>
                                        <Link href={item.path}>
                                            <NavigationMenuLink
                                                className={cn(
                                                    navigationMenuTriggerStyle(),
                                                    'h-10 bg-transparent px-5 text-sm font-bold tracking-widest uppercase transition-all hover:bg-primary/5 hover:text-primary active:scale-95',
                                                )}
                                            >
                                                {item.name}
                                            </NavigationMenuLink>
                                        </Link>
                                    </NavigationMenuItem>
                                ))}
                            </NavigationMenuList>
                        </NavigationMenu>
                    </div>

                    {/* Actions - Right */}
                    <div className="flex flex-1 items-center justify-end gap-3">
                        <div className="flex items-center gap-1.5">
                            <ColorThemeSelector />

                            <Button
                                variant="ghost"
                                size="icon"
                                className="relative h-11 w-11 rounded-2xl transition-all hover:bg-primary/10 hover:text-primary"
                                onClick={() => setIsCartOpen(true)}
                            >
                                <ShoppingCart className="h-5 w-5" />
                                {itemCount > 0 && (
                                    <span className="absolute top-2 right-2 flex h-4 w-4 animate-in items-center justify-center rounded-full bg-primary text-[10px] font-black text-primary-foreground zoom-in">
                                        {itemCount}
                                    </span>
                                )}
                            </Button>

                            <div className="mx-3 hidden h-6 w-px bg-border/60 lg:block" />

                            <div className="hidden items-center gap-3 lg:flex">
                                <Button
                                    asChild
                                    className="h-11 rounded-2xl bg-primary px-8 text-xs font-black tracking-widest uppercase shadow-lg shadow-primary/20 transition-all hover:scale-105 hover:bg-primary/90 active:scale-95"
                                >
                                    <Link
                                        href={
                                            auth.user ? '/dashboard' : '/login'
                                        }
                                    >
                                        {auth.user ? 'Sistema' : 'Ingresar'}
                                    </Link>
                                </Button>
                            </div>

                            {/* Mobile Toggle */}
                            <div className="lg:hidden">
                                <Sheet>
                                    <SheetTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-11 w-11 rounded-2xl"
                                        >
                                            <Menu className="h-6 w-6" />
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent
                                        side="right"
                                        className="flex w-[300px] flex-col border-l-0 p-8 shadow-2xl"
                                    >
                                        <div className="mb-12 flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                                                <Utensils className="h-5 w-5 text-primary" />
                                            </div>
                                            <span className="text-2xl font-black tracking-tighter uppercase italic">
                                                Miracode
                                            </span>
                                        </div>
                                        <nav className="flex flex-col gap-2">
                                            {[
                                                { name: 'Inicio', path: '/' },
                                                {
                                                    name: 'La Carta',
                                                    path: '/tienda',
                                                },
                                                {
                                                    name: 'Mi reserva',
                                                    path: '/tienda/checkout',
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
                                                    className="group flex flex-col gap-1 py-4"
                                                >
                                                    <span className="text-xl font-black tracking-tight uppercase transition-colors group-hover:text-primary">
                                                        {item.name}
                                                    </span>
                                                    <div className="h-1 w-0 bg-primary/20 transition-all group-hover:w-full" />
                                                </Link>
                                            ))}
                                        </nav>
                                        <div className="mt-auto border-t pt-8 text-center">
                                            <p className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">
                                                Restaurante Miracode
                                            </p>
                                        </div>
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
