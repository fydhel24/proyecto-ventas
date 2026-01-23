import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Upload, User, CheckCircle, Image as ImageIcon, FileText, ShoppingBag, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import PublicLayout from '@/layouts/public-layout';

interface ProductImage {
    file: File;
    quantity: number;
}

interface PedidosCreateProps {
    // No props needed now
}

// Data for Departments and Provinces
const DEPARTAMENTOS: Record<string, string[]> = {
    "La Paz": ["Murillo", "Omasuyos", "Pacajes", "Camacho", "Muñecas", "Larecaja", "Franz Tamayo", "Ingavi", "Loayza", "Inquisivi", "Sud Yungas", "Los Andes", "Aroma", "Nor Yungas", "Abel Iturralde", "Bautista Saavedra", "Manco Kapac", "Gualberto Villarroel", "Gral. José Manuel Pando", "Caranavi"],
    "Cochabamba": ["Arani", "Arque", "Ayopaya", "Bolívar", "Campero", "Capinota", "Cercado", "Carrasco", "Chapare", "Esteban Arce", "Germán Jordán", "Mizque", "Punata", "Quillacollo", "Tapacarí", "Tiraque"],
    "Santa Cruz": ["Andrés Ibáñez", "Ignacio Warnes", "José Miguel de Velasco", "Ichilo", "Chiquitos", "Sara", "Cordillera", "Vallegrande", "Florida", "Obispo Santistevan", "Ñuflo de Chávez", "Ángel Sandoval", "Manuel María Caballero", "Germán Busch", "Guarayos"],
    "Oruro": ["Cercado", "Eduardo Abaroa", "Carangas", "Sajama", "Litoral", "Poopó", "Pantaleón Dalence", "Ladislao Cabrera", "Atahuallpa", "Saucari", "Tomás Barrón", "Sur Carangas", "San Pedro de Totora", "Sebastián Pagador", "Mejillones", "Nor Carangas"],
    "Potosí": ["Tomás Frías", "Rafael Bustillo", "Cornelio Saavedra", "Chayanta", "Charcas", "Nor Chichas", "Alonzo de Ibáñez", "Sud Chichas", "Nor Lípez", "Sud Lípez", "Linares", "Antonio Quijarro", "Gral. Bernardino Bilbao", "Daniel Campos", "Modesto Omiste", "Enrique Baldivieso"],
    "Chuquisaca": ["Oropeza", "Azurduy", "Zudáñez", "Tomina", "Hernando Siles", "Yamparáez", "Nor Cinti", "Sud Cinti", "Belisario Boeto", "Luis Calvo"],
    "Tarija": ["Cercado", "Aniceto Arce", "Gran Chaco", "Avilés", "Méndez", "Burnet O'Connor"],
    "Beni": ["Cercado", "Vaca Díez", "Gral. José Ballivián", "Yacuma", "Moxos", "Marbán", "Mamoré", "Iténez"],
    "Pando": ["Nicolás Suárez", "Manuripi", "Madre de Dios", "Abuná", "Gral. Federico Román"]
};

// Zod Schema
const formSchema = z.object({
    nombre: z.string().min(1, 'El nombre es obligatorio'),
    ci: z.string().min(1, 'El CI/NIT es obligatorio'),
    celular: z.string().min(1, 'El celular es obligatorio'),
    departamento: z.string().min(1, 'Selecciona un departamento'),
    provincia: z.string().min(1, 'La provincia es obligatoria'),
});

