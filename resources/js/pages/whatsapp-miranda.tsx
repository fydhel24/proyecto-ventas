import { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useWhatsApp } from '@/hooks/use-whatsapp';
import { StatusBadge } from '@/components/whatsapp/status-badge';
import { MessageSquare, Settings, Shield, HelpCircle, QrCode, Power, ExternalLink, AlertCircle, CheckCircle2, Trash2, Edit2, Plus } from 'lucide-react';
import { BreadcrumbItem } from '@/types';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'WhatsApp Miranda',
        href: '/whatsapp-miranda',
    },
];

export default function WhatsAppMiranda() {
    const { login, getStatus, getConfig, toggleAutoResponder, updateSettings, addPreset, updatePreset, deletePreset, getQR, logoutSession, loading, error } = useWhatsApp();
    const [status, setStatus] = useState<any>(null);
    const [config, setConfig] = useState<any>(null);
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [editingPreset, setEditingPreset] = useState<any>(null);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState<{ title: string, description: string, onConfirm: () => void } | null>(null);

    // Form states
    const [settings, setSettings] = useState({
        palabrasClave: '',
        minResponseDelay: 1000,
        maxResponseDelay: 3000,
        minTypingDelay: 1000,
        maxTypingDelay: 2000,
        maxMensajesPorHora: 100,
        maxMensajesPorDia: 1000,
        cooldownMinutos: 0.5
    });

    const [preset, setPreset] = useState({
        mediaUrl: '',
        caption: ''
    });

    const initAuth = async () => {
        try {
            const token = localStorage.getItem('whatsapp_token');
            if (!token) {
                await login();
            }
            setIsAuthorized(true);
            fetchStatus();
            fetchConfig();
        } catch (err) {
            console.error('Auth failed', err);
        }
    };

    const fetchStatus = async () => {
        const data = await getStatus();
        if (data) {
            setStatus(data);
        }
    };

    const fetchConfig = async () => {
        const userId = import.meta.env.VITE_WHATSAPP_USER_ID || '1';
        try {
            const data = await getConfig(userId);
            if (data) {
                setConfig(data);
                setSettings({
                    palabrasClave: Array.isArray(data.palabrasClave) ? data.palabrasClave.join(', ') : (data.palabrasClave || ''),
                    minResponseDelay: data.minResponseDelay || 1000,
                    maxResponseDelay: data.maxResponseDelay || 3000,
                    minTypingDelay: data.minTypingDelay || 1000,
                    maxTypingDelay: data.maxTypingDelay || 2000,
                    maxMensajesPorHora: data.maxMensajesPorHora || 100,
                    maxMensajesPorDia: data.maxMensajesPorDia || 1000,
                    cooldownMinutos: data.cooldownMinutos || 0.5
                });
            }
        } catch (err) {
            console.error('Error fetching config', err);
        }
    };

    useEffect(() => {
        initAuth();
        const interval = setInterval(() => {
            if (isAuthorized) {
                fetchStatus();
            }
        }, 10000);
        return () => clearInterval(interval);
    }, [isAuthorized]);

    const handleLogout = async () => {
        setConfirmAction({
            title: '¿Cerrar Sesión?',
            description: '¿Estás seguro de que deseas cerrar la sesión de WhatsApp y borrar los datos locales? Tendrás que volver a escanear el QR.',
            onConfirm: async () => {
                try {
                    await logoutSession();
                    setStatus(null);
                    setQrCode(null);
                    setIsAuthorized(false);
                    toast.success('Sesión cerrada correctamente');
                    initAuth();
                } catch (err) {
                    console.error(err);
                    toast.error('Error al cerrar sesión');
                }
            }
        });
        setConfirmDialogOpen(true);
    };

    const handleToggleBot = async (checked: boolean) => {
        try {
            // Update local state immediately for better UX
            setStatus((prev: any) => prev ? { ...prev, autoResponder: checked } : { autoResponder: checked });
            await toggleAutoResponder('default', checked);
            await fetchStatus();
        } catch (err) {
            console.error(err);
            fetchStatus(); // Refresh to correct state on error
        }
    };

    const handleGetQR = async () => {
        try {
            const data = await getQR();
            if (data.qr) {
                setQrCode(data.qr);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdateSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const userId = import.meta.env.VITE_WHATSAPP_USER_ID || '1';
            await updateSettings(userId, settings);
            toast.success('Configuración actualizada correctamente');
            fetchConfig();
        } catch (err) {
            console.error(err);
            toast.error('Error al actualizar configuración');
        }
    };

    const handleAddPreset = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const userId = import.meta.env.VITE_WHATSAPP_USER_ID || '1';
            if (editingPreset) {
                await updatePreset(editingPreset.id, preset);
                setEditingPreset(null);
                toast.success('Respuesta actualizada');
            } else {
                await addPreset(userId, preset);
                toast.success('Respuesta añadida');
            }
            setPreset({ mediaUrl: '', caption: '' });
            fetchConfig();
        } catch (err) {
            console.error(err);
            toast.error('Error al guardar respuesta');
        }
    };

    const handleDeletePreset = async (id: number) => {
        setConfirmAction({
            title: '¿Eliminar Respuesta?',
            description: 'Esta acción no se puede deshacer. La respuesta se eliminará permanentemente.',
            onConfirm: async () => {
                try {
                    await deletePreset(id);
                    toast.success('Respuesta eliminada');
                    fetchConfig();
                } catch (err) {
                    console.error(err);
                    toast.error('Error al eliminar respuesta');
                }
            }
        });
        setConfirmDialogOpen(true);
    };

    const startEditing = (p: any) => {
        setEditingPreset(p);
        setPreset({
            mediaUrl: p.mediaUrl || '',
            caption: p.caption || ''
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEditing = () => {
        setEditingPreset(null);
        setPreset({ mediaUrl: '', caption: '' });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="WhatsApp Miranda" />

            <div className="flex flex-col space-y-6 max-w-6xl mx-auto w-full pb-12">
                {/* Modern Header / Status Bar */}
                <div className="bg-card p-6 rounded-2xl border shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-5 w-full md:w-auto">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0" style={{ backgroundColor: 'var(--whatsapp-primary)', boxShadow: '0 20px 25px -5px rgba(var(--whatsapp-primary), 0.1)' }}>
                            <MessageSquare className="w-8 h-8" />
                        </div>
                        <div className="flex-1">
                            <h2 className="font-extrabold text-xl text-slate-900 leading-tight">Miranda WhatsApp Hub</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <StatusBadge status={status?.status} />
                                <span className="text-xs font-medium text-slate-400">ID Usuario: {import.meta.env.VITE_WHATSAPP_USER_ID || '1'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0">
                        <div className="flex flex-col items-center md:items-end">
                            <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-2 px-1">Respondedor</span>
                            <div className="flex items-center gap-3">
                                <span className={`text-xs font-bold ${status?.autoResponder ? 'text-green-600' : 'text-slate-400'}`}>
                                    {status?.autoResponder ? 'ACTIVO' : 'OFF'}
                                </span>
                                <Switch
                                    checked={status?.autoResponder || false}
                                    onCheckedChange={handleToggleBot}
                                    disabled={loading}
                                />
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="lg"
                            className="bg-red-50 text-red-600 border-red-100 hover:bg-red-600 hover:text-white transition-all h-12 rounded-xl font-bold"
                            onClick={handleLogout}
                            disabled={loading}
                        >
                            <Power className="w-4 h-4 mr-2" />
                            Sesión
                        </Button>
                    </div>
                </div>

                <Tabs defaultValue="status" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 h-auto p-1.5 bg-muted rounded-2xl border mb-2">
                        <TabsTrigger value="status" className="py-4 rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-md font-bold transition-all" style={{ color: 'var(--whatsapp-primary)' }}>
                            <QrCode className="w-4 h-4 mr-2" />
                            <span className="hidden sm:inline">Conexión</span>
                        </TabsTrigger>
                        <TabsTrigger value="settings" className="py-4 rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-md font-bold transition-all" style={{ color: 'var(--whatsapp-primary)' }}>
                            <Settings className="w-4 h-4 mr-2" />
                            <span className="hidden sm:inline">Bot Config</span>
                        </TabsTrigger>
                        <TabsTrigger value="presets" className="py-4 rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-md font-bold transition-all" style={{ color: 'var(--whatsapp-primary)' }}>
                            <MessageSquare className="w-4 h-4 mr-2" />
                            <span className="hidden sm:inline">Respuestas</span>
                        </TabsTrigger>
                        <TabsTrigger value="antiban" className="py-4 rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-md font-bold transition-all" style={{ color: 'var(--whatsapp-primary)' }}>
                            <Shield className="w-4 h-4 mr-2" />
                            <span className="hidden sm:inline">Anti-Ban</span>
                        </TabsTrigger>
                        <TabsTrigger value="help" className="py-4 rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-md font-bold transition-all" style={{ color: 'var(--whatsapp-primary)' }}>
                            <HelpCircle className="w-4 h-4 mr-2" />
                            <span className="hidden sm:inline">Guía</span>
                        </TabsTrigger>
                    </TabsList>

                    <div className="mt-8">
                        {error && (
                            <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-4 text-red-900 flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-black">Error de Servidor</p>
                                    <p className="font-medium text-sm">{error}</p>
                                </div>
                            </div>
                        )}

                        <TabsContent value="status" className="m-0 focus-visible:outline-none">
                            <Card className="overflow-hidden border-none shadow-xl rounded-3xl">
                                <CardHeader className="text-white p-8" style={{ backgroundColor: 'var(--whatsapp-primary)' }}>
                                    <CardTitle className="text-2xl font-black">Vincular con WhatsApp</CardTitle>
                                    <CardDescription className="text-white/80 text-base font-medium">Control de enlace oficial para el automatizador Miranda.</CardDescription>
                                </CardHeader>
                                <CardContent className="flex flex-col items-center justify-center py-16 bg-card">
                                    {!status || status.status !== 'CONNECTED' ? (
                                        <div className="flex flex-col items-center space-y-10 animate-in fade-in duration-500">
                                            {qrCode ? (
                                                <div className="p-8 bg-card border-4 rounded-[2.5rem] shadow-2xl transition-all hover:scale-[1.02]" style={{ borderColor: 'var(--whatsapp-primary)' }}>
                                                    <img src={qrCode} alt="QR Code" className="w-72 h-72" />
                                                </div>
                                            ) : (
                                                <div className="w-72 h-72 bg-slate-50 flex items-center justify-center rounded-[2.5rem] border-4 border-dashed border-slate-200">
                                                    <QrCode className="w-24 h-24 text-slate-200" />
                                                </div>
                                            )}
                                            <div className="flex flex-col items-center gap-6 text-center max-w-sm">
                                                <p className="text-slate-500 font-medium leading-relaxed">
                                                    Abre tu app de WhatsApp, ve a <b>Dispositivos vinculados</b> y escanea el código para activar el sistema.
                                                </p>
                                                <Button onClick={handleGetQR} disabled={loading} size="lg" className="text-white px-10 h-14 rounded-2xl text-lg font-black transition-all hover:shadow-xl" style={{ backgroundColor: 'var(--whatsapp-primary)' }}>
                                                    {loading ? 'Preparando...' : (qrCode ? 'Refrescar Código' : 'Generar Vinculación')}
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center space-y-8 text-center animate-in zoom-in-95 duration-500">
                                            <div className="relative">
                                                <div className="w-28 h-28 rounded-full bg-green-100 flex items-center justify-center border-8 border-white shadow-xl">
                                                    <CheckCircle2 className="w-14 h-14 text-green-600" />
                                                </div>
                                                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center border-4 border-white shadow-sm" style={{ backgroundColor: 'var(--whatsapp-primary)' }}>
                                                    <div className="w-2 h-2 rounded-full bg-card animate-pulse" />
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="text-3xl font-black text-slate-900 tracking-tight">Sistema Conectado</h3>
                                                <p className="text-slate-400 font-bold mt-2 text-xl">Sesión operativa: <span style={{ color: 'var(--whatsapp-primary)' }}>{status.sessionName}</span></p>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg mt-6">
                                                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-left">
                                                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1 leading-none">Status Final</p>
                                                    <p className="font-extrabold text-2xl text-green-600 leading-tight">ONLINE</p>
                                                </div>
                                                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-left">
                                                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1 leading-none">Respondedor</p>
                                                    <p className={`font-extrabold text-2xl leading-tight ${status.autoResponder ? 'text-blue-600' : 'text-slate-300'}`}>
                                                        {status.autoResponder ? 'ACTIVO' : 'PAUSADO'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="settings" className="m-0 focus-visible:outline-none">
                            <form onSubmit={handleUpdateSettings} className="space-y-6">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    <div className="lg:col-span-2 space-y-8">
                                        <Card className="shadow-lg border-none rounded-3xl overflow-hidden">
                                            <CardHeader className="pb-4">
                                                <CardTitle className="text-xl font-black flex items-center gap-3">
                                                    <div className="p-2 rounded-lg" style={{ backgroundColor: 'color-mix(in srgb, var(--whatsapp-primary) 10%, white)' }}><Settings className="w-5 h-5" style={{ color: 'var(--whatsapp-primary)' }} /></div>
                                                    Inteligencia de Respuesta
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-6">
                                                <div className="space-y-3">
                                                    <Label htmlFor="keywords" className="text-sm font-black text-slate-700 uppercase tracking-wider">Palabras Clave Maestras</Label>
                                                    <Textarea
                                                        id="keywords"
                                                        value={settings.palabrasClave}
                                                        onChange={(e) => setSettings({ ...settings, palabrasClave: e.target.value })}
                                                        placeholder="miranda, info, catalogo, ayuda..."
                                                        className="min-h-[120px] rounded-2xl border-slate-200 text-lg font-medium transition-all"
                                                        style={{ '--tw-ring-color': 'var(--whatsapp-primary)' } as React.CSSProperties}
                                                    />
                                                    <p className="text-xs font-bold text-slate-400 italic">Separa los gatillos por comas. El bot es sensible al contenido del mensaje.</p>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card className="shadow-lg border-none rounded-3xl overflow-hidden">
                                            <CardHeader className="pb-4">
                                                <CardTitle className="text-xl font-black flex items-center gap-3">
                                                    <div className="p-2 rounded-lg bg-blue-50"><Shield className="w-5 h-5 text-blue-500" /></div>
                                                    Límites Críticos de Flujo
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                                <div className="space-y-2">
                                                    <Label className="font-bold text-slate-600">Límite / Hora</Label>
                                                    <Input type="number" value={settings.maxMensajesPorHora} onChange={(e) => setSettings({ ...settings, maxMensajesPorHora: parseInt(e.target.value) })} className="h-14 rounded-xl border-slate-200 text-xl font-bold bg-slate-50" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="font-bold text-slate-600">Límite / Día</Label>
                                                    <Input type="number" value={settings.maxMensajesPorDia} onChange={(e) => setSettings({ ...settings, maxMensajesPorDia: parseInt(e.target.value) })} className="h-14 rounded-xl border-slate-200 text-xl font-bold bg-slate-50" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="font-bold text-slate-600">Re-envío (Min)</Label>
                                                    <Input type="number" step="0.1" value={settings.cooldownMinutos} onChange={(e) => setSettings({ ...settings, cooldownMinutos: parseFloat(e.target.value) })} className="h-14 rounded-xl border-slate-200 text-xl font-bold bg-slate-50" />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    <div className="space-y-8">
                                        <Card className="shadow-lg border-none rounded-3xl overflow-hidden">
                                            <CardHeader className="bg-slate-900 text-white py-6">
                                                <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-center">Simulación Biológica</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-8 pt-8">
                                                <div className="space-y-6">
                                                    <div className="space-y-4">
                                                        <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Retraso de Respuesta (ms)</Label>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div className="space-y-1">
                                                                <span className="text-[10px] font-black text-slate-300 ml-1">MIN</span>
                                                                <Input type="number" value={settings.minResponseDelay} onChange={(e) => setSettings({ ...settings, minResponseDelay: parseInt(e.target.value) })} className="h-12 rounded-xl text-center font-bold" />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <span className="text-[10px] font-black text-slate-300 ml-1">MAX</span>
                                                                <Input type="number" value={settings.maxResponseDelay} onChange={(e) => setSettings({ ...settings, maxResponseDelay: parseInt(e.target.value) })} className="h-12 rounded-xl text-center font-bold" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-4">
                                                        <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Simul. Escritura (ms)</Label>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div className="space-y-1">
                                                                <span className="text-[10px] font-black text-slate-300 ml-1">MIN</span>
                                                                <Input type="number" value={settings.minTypingDelay} onChange={(e) => setSettings({ ...settings, minTypingDelay: parseInt(e.target.value) })} className="h-12 rounded-xl text-center font-bold" />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <span className="text-[10px] font-black text-slate-300 ml-1">MAX</span>
                                                                <Input type="number" value={settings.maxTypingDelay} onChange={(e) => setSettings({ ...settings, maxTypingDelay: parseInt(e.target.value) })} className="h-12 rounded-xl text-center font-bold" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <Button type="submit" disabled={loading} className="w-full text-white h-14 rounded-2xl text-lg font-black transition-all hover:scale-[1.02]" style={{ backgroundColor: 'var(--whatsapp-primary)' }}>
                                                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                                                </Button>
                                            </CardContent>
                                        </Card>

                                        <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 flex gap-4">
                                            <AlertCircle className="w-8 h-8 text-amber-500 shrink-0" />
                                            <div>
                                                <h4 className="font-extrabold text-amber-900 tabular-nums">Importante</h4>
                                                <p className="text-sm font-medium text-amber-700 leading-relaxed mt-1">Valores demasiado bajos aumentan el riesgo de detección de bots.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </TabsContent>

                        <TabsContent value="presets" className="m-0 focus-visible:outline-none space-y-10">
                            <Card className={`transition-all duration-500 rounded-[2.5rem] border-none shadow-xl ${editingPreset ? 'ring-4' : ''}`} style={editingPreset ? { '--tw-ring-color': 'var(--whatsapp-primary)' } as React.CSSProperties : {}}>
                                <CardHeader className="pt-10 px-10">
                                    <CardTitle className="text-2xl font-black flex items-center gap-4">
                                        <div className={`p-3 rounded-2xl transition-colors text-white ${editingPreset ? '' : 'bg-slate-100 text-slate-400'}`} style={editingPreset ? { backgroundColor: 'var(--whatsapp-primary)' } : {}}>
                                            {editingPreset ? <Edit2 className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                                        </div>
                                        {editingPreset ? 'Editando Respuesta' : 'Programar Nueva Respuesta'}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="px-10 pb-10 space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="space-y-3">
                                            <Label htmlFor="mediaUrl" className="text-sm font-black text-slate-500 uppercase tracking-widest pl-1">Link de Imagen / Catálogo</Label>
                                            <div className="flex gap-3">
                                                <Input
                                                    id="mediaUrl"
                                                    value={preset.mediaUrl}
                                                    onChange={(e) => setPreset({ ...preset, mediaUrl: e.target.value })}
                                                    placeholder="URL pública de la imagen..."
                                                    className="h-14 rounded-2xl border-slate-200 text-base font-medium shadow-sm"
                                                />
                                                {preset.mediaUrl && (
                                                    <Button variant="outline" size="icon" type="button" onClick={() => window.open(preset.mediaUrl, '_blank')} className="h-14 w-14 shrink-0 rounded-2xl hover:bg-slate-50 border-slate-200 shadow-sm">
                                                        <ExternalLink className="w-5 h-5 text-slate-400" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <Label htmlFor="caption" className="text-sm font-black text-slate-500 uppercase tracking-widest pl-1">Mensaje de Salida</Label>
                                            <Textarea
                                                id="caption"
                                                value={preset.caption}
                                                onChange={(e) => setPreset({ ...preset, caption: e.target.value })}
                                                placeholder="Contenido descriptivo de la respuesta..."
                                                className="h-14 min-h-[56px] py-4 rounded-2xl border-slate-200 text-base font-medium shadow-sm transition-all focus:min-h-[120px]"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-4 pt-4">
                                        {editingPreset && (
                                            <Button variant="ghost" type="button" onClick={cancelEditing} className="h-14 px-8 rounded-2xl font-bold text-slate-400 hover:text-slate-900">
                                                Cancelar Edición
                                            </Button>
                                        )}
                                        <Button onClick={handleAddPreset} disabled={loading} className={`h-14 px-12 rounded-2xl text-lg font-black transition-all hover:scale-[1.02] shadow-lg ${editingPreset ? 'text-white' : 'bg-slate-900 hover:bg-slate-800 shadow-slate-100'}`} style={editingPreset ? { backgroundColor: 'var(--whatsapp-primary)' } : {}}>
                                            {loading ? 'Procesando...' : (editingPreset ? 'Finalizar Edición' : 'Registrar Respuesta')}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="space-y-6">
                                <div className="flex items-center justify-between px-2">
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                        <MessageSquare className="w-7 h-7" style={{ color: 'var(--whatsapp-primary)' }} /> Respuestas Programadas
                                    </h3>
                                    <Badge className="bg-slate-100 text-slate-500 border-none font-bold px-4 py-1.5 rounded-full">{(config?.respuestas || []).length} Guardadas</Badge>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {(config?.respuestas || []).map((p: any) => (
                                        <Card key={p.id} className="group overflow-hidden flex flex-col hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border-none bg-card shadow-lg rounded-[2rem]">
                                            <div className="relative">
                                                {p.mediaUrl ? (
                                                    <div className="h-56 overflow-hidden bg-slate-900/5">
                                                        <img src={p.mediaUrl} alt="Preset" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                                    </div>
                                                ) : (
                                                    <div className="h-56 flex items-center justify-center bg-slate-50">
                                                        <MessageSquare className="w-16 h-16 text-slate-200" />
                                                    </div>
                                                )}
                                                <Badge className="absolute top-4 left-4 bg-card backdrop-blur text-foreground border-none shadow-md font-black text-[10px] tracking-widest uppercase py-1 px-3 rounded-xl">{p.tipo}</Badge>
                                            </div>

                                            <CardContent className="p-8 flex-1">
                                                <p className="text-slate-600 font-bold leading-relaxed text-lg line-clamp-3">
                                                    "{p.caption}"
                                                </p>
                                            </CardContent>

                                            <CardFooter className="p-6 pt-0 flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="lg"
                                                    onClick={() => startEditing(p)}
                                                    className="flex-1 h-12 rounded-xl font-bold bg-card hover:bg-muted border-muted shadow-sm transition-all"
                                                >
                                                    <Edit2 className="w-4 h-4 mr-2" /> Editar
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="lg"
                                                    onClick={() => handleDeletePreset(p.id)}
                                                    className="w-12 h-12 p-0 rounded-xl font-bold text-red-400 hover:bg-red-50 hover:text-red-600 border-red-50 shadow-sm transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    ))}

                                    {(config?.respuestas || []).length === 0 && (
                                        <div className="col-span-full py-24 text-center bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-200">
                                            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-6">
                                                <Plus className="w-10 h-10 text-slate-300" />
                                            </div>
                                            <p className="text-slate-400 font-black text-xl tracking-tight">Debes registrar tu primera respuesta</p>
                                            <p className="text-slate-300 font-bold mt-1">Usa el formulario de arriba para comenzar.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="antiban" className="m-0 focus-visible:outline-none space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <Card className="border-none shadow-xl rounded-[2.5rem] bg-gradient-to-br from-[#E3F2FD] to-white p-4">
                                    <CardHeader className="pb-2">
                                        <div className="w-16 h-16 rounded-3xl bg-blue-600 flex items-center justify-center text-white mb-6 shadow-xl shadow-blue-100">
                                            <Shield className="w-9 h-9" />
                                        </div>
                                        <CardTitle className="text-2xl font-black text-blue-900">Simulación Humana</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6 pt-4">
                                        <div className="p-5 bg-white/70 rounded-2xl border border-blue-100 shadow-sm">
                                            <h5 className="font-black text-blue-900 uppercase tracking-widest text-[10px] mb-2">Thinking Engine</h5>
                                            <p className="text-blue-700 font-bold text-base leading-snug">El bot procesa la lógica de respuesta utilizando delays aleatorios para no parecer instantáneo.</p>
                                        </div>
                                        <div className="p-5 bg-white/70 rounded-2xl border border-blue-100 shadow-sm">
                                            <h5 className="font-black text-blue-900 uppercase tracking-widest text-[10px] mb-2">Visual Feedback</h5>
                                            <p className="text-blue-700 font-bold text-base leading-snug">Activa el estado "Escribiendo..." en el móvil del cliente mientras prepara el multimedia.</p>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-none shadow-xl rounded-[2.5rem] bg-gradient-to-br from-orange-50 to-white p-4">
                                    <CardHeader className="pb-2">
                                        <div className="w-16 h-16 rounded-3xl bg-orange-600 flex items-center justify-center text-white mb-6 shadow-xl shadow-orange-100">
                                            <Power className="w-9 h-9" />
                                        </div>
                                        <CardTitle className="text-2xl font-black text-orange-900">Protección Activa</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6 pt-4">
                                        <div className="p-5 bg-white/70 rounded-2xl border border-orange-100 shadow-sm">
                                            <h5 className="font-black text-orange-900 uppercase tracking-widest text-[10px] mb-2">Cooldown Intelligente</h5>
                                            <p className="text-orange-700 font-bold text-base leading-snug">Un mismo contacto no recibirá spam. Cooldown actual: <b>{settings.cooldownMinutos} min</b>.</p>
                                        </div>
                                        <div className="p-5 bg-white/70 rounded-2xl border border-orange-100 shadow-sm">
                                            <h5 className="font-black text-orange-900 uppercase tracking-widest text-[10px] mb-2">Monitor de Ráfagas</h5>
                                            <p className="text-orange-700 font-bold text-base leading-snug">Límites configurados de <b>{settings.maxMensajesPorHora}</b> msgs/h para prevenir baneos masivos.</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="p-10 rounded-[3rem] ring-1 flex flex-col items-center text-center" style={{ backgroundColor: 'color-mix(in srgb, var(--whatsapp-primary) 5%, transparent)', borderColor: 'color-mix(in srgb, var(--whatsapp-primary) 20%, transparent)', '--tw-ring-color': 'color-mix(in srgb, var(--whatsapp-primary) 10%, transparent)' } as React.CSSProperties}>
                                <CheckCircle2 className="h-10 w-10 mb-4" style={{ color: 'var(--whatsapp-primary)' }} />
                                <div>
                                    <p className="text-slate-900 font-black text-2xl mb-2 tracking-tight">Resiliencia Automática (Fallback)</p>
                                    <p className="text-slate-500 text-lg font-medium leading-relaxed">
                                        Si un link multimedia falla o es inalcanzable, <b>Miranda enviará automáticamente el mensaje solo texto</b>.
                                        Esto garantiza que el cliente siempre reciba una respuesta, incluso si hay problemas de hosting externo.
                                    </p>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="help" className="m-0 focus-visible:outline-none">
                            <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white">
                                <CardHeader className="bg-slate-900 text-white p-12">
                                    <CardTitle className="text-3xl font-black tracking-tight">Referencia de Integración</CardTitle>
                                    <CardDescription className="text-slate-400 text-lg font-bold">Documentación técnica para desarrolladores Nexus.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-12 space-y-12">
                                    <div className="space-y-6">
                                        <h4 className="font-black text-slate-800 text-xl flex items-center gap-3">
                                            <div className="w-1.5 h-8 rounded-full" style={{ backgroundColor: 'var(--whatsapp-primary)' }} /> API REST Hub
                                        </h4>
                                        <div className="p-8 bg-slate-900 rounded-[2.5rem] text-slate-100 font-mono text-sm space-y-5 shadow-2xl">
                                            <div className="border-b border-slate-800 pb-4 flex justify-between items-center">
                                                <div>
                                                    <span className="font-black mr-3" style={{ color: 'var(--whatsapp-primary)' }}>GET</span> /whatsapp/config/:userId
                                                    <p className="text-slate-500 mt-2 font-sans font-bold text-xs">// Configuración completa + Array de respuestas</p>
                                                </div>
                                            </div>
                                            <div className="border-b border-slate-800 pb-4 flex justify-between items-center">
                                                <div>
                                                    <span className="text-yellow-400 font-black mr-3">PATCH</span> .../settings
                                                    <p className="text-slate-500 mt-2 font-sans font-bold text-xs">// Actualización de delays y cuotas</p>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <span className="text-red-400 font-black mr-3">DELETE</span> /whatsapp/session
                                                    <p className="text-slate-500 mt-2 font-sans font-bold text-xs">// Terminación y limpieza de estado de Baileys</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-blue-50 p-10 rounded-[2.5rem] border border-blue-100 flex items-start gap-8">
                                        <div className="p-4 bg-white rounded-2xl shadow-sm border border-blue-50 shrink-0">
                                            <HelpCircle className="w-10 h-10 text-blue-500" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-blue-900 text-2xl tracking-tight">Seguridad JWT</h4>
                                            <p className="text-blue-700/80 mt-3 text-lg font-bold leading-snug">
                                                Toda petición requiere <code className="bg-blue-100 px-3 py-1 rounded-lg text-blue-900 border border-blue-200 text-base">Bearer [TOKEN]</code>.
                                                La base URL oficial es: <br />
                                                <code className="text-blue-500 block mt-2 text-base font-black truncate">{import.meta.env.VITE_WHATSAPP_API_URL}</code>
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </div>
                </Tabs>
            </div>

            <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
                <DialogContent className="rounded-3xl">
                    <DialogHeader>
                        <DialogTitle className="font-black text-xl">{confirmAction?.title}</DialogTitle>
                        <DialogDescription className="font-medium">
                            {confirmAction?.description}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-3 sm:gap-0">
                        <Button variant="ghost" onClick={() => setConfirmDialogOpen(false)} className="rounded-xl font-bold">
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            className="rounded-xl font-bold"
                            onClick={() => {
                                confirmAction?.onConfirm();
                                setConfirmDialogOpen(false);
                            }}
                        >
                            Confirmar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
