import { Head, router } from '@inertiajs/react';
import PublicLayout from '@/layouts/public-layout';
import { ProductCard } from '@/components/shop/ProductCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    LayoutGrid,
    ListFilter,
    ChevronRight,
    SlidersHorizontal,
    SearchX,
    Search,
    DollarSign,
    PackageCheck
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useCart } from '@/hooks/use-cart';

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

export default function Index({ productos, categorias = [], marcas = [], filters = {} }: Props) {
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
                gsap.fromTo(gridRef.current.children,
                    { y: 30, opacity: 0, scale: 0.98 },
                    { y: 0, opacity: 1, scale: 1, stagger: 0.05, duration: 0.6, ease: "power2.out" }
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
        router.get('/tienda', newFilters, { preserveScroll: true, preserveState: true });
    };

    const filteredCategorias = categorias.filter(c =>
        c.nombre_cat.toLowerCase().includes(catSearch.toLowerCase())
    );

    const filteredMarcas = marcas.filter(m =>
        m.nombre_marca.toLowerCase().includes(brandSearch.toLowerCase())
    );

    return (
        <PublicLayout>
            <Head title="Tienda | Catálogo de Productos" />

            <div className="container mx-auto px-4 py-8 md:py-12">
                {/* Header Section */}
                <div className="flex flex-col gap-6 mb-12">
                    {/* Breadcrumb and Title */}
                    <div className="flex-1">
                        <div className="flex items-center gap-2 text-xs font-black text-muted-foreground uppercase tracking-wider mb-4">
                            <a href="/" className="hover:text-primary transition-colors">Inicio</a>
                            <ChevronRight className="h-3 w-3" />
                            <span className="text-primary">Tienda</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none">
                            {filters?.search ? `Buscando: ${filters.search}` : 'Tienda Miracode'}
                        </h1>
                    </div>

                    {/* Search Bar */}
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            if (searchInput.trim()) {
                                handleFilterChange('search', searchInput);
                            } else {
                                handleFilterChange('search', null);
                            }
                        }}
                        className="relative max-w-2xl"
                    >
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Buscar productos por nombre, marca o categoría..."
                            className="h-14 pl-12 pr-32 text-base rounded-2xl border-2 bg-background shadow-sm"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                            {searchInput && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setSearchInput('');
                                        handleFilterChange('search', null);
                                    }}
                                    className="h-10 px-3"
                                >
                                    Limpiar
                                </Button>
                            )}
                            <Button type="submit" size="sm" className="h-10 px-6 font-black">
                                Buscar
                            </Button>
                        </div>
                    </form>

                    {/* Sort and Filter Toggle */}
                    <div className="flex items-center gap-3">
                        <Select
                            value={filters?.sort || 'latest'}
                            onValueChange={(v) => handleFilterChange('sort', v)}
                        >
                            <SelectTrigger className="w-[200px] h-12 rounded-2xl font-black bg-card border-2 shadow-sm">
                                <SelectValue placeholder="Ordenar por" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-2">
                                <SelectItem value="latest">Más Relevantes</SelectItem>
                                <SelectItem value="price_asc">Menor Precio</SelectItem>
                                <SelectItem value="price_desc">Mayor Precio</SelectItem>
                                <SelectItem value="name_asc">A - Z</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button
                            variant="outline"
                            size="icon"
                            className="lg:hidden h-12 w-12 rounded-2xl border-2 shadow-sm"
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                        >
                            <SlidersHorizontal className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Sidebar Filters */}
                    <aside className={`lg:w-80 space-y-12 ${isFilterOpen ? 'block' : 'hidden lg:block'} animate-in slide-in-from-left duration-500`}>

                        {/* Filtro por Precio */}
                        <div className="space-y-6">
                            <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-primary">
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
                                    onChange={(e) => setPriceRange(e.target.value)}
                                    onMouseUp={() => handleFilterChange('max_price', priceRange)}
                                    onTouchEnd={() => handleFilterChange('max_price', priceRange)}
                                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                                <div className="flex justify-between mt-4 font-black">
                                    <span className="text-sm">Bs. 0</span>
                                    <span className="text-lg text-primary">{formatPrice(Number(priceRange))}</span>
                                </div>
                            </div>
                        </div>

                        {/* Categorías */}
                        <div className="space-y-6">
                            <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-primary">
                                <ListFilter className="h-4 w-4" />
                                Categorías
                            </h3>
                            <div className="relative mb-4">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar categoría..."
                                    value={catSearch}
                                    onChange={(e) => setCatSearch(e.target.value)}
                                    className="pl-9 h-10 rounded-xl border-2 bg-muted/30"
                                />
                            </div>
                            <div className="flex flex-col gap-1 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                <Button
                                    variant={!filters?.categoria ? 'secondary' : 'ghost'}
                                    className="justify-start font-black h-11 rounded-xl text-sm px-4"
                                    onClick={() => handleFilterChange('categoria', null)}
                                >
                                    Todas
                                </Button>
                                {filteredCategorias.map((cat) => (
                                    <Button
                                        key={cat.id}
                                        variant={filters?.categoria === String(cat.id) ? 'secondary' : 'ghost'}
                                        className="justify-start font-black h-11 rounded-xl text-sm px-4 transition-all hover:translate-x-1"
                                        onClick={() => handleFilterChange('categoria', String(cat.id))}
                                    >
                                        {cat.nombre_cat}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Marcas */}
                        <div className="space-y-6">
                            <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-primary">
                                <LayoutGrid className="h-4 w-4" />
                                Marcas
                            </h3>
                            <div className="relative mb-4">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar marca..."
                                    value={brandSearch}
                                    onChange={(e) => setBrandSearch(e.target.value)}
                                    className="pl-9 h-10 rounded-xl border-2 bg-muted/30"
                                />
                            </div>
                            <div className="flex flex-col gap-1 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                <Button
                                    variant={!filters?.marca ? 'secondary' : 'ghost'}
                                    className="justify-start font-black h-11 rounded-xl text-sm px-4"
                                    onClick={() => handleFilterChange('marca', null)}
                                >
                                    Todas las marcas
                                </Button>
                                {filteredMarcas.map((marca) => (
                                    <Button
                                        key={marca.id}
                                        variant={filters?.marca === String(marca.id) ? 'secondary' : 'ghost'}
                                        className="justify-start font-black h-11 rounded-xl text-sm px-4 transition-all hover:translate-x-1"
                                        onClick={() => handleFilterChange('marca', String(marca.id))}
                                    >
                                        {marca.nombre_marca}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Solo en Stock */}
                        <div className="pt-4 border-t">
                            <Button
                                variant={filters?.in_stock === '1' ? 'default' : 'outline'}
                                className="w-full gap-2 rounded-2xl h-12 font-black border-2"
                                onClick={() => handleFilterChange('in_stock', filters?.in_stock === '1' ? null : '1')}
                            >
                                <PackageCheck className="h-5 w-5" />
                                Solo productos en Stock
                            </Button>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1">
                        {productos.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 bg-muted/20 rounded-[3rem] border-4 border-dashed border-muted">
                                <div className="bg-background p-8 rounded-full shadow-xl mb-8">
                                    <SearchX className="h-16 w-16 text-muted-foreground/30" />
                                </div>
                                <h2 className="text-3xl font-black mb-4">Sin resultados</h2>
                                <p className="text-muted-foreground text-center max-w-sm font-medium">
                                    No encontramos productos con esos filtros. Intenta resetear la búsqueda.
                                </p>
                                <Button
                                    variant="outline"
                                    className="mt-8 font-black h-14 px-8 rounded-2xl border-2"
                                    onClick={() => router.get('/tienda')}
                                >
                                    Limpiar Filtros
                                </Button>
                            </div>
                        ) : (
                            <>
                                <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {productos.data.map((producto) => (
                                        <ProductCard key={producto.id} producto={producto} />
                                    ))}
                                </div>

                                {/* Pagination */}
                                {productos.last_page > 1 && (
                                    <div className="mt-20 flex justify-center items-center gap-2">
                                        {productos.links.map((link, i) => {
                                            if (link.label === '&laquo; Previous') return null;
                                            if (link.label === 'Next &raquo;') return null;

                                            const isActive = link.active;
                                            const label = link.label.replace('&laquo; ', '').replace(' &raquo;', '');

                                            return (
                                                <Button
                                                    key={i}
                                                    variant={isActive ? 'default' : 'outline'}
                                                    size="icon"
                                                    className={`h-12 w-12 rounded-xl font-black transition-all border-2 ${isActive ? 'scale-110' : 'hover:scale-105'}`}
                                                    disabled={!link.url}
                                                    onClick={() => link.url && router.get(link.url, {}, { preserveScroll: true })}
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