export default function Create() {
    const [productImages, setProductImages] = useState<ProductImage[]>([]);
    const [receiptImages, setReceiptImages] = useState<File[]>([]);
    const [productImagesError, setProductImagesError] = useState<string | null>(null);
    const [receiptImagesError, setReceiptImagesError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [orderId, setOrderId] = useState<number | null>(null);
    const [serverError, setServerError] = useState<string | null>(null);

    // Form setup
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nombre: '',
            ci: '',
            celular: '',
            departamento: '',
            provincia: '',
        },
    });

    const watchDepartamento = form.watch("departamento");
    const provinces = watchDepartamento ? DEPARTAMENTOS[watchDepartamento] || [] : [];

    // Reset provincia when departamento changes
    useEffect(() => {
        form.setValue('provincia', '');
    }, [watchDepartamento, form.setValue]);


    // Image Handlers
    const handleProductImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files).map(file => ({ file, quantity: 1 }));
            setProductImages([...productImages, ...newFiles]);
            setProductImagesError(null);
        }
    };

    const handleReceiptImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setReceiptImages([e.target.files[0]]);
            setReceiptImagesError(null);
        }
    };

    const updateProductQuantity = (index: number, quantity: number) => {
        const newImages = [...productImages];
        newImages[index].quantity = Math.max(1, quantity);
        setProductImages(newImages);
    };

    const removeProductImage = (index: number) => {
        const newImages = [...productImages];
        newImages.splice(index, 1);
        setProductImages(newImages);
    };

    const removeReceiptImage = (index: number) => {
        const newImages = [...receiptImages];
        newImages.splice(index, 1);
        setReceiptImages(newImages);
    };

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        let hasError = false;
        if (productImages.length === 0) {
            setProductImagesError('Debes adjuntar al menos una foto del producto.');
            hasError = true;
        }
        if (receiptImages.length === 0) {
            setReceiptImagesError('Debes adjuntar la foto de tu comprobante de pago.');
            hasError = true;
        }

        if (hasError) return;

        setSubmitting(true);
        setServerError(null);

        const formData = new FormData();
        formData.append('nombre', values.nombre);
        formData.append('ci', values.ci || '');
        formData.append('celular', values.celular);
        formData.append('departamento', values.departamento);
        formData.append('provincia', values.provincia);
        formData.append('detalle', '');
        formData.append('tipo', 'pedido_web');

        let globalIndex = 0;

        // Product Images
        productImages.forEach((item) => {
            formData.append(`imagenes[${globalIndex}]`, item.file);
            formData.append(`tipos_imagenes[${globalIndex}]`, 'producto');
            formData.append(`cantidades_imagenes[${globalIndex}]`, item.quantity.toString());
            globalIndex++;
        });

        // Receipt Images
        receiptImages.forEach((file) => {
            formData.append(`imagenes[${globalIndex}]`, file);
            formData.append(`tipos_imagenes[${globalIndex}]`, 'comprobante');
            formData.append(`cantidades_imagenes[${globalIndex}]`, '1');
            globalIndex++;
        });

        try {
            const response = await axios.post('/shoppedidos', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.pdf_base64) {
                const byteCharacters = atob(response.data.pdf_base64);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: 'application/pdf' });
                const url = window.URL.createObjectURL(blob);

                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `pedido-${response.data.id}.pdf`);
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);
            }

            setOrderId(response.data.id);
            setSuccess(true);
            form.reset();
            setProductImages([]);
            setReceiptImages([]);
        } catch (error: any) {
            console.error(error);
            if (error.response?.data?.message) {
                setServerError(error.response.data.message);
            } else {
                setServerError('Ocurrió un error al procesar el pedido.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (success) {
        return (
            <PublicLayout>
                <div className="min-h-screen bg-background flex items-center justify-center p-4">
                    <Card className="w-full max-w-md shadow-2xl border-primary/20 animate-in fade-in zoom-in duration-300 rounded-[2.5rem] bg-card text-card-foreground">
                        <CardHeader className="text-center pt-10">
                            <div className="w-20 h-20 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-12 h-12" />
                            </div>
                            <CardTitle className="text-3xl font-black">¡Pedido Enviado!</CardTitle>
                            <CardDescription className="text-muted-foreground font-medium mt-2">
                                Tu pedido <span className="text-primary font-black">#{orderId}</span> ha sido registrado correctamente en nuestro sistema. Te contactaremos pronto por WhatsApp.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex justify-center pb-10">
                            <Button onClick={() => setSuccess(false)} size="lg" className="rounded-2xl h-14 px-8 font-black text-lg">
                                Realizar otro pedido
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </PublicLayout>
        )
    }

    return (
        <PublicLayout>
            <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                <Head title="Realizar Pedido - Miracode Store" />

                {/* Fondo Decorativo */}
                <div className="absolute top-0 right-0 -z-10 h-[500px] w-[500px] bg-primary/5 blur-[120px] rounded-full opacity-50" />
                <div className="absolute bottom-0 left-0 -z-10 h-[400px] w-[400px] bg-blue-500/5 blur-[100px] rounded-full opacity-30" />

                <div className="max-w-xl mx-auto relative z-10">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-6 border border-primary/20">
                            <Zap className="h-4 w-4 fill-primary" />
                            <span>Quick Checkout</span>
                        </div>
                        <h1 className="text-5xl font-black tracking-tight mb-4">
                            Realizar <span className="text-primary italic">Pedido</span>
                        </h1>
                        <p className="text-xl text-muted-foreground font-medium">
                            Completa tus datos y adjunta las imágenes para procesar tu solicitud.
                        </p>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            {serverError && (
                                <div className="bg-destructive/10 border-l-4 border-destructive p-4 mb-4 rounded-xl animate-in slide-in-from-top-2">
                                    <p className="text-sm font-bold text-destructive">{serverError}</p>
                                </div>
                            )}

                            <Card className="shadow-2xl border-border rounded-[2.5rem] overflow-hidden bg-card text-card-foreground">
                                <CardHeader className="border-b border-border/50 pb-6 pt-8">
                                    <CardTitle className="flex items-center gap-3 text-2xl font-black italic">
                                        <div className="bg-primary/10 text-primary p-2.5 rounded-xl border border-primary/20">
                                            <User className="w-6 h-6" />
                                        </div>
                                        Datos del Cliente
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="nombre"
                                        render={({ field }) => (
                                            <FormItem className="md:col-span-2">
                                                <FormLabel className="font-black uppercase text-[10px] tracking-widest text-muted-foreground">Nombre Completo *</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Ej. Juan Perez" className="h-12 text-lg rounded-xl bg-muted/30 border-none focus-visible:ring-2" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="ci"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="font-black uppercase text-[10px] tracking-widest text-muted-foreground">CI / NIT *</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Ej. 1234567" className="h-12 text-lg rounded-xl bg-muted/30 border-none focus-visible:ring-2" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="celular"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="font-black uppercase text-[10px] tracking-widest text-muted-foreground">Celular / WhatsApp *</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Ej. 70000000" className="h-12 text-lg rounded-xl bg-muted/30 border-none focus-visible:ring-2" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="departamento"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="font-black uppercase text-[10px] tracking-widest text-muted-foreground">Departamento *</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="h-12 text-lg rounded-xl bg-muted/30 border-none focus:ring-2">
                                                            <SelectValue placeholder="Selecciona..." />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {Object.keys(DEPARTAMENTOS).map(dept => (
                                                            <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="provincia"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="font-black uppercase text-[10px] tracking-widest text-muted-foreground">Provincia / Ciudad *</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!watchDepartamento}>
                                                    <FormControl>
                                                        <SelectTrigger className="h-12 text-lg rounded-xl bg-muted/30 border-none focus:ring-2">
                                                            <SelectValue placeholder={watchDepartamento ? "Selecciona..." : "Elige un departamento"} />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {provinces.map(prov => (
                                                            <SelectItem key={prov} value={prov}>{prov}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            <Card className="shadow-2xl border-border rounded-[2.5rem] overflow-hidden bg-card text-card-foreground">
                                <CardHeader className="border-b border-border/50 pb-6 pt-8">
                                    <CardTitle className="flex items-center gap-3 text-2xl font-black italic">
                                        <div className="bg-primary/10 text-primary p-2.5 rounded-xl border border-primary/20">
                                            <ImageIcon className="w-6 h-6" />
                                        </div>
                                        Fotos de Productos
                                    </CardTitle>
                                    <CardDescription className="text-muted-foreground font-medium">Adjunta imágenes de los productos que deseas y su cantidad.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-8">
                                    <div className="space-y-6">
                                        {productImages.length > 0 && (
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 animate-in fade-in zoom-in duration-300">
                                                {productImages.map((item, index) => (
                                                    <div key={index} className="flex flex-col gap-3">
                                                        <div className="relative group aspect-square rounded-2xl overflow-hidden border-2 border-border shadow-md">
                                                            <img src={URL.createObjectURL(item.file)} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                                            <button
                                                                type="button"
                                                                onClick={() => removeProductImage(index)}
                                                                className="absolute top-2 right-2 bg-background/90 backdrop-blur p-2 rounded-xl text-destructive opacity-0 group-hover:opacity-100 transition-all hover:bg-destructive hover:text-white"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                                                            </button>
                                                        </div>
                                                        <div className="flex items-center gap-2 justify-center bg-muted/50 rounded-xl px-3 py-2 border border-border">
                                                            <span className="text-[10px] font-black uppercase text-muted-foreground">Cant:</span>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                value={item.quantity}
                                                                onChange={(e) => updateProductQuantity(index, parseInt(e.target.value) || 1)}
                                                                className="w-10 bg-transparent font-black text-center text-sm focus:outline-none"
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <Label htmlFor="product-images" className="block w-full cursor-pointer bg-muted/50 hover:bg-muted border-2 border-dashed border-border hover:border-primary rounded-[2rem] p-10 text-center transition-all group">
                                            <div className="bg-background w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl border border-border group-hover:scale-110 transition-transform">
                                                <Upload className="w-7 h-7 text-primary" />
                                            </div>
                                            <span className="text-foreground font-black block text-lg">Añadir más fotos</span>
                                            <input
                                                type="file"
                                                id="product-images"
                                                multiple
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleProductImageChange}
                                            />
                                        </Label>

                                        {productImagesError && (
                                            <p className="text-sm font-bold text-destructive animate-in fade-in slide-in-from-top-1 text-center">
                                                {productImagesError}
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-2xl border-border rounded-[2.5rem] overflow-hidden bg-card text-card-foreground">
                                <CardHeader className="border-b border-border/50 pb-6 pt-8">
                                    <CardTitle className="flex items-center gap-3 text-2xl font-black italic">
                                        <div className="bg-primary/10 text-primary p-2.5 rounded-xl border border-primary/20">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        Comprobante de Pago
                                    </CardTitle>
                                    <CardDescription className="text-muted-foreground font-medium">Adjunta el comprobante de tu transferencia o depósito.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-8">
                                    <div className="space-y-6">
                                        {receiptImages.length > 0 && (
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 animate-in fade-in zoom-in duration-300">
                                                {receiptImages.map((file, index) => (
                                                    <div key={index} className="relative group aspect-square rounded-2xl overflow-hidden border-2 border-border shadow-md">
                                                        <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeReceiptImage(index)}
                                                            className="absolute top-2 right-2 bg-background/90 backdrop-blur p-2 rounded-xl text-destructive opacity-0 group-hover:opacity-100 transition-all hover:bg-destructive hover:text-white"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {receiptImages.length === 0 && (
                                            <Label htmlFor="receipt-images" className="block w-full cursor-pointer bg-muted/50 hover:bg-muted border-2 border-dashed border-border hover:border-primary rounded-[2rem] p-10 text-center transition-all group">
                                                <div className="bg-background w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl border border-border group-hover:scale-110 transition-transform">
                                                    <Upload className="w-7 h-7 text-primary" />
                                                </div>
                                                <span className="text-foreground font-black block text-lg">Añadir comprobante</span>
                                                <input
                                                    type="file"
                                                    id="receipt-images"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={handleReceiptImageChange}
                                                />
                                            </Label>
                                        )}

                                        {receiptImagesError && (
                                            <p className="text-sm font-bold text-destructive animate-in fade-in slide-in-from-top-1 text-center">
                                                {receiptImagesError}
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="pt-6 sticky bottom-4">
                                <Button
                                    type="submit"
                                    className="w-full h-16 text-xl font-black rounded-2xl shadow-2xl hover:scale-[1.02] transition-all"
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="mr-3 h-7 w-7 animate-spin" />
                                            Procesando...
                                        </>
                                    ) : (
                                        "Confirmar Mi Pedido"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </div>
        </PublicLayout>
    );
}

// Simple label helper
function Label({ htmlFor, children, className }: { htmlFor?: string, children: React.ReactNode, className?: string }) {
    return <label htmlFor={htmlFor} className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)}>{children}</label>
}
