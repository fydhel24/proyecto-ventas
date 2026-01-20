import { useState, useEffect, useRef } from 'react';
import { Link } from '@inertiajs/react';
import { Search, ShoppingCart, Menu, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import gsap from 'gsap';

export function Navbar({ auth }: { auth: any }) {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    
    // Refs para GSAP
    const searchContainerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const navRef = useRef<HTMLElement>(null);

    // 1. Efecto de Scroll (GSAP)
    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 20;
            setScrolled(isScrolled);
            
            gsap.to(navRef.current, {
                height: isScrolled ? 64 : 80,
                backgroundColor: isScrolled ? "rgba(var(--background-rgb), 0.8)" : "rgba(var(--background-rgb), 1)",
                duration: 0.3,
                ease: "power2.out"
            });
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // 2. Animación del Buscador (GSAP)
    useEffect(() => {
        if (window.innerWidth < 768) { // Solo animamos el "expand" en móvil
            if (isSearchOpen) {
                gsap.fromTo(searchContainerRef.current, 
                    { width: 0, opacity: 0, x: 20 },
                    { width: "100%", opacity: 1, x: 0, duration: 0.4, ease: "expo.out" }
                );
                inputRef.current?.focus();
            } else {
                gsap.to(searchContainerRef.current, {
                    width: 0, opacity: 0, x: 20, duration: 0.3, ease: "power2.in"
                });
            }
        }
    }, [isSearchOpen]);

    return (
        <nav 
            ref={navRef}
            className={cn(
                "fixed top-0 z-50 w-full border-b p-4 transition-colors backdrop-blur-md",
                scrolled ? "border-border shadow-sm" : "border-transparent"
            )}
        >
            <div className="container mx-auto h-full flex items-center justify-between gap-4">
                
                {/* Lado Izquierdo: Logo y Links */}
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center space-x-2 group">
                        <div className="bg-primary h-9 w-9 rounded-xl flex items-center justify-center transition-transform group-hover:rotate-12">
                            <span className="text-primary-foreground font-bold text-xl">M</span>
                        </div>
                        <span className="hidden font-bold text-xl tracking-tighter sm:inline-block">
                            TIENDA
                        </span>
                    </Link>

                    <div className="hidden lg:flex items-center gap-6">
                        {['Inicio', 'Tienda', 'Nosotros','Contactanos', 'Pedidos'].map((item) => (
                            <Link 
                                key={item}
                                href={item === 'Inicio' ? '/' : `/${item.toLowerCase()}`}
                                className="text-xl font-semibold text-muted-foreground hover:text-primary transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all hover:after:w-full"
                            >
                                {item}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Lado Derecho: Buscador y Auth */}
                <div className="flex flex-1 items-center justify-end gap-3">
                    
                    {/* Buscador Adaptativo */}
                    <div className="relative flex items-center justify-end flex-1 max-w-sm">
                        {/* Contenedor animado por GSAP */}
                        <div 
                            ref={searchContainerRef}
                            className={cn(
                                "absolute right-0 top-1/2 -translate-y-1/2 overflow-hidden md:relative md:translate-y-0 md:w-full md:opacity-100 md:block",
                                isSearchOpen ? "z-20 flex w-full bg-background md:bg-transparent" : "hidden md:flex"
                            )}
                        >
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                ref={inputRef}
                                placeholder="¿Qué estás buscando?"
                                className="h-10 pl-10 pr-10 bg-muted/40 border-none rounded-full focus-visible:ring-2 focus-visible:ring-primary/20"
                            />
                            {isSearchOpen && (
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="absolute right-1 top-1/2 -translate-y-1/2 md:hidden"
                                    onClick={() => setIsSearchOpen(false)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                        
                        {!isSearchOpen && (
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="md:hidden hover:bg-muted" 
                                onClick={() => setIsSearchOpen(true)}
                            >
                                <Search className="h-5 w-5" />
                            </Button>
                        )}
                    </div>

                    {/* Acciones Finales */}
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="relative">
                            <ShoppingCart className="h-5 w-5" />
                            <span className="absolute top-1 right-1 h-4 w-4 text-[10px] font-bold flex items-center justify-center bg-primary text-primary-foreground rounded-full">
                                3
                            </span>
                        </Button>

                        <div className="hidden sm:block w-[1px] h-6 bg-border mx-2" />

                        <Button variant="ghost" size="icon" className="hidden sm:inline-flex">
                            <User className="h-5 w-5" />
                        </Button>

                        <div className="lg:hidden">
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <Menu className="h-6 w-6" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent>
                                    <nav className="flex flex-col gap-4 mt-10">
                                        <Link href="/" className="text-2xl font-bold">Inicio</Link>
                                        <Link href="/tienda" className="text-2xl font-bold">Tienda</Link>
                                        <Link href="/nosotros" className="text-2xl font-bold">Nosotros</Link>
                                    </nav>
                                </SheetContent>
                            </Sheet>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}