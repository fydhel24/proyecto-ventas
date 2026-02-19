import { useState, useEffect } from 'react';

export interface CartItem {
    id: number;
    nombre: string;
    precio: number;
    cantidad: number;
    foto?: string;
}

// Singleton state for global synchronization
let globalCart: CartItem[] = [];
let globalWishlist: number[] = [];
const listeners = new Set<() => void>();

const notify = () => listeners.forEach((l) => l());

// Initialize from localStorage once
if (typeof window !== 'undefined') {
    const savedCart = localStorage.getItem('cart');
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedCart) {
        try { globalCart = JSON.parse(savedCart); } catch (e) { console.error(e); }
    }
    if (savedWishlist) {
        try { globalWishlist = JSON.parse(savedWishlist); } catch (e) { console.error(e); }
    }
}

export function useCart() {
    const [items, setItems] = useState<CartItem[]>(globalCart);
    const [wishlist, setWishlist] = useState<number[]>(globalWishlist);

    useEffect(() => {
        const update = () => {
            setItems([...globalCart]);
            setWishlist([...globalWishlist]);
        };
        listeners.add(update);
        return () => {
            listeners.delete(update);
        };
    }, []);

    const save = (newItems: CartItem[]) => {
        globalCart = newItems;
        localStorage.setItem('cart', JSON.stringify(newItems));
        notify();
    };

    const saveWishlist = (newWishlist: number[]) => {
        globalWishlist = newWishlist;
        localStorage.setItem('wishlist', JSON.stringify(newWishlist));
        notify();
    };

    const addToCart = (product: any, cantidad: number = 1) => {
        const existing = globalCart.find((item) => item.id === product.id);
        if (existing) {
            save(globalCart.map((item) =>
                item.id === product.id
                    ? { ...item, cantidad: item.cantidad + cantidad }
                    : item
            ));
        } else {
            save([
                ...globalCart,
                {
                    id: product.id,
                    nombre: product.nombre,
                    precio: Number(product.precio_venta || product.precio_1 || 0),
                    cantidad,
                    foto: product.fotos?.[0]?.url,
                },
            ]);
        }
    };

    const removeFromCart = (productId: number) => {
        save(globalCart.filter((item) => item.id !== productId));
    };

    const updateQuantity = (productId: number, cantidad: number) => {
        if (cantidad <= 0) {
            removeFromCart(productId);
            return;
        }
        save(globalCart.map((item) =>
            item.id === productId ? { ...item, cantidad } : item
        ));
    };

    const clearCart = () => {
        save([]);
    };

    const toggleWishlist = (productId: number) => {
        if (globalWishlist.includes(productId)) {
            saveWishlist(globalWishlist.filter(id => id !== productId));
        } else {
            saveWishlist([...globalWishlist, productId]);
        }
    };

    const subtotal = items.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
    const itemCount = items.reduce((acc, item) => acc + item.cantidad, 0);

    const formatPrice = (price: number) => {
        return `Bs. ${Number(price).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    return {
        items,
        wishlist,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleWishlist,
        isInWishlist: (productId: number) => wishlist.includes(productId),
        subtotal,
        itemCount,
        formatPrice,
    };
}
