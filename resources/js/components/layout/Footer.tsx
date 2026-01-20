import { Link } from '@inertiajs/react'; // <--- ESTA ES LA LÍNEA QUE FALTA
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Footer() {
  return (
    <footer className="w-full border-t bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <h3 className="text-lg font-bold font-sans">Sobre Nosotros</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Tu tienda de confianza con los mejores productos del mercado.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold font-sans">Enlaces Rápidos</h3>
            <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
              {/* Ahora Link funcionará correctamente */}
              <li><Link href="/faq" className="hover:text-primary transition-colors">Preguntas Frecuentes</Link></li>
              <li><Link href="/envios" className="hover:text-primary transition-colors">Envíos</Link></li>
              <li><Link href="/contacto" className="hover:text-primary transition-colors">Contacto</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold font-sans">Newsletter</h3>
            <p className="mb-2 text-xs text-muted-foreground">Recibe ofertas exclusivas.</p>
            <div className="mt-2 flex gap-2">
              <Input placeholder="tu@email.com" className="h-9" />
              <Button size="sm">Suscribirse</Button>
            </div>
          </div>
        </div>
        <Separator className="my-8" />
        <p className="text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Mi Tienda Inc. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}