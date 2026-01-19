import { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useWhatsApp } from '@/hooks/use-whatsapp';
import { StatusBadge } from '@/components/whatsapp/status-badge';
import { MessageSquare, Settings, Shield, HelpCircle, QrCode, Power, ExternalLink, AlertCircle, CheckCircle2 } from 'lucide-react';
import { BreadcrumbItem } from '@/types';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'WhatsApp Miranda',
        href: '/whatsapp-miranda',
    },
];

export default function WhatsAppMiranda() {
    const { login, getStatus, toggleAutoResponder, updateSettings, addPreset, getQR, logoutSession, loading, error } = useWhatsApp();
    const [status, setStatus] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'status' | 'settings' | 'presets' | 'antiban' | 'help'>('status');
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [isAuthorized, setIsAuthorized] = useState(false);

    // Form states
    const [settings, setSettings] = useState({
        palabrasClave: '',
        minResponseDelay: 1000,
        maxResponseDelay: 3000,
        minTypingDelay: 1000,
        maxTypingDelay: 2000
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
        } catch (err) {
            console.error('Auth failed', err);
        }
    };

    const fetchStatus = async () => {
        const data = await getStatus();
        if (data) {
            setStatus(data);
            setSettings(prev => ({
                ...prev,
                palabrasClave: data.config?.palabrasClave || '',
                minResponseDelay: data.config?.minResponseDelay || 1000,
                maxResponseDelay: data.config?.maxResponseDelay || 3000,
                minTypingDelay: data.config?.minTypingDelay || 1000,
                maxTypingDelay: data.config?.maxTypingDelay || 2000,
            }));
        }
    };

    useEffect(() => {
        initAuth();
        const interval = setInterval(() => {
            if (isAuthorized) fetchStatus();
        }, 10000);
        return () => clearInterval(interval);
    }, [isAuthorized]);

    const handleLogout = async () => {
        if (confirm('¿Estás seguro de que deseas cerrar la sesión de WhatsApp y borrar los datos?')) {
            try {
                await logoutSession();
                setStatus(null);
                setQrCode(null);
                setIsAuthorized(false);
                alert('Sesión cerrada correctamente');
                initAuth(); // Re-intentar login para obtener nuevo token si es necesario
            } catch (err) {
                console.error(err);
            }
        }
    };

    const handleToggleBot = async (checked: boolean) => {
        try {
            await toggleAutoResponder('default', checked);
            fetchStatus();
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdateSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const userId = import.meta.env.VITE_WHATSAPP_USER_ID || '1';
            await updateSettings(userId, settings);
            alert('Configuración actualizada correctamente');
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddPreset = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const userId = import.meta.env.VITE_WHATSAPP_USER_ID || '1';
            await addPreset(userId, preset);
            setPreset({ mediaUrl: '', caption: '' });
            alert('Respuesta guardada correctamente');
        } catch (err) {
            console.error(err);
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

    const sidebarItems = [
        { id: 'status', label: 'Estado y Conexión', icon: QrCode },
        { id: 'settings', label: 'Configuración Bot', icon: Settings },
        { id: 'presets', label: 'Respuestas (Presets)', icon: MessageSquare },
        { id: 'antiban', label: 'Medidas Anti-Ban', icon: Shield },
        { id: 'help', label: 'Guía Técnica', icon: HelpCircle },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="WhatsApp Miranda" />

            <div className="flex h-[calc(100vh-8rem)] overflow-hidden bg-background rounded-lg border shadow-sm">
                {/* Left Sidebar - WhatsApp Web Style */}
                <div className="w-80 border-r bg-muted/30 flex flex-col">
                    <div className="p-4 bg-muted/50 border-b flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center text-white">
                                <MessageSquare className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-sm">Sesiones WhatsApp</h2>
                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                    <StatusBadge status={status?.status} />
                                </div>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={handleLogout}
                            title="Cerrar Sesión"
                            disabled={loading}
                        >
                            <Power className="w-5 h-5" />
                        </Button>
                    </div>

                    <div className="flex-1 overflow-y-auto py-2">
                        {sidebarItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id as any)}
                                className={`w-full flex items-center gap-3 px-4 py-4 text-sm transition-colors hover:bg-accent ${activeTab === item.id ? 'bg-accent' : ''
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-[#25D366]' : 'text-muted-foreground'}`} />
                                <span className="font-medium">{item.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="p-4 border-t bg-muted/30">
                        <div className="text-[10px] text-muted-foreground text-center uppercase tracking-wider font-semibold">
                            Miranda WhatsApp Integration v1.0
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col bg-white overflow-y-auto">
                    {/* Header */}
                    <div className="px-6 py-4 border-b bg-muted/10 sticky top-0 z-10 backdrop-blur-sm">
                        <h1 className="text-xl font-semibold flex items-center gap-2">
                            {sidebarItems.find(i => i.id === activeTab)?.label}
                        </h1>
                    </div>

                    <div className="p-8 max-w-4xl mx-auto w-full space-y-8">
                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {activeTab === 'status' && (
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Conexión del Dispositivo</CardTitle>
                                        <CardDescription>Escanea el código QR para vincular tu WhatsApp.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex flex-col items-center justify-center py-6 space-y-6">
                                        {!status || status.status !== 'CONNECTED' ? (
                                            <div className="flex flex-col items-center space-y-4">
                                                {qrCode ? (
                                                    <div className="p-4 bg-white border rounded-xl shadow-inner">
                                                        <img src={qrCode} alt="QR Code" className="w-64 h-64" />
                                                    </div>
                                                ) : (
                                                    <div className="w-64 h-64 bg-accent flex items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/30">
                                                        <QrCode className="w-16 h-16 text-muted-foreground/20" />
                                                    </div>
                                                )}
                                                <Button onClick={handleGetQR} disabled={loading} size="lg" className="w-full sm:w-auto">
                                                    {loading ? 'Generando...' : (qrCode ? 'Refrescar QR' : 'Generar Código QR')}
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center space-y-4 text-center">
                                                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                                                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-medium">¡Conectado Correctamente!</h3>
                                                    <p className="text-sm text-muted-foreground">Tu sesión "{status.sessionName}" está activa.</p>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 w-full max-w-sm mt-4">
                                                    <div className="p-3 border rounded-lg bg-muted/20">
                                                        <p className="text-[10px] text-muted-foreground uppercase font-bold">Estado</p>
                                                        <p className="font-semibold text-green-600">Activo</p>
                                                    </div>
                                                    <div className="p-3 border rounded-lg bg-muted/20">
                                                        <p className="text-[10px] text-muted-foreground uppercase font-bold">Sesión</p>
                                                        <p className="font-semibold">{status.sessionName}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Control de Auto-Responder</CardTitle>
                                        <CardDescription>Activa o desactiva las respuestas automáticas para esta sesión.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex items-center justify-between p-6 bg-muted/20 rounded-lg mx-6 mb-6">
                                        <div className="space-y-0.5">
                                            <Label className="text-base">Bot Inteligente</Label>
                                            <p className="text-sm text-muted-foreground">Cuando está activo, el bot responde automáticamente a las palabras clave.</p>
                                        </div>
                                        <Switch
                                            checked={status?.autoResponder || false}
                                            onCheckedChange={handleToggleBot}
                                            disabled={loading}
                                        />
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {activeTab === 'settings' && (
                            <form onSubmit={handleUpdateSettings} className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Reglas de Activación</CardTitle>
                                        <CardDescription>Configura los triggers que activarán las respuestas del bot.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="keywords">Palabras Clave (separadas por coma)</Label>
                                            <Input
                                                id="keywords"
                                                value={settings.palabrasClave}
                                                onChange={(e) => setSettings({ ...settings, palabrasClave: e.target.value })}
                                                placeholder="ej: info, precio, catalogo, ayuda"
                                            />
                                            <p className="text-[11px] text-muted-foreground">El bot buscará estas palabras dentro de los mensajes entrantes.</p>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Tiempos de Simulación Humana</CardTitle>
                                        <CardDescription>Ajusta los milisegundos para simular un comportamiento natural.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <h3 className="text-sm font-semibold flex items-center gap-2"><Settings className="w-4 h-4" /> Retraso de Respuesta</h3>
                                            <div className="space-y-2">
                                                <Label>Mínimo (ms)</Label>
                                                <Input type="number" value={settings.minResponseDelay} onChange={(e) => setSettings({ ...settings, minResponseDelay: parseInt(e.target.value) })} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Máximo (ms)</Label>
                                                <Input type="number" value={settings.maxResponseDelay} onChange={(e) => setSettings({ ...settings, maxResponseDelay: parseInt(e.target.value) })} />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <h3 className="text-sm font-semibold flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Simulación de Escritura</h3>
                                            <div className="space-y-2">
                                                <Label>Mínimo (ms)</Label>
                                                <Input type="number" value={settings.minTypingDelay} onChange={(e) => setSettings({ ...settings, minTypingDelay: parseInt(e.target.value) })} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Máximo (ms)</Label>
                                                <Input type="number" value={settings.maxTypingDelay} onChange={(e) => setSettings({ ...settings, maxTypingDelay: parseInt(e.target.value) })} />
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="border-t bg-muted/10 p-4">
                                        <Button type="submit" disabled={loading} className="w-full lg:w-auto ml-auto">
                                            Guardar Configuración
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </form>
                        )}

                        {activeTab === 'presets' && (
                            <form onSubmit={handleAddPreset} className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Nueva Respuesta (Preset)</CardTitle>
                                        <CardDescription>Crea respuestas que incluyan imágenes externas o solo texto.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="mediaUrl">URL de Imagen (Opcional)</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    id="mediaUrl"
                                                    value={preset.mediaUrl}
                                                    onChange={(e) => setPreset({ ...preset, mediaUrl: e.target.value })}
                                                    placeholder="https://example.com/imagen.jpg"
                                                />
                                                <Button variant="outline" size="icon" type="button" onClick={() => window.open(preset.mediaUrl, '_blank')}>
                                                    <ExternalLink className="w-4 h-4" />
                                                </Button>
                                            </div>
                                            <p className="text-[11px] text-muted-foreground">Si no se especifica, se enviará solo texto plano.</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="caption">Mensaje / Pie de Foto</Label>
                                            <Textarea
                                                id="caption"
                                                value={preset.caption}
                                                onChange={(e) => setPreset({ ...preset, caption: e.target.value })}
                                                placeholder="Escribe el mensaje aquí..."
                                                className="min-h-[120px]"
                                            />
                                        </div>
                                    </CardContent>
                                    <CardFooter className="border-t bg-muted/10 p-4">
                                        <Button type="submit" disabled={loading} className="w-full lg:w-auto ml-auto">
                                            Añadir Preset
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </form>
                        )}

                        {activeTab === 'antiban' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Card className="border-blue-100 bg-blue-50/10">
                                        <CardHeader>
                                            <Shield className="w-8 h-8 text-blue-600 mb-2" />
                                            <CardTitle className="text-blue-900">Simulación Humana</CardTitle>
                                        </CardHeader>
                                        <CardContent className="text-sm text-blue-800 space-y-2">
                                            <p><strong>Thinking Delay:</strong> Espera aleatoria antes de realizar cualquier acción.</p>
                                            <p><strong>Typing State:</strong> Muestra "Escribiendo..." para parecer una persona real.</p>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-orange-100 bg-orange-50/10">
                                        <CardHeader>
                                            <Power className="w-8 h-8 text-orange-600 mb-2" />
                                            <CardTitle className="text-orange-900">Protección de Cuenta</CardTitle>
                                        </CardHeader>
                                        <CardContent className="text-sm text-orange-800 space-y-2">
                                            <p><strong>Cooldown Cooldown:</strong> Evita el spam respondiendo solo una vez por intervalo al mismo contacto.</p>
                                            <p><strong>Límites Globales:</strong> Protege la cuenta de ráfagas masivas de mensajes.</p>
                                        </CardContent>
                                    </Card>
                                </div>

                                <Alert className="bg-green-50 border-green-200">
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    <AlertTitle className="text-green-800 font-bold">Resiliencia Automática</AlertTitle>
                                    <AlertDescription className="text-green-700">
                                        Si una imagen no carga o el link está roto, el bot detectará el error y enviará automáticamente el mensaje en texto plano para que el cliente siempre reciba una respuesta.
                                    </AlertDescription>
                                </Alert>
                            </div>
                        )}

                        {activeTab === 'help' && (
                            <div className="prose prose-sm max-w-none space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Referencia de Endpoints API</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="p-4 bg-slate-900 rounded-lg text-slate-100 font-mono text-[13px] space-y-3">
                                            <div className="border-b border-slate-700 pb-2">
                                                <span className="text-green-400 font-bold">POST</span> /auth/login
                                                <p className="text-slate-400 mt-1 text-xs">// Obtiene el JWT Token</p>
                                            </div>
                                            <div className="border-b border-slate-700 pb-2">
                                                <span className="text-blue-400 font-bold">GET</span> /whatsapp/qr
                                                <p className="text-slate-400 mt-1 text-xs">// Recupera QR en base64</p>
                                            </div>
                                            <div className="border-b border-slate-700 pb-2">
                                                <span className="text-yellow-400 font-bold">PATCH</span> /whatsapp/config/:uid/settings
                                                <p className="text-slate-400 mt-1 text-xs">// Actualiza delays y triggers</p>
                                            </div>
                                            <div className="border-b border-slate-700 pb-2">
                                                <span className="text-green-400 font-bold">POST</span> /whatsapp/config/:uid/preset
                                                <p className="text-slate-400 mt-1 text-xs">// Añade respuestas con multimedia</p>
                                            </div>
                                            <div>
                                                <span className="text-red-400 font-bold">DELETE</span> /whatsapp/session
                                                <p className="text-slate-400 mt-1 text-xs">// Desconecta y borra sesión</p>
                                            </div>
                                        </div>

                                        <div className="bg-accent/30 p-4 rounded-lg flex items-start gap-3">
                                            <HelpCircle className="w-5 h-5 mt-1 text-primary" />
                                            <div>
                                                <h4 className="font-semibold text-sm">¿Cómo integrar?</h4>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    Usa el Header <code className="bg-accent px-1 rounded">Authorization: Bearer [tu_token]</code> en cada petición.
                                                    La base URL es: <code className="bg-accent px-1 rounded">{import.meta.env.VITE_WHATSAPP_API_URL}</code>
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
