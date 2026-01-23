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
import { MessageSquare, Settings, Shield, HelpCircle, QrCode, Power, ExternalLink, AlertCircle, CheckCircle2, Trash2, Edit2, Plus, TrendingUp, BarChart3, AlertTriangle, Lock, Smartphone, Info } from 'lucide-react';
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
    DialogTrigger,
} from "@/components/ui/dialog";
import whatsappClient from '@/lib/whatsapp-client';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'WhatsApp Miranda',
        href: '/whatsapp-miranda',
    },
];

const HelpSection = ({ isConnected }: { isConnected: boolean }) => (
    <div className="space-y-12 p-8 md:p-12 bg-background">
        <div className="flex flex-col gap-3">
            <h3 className="font-black text-4xl flex items-center gap-4 text-foreground tracking-tight">
                <Shield className="w-10 h-10 text-primary" />
                🛡️ Sistema Anti-Baneo Miranda
            </h3>
            <p className="text-xl text-muted-foreground font-medium max-w-2xl">
                Guía oficial para una operación segura, rápida y eficiente en WhatsApp.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 bg-primary/5 rounded-[2rem] border border-primary/10 space-y-4">
                <h4 className="font-black text-primary text-xl flex items-center gap-2">
                    <TrendingUp className="w-6 h-6" /> ⚡ Cómo Funciona
                </h4>
                <ul className="space-y-4 text-base text-foreground/80 font-bold">
                    <li className="flex gap-3">
                        <span className="text-primary">1.</span>
                        <span><b>Cliente envía "miranda"</b> → Bot responde en <b>1-3 segundos</b> con QR + mensaje</span>
                    </li>
                    <li className="flex gap-3">
                        <span className="text-primary">2.</span>
                        <span><b>Sin confirmaciones</b> → Respuesta directa e inmediata</span>
                    </li>
                    <li className="flex gap-3">
                        <span className="text-primary">3.</span>
                        <span><b>Sin límite de 24h</b> → Pueden usar el trigger múltiples veces al día</span>
                    </li>
                    <li className="flex gap-3 border-t border-primary/10 pt-4 mt-4">
                        <Shield className="w-5 h-5 text-primary shrink-0 mt-1" />
                        <span className="text-sm">Protecciones activas: Delays aleatorios, typing y rate limiting global.</span>
                    </li>
                </ul>
            </div>
            <div className="p-8 bg-muted/50 rounded-[2rem] border border-border space-y-4">
                <h4 className="font-black text-foreground text-xl flex items-center gap-2">
                    <CheckCircle2 className="w-6 h-6 text-primary" /> ✅ Protecciones Activas
                </h4>
                <div className="space-y-4">
                    <div className="space-y-1">
                        <p className="font-black text-sm uppercase tracking-widest text-muted-foreground">Delays Biológicos</p>
                        <p className="text-sm font-bold">0.8 - 2s lectura simulada | 1 - 2.5s escritura simulada</p>
                    </div>
                    <div className="space-y-1">
                        <p className="font-black text-sm uppercase tracking-widest text-muted-foreground">Límites Globales</p>
                        <p className="text-sm font-bold">50 msgs/hora | 500 msgs/día | 30s cooldown por contacto</p>
                    </div>
                    <div className="p-4 bg-background rounded-xl border border-border">
                        <p className="text-xs font-bold text-muted-foreground italic">
                            Identificación: Chrome (Linux) Realista. Variaciones automáticas de texto activas.
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <div className="space-y-8">
            <h3 className="font-black text-3xl flex items-center gap-4 text-foreground tracking-tight">
                <MessageSquare className="w-10 h-10 text-primary" />
                📝 Documentación API Directa
            </h3>
            <div className="grid grid-cols-1 gap-4">
                {[
                    { method: 'GET', path: '/whatsapp/qr', desc: 'Obtener QR y conectar sesión inteligente.', color: 'text-emerald-500' },
                    { method: 'GET', path: '/whatsapp/status', desc: 'Verificar estado de conexión y auto-responder.', color: 'text-blue-500' },
                    { method: 'PATCH', path: '/whatsapp/config/:userId/settings', desc: 'Actualizar palabras clave y límites críticos.', color: 'text-amber-500' },
                    { method: 'POST', path: '/whatsapp/config/:userId/preset', desc: 'Agregar mensaje (Texto o URL de Imagen).', color: 'text-cyan-500' },
                    { method: 'DELETE', path: '/whatsapp/session', desc: 'Cerrar sesión y borrar datos locales.', color: 'text-red-500' },
                ].map((api) => (
                    <div key={api.path} className="group p-6 bg-muted/30 hover:bg-muted/50 rounded-2xl border border-border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="font-mono text-sm">
                            <span className={`font-black uppercase mr-4 px-2 py-1 rounded bg-background ${api.color}`}>{api.method}</span>
                            <span className="text-foreground/80 font-bold">{api.path}</span>
                        </div>
                        <p className="text-muted-foreground text-sm font-bold">{api.desc}</p>
                    </div>
                ))}
            </div>
        </div>

        <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-primary/10 to-transparent border-2 border-primary/10 flex flex-col md:flex-row items-center gap-8">
            <div className="p-5 bg-primary rounded-[1.5rem] text-primary-foreground shadow-2xl shadow-primary/20">
                <Info className="w-10 h-10" />
            </div>
            <div className="text-center md:text-left">
                <h4 className="font-black text-foreground mb-2 text-2xl">Integración Laravel</h4>
                <p className="text-muted-foreground font-bold text-lg mb-4">
                    Base URL: <code className="bg-background px-3 py-1 rounded-lg text-primary font-black border border-primary/20">{import.meta.env.VITE_WHATSAPP_API_URL || 'http://localhost:3000'}</code>
                </p>
                <div className="flex flex-wrap gap-3">
                    <Badge variant="outline" className="rounded-full px-4 py-1 font-bold">JWT Auth Required</Badge>
                    <Badge variant="outline" className="rounded-full px-4 py-1 font-bold">Inertia Shared Data</Badge>
                </div>
            </div>
        </div>
    </div>
);

