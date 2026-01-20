import { type ReactNode } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Toaster } from '@/components/ui/sonner';
import { WhatsAppButton } from '@/components/shop/WhatsAppButton';
import { usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';

interface PublicLayoutProps {
    children: ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
    const { auth } = usePage<SharedData>().props;

    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary/20">
            <Navbar auth={auth} />
            <main className="flex-1 pt-20 relative z-0">
                {children}
            </main>
            <Footer />
            <Toaster position="top-center" offset="100px" />
            <WhatsAppButton />
        </div>
    );
}
