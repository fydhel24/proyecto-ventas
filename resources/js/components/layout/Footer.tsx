import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    Facebook,
    Instagram,
    Mail,
    MapPin,
    Phone,
    Twitter,
    Utensils,
} from 'lucide-react';

export function Footer() {
    const { name } = usePage<SharedData>().props;

    return (
        <footer className="w-full border-t border-border/40 bg-card/30 pt-20 pb-12 backdrop-blur-sm">
            <div className="container mx-auto px-6">
                <div className="flex flex-col items-center text-center">
                    {/* Brand Identity - Centered */}
                    <div className="mb-12 flex flex-col items-center space-y-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 shadow-inner">
                            <Utensils className="h-8 w-8 text-primary transition-transform hover:scale-110" />
                        </div>
                        <div className="flex flex-col">
                            <h2 className="text-4xl leading-none font-black tracking-tighter uppercase italic">
                                {name}
                            </h2>
                            <span className="mt-1 text-[10px] font-bold tracking-[0.4em] text-muted-foreground uppercase">
                                Experiencia Gourmet
                            </span>
                        </div>
                        <p className="max-w-md text-sm leading-relaxed font-medium text-muted-foreground/80">
                            Fusión perfecta entre tradición culinaria e
                            innovación constante. Creamos momentos inolvidables
                            en cada platillo.
                        </p>
                    </div>

                    {/* Social Links - Premium Pills */}
                    <div className="mb-16 flex gap-3">
                        {[
                            { Icon: Facebook, label: 'Facebook' },
                            { Icon: Instagram, label: 'Instagram' },
                            { Icon: Twitter, label: 'Twitter' },
                            { Icon: Mail, label: 'Email' },
                        ].map(({ Icon, label }, i) => (
                            <a
                                key={i}
                                href="#"
                                aria-label={label}
                                className="group flex size-12 items-center justify-center rounded-2xl bg-muted/50 shadow-sm transition-all duration-300 hover:scale-110 hover:bg-primary hover:text-white"
                            >
                                <Icon className="size-5 transition-transform group-hover:rotate-6" />
                            </a>
                        ))}
                    </div>

                    {/* Navigation Grid - Balanced */}
                    <div className="mb-20 grid w-full grid-cols-2 gap-x-8 gap-y-12 md:grid-cols-3 lg:max-w-4xl">
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black tracking-[0.3em] text-primary uppercase">
                                Menú
                            </h3>
                            <ul className="space-y-4 text-sm font-bold tracking-wider uppercase">
                                <li>
                                    <Link
                                        href="/"
                                        className="transition-colors hover:text-primary"
                                    >
                                        Inicio
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/tienda"
                                        className="transition-colors hover:text-primary"
                                    >
                                        La Carta
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black tracking-[0.3em] text-primary uppercase">
                                Cliente
                            </h3>
                            <ul className="space-y-4 text-sm font-bold tracking-wider uppercase">
                                <li>
                                    <Link
                                        href="/tienda/checkout"
                                        className="transition-colors hover:text-primary"
                                    >
                                        Mi Reserva
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/login"
                                        className="transition-colors hover:text-primary"
                                    >
                                        Ingresar
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        <div className="col-span-2 space-y-6 md:col-span-1">
                            <h3 className="text-[10px] font-black tracking-[0.3em] text-primary uppercase">
                                Ubicación
                            </h3>
                            <div className="flex flex-col items-center gap-2 text-sm font-medium text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <MapPin className="size-4 text-primary" />
                                    <span>Bolivia - Santa Cruz</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="size-4 text-primary" />
                                    <span>+591 700 00000</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Subscription Section - Premium Card */}
                    <div className="relative mb-20 w-full max-w-2xl overflow-hidden rounded-[3rem] border-2 border-border/50 bg-muted/40 p-1">
                        <div className="rounded-[2.8rem] bg-card/80 p-10 backdrop-blur-md">
                            <div className="mb-8 space-y-2">
                                <h3 className="text-2xl font-black tracking-tight uppercase italic">
                                    Únete al club{' '}
                                    <span className="text-primary">
                                        Miracode
                                    </span>
                                </h3>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Sé el primero en conocer nuestros eventos
                                    exclusivos y lanzamientos de temporada.
                                </p>
                            </div>
                            <div className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row">
                                <input
                                    type="email"
                                    placeholder="correo@ejemplo.com"
                                    className="h-12 flex-1 rounded-2xl border-transparent bg-muted/50 px-6 text-sm font-medium transition-all focus:border-primary/50 focus:bg-background focus:ring-4 focus:ring-primary/10 focus:outline-none"
                                />
                                <Button className="h-12 rounded-2xl bg-primary px-8 font-black tracking-widest uppercase shadow-lg shadow-primary/20 transition-all hover:scale-105 hover:bg-primary/90 active:scale-95">
                                    Suscribirme
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <Separator className="mb-10 bg-border/40" />

                {/* Bottom Bar */}
                <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
                    <p className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">
                        © {new Date().getFullYear()} {name} Gourmet · Sabor &
                        Tecnología
                    </p>
                    <div className="flex gap-8 text-[10px] font-black tracking-[0.2em] text-muted-foreground uppercase">
                        <a
                            href="#"
                            className="transition-colors hover:text-primary"
                        >
                            Privacidad
                        </a>
                        <a
                            href="#"
                            className="transition-colors hover:text-primary"
                        >
                            Términos
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
