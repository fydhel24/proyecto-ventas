import { ProductCard } from '@/components/shop/ProductCard';
import { SearchBar } from '@/components/shop/SearchBar';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useCart } from '@/hooks/use-cart';
import PublicLayout from '@/layouts/public-layout';
import { Head, router } from '@inertiajs/react';
import gsap from 'gsap';
import {
    ChefHat,
    DollarSign,
    SearchX,
    ShoppingBag,
    SlidersHorizontal,
    UtensilsCrossed,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface Props {
    productos: {
        data: any[];
        links: any[];
        current_page: number;
        last_page: number;
    };
    categorias: any[];
    marcas: any[];
    filters: {
        search?: string;
        categoria?: string;
        marca?: string;
        sort?: string;
        min_price?: string;
        max_price?: string;
        in_stock?: string;
    };
}

export default function Index({
    productos,
    categorias = [],
    marcas = [],
    filters = {},
}: Props) {
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [catSearch, setCatSearch] = useState('');
    const [brandSearch, setBrandSearch] = useState('');
    const [priceRange, setPriceRange] = useState(filters.max_price || '1000');
    const [searchInput, setSearchInput] = useState(filters.search || '');

    const gridRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const { formatPrice } = useCart();

    useEffect(() => {
        const ctx = gsap.context(() => {
            if (headerRef.current) {
                gsap.from(headerRef.current.children, {
                    y: 30,
                    opacity: 0,
                    stagger: 0.1,
                    duration: 0.8,
                    ease: 'power3.out',
                });
            }
            if (gridRef.current) {
                gsap.fromTo(
                    gridRef.current.children,
                    { y: 30, opacity: 0, scale: 0.95 },
                    {
                        y: 0,
                        opacity: 1,
                        scale: 1,
                        stagger: 0.05,
                        duration: 0.6,
                        ease: 'power2.out',
                    },
                );
            }
        });
        return () => ctx.revert();
    }, [productos.data]);

    const handleFilterChange = (key: string, value: any) => {
        const newFilters = { ...filters };
        if (value !== null && value !== undefined && value !== '') {
            newFilters[key as keyof typeof filters] = String(value);
        } else {
            delete newFilters[key as keyof typeof filters];
        }
        router.get('/tienda', newFilters, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const filteredCategorias = categorias.filter((c) =>
        c.nombre_cat.toLowerCase().includes(catSearch.toLowerCase()),
    );

    return (
        <PublicLayout>
            <Head title="Nuestra Carta | Selección Gastronómica" />

            {/* HEADER DE LA CARTA */}
            <section className="relative flex h-[30vh] items-center justify-center overflow-hidden bg-black pt-20 md:h-[40vh]">
                <img
                    src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2070&auto=format&fit=crop"
                    className="absolute inset-0 h-full w-full object-cover opacity-60"
                    alt="Menu Background"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-background" />

                <div
                    ref={headerRef}
                    className="relative z-10 container px-4 text-center"
                >
                    <div className="mb-4 inline-flex items-center gap-2">
                        <div className="h-px w-8 bg-[var(--theme-primary)]" />
                        <span className="text-xs font-black tracking-[0.3em] text-[var(--theme-primary)] uppercase">
                            Menu Digital
                        </span>
                        <div className="h-px w-8 bg-[var(--theme-primary)]" />
                    </div>
                    <h1 className="text-5xl leading-none font-black tracking-tighter text-white uppercase italic md:text-8xl">
                        Nuestra{' '}
                        <span className="text-[var(--theme-primary)]">
                            Carta
                        </span>
                    </h1>
                    <p className="mx-auto mt-6 max-w-xl font-medium text-white/70 md:text-xl">
                        Explora una selección única de platos diseñados por
                        nuestros chefs para deleitar tus sentidos.
                    </p>
                </div>
            </section>

            <div className="container mx-auto px-4 py-12">
                {/* TOOLBAR SECUNDARIO */}
                <div className="mb-12 flex flex-col items-center gap-6 lg:flex-row">
                    <div className="w-full lg:flex-1">
                        <SearchBar
                            initialSearch={filters?.search || ''}
                            onSearchChange={(query) => setSearchInput(query)}
                            className="h-16 w-full rounded-2xl border-2 bg-card text-lg shadow-sm"
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-12 lg:flex-row">
                    {/* SIDEBAR - CATEGORÍAS TIPO MENÚ */}
                    <aside
                        className={`space-y-10 lg:w-80 ${isFilterOpen ? 'block' : 'hidden lg:block'}`}
                    >
                        {/* Categorías (Menú) */}
                        <div className="rounded-[3rem] border-2 bg-card p-8 shadow-sm">
                            <h3 className="mb-8 flex items-center gap-2 text-xs font-black tracking-widest text-[var(--theme-primary)] uppercase">
                                <UtensilsCrossed className="size-4" />
                                Secciones
                            </h3>

                            <div className="flex flex-col gap-2">
                                <Button
                                    variant={
                                        !filters?.categoria
                                            ? 'secondary'
                                            : 'ghost'
                                    }
                                    className="category-pill h-14 justify-start rounded-2xl px-6 text-sm font-black tracking-tight uppercase"
                                    onClick={() =>
                                        handleFilterChange('categoria', null)
                                    }
                                >
                                    Ver Todo
                                </Button>
                                {categorias.map((cat) => (
                                    <Button
                                        key={cat.id}
                                        variant={
                                            filters?.categoria ===
                                            String(cat.id)
                                                ? 'secondary'
                                                : 'ghost'
                                        }
                                        className="category-pill h-14 justify-start rounded-2xl px-6 text-sm font-black tracking-tight uppercase"
                                        onClick={() =>
                                            handleFilterChange(
                                                'categoria',
                                                String(cat.id),
                                            )
                                        }
                                    >
                                        {cat.nombre_cat}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Rango de Inversión */}
                        <div className="rounded-[3rem] border-2 border-dashed bg-muted/30 p-8">
                            <h3 className="mb-6 flex items-center gap-2 text-xs font-black tracking-widest text-primary uppercase">
                                <DollarSign className="size-4" />
                                Presupuesto
                            </h3>
                            <div className="px-2">
                                <input
                                    type="range"
                                    min="0"
                                    max="1000"
                                    step="10"
                                    value={priceRange}
                                    onChange={(e) =>
                                        setPriceRange(e.target.value)
                                    }
                                    onMouseUp={() =>
                                        handleFilterChange(
                                            'max_price',
                                            priceRange,
                                        )
                                    }
                                    className="price-range-input h-3 w-full cursor-pointer appearance-none rounded-full bg-muted accent-[var(--theme-primary)]"
                                />
                                <div className="mt-4 flex justify-between font-black">
                                    <span className="text-xs text-muted-foreground uppercase">
                                        Mín
                                    </span>
                                    <span className="text-xl font-black text-[var(--theme-primary)] italic">
                                        {formatPrice(Number(priceRange))}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Disponibilidad */}
                        <div className="border-t px-4 pt-4">
                            <Button
                                variant={
                                    filters?.in_stock === '1'
                                        ? 'default'
                                        : 'outline'
                                }
                                className="h-14 w-full gap-2 rounded-2xl border-2 font-black tracking-wide uppercase"
                                onClick={() =>
                                    handleFilterChange(
                                        'in_stock',
                                        filters?.in_stock === '1' ? null : '1',
                                    )
                                }
                            >
                                <ChefHat className="h-5 w-5" />
                                Solo Disponibles
                            </Button>
                        </div>
                    </aside>

                    {/* LISTA DE PLATOS */}
                    <div className="flex-1">
                        {productos.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-[4rem] border-4 border-dashed border-muted bg-muted/20 py-32">
                                <SearchX className="mb-8 h-24 w-24 text-muted-foreground/20" />
                                <h2 className="mb-4 text-4xl font-black uppercase italic">
                                    Sin resultados
                                </h2>
                                <p className="mb-12 max-w-sm text-center font-medium text-muted-foreground">
                                    No encontramos platos con esos criterios.
                                    Prueba cambiando de categoría.
                                </p>
                                <Button
                                    variant="outline"
                                    className="h-16 rounded-2xl border-2 px-10 font-black uppercase"
                                    onClick={() => router.get('/tienda')}
                                >
                                    Limpiar Filtros
                                </Button>
                            </div>
                        ) : (
                            <>
                                <div
                                    ref={gridRef}
                                    className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:gap-8 lg:grid-cols-3 xl:grid-cols-4"
                                >
                                    {productos.data.map((producto) => (
                                        <div
                                            key={producto.id}
                                            className="transition-all"
                                        >
                                            <ProductCard producto={producto} />
                                        </div>
                                    ))}
                                </div>

                                {/* Paginación Premium */}
                                {productos.last_page > 1 && (
                                    <div className="mt-20 flex items-center justify-center gap-4">
                                        {productos.links.map((link, i) => {
                                            if (
                                                link.label ===
                                                '&laquo; Previous'
                                            )
                                                return null;
                                            if (link.label === 'Next &raquo;')
                                                return null;

                                            const isActive = link.active;
                                            const label = link.label
                                                .replace('&laquo; ', '')
                                                .replace(' &raquo;', '');

                                            return (
                                                <Button
                                                    key={i}
                                                    variant={
                                                        isActive
                                                            ? 'default'
                                                            : 'outline'
                                                    }
                                                    className={`h-14 w-14 rounded-2xl border-2 font-black transition-all ${isActive ? 'scale-110 shadow-xl' : 'hover:scale-105'}`}
                                                    disabled={!link.url}
                                                    onClick={() =>
                                                        link.url &&
                                                        router.get(
                                                            link.url,
                                                            {},
                                                            {
                                                                preserveScroll: true,
                                                            },
                                                        )
                                                    }
                                                >
                                                    {label}
                                                </Button>
                                            );
                                        })}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* BARRA DE CARRITO FLOTANTE (Opcional, pero para pedidos sirve) */}
            <div className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 lg:hidden">
                <Button
                    className="flex h-16 animate-bounce items-center gap-3 rounded-full bg-[var(--theme-primary)] px-8 font-black text-white shadow-2xl"
                    onClick={() => router.visit('/tienda/checkout')}
                >
                    <ShoppingBag className="size-6" />
                    VER MI PEDIDO
                </Button>
            </div>
        </PublicLayout>
    );
}
