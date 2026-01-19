
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
import { Loader2, Upload, User, CheckCircle, Image as ImageIcon, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

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
            await axios.post('/api/shoppedidos', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
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
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-md shadow-lg border-green-200 animate-in fade-in zoom-in duration-300">
                    <CardHeader className="text-center">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <CardTitle className="text-2xl text-green-700">¡Pedido Enviado!</CardTitle>
                        <CardDescription className="text-gray-600 mt-2">
                            Tu pedido ha sido registrado correctamente. Te contactaremos pronto.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <Button onClick={() => setSuccess(false)} className="bg-green-600 hover:bg-green-700">
                            Realizar otro pedido
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <Head title="Nuevo Pedido" />

            <div className="max-w-xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                        Realizar Pedido
                    </h1>
                    <p className="mt-2 text-lg text-gray-600">
                        Completa tus datos y adjunta las imágenes necesarias.
                    </p>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {serverError && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded-md animate-in slide-in-from-top-2">
                                <div className="flex">
                                    <div className="ml-3">
                                        <p className="text-sm text-red-700">{serverError}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <Card className="shadow-md overflow-hidden border-none ring-1 ring-gray-200">
                            <CardHeader className="bg-white border-b border-gray-100 pb-4">
                                <CardTitle className="flex items-center gap-2 text-xl">
                                    <span className="bg-purple-100 text-purple-600 p-2 rounded-lg"><User className="w-5 h-5" /></span>
                                    Datos del Cliente
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white">
                                <FormField
                                    control={form.control}
                                    name="nombre"
                                    render={({ field }) => (
                                        <FormItem className="md:col-span-2">
                                            <FormLabel>Nombre Completo *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ej. Juan Perez" {...field} />
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
                                            <FormLabel>CI / NIT *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ej. 1234567" {...field} />
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
                                            <FormLabel>Celular / WhatsApp *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ej. 70000000" {...field} />
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
                                            <FormLabel>Departamento *</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
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
                                            <FormLabel>Provincia / Ciudad *</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!watchDepartamento}>
                                                <FormControl>
                                                    <SelectTrigger>
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

                        <Card className="shadow-md overflow-hidden border-none ring-1 ring-gray-200">
                            <CardHeader className="bg-white border-b border-gray-100 pb-4">
                                <CardTitle className="flex items-center gap-2 text-xl">
                                    <span className="bg-blue-100 text-blue-600 p-2 rounded-lg"><ImageIcon className="w-5 h-5" /></span>
                                    Fotos de los Productos *
                                </CardTitle>
                                <CardDescription>
                                    Adjunta imágenes de los productos.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 bg-white">
                                <div className="space-y-4">
                                    <Label htmlFor="product-images" className="block w-full cursor-pointer bg-blue-50/50 hover:bg-blue-50 border-2 border-dashed border-blue-200 hover:border-blue-400 rounded-xl p-6 text-center transition-all group">
                                        <div className="bg-white w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm group-hover:scale-110 transition-transform">
                                            <Upload className="w-5 h-5 text-blue-500" />
                                        </div>
                                        <span className="text-blue-700 font-medium block text-sm">Añadir fotos de productos</span>
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
                                        <p className="text-[0.8rem] font-medium text-red-500 animate-in fade-in slide-in-from-top-1">
                                            {productImagesError}
                                        </p>
                                    )}

                                    {productImages.length > 0 && (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 animate-in fade-in zoom-in duration-300">
                                            {productImages.map((item, index) => (
                                                <div key={index} className="flex flex-col gap-2">
                                                    <div className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
                                                        <img src={URL.createObjectURL(item.file)} alt="" className="w-full h-full object-cover" />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeProductImage(index)}
                                                            className="absolute top-1 right-1 bg-white/80 p-1 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                                                        >
                                                            <Loader2 className="w-4 h-4 hidden" /> {/* Dummy for import usage */}
                                                            <span className="sr-only">Eliminar</span>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2 w-4 h-4"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
                                                        </button>
                                                    </div>
                                                    <div className="flex items-center gap-2 px-1">
                                                        <span className="text-xs font-semibold text-gray-500 uppercase">Cant:</span>
                                                        <Input
                                                            type="number"
                                                            min="1"
                                                            value={item.quantity}
                                                            onChange={(e) => updateProductQuantity(index, parseInt(e.target.value) || 1)}
                                                            className="h-8 text-xs text-center"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-md overflow-hidden border-none ring-1 ring-gray-200">
                            <CardHeader className="bg-white border-b border-gray-100 pb-4">
                                <CardTitle className="flex items-center gap-2 text-xl">
                                    <span className="bg-green-100 text-green-600 p-2 rounded-lg"><FileText className="w-5 h-5" /></span>
                                    Comprobante de Pago *
                                </CardTitle>
                                <CardDescription>
                                    Si ya realizaste el pago o anticipo, adjunta el comprobante aquí.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 bg-white">
                                <div className="space-y-4">
                                    <Label htmlFor="receipt-images" className="block w-full cursor-pointer bg-green-50/50 hover:bg-green-50 border-2 border-dashed border-green-200 hover:border-green-400 rounded-xl p-6 text-center transition-all group">
                                        <div className="bg-white w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm group-hover:scale-110 transition-transform">
                                            <Upload className="w-5 h-5 text-green-500" />
                                        </div>
                                        <span className="text-green-700 font-medium block text-sm">Añadir comprobante</span>
                                        <input
                                            type="file"
                                            id="receipt-images"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleReceiptImageChange}
                                        />
                                    </Label>

                                    {receiptImagesError && (
                                        <p className="text-[0.8rem] font-medium text-red-500 animate-in fade-in slide-in-from-top-1">
                                            {receiptImagesError}
                                        </p>
                                    )}

                                    {receiptImages.length > 0 && (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 animate-in fade-in zoom-in duration-300">
                                            {receiptImages.map((file, index) => (
                                                <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
                                                    <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeReceiptImage(index)}
                                                        className="absolute top-1 right-1 bg-white/80 p-1 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                                                    >
                                                        <span className="sr-only">Eliminar</span>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2 w-4 h-4"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <div className="pt-4 sticky bottom-4">
                            <Button
                                type="submit"
                                className="w-full h-14 text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-xl shadow-purple-200 hover:shadow-2xl hover:shadow-purple-300 transition-all duration-300 transform hover:-translate-y-1 rounded-xl"
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                                        Enviando...
                                    </>
                                ) : (
                                    "Confirmar Pedido"
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
}

// Simple label helper
function Label({ htmlFor, children, className }: { htmlFor?: string, children: React.ReactNode, className?: string }) {
    return <label htmlFor={htmlFor} className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)}>{children}</label>
}
