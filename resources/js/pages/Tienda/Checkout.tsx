import { Head, useForm, usePage } from '@inertiajs/react';
import PublicLayout from '@/layouts/public-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCart } from '@/hooks/use-cart';
import {
    CreditCard,
    Truck,
    User,
    Phone,
    MapPin,
    ShoppingBag,
    ArrowRight,
    CheckCircle2
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { type SharedData } from '@/types';
import gsap from 'gsap';

export default function Checkout() {
    const { items, subtotal, clearCart, formatPrice } = useCart();
    const { app_url } = usePage<SharedData & { app_url: string }>().props;
    const [isFinished, setIsFinished] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        nombre: '',
        ci: '',
        celular: '',
        departamento: '',
        provincia: '',
        productos: items.map(item => ({
            producto_id: item.id,
            cantidad: item.cantidad,
            precio_venta: item.precio
        }))
    });

    useEffect(() => {
        setData('productos', items.map(item => ({
            producto_id: item.id,
            cantidad: item.cantidad,
            precio_venta: item.precio
        })));
    }, [items]);

    const { flash } = usePage<SharedData & { flash: any }>().props;

    useEffect(() => {
        if (flash?.pedido_resultado) {
            const res = flash.pedido_resultado;
            setIsFinished(true);
            clearCart();
            toast.success(res.message || 'Pedido realizado con éxito');

            // Descarga automática si viene el PDF en base64
            if (res.pdf_base64) {
                try {
                    const linkSource = `data:application/pdf;base64,${res.pdf_base64}`;
                    const downloadLink = document.createElement("a");
                    const fileName = `pedido_${res.id}.pdf`;
                    downloadLink.href = linkSource;
                    downloadLink.download = fileName;
                    downloadLink.click();
                    toast.success('Descargando comprobante...');
                } catch (err) {
                    console.error('Error downloading PDF:', err);
                }
            }
        }
    }, [flash]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (items.length === 0) {
            toast.error('Tu carrito está vacío');
            return;
        }

        post('/cuadernos/pedidos', {
            preserveScroll: true,
            onError: (errors) => {
                console.error('Checkout errors:', errors);
                toast.error('Hubo un error al procesar tu pedido');
            }
        });
    };

    if (isFinished) {
        return (
            <PublicLayout>
                <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center text-center">
                    <div className="h-32 w-32 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-10 animate-bounce">
                        <CheckCircle2 className="h-16 w-16" />
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight">¡Pedido Confirmado!</h1>
                    <p className="text-xl text-muted-foreground max-w-lg mb-12 font-medium leading-relaxed">
                        Tu solicitud ha sido procesada con éxito. Un asesor de Miranda se pondrá en contacto contigo en breve para coordinar el envío.
                    </p>
                    <Button size="lg" className="h-20 px-12 rounded-[2rem] text-xl font-black shadow-2xl hover:scale-105 transition-transform" asChild>
                        <a href="/tienda">Volver al Catálogo</a>
                    </Button>
                </div>
            </PublicLayout>
        );
    }

    return (
        <PublicLayout>
            <Head title="Checkout | Finalizar Pedido" />

            <div className="container mx-auto px-4 py-8 md:py-16">
                <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-12">Finalizar Pedido</h1>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    {/* Form */}
                    <div className="lg:col-span-7 space-y-10">
                        <Card className="rounded-[3rem] border-4 border-border/50 shadow-2xl overflow-hidden bg-card/50 backdrop-blur-xl">
                            <CardHeader className="p-8 pb-4">
                                <CardTitle className="text-3xl font-black flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                        <User className="h-6 w-6" />
                                    </div>
                                    Tus Datos de Envío
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 pt-4">
                                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8" id="checkout-form">
                                    <div className="space-y-3 md:col-span-2">
                                        <Label htmlFor="nombre" className="text-sm font-black uppercase tracking-widest text-muted-foreground">Nombre Completo</Label>
                                        <Input
                                            id="nombre"
                                            value={data.nombre}
                                            onChange={e => setData('nombre', e.target.value)}
                                            placeholder="Ej. Juan Pérez"
                                            className="h-14 rounded-2xl border-2 text-lg px-6 font-medium"
                                            required
                                        />
                                        {errors.nombre && <p className="text-sm text-red-500 font-bold ml-2">{errors.nombre}</p>}
                                    </div>

                                    <div className="space-y-3">
                                        <Label htmlFor="ci" className="text-sm font-black uppercase tracking-widest text-muted-foreground">CI / NIT</Label>
                                        <Input
                                            id="ci"
                                            value={data.ci}
                                            onChange={e => setData('ci', e.target.value)}
                                            placeholder="Opcional"
                                            className="h-14 rounded-2xl border-2 text-lg px-6 font-medium"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <Label htmlFor="celular" className="text-sm font-black uppercase tracking-widest text-muted-foreground">Celular de contacto</Label>
                                        <Input
                                            id="celular"
                                            value={data.celular}
                                            onChange={e => setData('celular', e.target.value)}
                                            placeholder="70600000"
                                            className="h-14 rounded-2xl border-2 text-lg px-6 font-medium"
                                            required
                                        />
                                        {errors.celular && <p className="text-sm text-red-500 font-bold ml-2">{errors.celular}</p>}
                                    </div>

                                    <div className="space-y-3">
                                        <Label htmlFor="departamento" className="text-sm font-black uppercase tracking-widest text-muted-foreground">Departamento</Label>
                                        <Input
                                            id="departamento"
                                            value={data.departamento}
                                            onChange={e => setData('departamento', e.target.value)}
                                            placeholder="La Paz, SCZ..."
                                            className="h-14 rounded-2xl border-2 text-lg px-6 font-medium"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <Label htmlFor="provincia" className="text-sm font-black uppercase tracking-widest text-muted-foreground">Ciudad / Provincia</Label>
                                        <Input
                                            id="provincia"
                                            value={data.provincia}
                                            onChange={e => setData('provincia', e.target.value)}
                                            placeholder="Localidad específica"
                                            className="h-14 rounded-2xl border-2 text-lg px-6 font-medium"
                                            required
                                        />
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                { icon: Truck, title: 'Entrega en 24h', desc: 'Dentro del área urbana' },
                                { icon: ShoppingBag, title: 'Revisa al recibir', desc: 'Paga con seguridad total' }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-6 p-8 rounded-[2.5rem] bg-muted/30 border-2 border-border/50 hover:bg-muted/50 transition-colors">
                                    <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
                                        <item.icon className="h-7 w-7" />
                                    </div>
                                    <div className="flex flex-col justify-center">
                                        <p className="font-black text-xl leading-none mb-2">{item.title}</p>
                                        <p className="text-xs text-muted-foreground font-black  tracking-widest opacity-80">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="lg:col-span-5 checkout-animate">
                        <Card className="rounded-[3rem] border-4 border-primary/20 shadow-[0_20px_50px_rgba(0,0,0,0.1)] sticky top-32 overflow-hidden bg-card">
                            <div className="bg-primary p-8 text-primary-foreground">
                                <CardTitle className="text-3xl font-black flex items-center gap-4">
                                    <ShoppingBag className="h-8 w-8" />
                                    Tu Compra
                                </CardTitle>
                            </div>
                            <CardContent className="p-8 space-y-8">
                                <div className="space-y-6 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                                    {items.map((item) => (
                                        <div key={item.id} className="flex justify-between items-center group">
                                            <div className="flex gap-4 items-center">
                                                <div className="h-16 w-16 rounded-2xl bg-muted border-2 border-border/50 overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform">
                                                    {item.foto && <img src={`${app_url}/storage/${item.foto}`} className="w-full h-full object-cover" />}
                                                </div>
                                                <div>
                                                    <p className="font-black text-base line-clamp-1">{item.nombre}</p>
                                                    <p className="text-xs text-muted-foreground font-black uppercase tracking-tighter">
                                                        {item.cantidad} x {formatPrice(item.precio)}
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="font-black text-xl text-primary">{formatPrice(item.precio * item.cantidad)}</p>
                                        </div>
                                    ))}
                                    {items.length === 0 && (
                                        <div className="flex flex-col items-center py-12 space-y-4">
                                            <ShoppingBag className="h-12 w-12 text-muted-foreground opacity-20" />
                                            <p className="text-center text-muted-foreground font-black uppercase tracking-widest">Carrito vacío</p>
                                        </div>
                                    )}
                                </div>

                                <Separator className="h-1 bg-border/50 rounded-full" />

                                <div className="space-y-4">
                                    <div className="flex justify-between font-black text-lg">
                                        <span className="text-muted-foreground">Monto Bruto</span>
                                        <span>{formatPrice(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between font-black text-lg text-green-600">
                                        <span>Logística Miranda</span>
                                        <span className="uppercase text-sm tracking-widest">Sin costo</span>
                                    </div>
                                    <Separator className="h-1" />
                                    <div className="flex justify-between text-4xl font-black pt-4">
                                        <span>Inversión</span>
                                        <div className="flex flex-col items-end">
                                            <span className="text-primary leading-none">{formatPrice(subtotal)}</span>
                                            <span className="text-[10px] text-muted-foreground uppercase opacity-50 tracking-[0.2em] mt-1">Neto Final</span>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    form="checkout-form"
                                    type="submit"
                                    disabled={processing || items.length === 0}
                                    className="w-full h-24 rounded-[2rem] text-2xl font-black gap-4 shadow-3xl shadow-primary/30 mt-6 active:scale-95 transition-all group overflow-hidden relative"
                                >
                                    <div className="bg-white/10 absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                    <span className="relative z-10">{processing ? 'Procesando...' : 'Confirmar Pedido'}</span>
                                    <ArrowRight className="h-8 w-8 transition-transform group-hover:translate-x-3 relative z-10" />
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
