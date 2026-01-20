import { useEffect, useRef, useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePage } from '@inertiajs/react';
import gsap from 'gsap';

interface WhatsAppButtonProps {
    productName?: string;
}

export function WhatsAppButton({ productName }: WhatsAppButtonProps) {
    const [isVisible, setIsVisible] = useState(false);
    const buttonRef = useRef<HTMLDivElement>(null);
    const { url } = usePage();

    useEffect(() => {
        // Show button after 3 seconds
        const timer = setTimeout(() => setIsVisible(true), 3000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (isVisible && buttonRef.current) {
            gsap.fromTo(
                buttonRef.current,
                {
                    scale: 0,
                    opacity: 0,
                    rotation: -180
                },
                {
                    scale: 1,
                    opacity: 1,
                    rotation: 0,
                    duration: 0.6,
                    ease: 'back.out(1.7)'
                }
            );

            // Subtle floating animation
            gsap.to(buttonRef.current, {
                y: -10,
                duration: 2,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut'
            });
        }
    }, [isVisible]);

    const handleClick = () => {
        const phone = '59169867332';
        let message = '¡Hola! Me interesa obtener más información';

        if (productName) {
            message = `¡Hola! Me interesa este producto: *${productName}*`;
        }

        const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    if (!isVisible) return null;

    return (
        <div
            ref={buttonRef}
            className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3"
        >
            <Button
                onClick={handleClick}
                size="lg"
                className="h-16 w-16 rounded-full shadow-2xl bg-green-500 hover:bg-green-600 text-white border-4 border-white dark:border-gray-900 transition-all hover:scale-110 active:scale-95 group relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <MessageCircle className="h-8 w-8 relative z-10 animate-pulse" />
            </Button>

            {/* Tooltip */}
            <div className="absolute right-20 bottom-4 bg-background border-2 border-primary/20 rounded-2xl px-4 py-2 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                <p className="font-black text-sm">¿Necesitas ayuda?</p>
                <p className="text-xs text-muted-foreground">Chatea con nosotros</p>
            </div>
        </div>
    );
}
