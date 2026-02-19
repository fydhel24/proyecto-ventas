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
        <footer className="w-full border-t-4 border-[var(--theme-primary)]/20 bg-card pt-20 pb-10">
            <div className="container mx-auto px-6">
                <div className="mb-20 grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
                    {/* Brand Info */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <Utensils className="size-8 text-[var(--theme-primary)]" />
                            <h2 className="text-3xl font-black tracking-tighter uppercase italic">
                                {name}
                            </h2>
                        </div>
                        <p className="leading-relaxed font-medium text-muted-foreground">
                            Una experiencia gastronómica que combina la
                            tradición con la innovación en el corazón de la
                            ciudad.
                        </p>
                        <div className="flex gap-4">
                            {[Facebook, Instagram, Twitter].map((Icon, i) => (
                                <a
                                    key={i}
                                    href="#"
                                    className="flex size-10 items-center justify-center rounded-full bg-muted shadow-sm transition-all hover:bg-[var(--theme-primary)] hover:text-white"
                                >
                                    <Icon className="size-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Menu */}
                    <div>
                        <h3 className="mb-8 text-xs font-black tracking-[0.3em] text-[var(--theme-primary)] uppercase">
                            Explora
                        </h3>
                        <ul className="space-y-4 font-bold">
                            <li>
                                <Link
                                    href="/"
                                    className="transition-colors hover:text-[var(--theme-primary)]"
                                >
                                    Inicio
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/tienda"
                                    className="transition-colors hover:text-[var(--theme-primary)]"
                                >
                                    Nuestra Carta
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/reservas"
                                    className="transition-colors hover:text-[var(--theme-primary)]"
                                >
                                    Reservar Mesa
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/promociones"
                                    className="transition-colors hover:text-[var(--theme-primary)]"
                                >
                                    Promociones
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="mb-8 text-xs font-black tracking-[0.3em] text-[var(--theme-primary)] uppercase">
                            Contacto
                        </h3>
                        <ul className="space-y-4 font-medium text-muted-foreground">
                            <li className="flex items-start gap-3">
                                <MapPin className="size-5 flex-shrink-0 text-[var(--theme-primary)]" />
                                <span>
                                    Av. Principal 456, Santa Cruz - Bolivia
                                </span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="size-5 flex-shrink-0 text-[var(--theme-primary)]" />
                                <span>+591 700 00000</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="size-5 flex-shrink-0 text-[var(--theme-primary)]" />
                                <span>hola@miracode.com</span>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter / CTA */}
                    <div className="space-y-6 rounded-[2.5rem] border-2 bg-muted/50 p-8">
                        <h3 className="text-xl font-black uppercase italic">
                            ¿Quieres ser el primero?
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Suscríbete para recibir eventos exclusivos y nuevas
                            creaciones de nuestro chef.
                        </p>
                        <div className="flex flex-col gap-3">
                            <input
                                type="email"
                                placeholder="Tu correo electrónico"
                                className="h-12 w-full rounded-2xl border-2 bg-background px-4 text-sm font-medium transition-colors focus:border-[var(--theme-primary)] focus:outline-none"
                            />
                            <Button className="h-12 w-full rounded-2xl bg-[var(--theme-primary)] font-black uppercase transition-transform hover:scale-105">
                                SUSCRIBIRME
                            </Button>
                        </div>
                    </div>
                </div>

                <Separator className="mb-10 bg-border/50" />

                <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
                    <p className="text-sm font-bold tracking-widest text-muted-foreground uppercase">
                        © {new Date().getFullYear()} {name} Gourmet. All rights
                        reserved.
                    </p>
                    <div className="flex gap-8 text-xs font-black tracking-widest text-muted-foreground uppercase">
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
