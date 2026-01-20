import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Navbar } from '@/components/layout/Navbar'; // Ajusta la ruta
import { Footer } from '@/components/layout/Footer'; // Ajusta la ruta
import { Button } from '@/components/ui/button';

export default function Welcome({ canRegister = true }: { canRegister?: boolean }) {
    const { auth } = usePage<SharedData>().props;

    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-300">
            <Head title="Bienvenido a nuestra tienda" />
            
            <Navbar auth={auth} />

            <main className="flex-1">
              
            </main>

            <Footer />
        </div>
    );
}