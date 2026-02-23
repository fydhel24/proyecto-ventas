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
        <footer className="w-full border-t border-border/40 bg-card/50 pt-20 pb-12 backdrop-blur-md">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-4 lg:gap-8">
                    {/* Brand Identity & Socials */}
                    <div className="flex flex-col space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 shadow-inner">
                                <Utensils className="h-6 w-6 text-primary" />
                            </div>
                            <div className="flex flex-col leading-none">
                                <h2 className="text-2xl font-black tracking-tighter uppercase italic">
                                    {name}
                                </h2>
                                <span className="mt-0.5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">
                                    Miracode Gourmet
                                </span>
                            </div>
                        </div>
                        <p className="max-w-xs text-sm leading-relaxed font-medium text-muted-foreground/80">
                            Excelencia en cada ingrediente. Disfruta de la mejor
                            experiencia gastronómica de Santa Cruz ahora en tu
                            mesa.
                        </p>
                        <div className="flex gap-3 pt-2">
                            {[
                                { Icon: Facebook, label: 'Facebook' },
                                { Icon: Instagram, label: 'Instagram' },
                                { Icon: Twitter, label: 'Twitter' },
                            ].map(({ Icon, label }, i) => (
                                <a
                                    key={i}
                                    href="#"
                                    aria-label={label}
                                    className="flex size-10 items-center justify-center rounded-xl bg-muted/50 text-muted-foreground shadow-sm transition-all duration-300 hover:scale-110 hover:bg-primary hover:text-white"
                                >
                                    <Icon className="size-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Menu - Menu Section */}
                    <div className="flex flex-col space-y-6 lg:pl-8">
                        <h3 className="text-[11px] font-black tracking-[0.25em] text-primary uppercase">
                            Explora la Carta
                        </h3>
                        <ul className="space-y-4 text-sm font-bold tracking-tight uppercase">
                            <li>
                                <Link
                                    href="/"
                                    className="group flex items-center gap-2 transition-colors hover:text-primary"
                                >
                                    <div className="h-1 w-0 bg-primary transition-all group-hover:w-3" />
                                    Inicio
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/tienda"
                                    className="group flex items-center gap-2 transition-colors hover:text-primary"
                                >
                                    <div className="h-1 w-0 bg-primary transition-all group-hover:w-3" />
                                    La Carta
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support / Client Section */}
                    <div className="flex flex-col space-y-6">
                        <h3 className="text-[11px] font-black tracking-[0.25em] text-primary uppercase">
                            Tu Reserva
                        </h3>
                        <ul className="space-y-4 text-sm font-bold tracking-tight uppercase">
                            <li>
                                <Link
                                    href="/tienda/checkout"
                                    className="group flex items-center gap-2 transition-colors hover:text-primary"
                                >
                                    <div className="h-1 w-0 bg-primary transition-all group-hover:w-3" />
                                    Mi Reserva
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/login"
                                    className="group flex items-center gap-2 transition-colors hover:text-primary"
                                >
                                    <div className="h-1 w-0 bg-primary transition-all group-hover:w-3" />
                                    Acceso Sistema
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter & Contact */}
                    <div className="flex flex-col space-y-6">
                        <h3 className="text-[11px] font-black tracking-[0.25em] text-primary uppercase">
                            Suscríbete
                        </h3>
                        <div className="space-y-4">
                            <p className="text-xs font-medium text-muted-foreground">
                                Recibe ofertas exclusivas y novedades de nuestro
                                menú semanal.
                            </p>
                            <div className="flex flex-col gap-2">
                                <div className="relative">
                                    <Mail className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <input
                                        type="email"
                                        placeholder="Tu correo"
                                        className="h-11 w-full rounded-xl border-border/50 bg-muted/30 pr-4 pl-10 text-xs font-medium transition-all focus:border-primary/50 focus:bg-background focus:ring-4 focus:ring-primary/10 focus:outline-none"
                                    />
                                </div>
                                <Button className="h-11 w-full rounded-xl bg-primary text-xs font-black tracking-widest uppercase shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
                                    Unirme ahora
                                </Button>
                            </div>
                        </div>
                        <div className="flex flex-col space-y-3 pt-2">
                            <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground">
                                <MapPin className="size-4 shrink-0 text-primary" />
                                <span>Equipetrol Sur, Santa Cruz - BO</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground">
                                <Phone className="size-4 shrink-0 text-primary" />
                                <span>+591 700 88221</span>
                            </div>
                        </div>
                    </div>
                </div>

                <Separator className="my-12 bg-border/40" />

                {/* Bottom Bar */}
                <div className="flex flex-col items-center justify-between gap-6 text-start md:flex-row lg:items-end">
                    <div className="flex flex-col gap-1">
                        <p className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">
                            © {new Date().getFullYear()} {name} Gourmet
                        </p>
                        <p className="text-[9px] font-medium tracking-widest text-muted-foreground/60 uppercase">
                            Desarrollado con precisión por Miracode Tech
                        </p>
                    </div>
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