export default function WhatsAppMiranda() {
    const { login, getStatus, getConfig, toggleAutoResponder, updateSettings, addPreset, updatePreset, deletePreset, getQR, logoutSession, loading, error } = useWhatsApp();
    const [status, setStatus] = useState<any>(null);
    const [config, setConfig] = useState<any>(null);
    const [stats, setStats] = useState<any>(null);
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [editingPreset, setEditingPreset] = useState<any>(null);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState<{ title: string, description: string, onConfirm: () => void } | null>(null);
    const [loadingStats, setLoadingStats] = useState(false);
    const [showDisconnectedDialog, setShowDisconnectedDialog] = useState(true);

    // Verificar si está conectado
    const isConnected = status?.status === 'CONNECTED';

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

    const fetchStats = async () => {
        setLoadingStats(true);
        try {
            const response = await whatsappClient.get('/whatsapp/stats?sessionName=default');
            if (response.data) {
                setStats(response.data);
            }
        } catch (err) {
            console.error('Error fetching stats', err);
        } finally {
            setLoadingStats(false);
        }
    };

    useEffect(() => {
        initAuth();
        const interval = setInterval(() => {
            if (isAuthorized) {
                fetchStatus();
                fetchStats();
            }
        }, 10000);
        return () => clearInterval(interval);
    }, [isAuthorized]);

    useEffect(() => {
        // Mostrar dialog si está desconectado
        if (status && status.status === 'DISCONNECTED') {
            setShowDisconnectedDialog(true);
        } else if (isConnected) {
            setShowDisconnectedDialog(false);
        }
    }, [status?.status]);

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

            // Normalizar mediaUrl para evitar 400 Bad Request en la API si está vacío
            const normalizedPreset = {
                ...preset,
                mediaUrl: preset.mediaUrl?.trim() || null,
                mediaType: preset.mediaUrl?.trim() ? 'image' : 'text',
                tipo: preset.mediaUrl?.trim() ? 'IMAGE' : 'TEXT'
            };

            if (editingPreset) {
                await updatePreset(editingPreset.id, normalizedPreset);
                setEditingPreset(null);
                toast.success('Respuesta actualizada');
            } else {
                await addPreset(userId, normalizedPreset);
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

    const getRiskColor = (nivel: string) => {
        switch (nivel?.toUpperCase()) {
            case 'BAJO':
                return { bg: 'bg-green-50', border: 'border-green-200', badge: 'bg-green-100 text-green-800', icon: '🟢' };
            case 'ESTABLE':
                return { bg: 'bg-yellow-50', border: 'border-yellow-200', badge: 'bg-yellow-100 text-yellow-800', icon: '🟡' };
            case 'ALTO':
                return { bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-800', icon: '🔴' };
            default:
                return { bg: 'bg-slate-50', border: 'border-slate-200', badge: 'bg-slate-100 text-slate-800', icon: '⚪' };
        }
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
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0 bg-primary" style={{ boxShadow: '0 20px 25px -5px rgba(var(--primary), 0.1)' }}>
                            <MessageSquare className="w-8 h-8" />
                        </div>
                        <div className="flex-1">
                            <h2 className="font-extrabold text-xl text-foreground leading-tight">Miranda WhatsApp Hub</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <StatusBadge status={status?.status} />
                                <span className="text-xs font-medium text-muted-foreground italic">ID Usuario: {import.meta.env.VITE_WHATSAPP_USER_ID || '1'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0">
                        <div className="flex flex-col items-center md:items-end">
                            <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-2 px-1">Respondedor</span>
                            <div className="flex items-center gap-3">
                                <span className={`text-xs font-bold ${status?.autoResponder ? 'text-primary' : 'text-muted-foreground'}`}>
                                    {status?.autoResponder ? 'ACTIVO' : 'OFF'}
                                </span>
                                <Switch
                                    checked={status?.autoResponder || false}
                                    onCheckedChange={handleToggleBot}
                                    disabled={loading || !isConnected}
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Dialog>
                                <DialogTrigger >
                                    <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl border-primary/20 text-primary hover:bg-primary/10">
                                        <HelpCircle className="w-5 h-5" />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl p-0">
                                    <HelpSection isConnected={isConnected} />
                                </DialogContent>
                            </Dialog>
                            {isConnected && (
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive hover:text-white transition-all h-12 rounded-xl font-bold"
                                    onClick={handleLogout}
                                    disabled={loading}
                                >
                                    <Power className="w-4 h-4 mr-2" />
                                    Cerrar Sesión
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                <Tabs defaultValue="status" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto p-1.5 bg-muted rounded-2xl border mb-2">
                        <TabsTrigger value="status" className="py-4 rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-md font-bold transition-all text-primary">
                            <QrCode className="w-4 h-4 mr-2" />
                            <span className="hidden sm:inline">Conexión</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="settings"
                            disabled={!isConnected}
                            className="py-4 rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-md font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed text-primary"
                        >
                            {!isConnected && <Lock className="w-4 h-4 mr-2" />}
                            {isConnected && <Settings className="w-4 h-4 mr-2" />}
                            <span className="hidden sm:inline">Bot Config</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="presets"
                            disabled={!isConnected}
                            className="py-4 rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-md font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed text-primary"
                        >
                            {!isConnected && <Lock className="w-4 h-4 mr-2" />}
                            {isConnected && <MessageSquare className="w-4 h-4 mr-2" />}
                            <span className="hidden sm:inline">Respuestas</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="stats"
                            disabled={!isConnected}
                            className="py-4 rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-md font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed text-primary"
                        >
                            {!isConnected && <Lock className="w-4 h-4 mr-2" />}
                            {isConnected && <BarChart3 className="w-4 h-4 mr-2" />}
                            <span className="hidden sm:inline">Estadísticas</span>
                        </TabsTrigger>
                    </TabsList>

                    <div className="mt-8">
                        <TabsContent value="status" className="m-0 focus-visible:outline-none">
                            <Card className="overflow-hidden border-none shadow-xl rounded-3xl">
                                <CardHeader className="text-primary-foreground p-8 bg-primary">
                                    <CardTitle className="text-2xl font-black">Vincular con WhatsApp</CardTitle>
                                    <CardDescription className="text-primary-foreground/80 text-base font-medium">Control de enlace oficial para el automatizador Miranda.</CardDescription>
                                </CardHeader>
                                <CardContent className="flex flex-col items-center justify-center py-16 bg-card">
                                    {!status || status.status !== 'CONNECTED' ? (
                                        <div className="flex flex-col items-center space-y-10 animate-in fade-in duration-500">
                                            {qrCode ? (
                                                <div className="p-8 bg-card border-4 rounded-[2.5rem] shadow-2xl transition-all hover:scale-[1.02] border-primary">
                                                    <img src={qrCode} alt="QR Code" className="w-72 h-72" />
                                                </div>
                                            ) : (
                                                <div className="w-72 h-72 bg-muted flex items-center justify-center rounded-[2.5rem] border-4 border-dashed border-muted-foreground/20">
                                                    <QrCode className="w-24 h-24 text-muted-foreground/30" />
                                                </div>
                                            )}
                                            <div className="flex flex-col items-center gap-6 text-center max-w-sm">
                                                <p className="text-muted-foreground font-medium leading-relaxed">
                                                    Abre tu app de WhatsApp, ve a <b>Dispositivos vinculados</b> y escanea el código para activar el sistema.
                                                </p>
                                                <Button onClick={handleGetQR} disabled={loading} size="lg" className="text-primary-foreground px-10 h-14 rounded-2xl text-lg font-black transition-all hover:shadow-xl bg-primary">
                                                    {loading ? 'Preparando...' : (qrCode ? 'Refrescar Código' : 'Generar Vinculación')}
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center space-y-8 text-center animate-in zoom-in-95 duration-500">
                                            <div className="relative">
                                                <div className="w-28 h-28 rounded-full bg-primary/10 flex items-center justify-center border-8 border-background shadow-xl">
                                                    <CheckCircle2 className="w-14 h-14 text-primary" />
                                                </div>
                                                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center border-4 border-background shadow-sm bg-primary">
                                                    <div className="w-2 h-2 rounded-full bg-background animate-pulse" />
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="text-3xl font-black text-foreground tracking-tight">Sistema Conectado</h3>
                                                <p className="text-muted-foreground font-bold mt-2 text-xl">Sesión operativa: <span className="text-primary">{status.sessionName}</span></p>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg mt-6">
                                                <div className="p-6 bg-muted rounded-2xl border border-border text-left">
                                                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1 leading-none">Status Final</p>
                                                    <p className="font-extrabold text-2xl text-primary leading-tight">ONLINE</p>
                                                </div>
                                                <div className="p-6 bg-muted rounded-2xl border border-border text-left">
                                                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1 leading-none">aasd</p>
                                                    <p className={`font-extrabold text-2xl leading-tight ${status.autoResponder ? 'text-primary' : 'text-muted-foreground/50'}`}>
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
                            {!isConnected ? (
                                <Card className="overflow-hidden border-2 rounded-3xl shadow-xl border-primary/20 bg-primary/5">
                                    <CardContent className="flex flex-col items-center justify-center py-24">
                                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                                            <Lock className="w-10 h-10 text-primary" />
                                        </div>
                                        <h3 className="text-2xl font-black text-foreground mb-2">Configuración Bloqueada</h3>
                                        <p className="text-muted-foreground font-bold text-center max-w-md">Vincule su WhatsApp para personalizar los parámetros de su asistente Miranda.</p>
                                        <Button
                                            onClick={() => {
                                                const tabs = document.querySelector('[role="tablist"]');
                                                const statusTab = tabs?.querySelector('[value="status"]') as HTMLElement;
                                                statusTab?.click();
                                            }}
                                            className="mt-8 rounded-2xl font-black px-8 h-12 bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
                                        >
                                            Vincular Ahora
                                        </Button>
                                    </CardContent>
                                </Card>
                            ) : (
                                <form onSubmit={handleUpdateSettings} className="space-y-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                        <div className="lg:col-span-2 space-y-8">
                                            <Card className="shadow-lg border-none rounded-3xl overflow-hidden">
                                                <CardHeader className="pb-4">
                                                    <CardTitle className="text-xl font-black flex items-center gap-3">
                                                        <div className="p-2 rounded-lg bg-primary/10 text-primary"><Settings className="w-5 h-5" /></div>
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
                                                            className="min-h-[120px] rounded-2xl border-border text-lg font-medium transition-all focus-visible:ring-primary"
                                                        />
                                                        <p className="text-xs font-bold text-slate-400 italic">Separa los gatillos por comas. El bot es sensible al contenido del mensaje.</p>
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            <Card className="shadow-lg border-none rounded-3xl overflow-hidden bg-card">
                                                <CardHeader className="pb-4">
                                                    <CardTitle className="text-xl font-black flex items-center gap-3 text-foreground">
                                                        <div className="p-2 rounded-lg bg-primary/10 text-primary"><Shield className="w-5 h-5" /></div>
                                                        Límites Críticos de Flujo
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                                    <div className="space-y-2">
                                                        <Label className="font-bold text-muted-foreground">Límite / Hora</Label>
                                                        <Input type="number" value={settings.maxMensajesPorHora} onChange={(e) => setSettings({ ...settings, maxMensajesPorHora: parseInt(e.target.value) })} className="h-14 rounded-xl border-border text-xl font-bold bg-muted/30" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="font-bold text-muted-foreground">Límite / Día</Label>
                                                        <Input type="number" value={settings.maxMensajesPorDia} onChange={(e) => setSettings({ ...settings, maxMensajesPorDia: parseInt(e.target.value) })} className="h-14 rounded-xl border-border text-xl font-bold bg-muted/30" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="font-bold text-muted-foreground">Re-envío (Min)</Label>
                                                        <Input type="number" step="0.1" value={settings.cooldownMinutos} onChange={(e) => setSettings({ ...settings, cooldownMinutos: parseFloat(e.target.value) })} className="h-14 rounded-xl border-border text-xl font-bold bg-muted/30" />
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>

                                        <div className="space-y-8">
                                            <Card className="shadow-lg border-none rounded-3xl overflow-hidden bg-card">
                                                <CardHeader className="bg-primary py-6">
                                                    <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-center text-primary-foreground">Simulación Biológica</CardTitle>
                                                </CardHeader>
                                                <CardContent className="space-y-8 pt-8">
                                                    <div className="space-y-6">
                                                        <div className="space-y-4">
                                                            <Label className="text-xs font-black text-muted-foreground uppercase tracking-widest">Retraso de Respuesta (ms)</Label>
                                                            <div className="grid grid-cols-2 gap-2">
                                                                <div className="space-y-1">
                                                                    <span className="text-[10px] font-black text-muted-foreground ml-1">MIN</span>
                                                                    <Input type="number" value={settings.minResponseDelay} onChange={(e) => setSettings({ ...settings, minResponseDelay: parseInt(e.target.value) })} className="h-12 rounded-xl text-center font-bold bg-muted/20 border-border" />
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <span className="text-[10px] font-black text-muted-foreground ml-1">MAX</span>
                                                                    <Input type="number" value={settings.maxResponseDelay} onChange={(e) => setSettings({ ...settings, maxResponseDelay: parseInt(e.target.value) })} className="h-12 rounded-xl text-center font-bold bg-muted/20 border-border" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-4">
                                                            <Label className="text-xs font-black text-muted-foreground uppercase tracking-widest">Simul. Escritura (ms)</Label>
                                                            <div className="grid grid-cols-2 gap-2">
                                                                <div className="space-y-1">
                                                                    <span className="text-[10px] font-black text-muted-foreground ml-1">MIN</span>
                                                                    <Input type="number" value={settings.minTypingDelay} onChange={(e) => setSettings({ ...settings, minTypingDelay: parseInt(e.target.value) })} className="h-12 rounded-xl text-center font-bold bg-muted/20 border-border" />
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <span className="text-[10px] font-black text-muted-foreground ml-1">MAX</span>
                                                                    <Input type="number" value={settings.maxTypingDelay} onChange={(e) => setSettings({ ...settings, maxTypingDelay: parseInt(e.target.value) })} className="h-12 rounded-xl text-center font-bold bg-muted/20 border-border" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Button type="submit" disabled={loading} className="w-full text-primary-foreground h-14 rounded-2xl text-lg font-black transition-all hover:scale-[1.02] bg-primary shadow-lg shadow-primary/20">
                                                        {loading ? 'Guardando...' : 'Guardar Cambios'}
                                                    </Button>
                                                </CardContent>
                                            </Card>

                                            <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10 flex gap-4">
                                                <AlertCircle className="w-8 h-8 text-primary shrink-0" />
                                                <div>
                                                    <h4 className="font-extrabold text-foreground tabular-nums">Importante</h4>
                                                    <p className="text-sm font-medium text-muted-foreground leading-relaxed mt-1">Valores demasiado bajos aumentan el riesgo de detección de bots.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            )}
                        </TabsContent>

                        <TabsContent value="presets" className="m-0 focus-visible:outline-none space-y-10">
                            {!isConnected ? (
                                <Card className="overflow-hidden border-2 rounded-3xl shadow-xl border-primary/20 bg-primary/5">
                                    <CardContent className="flex flex-col items-center justify-center py-24">
                                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                                            <MessageSquare className="w-10 h-10 text-primary" />
                                        </div>
                                        <h3 className="text-2xl font-black text-foreground mb-2">Respuestas Bloqueadas</h3>
                                        <p className="text-muted-foreground font-bold text-center max-w-md">Inicie sesión para gestionar el catálogo de respuestas inteligentes de Miranda.</p>
                                        <Button
                                            onClick={() => {
                                                const tabs = document.querySelector('[role="tablist"]');
                                                const statusTab = tabs?.querySelector('[value="status"]') as HTMLElement;
                                                statusTab?.click();
                                            }}
                                            className="mt-8 rounded-2xl font-black px-8 h-12 bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
                                        >
                                            Ir a Conexión
                                        </Button>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="space-y-10">
                                    <Card className={`transition-all duration-500 rounded-[2.5rem] border-none shadow-xl ${editingPreset ? 'ring-4 ring-primary' : ''}`}>
                                        <CardHeader className="pt-10 px-10">
                                            <CardTitle className="text-2xl font-black flex items-center gap-4 text-foreground">
                                                <div className={`p-3 rounded-2xl transition-colors ${editingPreset ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'bg-muted text-muted-foreground'}`}>
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
                                                <Button onClick={handleAddPreset} disabled={loading} className={`h-14 px-12 rounded-2xl text-lg font-black transition-all hover:scale-[1.02] shadow-lg ${editingPreset ? 'bg-primary text-primary-foreground shadow-primary/20' : 'bg-foreground text-background hover:opacity-90'}`}>
                                                    {loading ? 'Procesando...' : (editingPreset ? 'Finalizar Edición' : 'Registrar Respuesta')}
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between px-2">
                                            <h3 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-3">
                                                <MessageSquare className="w-7 h-7 text-primary" /> Respuestas Programadas
                                            </h3>
                                            <Badge className="bg-muted text-muted-foreground border-none font-bold px-4 py-1.5 rounded-full">{(config?.respuestas || []).length} Guardadas</Badge>
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
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="stats" className="m-0 focus-visible:outline-none space-y-8">
                            {!isConnected ? (
                                <Card className="overflow-hidden border-2 rounded-3xl shadow-xl border-primary/20 bg-primary/5">
                                    <CardContent className="flex flex-col items-center justify-center py-24">
                                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                                            <BarChart3 className="w-10 h-10 text-primary" />
                                        </div>
                                        <h3 className="text-2xl font-black text-foreground mb-2">Análisis Bloqueado</h3>
                                        <p className="text-muted-foreground font-bold text-center max-w-md">Estadísticas de uso y niveles de riesgo disponibles tras la conexión.</p>
                                        <Button
                                            onClick={() => {
                                                const tabs = document.querySelector('[role="tablist"]');
                                                const statusTab = tabs?.querySelector('[value="status"]') as HTMLElement;
                                                statusTab?.click();
                                            }}
                                            className="mt-8 rounded-2xl font-black px-8 h-12 bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
                                        >
                                            Ir a Conexión
                                        </Button>
                                    </CardContent>
                                </Card>
                            ) : (
                                <>
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-3">
                                            <BarChart3 className="w-7 h-7 text-primary" /> Estadísticas en Tiempo Real
                                        </h3>
                                        <Button
                                            onClick={fetchStats}
                                            disabled={loadingStats}
                                            size="sm"
                                            variant="outline"
                                            className="rounded-xl border-primary/20 text-primary hover:bg-primary/5 h-10 px-6 font-bold"
                                        >
                                            {loadingStats ? 'Cargando...' : 'Actualizar Dados'}
                                        </Button>
                                    </div>

                                    {stats ? (
                                        <div className="space-y-8">
                                            {/* Risk Level Card */}
                                            {stats.analisisRiesgo && (
                                                <Card className={`border-2 overflow-hidden rounded-3xl ${getRiskColor(stats.analisisRiesgo.nivel).border}`} style={{ backgroundColor: getRiskColor(stats.analisisRiesgo.nivel).bg }}>
                                                    <CardHeader className="pb-4">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <CardTitle className="text-2xl font-black flex items-center gap-3">
                                                                    <span className="text-4xl">{getRiskColor(stats.analisisRiesgo.nivel).icon}</span>
                                                                    Nivel de Riesgo
                                                                </CardTitle>
                                                                <Badge className={`${getRiskColor(stats.analisisRiesgo.nivel).badge} font-black mt-3 text-base px-4 py-2 rounded-full`}>
                                                                    {stats.analisisRiesgo.nivel} ({stats.analisisRiesgo.porcentajeUso})
                                                                </Badge>
                                                            </div>
                                                            <AlertTriangle className="w-12 h-12 opacity-20" />
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent className="space-y-6">
                                                        <div className="p-6 bg-white/50 rounded-2xl border border-current/10">
                                                            <p className="font-bold text-lg leading-relaxed">{stats.analisisRiesgo.recomendacion}</p>
                                                        </div>
                                                        {stats.analisisRiesgo.factores && (
                                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                                <div className="p-4 bg-white/50 rounded-xl">
                                                                    <p className="text-xs font-black uppercase mb-2">Uso Horario Alto</p>
                                                                    <p className="font-bold text-lg">{stats.analisisRiesgo.factores.usoHorarioAlto ? '❌ Sí' : '✅ No'}</p>
                                                                </div>
                                                                <div className="p-4 bg-white/50 rounded-xl">
                                                                    <p className="text-xs font-black uppercase mb-2">Uso Diario Alto</p>
                                                                    <p className="font-bold text-lg">{stats.analisisRiesgo.factores.usoDiarioAlto ? '❌ Sí' : '✅ No'}</p>
                                                                </div>
                                                                <div className="p-4 bg-white/50 rounded-xl">
                                                                    <p className="text-xs font-black uppercase mb-2">Muchos Msgs/Contacto</p>
                                                                    <p className="font-bold text-lg">{stats.analisisRiesgo.factores.muchosMensajesPorContacto ? '❌ Sí' : '✅ No'}</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            )}

                                            {/* Stats Grid */}
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                                {/* Connection Status */}
                                                <Card className="border-none shadow-lg rounded-3xl overflow-hidden">
                                                    <CardHeader className="bg-primary/5 pb-4">
                                                        <CardTitle className="text-lg font-black flex items-center gap-2 text-foreground">
                                                            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                                                            Estado de Conexión
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="pt-8">
                                                        <div className="space-y-4">
                                                            <div className="flex justify-between items-center p-4 bg-muted/50 rounded-xl">
                                                                <span className="font-bold text-foreground">Estado:</span>
                                                                <Badge className="bg-primary/10 text-primary border-primary/20 font-black">{stats.estadoConexion}</Badge>
                                                            </div>
                                                            <div className="flex justify-between items-center p-4 bg-muted/50 rounded-xl">
                                                                <span className="font-bold text-foreground">Respondedor:</span>
                                                                <Badge className={`font-black ${stats.autoResponderActivo ? 'bg-primary/10 text-primary border-primary/20' : 'bg-muted text-muted-foreground'}`}>
                                                                    {stats.autoResponderActivo ? 'ACTIVO' : 'PAUSADO'}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>

                                                {/* Contacts */}
                                                <Card className="border-none shadow-lg rounded-3xl overflow-hidden">
                                                    <CardHeader className="bg-primary/10 pb-4">
                                                        <CardTitle className="text-lg font-black text-foreground">Contactos</CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="pt-8">
                                                        <div className="space-y-4">
                                                            <div className="flex justify-between items-center p-4 bg-muted/50 rounded-xl">
                                                                <span className="font-bold text-foreground">Total:</span>
                                                                <span className="font-black text-2xl text-primary">{stats.contactos.total}</span>
                                                            </div>
                                                            <div className="flex justify-between items-center p-4 bg-muted/50 rounded-xl">
                                                                <span className="font-bold text-foreground">Últimas 24h:</span>
                                                                <span className="font-black text-2xl text-primary">{stats.contactos.activos24h}</span>
                                                            </div>
                                                            <div className="flex justify-between items-center p-4 bg-muted/50 rounded-xl">
                                                                <span className="font-bold text-foreground">Inactivos:</span>
                                                                <span className="font-black text-2xl text-muted-foreground">{stats.contactos.inactivos}</span>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </div>

                                            {/* Messages Stats */}
                                            <Card className="border-none shadow-lg rounded-3xl overflow-hidden">
                                                <CardHeader className="bg-primary/5 pb-4">
                                                    <CardTitle className="text-lg font-black text-foreground">Mensajes</CardTitle>
                                                </CardHeader>
                                                <CardContent className="pt-8">
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                        <div className="p-4 bg-muted/50 rounded-xl">
                                                            <p className="text-xs font-black uppercase text-muted-foreground mb-2">Enviados</p>
                                                            <p className="font-black text-3xl text-primary">{stats.mensajes.totalEnviados}</p>
                                                        </div>
                                                        <div className="p-4 bg-muted/50 rounded-xl">
                                                            <p className="text-xs font-black uppercase text-muted-foreground mb-2">Recibidos</p>
                                                            <p className="font-black text-3xl text-foreground">{stats.mensajes.totalRecibidos}</p>
                                                        </div>
                                                        <div className="p-4 bg-muted/50 rounded-xl">
                                                            <p className="text-xs font-black uppercase text-muted-foreground mb-2">Automáticos</p>
                                                            <p className="font-black text-3xl text-primary">{stats.mensajes.automaticosEnviados}</p>
                                                        </div>
                                                        <div className="p-4 bg-muted/50 rounded-xl">
                                                            <p className="text-xs font-black uppercase text-muted-foreground mb-2">Ratio</p>
                                                            <p className="font-black text-3xl text-primary">{stats.mensajes.ratio}x</p>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            {/* Rate Limits */}
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                                <Card className="border-none shadow-lg rounded-3xl overflow-hidden">
                                                    <CardHeader className="bg-primary/10 pb-4">
                                                        <CardTitle className="text-lg font-black text-foreground">Límite Horario</CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="pt-8">
                                                        <div className="space-y-6">
                                                            <div>
                                                                <div className="flex justify-between items-center mb-3">
                                                                    <span className="font-bold text-foreground">Uso: {stats.rateLimits.horario.porcentaje}</span>
                                                                    <span className="font-black text-sm text-muted-foreground">{stats.rateLimits.horario.usados} / {stats.rateLimits.horario.limite}</span>
                                                                </div>
                                                                <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                                                                    <div
                                                                        className="h-full bg-primary rounded-full transition-all"
                                                                        style={{ width: stats.rateLimits.horario.porcentaje }}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="p-4 bg-muted/50 rounded-xl">
                                                                <p className="text-xs font-black uppercase text-muted-foreground mb-1">Disponibles</p>
                                                                <p className="font-black text-2xl text-primary">{stats.rateLimits.horario.disponibles}</p>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>

                                                <Card className="border-none shadow-lg rounded-3xl overflow-hidden">
                                                    <CardHeader className="bg-primary/5 pb-4">
                                                        <CardTitle className="text-lg font-black text-foreground">Límite Diario</CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="pt-8">
                                                        <div className="space-y-6">
                                                            <div>
                                                                <div className="flex justify-between items-center mb-3">
                                                                    <span className="font-bold text-foreground">Uso: {stats.rateLimits.diario.porcentaje}</span>
                                                                    <span className="font-black text-sm text-muted-foreground">{stats.rateLimits.diario.usados} / {stats.rateLimits.diario.limite}</span>
                                                                </div>
                                                                <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                                                                    <div
                                                                        className="h-full bg-primary rounded-full transition-all"
                                                                        style={{ width: stats.rateLimits.diario.porcentaje }}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="p-4 bg-muted/50 rounded-xl">
                                                                <p className="text-xs font-black uppercase text-muted-foreground mb-1">Disponibles</p>
                                                                <p className="font-black text-2xl text-primary">{stats.rateLimits.diario.disponibles}</p>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </div>

                                            {/* Last Update */}
                                            <div className="text-center text-xs font-bold text-muted-foreground/50 uppercase tracking-widest">
                                                Última actualización: {new Date(stats.timestamp).toLocaleTimeString('es-ES')}
                                            </div>
                                        </div>
                                    ) : null}
                                </>
                            )}
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

            {/* Dialog de Desconexión */}
            <Dialog open={showDisconnectedDialog && !isConnected} onOpenChange={setShowDisconnectedDialog}>
                <DialogContent className="rounded-3xl max-w-md border-2 border-primary">
                    <DialogHeader className="text-center">
                        <div className="flex justify-center mb-4">
                            <div className="w-20 h-20 rounded-full flex items-center justify-center text-primary-foreground bg-primary">
                                <Smartphone className="w-10 h-10" />
                            </div>
                        </div>
                        <DialogTitle className="text-2xl font-black text-center text-foreground">Conecta con WhatsApp</DialogTitle>
                        <DialogDescription className="text-base font-bold text-center mt-2 text-muted-foreground/80">
                            Tu sesión de Miranda no está vinculada. Por favor, conecta con WhatsApp escaneando el código QR en la pestaña de <b>Conexión</b>.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-6 px-4 bg-muted rounded-2xl border-2 border-dashed text-center border-primary/30">
                        <p className="font-black text-sm text-primary">📱 Abre WhatsApp en tu celular</p>
                        <p className="text-xs text-muted-foreground font-bold mt-2 italic">Ve a Dispositivos vinculados y escanea el QR</p>
                    </div>
                    <DialogFooter>
                        <Button
                            onClick={() => {
                                handleGetQR();
                                setShowDisconnectedDialog(false);
                            }}
                            disabled={loading}
                            size="lg"
                            className="w-full h-12 rounded-2xl text-primary-foreground font-black text-base bg-primary hover:scale-[1.02] transition-transform shadow-lg shadow-primary/20"
                        >
                            {loading ? 'Preparando...' : 'Ir a Conexión'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout >
    );
}
