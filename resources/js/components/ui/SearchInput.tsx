import { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, ShoppingBag } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/use-debounce'; // Assuming this exists, if not I'll implement a local debounce
import { router } from '@inertiajs/react';

interface SearchInputProps {
    className?: string;
    onClose?: () => void;
    autoFocus?: boolean;
}

interface Suggestion {
    id: number;
    nombre: string;
    precio_1: number;
    fotos: { url: string }[];
    url: string; // fallback if needed
}

export function SearchInput({ className, onClose, autoFocus }: SearchInputProps) {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    // We can use a local debounce if the hook doesn't exist.
    // implementing local debounce for safety
    const [debouncedQuery, setDebouncedQuery] = useState(query);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(query), 300);
        return () => clearTimeout(timer);
    }, [query]);

    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (!debouncedQuery.trim()) {
            setSuggestions([]);
            setIsOpen(false);
            return;
        }

        const fetchSuggestions = async () => {
            setIsLoading(true);
            try {
                // Using the existing endpoint structure - fetch 5 results for navbar
                const res = await fetch(`/search-suggestions?q=${encodeURIComponent(debouncedQuery)}&limit=5`);
                if (res.ok) {
                    const data = await res.json();
                    setSuggestions(data);
                    setIsOpen(true);
                }
            } catch (error) {
                console.error("Search error:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSuggestions();
    }, [debouncedQuery]);

    const handleViewAll = () => {
        // Redirect to tienda with search query autocompleted
        router.get('/tienda', { search: query });
        setIsOpen(false);
        onClose?.();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            handleViewAll();
        }
    };

    return (
        <div ref={containerRef} className={cn("relative w-full", className)}>
            <form onSubmit={handleSubmit} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar productos..."
                    className="pl-9 pr-10 h-10 bg-muted/40 border-primary/20 focus-visible:ring-primary/20 transition-all focus:bg-background"
                    autoFocus={autoFocus}
                    onFocus={() => {
                        if (suggestions.length > 0) setIsOpen(true);
                    }}
                />
                {query && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-10 w-10 hover:bg-transparent"
                        onClick={() => {
                            setQuery('');
                            setSuggestions([]);
                            setIsOpen(false);
                        }}
                    >
                        <X className="h-4 w-4 text-muted-foreground" />
                    </Button>
                )}
            </form>

            {/* Suggestions Dropdown */}
            {isOpen && (suggestions.length > 0 || isLoading) && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-popover/95 backdrop-blur-md text-popover-foreground rounded-xl border shadow-xl overflow-hidden z-[60] animate-in fade-in slide-in-from-top-2 max-h-[60vh] md:max-h-[50vh] overflow-y-auto">
                    {isLoading ? (
                        <div className="p-4 flex items-center justify-center text-muted-foreground">
                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                            <span className="text-sm">Buscando...</span>
                        </div>
                    ) : (
                        suggestions.length > 0 ? (
                            <div className="py-1 max-h-[60vh] overflow-y-auto custom-scrollbar">
                                <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Sugerencias
                                </div>
                                {suggestions.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => {
                                            router.get(`/tienda/${item.id}`);
                                            setIsOpen(false);
                                            onClose?.();
                                        }}
                                        className="w-full text-left px-3 py-2.5 hover:bg-muted/50 transition-colors flex items-center gap-3 group"
                                    >
                                        <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden border">
                                            {item.fotos && item.fotos[0] ? (
                                                <img src={`/storage/${item.fotos[0].url}`} alt={item.nombre} className="h-full w-full object-cover" />
                                            ) : (
                                                <ShoppingBag className="h-5 w-5 text-muted-foreground/50" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium group-hover:text-primary transition-colors truncate">
                                                {item.nombre}
                                            </p>
                                            <p className="text-xs text-muted-foreground font-black">
                                                Bs. {item.precio_1}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                                {suggestions.length > 0 && (
                                    <div className="border-t p-2 mt-1 bg-muted/30">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            className="w-full text-xs font-bold justify-center hover:bg-muted/60 h-9 text-primary"
                                            onClick={handleViewAll}
                                        >
                                            Ver todos los resultados
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ) : null
                    )}
                </div>
            )}
        </div>
    );
}
