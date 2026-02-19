import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import {
    Settings,
    Save,
    Building,
    Receipt,
    Phone,
    MapPin,
    Percent,
    Coins,
    ShieldCheck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function SettingsIndex({ config }: any) {
    const [formData, setFormData] = useState(config);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        router.post('/settings', formData, {
            onSuccess: () => toast.success("Configuración guardada"),
            onFinish: () => setIsLoading(false)
        });
    };

    return (
        <AppLayout>
            <Head title="Ajustes - Nexus Farma" />

            <div className="p-6 max-w-4xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Configuración del Sistema</h1>
                    <p className="text-slate-500">Administra los datos fiscales y generales de tu farmacia.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card className="border-none shadow-sm overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b py-4">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Building className="w-5 h-5 text-[#16A34A]" />
                                Datos del Establecimiento
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold flex items-center gap-2">Nombre Comercial</label>
                                <Input
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                    className="h-11"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold flex items-center gap-2">NIT / No. Identificación</label>
                                <Input
                                    value={formData.nit}
                                    onChange={(e) => setFormData({ ...formData, nit: e.target.value })}
                                    className="h-11"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold flex items-center gap-2"><Phone className="w-3 h-3" /> Teléfono</label>
                                <Input
                                    value={formData.telefono}
                                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                    className="h-11"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold flex items-center gap-2"><MapPin className="w-3 h-3" /> Dirección</label>
                                <Input
                                    value={formData.direccion}
                                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                                    className="h-11"
                                    required
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b py-4">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Receipt className="w-5 h-5 text-[#16A34A]" />
                                Facturación y Moneda
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold flex items-center gap-2"><Percent className="w-3 h-3" /> Impuesto Local (%)</label>
                                <Input
                                    type="number"
                                    value={formData.impuesto}
                                    onChange={(e) => setFormData({ ...formData, impuesto: e.target.value })}
                                    className="h-11"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold flex items-center gap-2"><Coins className="w-3 h-3" /> Símbolo de Moneda</label>
                                <Input
                                    value={formData.moneda}
                                    onChange={(e) => setFormData({ ...formData, moneda: e.target.value })}
                                    className="h-11 text-center font-bold"
                                    maxLength={5}
                                    required
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="bg-slate-50 border-t p-4 flex justify-end">
                            <Button
                                type="submit"
                                className="bg-[#16A34A] hover:bg-[#15803d] h-12 px-10 font-bold"
                                disabled={isLoading}
                            >
                                <Save className="w-4 h-4 mr-2" />
                                {isLoading ? "Guardando..." : "Guardar Cambios"}
                            </Button>
                        </CardFooter>
                    </Card>
                </form>

                <div className="flex items-center justify-center gap-2 text-xs text-slate-400 py-6">
                    <ShieldCheck className="w-4 h-4" />
                    Nexus Farma - v1.0 Gold Standard ERP
                </div>
            </div>
        </AppLayout>
    );
}
