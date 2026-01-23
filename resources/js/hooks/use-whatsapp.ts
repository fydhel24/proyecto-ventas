import { useState, useCallback } from 'react';
import whatsappClient from '@/lib/whatsapp-client';

export const useWhatsApp = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const login = useCallback(async (email?: string, password?: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await whatsappClient.post('/auth/login', {
                email: email || import.meta.env.VITE_WHATSAPP_TEST_EMAIL,
                password: password || import.meta.env.VITE_WHATSAPP_TEST_PASSWORD,
            });
            const token = response.data.access_token;
            localStorage.setItem('whatsapp_token', token);
            whatsappClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al iniciar sesión');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const getQR = useCallback(async (sessionName = 'default') => {
        setLoading(true);
        try {
            const response = await whatsappClient.get(`/whatsapp/qr?sessionName=${sessionName}`);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al obtener código QR');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const getStatus = useCallback(async (sessionName = 'default') => {
        try {
            const response = await whatsappClient.get(`/whatsapp/status?sessionName=${sessionName}`);
            return response.data;
        } catch (err: any) {
            console.error('Error fetching status', err);
            return null;
        }
    }, []);

    const toggleAutoResponder = useCallback(async (sessionName: string, enable: boolean) => {
        setLoading(true);
        try {
            const response = await whatsappClient.post(`/whatsapp/toggle-auto-responder?sessionName=${sessionName}&enable=${enable}`);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al cambiar estado del bot');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateSettings = useCallback(async (userId: string, settings: any) => {
        setLoading(true);
        try {
            const response = await whatsappClient.patch(`/whatsapp/config/${userId}/settings?sessionName=default`, settings);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al actualizar configuración');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const addPreset = useCallback(async (userId: string, preset: any) => {
        setLoading(true);
        try {
            const response = await whatsappClient.post(`/whatsapp/config/${userId}/preset?sessionName=default`, preset);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al añadir respuesta');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const getConfig = useCallback(async (userId: string) => {
        setLoading(true);
        try {
            const response = await whatsappClient.get(`/whatsapp/config/${userId}?sessionName=default`);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al obtener configuración');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const updatePreset = useCallback(async (presetId: number, preset: any) => {
        setLoading(true);
        try {
            const response = await whatsappClient.patch(`/whatsapp/config/preset/${presetId}?sessionName=default`, preset);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al actualizar respuesta');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const deletePreset = useCallback(async (presetId: number) => {
        setLoading(true);
        try {
            const response = await whatsappClient.delete(`/whatsapp/config/preset/${presetId}?sessionName=default`);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al eliminar respuesta');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const logoutSession = useCallback(async (sessionName = 'default') => {
        setLoading(true);
        try {
            const response = await whatsappClient.delete(`/whatsapp/session?sessionName=${sessionName}`);
            localStorage.removeItem('whatsapp_token');
            delete whatsappClient.defaults.headers.common['Authorization'];
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al cerrar sesión');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        login,
        getQR,
        getStatus,
        toggleAutoResponder,
        updateSettings,
        getConfig,
        addPreset,
        updatePreset,
        deletePreset,
        logoutSession,
        loading,
        error
    };
};
