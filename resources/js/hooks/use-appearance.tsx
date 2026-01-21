import { useCallback, useEffect, useState } from 'react';

export type Appearance = 'light' | 'dark' | 'system';
export type ThemeColor = 'red' | 'green' | 'blue' | 'cyan' | 'white' | 'black';

// OKLch color values for theme colors
const COLOR_CSS_VARS: Record<ThemeColor, Record<string, string>> = {
    red: {
        '--primary': 'oklch(0.5 0.2 25)', // red primary
        '--primary-foreground': 'oklch(0.985 0 0)', // white foreground
    },
    green: {
        '--primary': 'oklch(0.55 0.18 142)', // green primary
        '--primary-foreground': 'oklch(0.985 0 0)', // white foreground
    },
    blue: {
        '--primary': 'oklch(0.5 0.2 264)', // blue primary
        '--primary-foreground': 'oklch(0.985 0 0)', // white foreground
    },
    cyan: {
        '--primary': 'oklch(0.65 0.15 200)', // cyan primary
        '--primary-foreground': 'oklch(0.985 0 0)', // white foreground
    },
    white: {
        '--primary': 'oklch(0.98 0 0)', // white primary
        '--primary-foreground': 'oklch(0.145 0 0)', // dark foreground
    },
    black: {
        '--primary': 'oklch(0.2 0 0)', // black primary
        '--primary-foreground': 'oklch(0.985 0 0)', // white foreground
    },
};

const prefersDark = () => {
    if (typeof window === 'undefined') {
        return false;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const setCookie = (name: string, value: string, days = 365) => {
    if (typeof document === 'undefined') {
        return;
    }

    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax`;
};

const applyTheme = (appearance: Appearance, color: ThemeColor = 'blue') => {
    const isDark =
        appearance === 'dark' || (appearance === 'system' && prefersDark());

    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';

    // Apply color theme
    const colorVars = COLOR_CSS_VARS[color];
    Object.entries(colorVars).forEach(([key, value]) => {
        document.documentElement.style.setProperty(key, value);
    });
};

const mediaQuery = () => {
    if (typeof window === 'undefined') {
        return null;
    }

    return window.matchMedia('(prefers-color-scheme: dark)');
};

const handleSystemThemeChange = (color: ThemeColor = 'blue') => {
    const currentAppearance = localStorage.getItem('appearance') as Appearance;
    applyTheme(currentAppearance || 'system', color);
};

export function initializeTheme() {
    const savedAppearance =
        (localStorage.getItem('appearance') as Appearance) || 'system';
    const savedColor = (localStorage.getItem('themeColor') as ThemeColor) || 'blue';

    applyTheme(savedAppearance, savedColor);

    // Add the event listener for system theme changes...
    mediaQuery()?.addEventListener('change', () => handleSystemThemeChange(savedColor));
}

export function useAppearance() {
    const [appearance, setAppearance] = useState<Appearance>(() => {
        if (typeof window === 'undefined') return 'system';
        return (localStorage.getItem('appearance') as Appearance) || 'system';
    });

    const [themeColor, setThemeColor] = useState<ThemeColor>(() => {
        if (typeof window === 'undefined') return 'blue';
        return (localStorage.getItem('themeColor') as ThemeColor) || 'blue';
    });

    const updateAppearance = useCallback((mode: Appearance) => {
        setAppearance(mode);

        // Store in localStorage for client-side persistence...
        localStorage.setItem('appearance', mode);

        // Store in cookie for SSR...
        setCookie('appearance', mode);

        const savedColor = (localStorage.getItem('themeColor') as ThemeColor) || 'blue';
        applyTheme(mode, savedColor);
    }, []);

    const updateThemeColor = useCallback((color: ThemeColor) => {
        setThemeColor(color);

        // Store in localStorage for client-side persistence...
        localStorage.setItem('themeColor', color);

        // Store in cookie for SSR...
        setCookie('themeColor', color);

        const savedAppearance = (localStorage.getItem('appearance') as Appearance) || 'system';
        applyTheme(savedAppearance, color);
    }, []);

    useEffect(() => {
        const savedAppearance = localStorage.getItem('appearance') as Appearance | null;
        const savedColor = localStorage.getItem('themeColor') as ThemeColor | null;

        const appearance = savedAppearance || 'system';
        const color = savedColor || 'blue';

        applyTheme(appearance, color);

        const handleChange = () => handleSystemThemeChange(color);
        mediaQuery()?.addEventListener('change', handleChange);

        return () =>
            mediaQuery()?.removeEventListener(
                'change',
                handleChange,
            );
    }, []);

    return { appearance, updateAppearance, themeColor, updateThemeColor } as const;
}
