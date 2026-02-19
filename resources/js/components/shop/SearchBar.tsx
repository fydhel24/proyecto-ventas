import { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { router } from '@inertiajs/react';

interface SearchBarProps {
    initialSearch?: string;
    onSearchChange?: (query: string) => void;
    className?: string;
}

interface SearchResult {
    id: number;
    nombre: string;
    precio_1: number;
    fotos: { url: string }[];
}

export function SearchBar({ initialSearch = '', onSearchChange, className }: SearchBarProps) {
    const [query, setQuery] = useState(initialSearch);
    const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [debouncedQuery, setDebouncedQuery] = useState(query);
    const containerRef = useRef<HTMLDivElement>(null);

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(query), 300);
        return () => clearTimeout(timer);
    }, [query]);

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch suggestions
    useEffect(() => {
        if (!debouncedQuery.trim()) {
            setSuggestions([]);
            setIsOpen(false);
            return;
        }

        const fetchSuggestions = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(
                    `/search-suggestions?q=${encodeURIComponent(debouncedQuery)}&limit=8`
                );
                if (res.ok) {
                    const data = await res.json();
                    setSuggestions(data);
                    setIsOpen(true);
                    onSearchChange?.(debouncedQuery);
                }
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSuggestions();
    }, [debouncedQuery, onSearchChange]);

    const handleClear = () => {
        setQuery('');
        setSuggestions([]);
        setIsOpen(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.get('/tienda', { search: query }, { preserveScroll: true });
            setIsOpen(false);
        }
    };

    const handleSelectProduct = (productId: number) => {
        router.get(`/tienda/${productId}`);
        setIsOpen(false);
    };

    return (
        <div ref={containerRef} className={cn('relative w-full', className)}>
            <form onSubmit={handleSubmit} className="relative">
                <div className="relative flex items-center">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Buscar medicamentos, laboratorios, principio activo..."
                        className="pl-12 pr-10 h-12 bg-muted/40 border-primary/20 focus-visible:ring-primary/30 transition-all focus:bg-background text-base"
                        onFocus={() => {
                            if (suggestions.length > 0) setIsOpen(true);
                        }}
                    />
                    {query && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-12 w-12 hover:bg-transparent"
                            onClick={handleClear}
                        >
                            <X className="h-5 w-5 text-muted-foreground" />
                        </Button>
                    )}
                </div>
            </form>

            {/* Suggestions Dropdown */}
            {isOpen && (suggestions.length > 0 || isLoading) && (
                <div className="absolute top-full left-0 right-0 mt-3 bg-popover/95 backdrop-blur-md text-popover-foreground rounded-xl border shadow-2xl overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2">
                    {isLoading ? (
                        <div className="p-6 flex items-center justify-center text-muted-foreground">
                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                            <span className="text-sm font-medium">Buscando productos...</span>
                        </div>
                    ) : suggestions.length > 0 ? (
                        <div className="py-2 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div className="px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                <TrendingUp className="h-4 w-4" />
                                Resultados relevantes
                            </div>

                            {suggestions.map((item, idx) => (
                                <button
                                    key={item.id}
                                    onClick={() => handleSelectProduct(item.id)}
                                    className="w-full text-left px-4 py-3 hover:bg-muted/60 transition-all duration-150 flex items-center gap-4 group border-b border-transparent last:border-b-0"
                                >
                                    <div className="h-14 w-14 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden border border-border/50 group-hover:border-primary/30 transition-colors">
                                        {item.fotos && item.fotos[0] ? (
                                            <img
                                                src={`/storage/${item.fotos[0].url}`}
                                                alt={item.nombre}
                                                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
                                            />
                                        ) : (
                                            <Search className="h-6 w-6 text-muted-foreground/40" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold group-hover:text-primary transition-colors truncate">
                                            {item.nombre}
                                        </p>
                                        <p className="text-xs text-muted-foreground font-bold mt-1">
                                            Bs. {item.precio_1.toLocaleString('es-ES', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            })}
                                        </p>
                                    </div>
                                    <div className="text-xs font-medium text-primary/60 group-hover:text-primary transition-colors flex-shrink-0">
                                        #{idx + 1}
                                    </div>
                                </button>
                            ))}

                            <div className="border-t border-border bg-muted/20 p-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="w-full text-sm font-bold justify-center hover:bg-muted/40 h-11"
                                    onClick={handleSubmit}
                                >
                                    Ver todos los resultados para "{query}"
                                </Button>
                            </div>
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
}
