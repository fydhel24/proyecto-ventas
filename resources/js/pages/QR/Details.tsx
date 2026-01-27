import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import {
    CheckCircle2,
    User,
    Phone,
    CreditCard,
    Calendar,
    Package,
    AlertCircle,
    ShoppingBag,
    QrCode,
    Camera,
    Upload,
    ArrowLeft,
    RefreshCcw
} from 'lucide-react';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import { toast } from 'sonner';
import PublicLayout from '@/layouts/public-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Producto {
    id: number;
    nombre: string;
    descripcion: string;
    pivot: {
        cantidad: number;
        precio_venta: number;
    };
}

interface Imagen {
    id: number;
    url: string;
    pivot: {
        tipo: string;
        cantidad: number;
    };
}

interface Cuaderno {
    id: number;
    nombre: string;
    ci: string;
    celular: string;
    detalle: string;
    status: string;
    created_at: string;
    productos: Producto[];
    imagenes: Imagen[];
}

export default function Details({ cuaderno }: { cuaderno: Cuaderno | null }) {
    const [isScanning, setIsScanning] = useState(false);

    // Auto-calculate total if cuaderno exists
    const total = cuaderno ? cuaderno.productos.reduce((acc, p) => acc + (p.pivot.cantidad * p.pivot.precio_venta), 0) : 0;

    const formattedDate = cuaderno ? new Date(cuaderno.created_at).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }) : '';

    const getImageUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        return `/storage/${url}`;
    };

    // Function to handle successful QR scan
    const handleScanSuccess = (decodedText: string) => {
        try {
            // Check if it's a URL and contains our params
            const url = new URL(decodedText);
            const params = new URLSearchParams(url.search);

            if (params.has('id') && params.has('ci') && params.has('celular')) {
                toast.success('¡Código escaneado con éxito!');
                // Redirect using Inertia router
                router.get('/qr', {
                    id: params.get('id'),
                    ci: params.get('ci'),
                    celular: params.get('celular')
                });
            } else {
                toast.error('El código QR no es válido para este sistema.');
            }
        } catch (e) {
            toast.error('No se pudo leer el código QR.');
        }
    };

    // Initialize scanner for camera
    useEffect(() => {
        let scanner: Html5QrcodeScanner | null = null;

        if (isScanning && !cuaderno) {
            scanner = new Html5QrcodeScanner(
                "reader",
                { fps: 10, qrbox: { width: 250, height: 250 }, rememberLastUsedCamera: true },
                /* verbose= */ false
            );

            scanner.render(handleScanSuccess, (error) => {
                // Ignore errors as they happen constantly during scanning
            });
        }

        return () => {
            if (scanner) {
                scanner.clear().catch(error => console.error("Failed to clear scanner", error));
            }
        };
    }, [isScanning, cuaderno]);

    // Handle file upload scanning
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const html5QrCode = new Html5Qrcode("reader-file");
            try {
                const decodedText = await html5QrCode.scanFile(file, true);
                handleScanSuccess(decodedText);
            } catch (err) {
                toast.error('No se encontró un código QR en la imagen.');
            }
        }
    };

    if (!cuaderno) {
        return (
            <PublicLayout>
                <div className="min-h-screen bg-background pb-12">
                    <Head title="Escanear Pedido - Miracode" />

                    <div className="relative pt-16 pb-32 px-6 text-center overflow-hidden">
                        <div className="absolute top-0 right-0 -z-10 h-[300px] w-[300px] bg-primary/10 blur-[100px] rounded-full opacity-50" />
                        <div className="max-w-md mx-auto relative z-10">
                            <h1 className="text-4xl font-black tracking-tight mb-4">Verificador de Pedidos</h1>
                            <p className="text-muted-foreground font-medium">Escanea el código QR de tu nota de entrega para ver los detalles.</p>
                        </div>
                    </div>

                    <div className="max-w-md mx-auto -mt-16 px-6 relative z-20">
                        <Card className="rounded-[2.5rem] shadow-2xl border-border p-8 bg-card text-card-foreground">
                            {!isScanning ? (
                                <div className="space-y-6">
                                    <div className="text-center py-10">
                                        <div className="w-24 h-24 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                                            <QrCode className="w-12 h-12" />
                                        </div>
                                        <h3 className="text-xl font-black mb-2">Selecciona un método</h3>
                                        <p className="text-muted-foreground font-bold text-sm">¿Cómo deseas escanear el código?</p>
                                    </div>

                                    <Button
                                        onClick={() => setIsScanning(true)}
                                        className="w-full h-16 rounded-2xl flex items-center justify-center gap-4 font-black transition-all hover:scale-[1.02] text-lg"
                                    >
                                        <Camera className="w-6 h-6" />
                                        Usar Cámara
                                    </Button>

                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <span className="w-full border-t border-border"></span>
                                        </div>
                                        <div className="relative flex justify-center text-xs font-black uppercase tracking-widest text-muted-foreground">
                                            <span className="bg-card px-4 italic">o también</span>
                                        </div>
                                    </div>

                                    <label className="w-full bg-transparent border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 text-muted-foreground h-16 rounded-2xl flex items-center justify-center gap-4 font-black transition-all cursor-pointer group">
                                        <Upload className="w-6 h-6 group-hover:text-primary" />
                                        <span className="group-hover:text-foreground">Subir Imagen QR</span>
                                        <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                                    </label>

                                    <div id="reader-file" className="hidden"></div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <Button
                                            variant="ghost"
                                            onClick={() => setIsScanning(false)}
                                            className="text-muted-foreground hover:text-foreground font-black text-sm flex items-center gap-2 p-0 h-auto"
                                        >
                                            <ArrowLeft className="w-4 h-4" /> Volver
                                        </Button>
                                        <span className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div> Escaneando...
                                        </span>
                                    </div>

                                    <div className="relative overflow-hidden rounded-2xl border-4 border-muted shadow-inner bg-slate-950 aspect-square flex items-center justify-center">
                                        <div id="reader" className="w-full h-full"></div>

                                        {/* Overlay for "Scanning" state before library loads */}
                                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center animate-pulse">
                                            <Camera className="w-12 h-12 text-white opacity-20" />
                                        </div>

                                        {/* Custom CSS to force library to fill container */}
                                        <style dangerouslySetInnerHTML={{
                                            __html: `
                                            #reader { border: none !important; }
                                            #reader video { 
                                                object-fit: cover !important; 
                                                width: 100% !important; 
                                                height: 100% !important; 
                                                border-radius: 12px;
                                            }
                                            #reader__scan_region {
                                                width: 100% !important;
                                                height: 100% !important;
                                            }
                                            #reader__dashboard { display: none !important; }
                                            #reader__status_span { display: none !important; }
                                        `}} />
                                    </div>

                                    <p className="text-center text-xs font-bold text-muted-foreground px-4 leading-relaxed">
                                        Enfoca el código QR que se encuentra en la parte inferior de tu nota de entrega.
                                    </p>
                                </div>
                            )}
                        </Card>

                        <div className="mt-12 text-center pb-8 opacity-50">
                            <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.4em] mb-4">MiraCode</p>
                            <div className="flex justify-center gap-6">
                                <div className="w-4 h-1 bg-muted-foreground rounded-full"></div>
                                <div className="w-4 h-1 bg-muted-foreground rounded-full"></div>
                                <div className="w-4 h-1 bg-muted-foreground rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </PublicLayout>
        );
    }

    return (
        <PublicLayout>
            <div className="min-h-screen bg-background pb-12">
                <Head title={`Pedido #${cuaderno.id} - Miracode`} />

                {/* Header / Hero */}
                <div className="relative pt-12 pb-24 px-6 overflow-hidden">
                    <div className="absolute top-0 right-0 -z-10 h-[300px] w-[300px] bg-primary/10 blur-[100px] rounded-full opacity-50" />
                    <div className="absolute bottom-0 left-0 -z-10 h-[250px] w-[250px] bg-blue-500/10 blur-[100px] rounded-full opacity-30" />

                    <div className="max-w-md mx-auto relative z-10 flex flex-col items-center text-center">
                        <div className="w-20 h-20 bg-primary/10 text-primary rounded-3xl flex items-center justify-center shadow-2xl mb-6 animate-in zoom-in duration-500 border border-primary/20">
                            <CheckCircle2 className="w-10 h-10" />
                        </div>
                        <h1 className="text-4xl font-black tracking-tight mb-2">Pedido Verificado</h1>
                        <p className="text-muted-foreground font-medium italic">Comprobante oficial de Miracode Store</p>
                    </div>
                </div>

                {/* Content Container */}
                <div className="max-w-lg mx-auto -mt-16 px-6 relative z-20">
                    {/* Main Info Card */}
                    <Card className="rounded-[2.5rem] shadow-xl border-border overflow-hidden mb-6 bg-card text-card-foreground">
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground block mb-1">ID Seguimiento</span>
                                    <h2 className="text-3xl font-black">#{cuaderno.id}</h2>
                                </div>
                                <div className="bg-primary/10 text-primary px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider border border-primary/20">
                                    {cuaderno.status || 'Completado'}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center">
                                        <User className="text-muted-foreground w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Cliente</p>
                                        <p className="font-bold leading-tight">{cuaderno.nombre}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center">
                                            <CreditCard className="text-muted-foreground w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">C.I.</p>
                                            <p className="font-bold">{cuaderno.ci}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center">
                                            <Phone className="text-muted-foreground w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Celular</p>
                                            <p className="font-bold">{cuaderno.celular}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center">
                                        <Calendar className="text-muted-foreground w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Fecha de Registro</p>
                                        <p className="font-bold">{formattedDate}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-muted/50 p-8 border-t border-border">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Total Pagado</span>
                                <span className="text-4xl font-black text-primary tracking-tighter">Bs. {total.toFixed(2)}</span>
                            </div>
                        </div>
                    </Card>

                    {/* Items Card */}
                    <Card className="rounded-[2.5rem] shadow-xl border-border overflow-hidden mb-6 bg-card text-card-foreground">
                        <div className="p-8">
                            <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                                <Package className="text-primary w-6 h-6" />
                                Productos en Pedido
                            </h3>

                            <div className="space-y-6">
                                {cuaderno.productos.map((prod) => (
                                    <div key={prod.id} className="flex justify-between items-center group">
                                        <div className="flex gap-4 items-center">
                                            <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center font-black text-muted-foreground/50 border border-border">
                                                {prod.pivot.cantidad}x
                                            </div>
                                            <div>
                                                <p className="font-bold group-hover:text-primary transition-colors">{prod.nombre}</p>
                                                <p className="text-xs font-bold text-muted-foreground">Bs. {prod.pivot.precio_venta}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black">Bs. {(prod.pivot.cantidad * prod.pivot.precio_venta).toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>

                    {/* Images Section if any */}
                    {cuaderno.imagenes && cuaderno.imagenes.length > 0 && (
                        <Card className="rounded-[2.5rem] shadow-xl border-border overflow-hidden mb-6 p-8 bg-card text-card-foreground">
                            <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                                <ShoppingBag className="text-primary w-6 h-6" />
                                Galería de Productos
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                {cuaderno.imagenes.map((img) => (
                                    <div key={img.id} className="aspect-square relative rounded-2xl overflow-hidden border border-border shadow-sm group bg-muted">
                                        <img
                                            src={getImageUrl(img.url)}
                                            alt="Prod"
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        <div className="absolute bottom-2 left-2 right-2 bg-background/80 backdrop-blur px-2 py-1 rounded-lg border border-border/50">
                                            <p className="text-[10px] font-black uppercase text-muted-foreground truncate">{img.pivot.tipo}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    {/* Detail Section */}
                    {cuaderno.detalle && (
                        <div className="bg-primary/5 rounded-[2rem] border border-primary/10 p-8 flex gap-4 mb-6">
                            <AlertCircle className="w-6 h-6 text-primary shrink-0" />
                            <div>
                                <h4 className="font-black text-primary uppercase text-[10px] tracking-widest mb-1">Observaciones</h4>
                                <p className="text-sm font-medium leading-relaxed">{cuaderno.detalle}</p>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="space-y-4">
                        <Button
                            variant="outline"
                            onClick={() => router.get('/qr')}
                            className="w-full h-14 rounded-2xl flex items-center justify-center gap-3 font-black transition-all hover:bg-muted shadow-sm border-2 text-lg"
                        >
                            <RefreshCcw className="w-5 h-5" />
                            Escanear otro Código
                        </Button>
                    </div>

                    {/* Footer */}
                    <div className="mt-12 text-center pb-8">
                        <p className="text-muted-foreground text-xs font-bold uppercase tracking-[0.3em]">Miracode Store &copy; 2026</p>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
