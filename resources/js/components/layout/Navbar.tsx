import { useState, useEffect, useRef } from 'react';
import { Link, router } from '@inertiajs/react';
import { Search, ShoppingCart, Menu, User, X, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import gsap from 'gsap';
import { useCart } from '@/hooks/use-cart';
import { CartDrawer } from '@/components/shop/CartDrawer';

export function Navbar({ auth }: { auth: any }) {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const { itemCount } = useCart();

    const navRef = useRef<HTMLElement>(null);
    const searchContainerRef = useRef<HTMLFormElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
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

    // Debounce search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchQuery) {
                router.get('/tienda', { search: searchQuery }, { preserveState: true, preserveScroll: true, replace: true });
            } else if (window.location.pathname.includes('/tienda') && searchQuery === '') {
                // Clean search if empty and we are in shop
                router.get('/tienda', {}, { preserveState: true, preserveScroll: true, replace: true });
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // Prevent default submission as useEffect handles it, 
        // but keep this if user hits enter to close mobile keyboard if needed
    };

    // Animación del buscador expansible en móvil con GSAP
    useEffect(() => {
        if (window.innerWidth < 768) {
            if (isSearchOpen) {
                gsap.fromTo(searchContainerRef.current,
                    { width: 0, opacity: 0 },
                    { width: "100%", opacity: 1, duration: 0.4, ease: "power2.out" }
                );
                inputRef.current?.focus();
            } else {
                gsap.to(searchContainerRef.current, { width: 0, opacity: 0, duration: 0.3 });
            }
        }
    }, [isSearchOpen]);

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
                            <div className="bg-primary h-10 w-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110">
                                <span className="text-primary-foreground font-bold text-2xl">M</span>
                            </div>
                            <span className="hidden font-black text-2xl tracking-tighter sm:inline-block uppercase">Miracode</span>
                        </Link>

                        {/* Links con Texto XL */}
                        <div className="hidden lg:flex items-center gap-8">
                            {[
                                { name: 'Inicio', path: '/' },
                                { name: 'Tienda', path: '/tienda' },
                                { name: 'Pedidos', path: '/pedido' }
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
                            <form
                                onSubmit={handleSearch}
                                ref={searchContainerRef}
                                className={cn(
                                    "absolute right-0 z-20 overflow-hidden md:relative md:w-full md:opacity-100 md:block",
                                    isSearchOpen ? "flex w-full bg-background md:bg-transparent" : "hidden md:flex"
                                )}
                            >
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                    ref={inputRef}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Buscar productos..."
                                    className="h-11 pl-10 pr-10 text-lg bg-muted/50 border-none rounded-full focus-visible:ring-2 focus-visible:ring-primary/20"
                                />
                                {isSearchOpen && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-1 top-1/2 -translate-y-1/2 md:hidden"
                                        onClick={() => setIsSearchOpen(false)}
                                    >
                                        <X className="h-5 w-5" />
                                    </Button>
                                )}
                            </form>

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
                            <Button
                                ref={themeBtnRef}
                                variant="ghost"
                                size="icon"
                                onClick={toggleTheme}
                                className="rounded-full h-11 w-11"
                            >
                                {isDark ? <Sun className="h-6 w-6 text-yellow-500" /> : <Moon className="h-6 w-6 text-slate-700" />}
                            </Button>

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
                                                { name: 'Pedidos', path: '/pedido' }
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