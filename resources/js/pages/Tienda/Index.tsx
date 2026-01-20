import { Head, router } from '@inertiajs/react';
import PublicLayout from '@/layouts/public-layout';
import { ProductCard } from '@/components/shop/ProductCard';
import { Button } from '@/components/ui/button';
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
    SearchX
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

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
    };
}

export default function Index({ productos, categorias = [], marcas = [], filters = {} }: Props) {
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const gridRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            if (gridRef.current) {
                gsap.fromTo(gridRef.current.children,
                    { y: 50, opacity: 0, scale: 0.95 },
                    { y: 0, opacity: 1, scale: 1, stagger: 0.05, duration: 0.8, ease: "power4.out" }
                );
            }
        });
        return () => ctx.revert();
    }, [productos.data]);

    const handleFilterChange = (key: string, value: string | null) => {
        const newFilters = { ...filters };
        if (value) {
            newFilters[key as keyof typeof filters] = value;
        } else {
            delete newFilters[key as keyof typeof filters];
        }
        router.get('/tienda', newFilters, { preserveScroll: true, preserveState: true });
    };

    return (
        <PublicLayout>
            <Head title="Tienda | Catálogo de Productos" />

            <div className="container mx-auto px-4 py-8 md:py-12">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <div className="flex items-center gap-2 text-sm font-black text-muted-foreground uppercase tracking-wider mb-4">
                            <a href="/" className="hover:text-primary transition-colors">Inicio</a>
                            <ChevronRight className="h-3 w-3" />
                            <span className="text-primary">Tienda</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none">
                            {filters?.search ? `Buscando: ${filters.search}` : 'Catálogo Real'}
                        </h1>
                        <p className="text-muted-foreground mt-4 text-xl max-w-2xl leading-relaxed">
                            Tecnología premium seleccionada para maximizar tu productividad y estilo.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Select
                            value={filters?.sort || 'latest'}
                            onValueChange={(v) => handleFilterChange('sort', v)}
                        >
                            <SelectTrigger className="w-[200px] h-14 rounded-2xl font-black bg-card border-2 shadow-sm">
                                <SelectValue placeholder="Ordenar por" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-2">
                                <SelectItem value="latest">Lo más nuevo</SelectItem>
                                <SelectItem value="price_asc">Precio: Menor a Mayor</SelectItem>
                                <SelectItem value="price_desc">Precio: Mayor a Menor</SelectItem>
                                <SelectItem value="name_asc">Nombre: A - Z</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button
                            variant="outline"
                            size="icon"
                            className="lg:hidden h-14 w-14 rounded-2xl border-2 shadow-sm"
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                        >
                            <SlidersHorizontal className="h-6 w-6" />
                        </Button>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Sidebar Filters */}
                    <aside className={`lg:w-72 space-y-10 ${isFilterOpen ? 'block' : 'hidden lg:block'} animate-in slide-in-from-left duration-500`}>
                        {/* Categorías */}
                        <div className="space-y-6">
                            <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-primary">
                                <ListFilter className="h-4 w-4" />
                                Categorías
                            </h3>
                            <div className="flex flex-wrap lg:flex-col gap-3">
                                <Button
                                    variant={!filters?.categoria ? 'secondary' : 'ghost'}
                                    className="justify-start font-black h-12 rounded-2xl text-base px-6"
                                    onClick={() => handleFilterChange('categoria', null)}
                                >
                                    Todas las categorías
                                </Button>
                                {categorias.map((cat) => (
                                    <Button
                                        key={cat.id}
                                        variant={filters?.categoria === String(cat.id) ? 'secondary' : 'ghost'}
                                        className="justify-start font-black h-12 rounded-2xl text-base px-6 transition-all hover:translate-x-1"
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
                            <div className="flex flex-wrap lg:flex-col gap-3">
                                <Button
                                    variant={!filters?.marca ? 'secondary' : 'ghost'}
                                    className="justify-start font-black h-12 rounded-2xl text-base px-6"
                                    onClick={() => handleFilterChange('marca', null)}
                                >
                                    Todas las marcas
                                </Button>
                                {marcas.map((marca) => (
                                    <Button
                                        key={marca.id}
                                        variant={filters?.marca === String(marca.id) ? 'secondary' : 'ghost'}
                                        className="justify-start font-black h-12 rounded-2xl text-base px-6 transition-all hover:translate-x-1"
                                        onClick={() => handleFilterChange('marca', String(marca.id))}
                                    >
                                        {marca.nombre_marca}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1">
                        {productos.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 bg-muted/30 rounded-[3rem] border-4 border-dashed border-muted transition-all hover:bg-muted/50">
                                <div className="bg-background p-8 rounded-full shadow-2xl mb-8 animate-bounce">
                                    <SearchX className="h-16 w-16 text-muted-foreground" />
                                </div>
                                <h2 className="text-3xl font-black mb-4">No hay resultados</h2>
                                <p className="text-muted-foreground text-center max-w-sm text-lg font-medium leading-relaxed">
                                    Prueba a buscar otro término o limpia los filtros para ver todo nuestro stock.
                                </p>
                                <Button
                                    variant="outline"
                                    className="mt-8 font-black h-14 px-8 rounded-2xl border-2 hover:bg-primary hover:text-primary-foreground transition-all active:scale-95"
                                    onClick={() => router.get('/tienda')}
                                >
                                    Limpiar todos los filtros
                                </Button>
                            </div>
                        ) : (
                            <>
                                <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                                    {productos.data.map((producto) => (
                                        <ProductCard key={producto.id} producto={producto} />
                                    ))}
                                </div>

                                {/* Pagination */}
                                {productos.last_page > 1 && (
                                    <div className="mt-20 flex justify-center items-center gap-3">
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
                                                    className={`h-14 w-14 rounded-2xl font-black text-lg transition-all border-2 ${isActive ? 'shadow-2xl scale-125 z-10' : 'hover:scale-110'}`}
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
