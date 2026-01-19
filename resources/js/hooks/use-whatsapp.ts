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

    const toggleAutoResponder = useCallback(async (sessionId: string, status: boolean) => {
        setLoading(true);
        try {
            const response = await whatsappClient.post('/whatsapp/toggle-auto-responder', {
                sessionId,
                status,
            });
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
            const response = await whatsappClient.patch(`/whatsapp/config/${userId}/settings`, settings);
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
            const response = await whatsappClient.post(`/whatsapp/config/${userId}/preset`, preset);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al añadir respuesta');
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
        addPreset,
        logoutSession,
        loading,
        error
    };
};
