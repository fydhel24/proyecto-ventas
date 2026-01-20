import { useState, useEffect } from 'react';

export interface CartItem {
    id: number;
    nombre: string;
    precio: number;
    cantidad: number;
    foto?: string;
}

export function useCart() {
    const [items, setItems] = useState<CartItem[]>([]);

    // Cargar carrito al iniciar
    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            try {
                setItems(JSON.parse(savedCart));
            } catch (e) {
                console.error('Error parsing cart from localStorage', e);
            }
        }
    }, []);

    // Guardar carrito al cambiar
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(items));
    }, [items]);

    const addToCart = (product: any, cantidad: number = 1) => {
        setItems((prev) => {
            const existing = prev.find((item) => item.id === product.id);
            if (existing) {
                return prev.map((item) =>
                    item.id === product.id
                        ? { ...item, cantidad: item.cantidad + cantidad }
                        : item
                );
            }
            return [
                ...prev,
                {
                    id: product.id,
                    nombre: product.nombre,
                    precio: Number(product.precio_1),
                    cantidad,
                    foto: product.fotos?.[0]?.url,
                },
            ];
        });
    };

    const removeFromCart = (productId: number) => {
        setItems((prev) => prev.filter((item) => item.id !== productId));
    };

    const updateQuantity = (productId: number, cantidad: number) => {
        if (cantidad <= 0) {
            removeFromCart(productId);
            return;
        }
        setItems((prev) =>
            prev.map((item) =>
                item.id === productId ? { ...item, cantidad } : item
            )
        );
    };

    const clearCart = () => {
        setItems([]);
    };

    const subtotal = items.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
    const itemCount = items.reduce((acc, item) => acc + item.cantidad, 0);

    return {
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotal,
        itemCount,
    };
}
