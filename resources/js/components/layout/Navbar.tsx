import { useState, useEffect, useRef } from 'react';
import { Link, router } from '@inertiajs/react';
import { Search, ShoppingCart, Menu, User, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import gsap from 'gsap';
import { useCart } from '@/hooks/use-cart';
import { CartDrawer } from '@/components/shop/CartDrawer';
import { SearchInput } from '@/components/ui/SearchInput';
import { ColorThemeSelector } from '@/components/color-theme-selector';

export function Navbar({ auth }: { auth: any }) {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);

    const { itemCount } = useCart();
    const navRef = useRef<HTMLElement>(null);
    const themeBtnRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const theme = localStorage.getItem('theme');
        if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
            setIsDark(true);
        }

        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleTheme = () => {
        const root = document.documentElement;
        const newTheme = root.classList.toggle('dark') ? 'dark' : 'light';
        localStorage.setItem('theme', newTheme);
        setIsDark(newTheme === 'dark');

        gsap.fromTo(themeBtnRef.current,
            { rotate: 0, scale: 0.8 },
            { rotate: 360, scale: 1, duration: 0.4, ease: "back.out" }
        );
    };

    return (
        <>
            <nav
                ref={navRef}
                className={cn(
                    "fixed top-0 z-50 w-full border-b p-2 transition-all duration-300 backdrop-blur-md",
                    scrolled ? "bg-background/80 border-border shadow-sm h-16" : "bg-background border-transparent h-20"
                )}
            >
                <div className="container mx-auto h-full flex items-center justify-between gap-4">

                    {/* Logo */}
                    <div className="flex items-center gap-10">
                        <Link href="/" className="flex items-center space-x-2 group">
                            <div className="bg-transparent h-10 w-10 flex items-center justify-center transition-transform group-hover:scale-110">
                                <img src="/favicon.ico" className="h-10 w-10 object-contain" alt="Logo" />
                            </div>
                            <span className="hidden font-black text-2xl tracking-tighter sm:inline-block uppercase">Miracode</span>
                        </Link>

                        {/* Links con Texto XL */}
                        <div className="hidden lg:flex items-center gap-8">
                            {[
                                { name: 'Inicio', path: '/' },
                                { name: 'Tienda', path: '/tienda' },
                                { name: 'Pedidos', path: '/pedido' },
                                { name: 'Verificar pedido', path: '/qr' }
                            ].map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.path}
                                    className="text-xl font-bold text-muted-foreground hover:text-primary transition-colors relative group"
                                >
                                    {item.name}
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Derecha: Buscador y Acciones */}
                    <div className="flex items-center justify-end flex-1 gap-2">

                        {/* Buscador */}
                        <div className="relative flex items-center justify-end flex-1 max-w-sm">
                            <div className={cn(
                                "absolute right-0 z-20 overflow-visible md:relative md:w-full md:opacity-100 md:block transition-all",
                                isSearchOpen ? "flex w-full bg-background md:bg-transparent" : "hidden md:flex"
                            )}>
                                <SearchInput
                                    onClose={() => setIsSearchOpen(false)}
                                    autoFocus={isSearchOpen}
                                    className={cn(
                                        "w-full",
                                        isSearchOpen ? "min-w-[200px]" : ""
                                    )}
                                />
                            </div>

                            {!isSearchOpen && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="md:hidden"
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
                                    <span className="absolute top-1 right-1 h-5 w-5 text-xs font-bold flex items-center justify-center bg-primary text-primary-foreground rounded-full animate-in zoom-in">
                                        {itemCount}
                                    </span>
                                )}
                            </Button>

                            <div className="hidden sm:block w-[1px] h-8 bg-border mx-2" />

                            <Button variant="ghost" size="icon" className="hidden sm:flex h-11 w-11">
                                <User className="h-6 w-6" />
                            </Button>

                            {/* Mobile Menu */}
                            <div className="lg:hidden">
                                <Sheet>
                                    <SheetTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-11 w-11"><Menu className="h-7 w-7" /></Button>
                                    </SheetTrigger>
                                    <SheetContent>
                                        <nav className="flex flex-col gap-6 mt-12">
                                            {[
                                                { name: 'Inicio', path: '/' },
                                                { name: 'Tienda', path: '/tienda' },
                                                { name: 'Pedidos', path: '/pedido' },
                                                { name: 'Verificar pedido', path: '/qr' }
                                            ].map(item => (
                                                <Link key={item.name} href={item.path} className="text-2xl font-black border-b pb-2">{item.name}</Link>
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
