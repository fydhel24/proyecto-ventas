import { ProductCard } from '@/components/shop/ProductCard';
import { SearchBar } from '@/components/shop/SearchBar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    ChevronRight,
    DollarSign,
    LayoutGrid,
    ListFilter,
    PackageCheck,
    Search,
    SearchX,
    SlidersHorizontal,
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
    const [priceRange, setPriceRange] = useState(filters.max_price || '5000');
    const [searchInput, setSearchInput] = useState(filters.search || '');

    const gridRef = useRef<HTMLDivElement>(null);
    const { formatPrice } = useCart();

    useEffect(() => {
        const ctx = gsap.context(() => {
            if (gridRef.current) {
                gsap.fromTo(
                    gridRef.current.children,
                    { y: 30, opacity: 0, scale: 0.98 },
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

    const filteredMarcas = marcas.filter((m) =>
        m.nombre_marca.toLowerCase().includes(brandSearch.toLowerCase()),
    );

    return (
        <PublicLayout>
            <Head title="Tienda | Catálogo de Productos" />

            <div className="container mx-auto px-4 py-8 md:py-12">
                {/* Header Section */}
                <div className="mb-12 flex flex-col gap-6">
                    {/* Breadcrumb and Title */}
                    <div className="flex-1">
                        <div className="mb-4 flex items-center gap-2 text-xs font-black tracking-wider text-muted-foreground uppercase">
                            <a
                                href="/"
                                className="transition-colors hover:text-primary"
                            >
                                Inicio
                            </a>
                            <ChevronRight className="h-3 w-3" />
                            <span className="text-primary">Tienda</span>
                        </div>
                        <h1 className="text-4xl leading-none font-black tracking-tight md:text-6xl">
                            {filters?.search
                                ? `Buscando: ${filters.search}`
                                : 'Tienda Miracode'}
                        </h1>
                    </div>

                    {/* Search Bar */}
                    <SearchBar
                        initialSearch={filters?.search || ''}
                        onSearchChange={(query) => {
                            setSearchInput(query);
                        }}
                        className="w-full md:max-w-2xl"
                    />

                    {/* Sort and Filter Toggle */}
                    <div className="flex items-center gap-3">
                        <Select
                            value={filters?.sort || 'latest'}
                            onValueChange={(v) => handleFilterChange('sort', v)}
                        >
                            <SelectTrigger className="h-12 w-[200px] rounded-2xl border-2 bg-card font-black shadow-sm">
                                <SelectValue placeholder="Más Relevantes" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-2">
                                <SelectItem value="latest">
                                    Más Relevantes
                                </SelectItem>
                                <SelectItem value="price_asc">
                                    Menor Precio
                                </SelectItem>
                                <SelectItem value="price_desc">
                                    Mayor Precio
                                </SelectItem>
                                <SelectItem value="name_asc">A - Z</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button
                            variant="outline"
                            size="icon"
                            className="h-12 w-12 rounded-2xl border-2 shadow-sm lg:hidden"
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                        >
                            <SlidersHorizontal className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                <div className="flex flex-col gap-12 lg:flex-row">
                    {/* Sidebar Filters */}
                    <aside
                        className={`space-y-12 lg:w-80 ${isFilterOpen ? 'block' : 'hidden lg:block'} animate-in duration-500 slide-in-from-left`}
                    >
                        {/* Filtro por Precio */}
                        <div className="space-y-6">
                            <h3 className="flex items-center gap-2 text-xs font-black tracking-widest text-primary uppercase">
                                <DollarSign className="h-4 w-4" />
                                Rango de Inversión
                            </h3>
                            <div className="px-2">
                                <input
                                    type="range"
                                    min="0"
                                    max="20000"
                                    step="100"
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
                                    onTouchEnd={() =>
                                        handleFilterChange(
                                            'max_price',
                                            priceRange,
                                        )
                                    }
                                    className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-muted accent-primary"
                                />
                                <div className="mt-4 flex justify-between font-black">
                                    <span className="text-sm">Bs. 0</span>
                                    <span className="text-lg text-primary">
                                        {formatPrice(Number(priceRange))}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Categorías */}
                        <div className="space-y-6">
                            <h3 className="flex items-center gap-2 text-xs font-black tracking-widest text-primary uppercase">
                                <ListFilter className="h-4 w-4" />
                                Categorías
                            </h3>
                            <div className="relative mb-4">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar categoría..."
                                    value={catSearch}
                                    onChange={(e) =>
                                        setCatSearch(e.target.value)
                                    }
                                    className="h-10 rounded-xl border-2 bg-muted/30 pl-9"
                                />
                            </div>
                            <div className="custom-scrollbar flex max-h-60 flex-col gap-1 overflow-y-auto pr-2">
                                <Button
                                    variant={
                                        !filters?.categoria
                                            ? 'secondary'
                                            : 'ghost'
                                    }
                                    className="h-11 justify-start rounded-xl px-4 text-sm font-black"
                                    onClick={() =>
                                        handleFilterChange('categoria', null)
                                    }
                                >
                                    Todas
                                </Button>
                                {filteredCategorias.map((cat) => (
                                    <Button
                                        key={cat.id}
                                        variant={
                                            filters?.categoria ===
                                            String(cat.id)
                                                ? 'secondary'
                                                : 'ghost'
                                        }
                                        className="h-11 justify-start rounded-xl px-4 text-sm font-black transition-all hover:translate-x-1"
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

                        {/* Marcas */}
                        <div className="space-y-6">
                            <h3 className="flex items-center gap-2 text-xs font-black tracking-widest text-primary uppercase">
                                <LayoutGrid className="h-4 w-4" />
                                Marcas
                            </h3>
                            <div className="relative mb-4">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar marca..."
                                    value={brandSearch}
                                    onChange={(e) =>
                                        setBrandSearch(e.target.value)
                                    }
                                    className="h-10 rounded-xl border-2 bg-muted/30 pl-9"
                                />
                            </div>
                            <div className="custom-scrollbar flex max-h-60 flex-col gap-1 overflow-y-auto pr-2">
                                <Button
                                    variant={
                                        !filters?.marca ? 'secondary' : 'ghost'
                                    }
                                    className="h-11 justify-start rounded-xl px-4 text-sm font-black"
                                    onClick={() =>
                                        handleFilterChange('marca', null)
                                    }
                                >
                                    Todas las marcas
                                </Button>
                                {filteredMarcas.map((marca) => (
                                    <Button
                                        key={marca.id}
                                        variant={
                                            filters?.marca === String(marca.id)
                                                ? 'secondary'
                                                : 'ghost'
                                        }
                                        className="h-11 justify-start rounded-xl px-4 text-sm font-black transition-all hover:translate-x-1"
                                        onClick={() =>
                                            handleFilterChange(
                                                'marca',
                                                String(marca.id),
                                            )
                                        }
                                    >
                                        {marca.nombre_marca}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Solo en Stock */}
                        <div className="border-t pt-4">
                            <Button
                                variant={
                                    filters?.in_stock === '1'
                                        ? 'default'
                                        : 'outline'
                                }
                                className="h-12 w-full gap-2 rounded-2xl border-2 font-black"
                                onClick={() =>
                                    handleFilterChange(
                                        'in_stock',
                                        filters?.in_stock === '1' ? null : '1',
                                    )
                                }
                            >
                                <PackageCheck className="h-5 w-5" />
                                Solo productos en Stock
                            </Button>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1">
                        {productos.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-[3rem] border-4 border-dashed border-muted bg-muted/20 py-24">
                                <div className="mb-8 rounded-full bg-background p-8 shadow-xl">
                                    <SearchX className="h-16 w-16 text-muted-foreground/30" />
                                </div>
                                <h2 className="mb-4 text-3xl font-black">
                                    Sin resultados
                                </h2>
                                <p className="max-w-sm text-center font-medium text-muted-foreground">
                                    No encontramos productos con esos filtros.
                                    Intenta resetear la búsqueda.
                                </p>
                                <Button
                                    variant="outline"
                                    className="mt-8 h-14 rounded-2xl border-2 px-8 font-black"
                                    onClick={() => router.get('/tienda')}
                                >
                                    Limpiar Filtros
                                </Button>
                            </div>
                        ) : (
                            <>
                                <div
                                    ref={gridRef}
                                    className="grid grid-cols-2 gap-3 md:grid-cols-2 md:gap-6 lg:grid-cols-3"
                                >
                                    {productos.data.map((producto) => (
                                        <ProductCard
                                            key={producto.id}
                                            producto={producto}
                                        />
                                    ))}
                                </div>

                                {/* Pagination */}
                                {productos.last_page > 1 && (
                                    <div className="mt-20 flex items-center justify-center gap-2">
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
                                                    size="icon"
                                                    className={`h-12 w-12 rounded-xl border-2 font-black transition-all ${isActive ? 'scale-110' : 'hover:scale-105'}`}
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
        </PublicLayout>
    );
}
