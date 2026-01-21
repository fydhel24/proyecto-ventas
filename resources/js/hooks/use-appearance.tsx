import { useCallback, useEffect, useState } from 'react';

export type Appearance = 'light' | 'dark' | 'system';
export type ThemeColor = 'red' | 'green' | 'blue' | 'cyan' | 'white' | 'black';

// Complete theme color palettes with light and dark modes
const COLOR_THEMES: Record<ThemeColor, { light: Record<string, string>; dark: Record<string, string> }> = {
    red: {
        light: {
            '--primary': 'oklch(0.5 0.2 25)', // red primary
            '--primary-foreground': 'oklch(0.985 0 0)', // white
            '--background': 'oklch(0.98 0 0)', // near white
            '--foreground': 'oklch(0.145 0 0)', // dark text
            '--card': 'oklch(1 0 0)', // white
            '--card-foreground': 'oklch(0.145 0 0)',
            '--muted': 'oklch(0.97 0 0)', // light gray
            '--muted-foreground': 'oklch(0.556 0 0)', // medium gray
            '--accent': 'oklch(0.5 0.2 25)', // same as primary
            '--accent-foreground': 'oklch(0.985 0 0)',
            '--secondary': 'oklch(0.45 0.15 25)', // darker red
            '--secondary-foreground': 'oklch(0.985 0 0)',
        },
        dark: {
            '--primary': 'oklch(0.5 0.2 25)', // red primary
            '--primary-foreground': 'oklch(0.985 0 0)',
            '--background': 'oklch(0.12 0 0)', // very dark gray
            '--foreground': 'oklch(0.985 0 0)', // light text
            '--card': 'oklch(0.16 0 0)', // dark gray card
            '--card-foreground': 'oklch(0.985 0 0)',
            '--muted': 'oklch(0.25 0 0)', // medium dark gray
            '--muted-foreground': 'oklch(0.708 0 0)', // light gray text
            '--accent': 'oklch(0.5 0.2 25)', // same as primary
            '--accent-foreground': 'oklch(0.985 0 0)',
            '--secondary': 'oklch(0.6 0.2 25)', // lighter red
            '--secondary-foreground': 'oklch(0.145 0 0)',
        },
    },
    green: {
        light: {
            '--primary': 'oklch(0.55 0.18 142)', // green primary
            '--primary-foreground': 'oklch(0.985 0 0)',
            '--background': 'oklch(0.98 0 0)',
            '--foreground': 'oklch(0.145 0 0)',
            '--card': 'oklch(1 0 0)',
            '--card-foreground': 'oklch(0.145 0 0)',
            '--muted': 'oklch(0.97 0 0)',
            '--muted-foreground': 'oklch(0.556 0 0)',
            '--accent': 'oklch(0.55 0.18 142)',
            '--accent-foreground': 'oklch(0.985 0 0)',
            '--secondary': 'oklch(0.45 0.15 142)',
            '--secondary-foreground': 'oklch(0.985 0 0)',
        },
        dark: {
            '--primary': 'oklch(0.55 0.18 142)',
            '--primary-foreground': 'oklch(0.985 0 0)',
            '--background': 'oklch(0.12 0 0)',
            '--foreground': 'oklch(0.985 0 0)',
            '--card': 'oklch(0.16 0 0)',
            '--card-foreground': 'oklch(0.985 0 0)',
            '--muted': 'oklch(0.25 0 0)',
            '--muted-foreground': 'oklch(0.708 0 0)',
            '--accent': 'oklch(0.55 0.18 142)',
            '--accent-foreground': 'oklch(0.985 0 0)',
            '--secondary': 'oklch(0.6 0.15 142)',
            '--secondary-foreground': 'oklch(0.145 0 0)',
        },
    },
    blue: {
        light: {
            '--primary': 'oklch(0.5 0.2 264)', // blue primary
            '--primary-foreground': 'oklch(0.985 0 0)',
            '--background': 'oklch(0.98 0 0)',
            '--foreground': 'oklch(0.145 0 0)',
            '--card': 'oklch(1 0 0)',
            '--card-foreground': 'oklch(0.145 0 0)',
            '--muted': 'oklch(0.97 0 0)',
            '--muted-foreground': 'oklch(0.556 0 0)',
            '--accent': 'oklch(0.5 0.2 264)',
            '--accent-foreground': 'oklch(0.985 0 0)',
            '--secondary': 'oklch(0.45 0.15 264)',
            '--secondary-foreground': 'oklch(0.985 0 0)',
        },
        dark: {
            '--primary': 'oklch(0.5 0.2 264)',
            '--primary-foreground': 'oklch(0.985 0 0)',
            '--background': 'oklch(0.12 0 0)',
            '--foreground': 'oklch(0.985 0 0)',
            '--card': 'oklch(0.16 0 0)',
            '--card-foreground': 'oklch(0.985 0 0)',
            '--muted': 'oklch(0.25 0 0)',
            '--muted-foreground': 'oklch(0.708 0 0)',
            '--accent': 'oklch(0.5 0.2 264)',
            '--accent-foreground': 'oklch(0.985 0 0)',
            '--secondary': 'oklch(0.6 0.2 264)',
            '--secondary-foreground': 'oklch(0.145 0 0)',
        },
    },
    cyan: {
        light: {
            '--primary': 'oklch(0.65 0.15 200)', // cyan primary
            '--primary-foreground': 'oklch(0.985 0 0)',
            '--background': 'oklch(0.98 0 0)',
            '--foreground': 'oklch(0.145 0 0)',
            '--card': 'oklch(1 0 0)',
            '--card-foreground': 'oklch(0.145 0 0)',
            '--muted': 'oklch(0.97 0 0)',
            '--muted-foreground': 'oklch(0.556 0 0)',
            '--accent': 'oklch(0.65 0.15 200)',
            '--accent-foreground': 'oklch(0.985 0 0)',
            '--secondary': 'oklch(0.55 0.12 200)',
            '--secondary-foreground': 'oklch(0.985 0 0)',
        },
        dark: {
            '--primary': 'oklch(0.65 0.15 200)',
            '--primary-foreground': 'oklch(0.985 0 0)',
            '--background': 'oklch(0.12 0 0)',
            '--foreground': 'oklch(0.985 0 0)',
            '--card': 'oklch(0.16 0 0)',
            '--card-foreground': 'oklch(0.985 0 0)',
            '--muted': 'oklch(0.25 0 0)',
            '--muted-foreground': 'oklch(0.708 0 0)',
            '--accent': 'oklch(0.65 0.15 200)',
            '--accent-foreground': 'oklch(0.985 0 0)',
            '--secondary': 'oklch(0.7 0.15 200)',
            '--secondary-foreground': 'oklch(0.145 0 0)',
        },
    },
    white: {
        light: {
            '--primary': 'oklch(0.98 0 0)', // white primary
            '--primary-foreground': 'oklch(0.145 0 0)',
            '--background': 'oklch(0.98 0 0)',
            '--foreground': 'oklch(0.145 0 0)',
            '--card': 'oklch(1 0 0)',
            '--card-foreground': 'oklch(0.145 0 0)',
            '--muted': 'oklch(0.97 0 0)',
            '--muted-foreground': 'oklch(0.556 0 0)',
            '--accent': 'oklch(0.98 0 0)',
            '--accent-foreground': 'oklch(0.145 0 0)',
            '--secondary': 'oklch(0.95 0 0)',
            '--secondary-foreground': 'oklch(0.145 0 0)',
        },
        dark: {
            '--primary': 'oklch(0.98 0 0)',
            '--primary-foreground': 'oklch(0.145 0 0)',
            '--background': 'oklch(0.12 0 0)',
            '--foreground': 'oklch(0.985 0 0)',
            '--card': 'oklch(0.16 0 0)',
            '--card-foreground': 'oklch(0.985 0 0)',
            '--muted': 'oklch(0.25 0 0)',
            '--muted-foreground': 'oklch(0.708 0 0)',
            '--accent': 'oklch(0.98 0 0)',
            '--accent-foreground': 'oklch(0.145 0 0)',
            '--secondary': 'oklch(0.2 0 0)',
            '--secondary-foreground': 'oklch(0.985 0 0)',
        },
    },
    black: {
        light: {
            '--primary': 'oklch(0.2 0 0)', // black primary
            '--primary-foreground': 'oklch(0.985 0 0)',
            '--background': 'oklch(0.98 0 0)',
            '--foreground': 'oklch(0.145 0 0)',
            '--card': 'oklch(1 0 0)',
            '--card-foreground': 'oklch(0.145 0 0)',
            '--muted': 'oklch(0.97 0 0)',
            '--muted-foreground': 'oklch(0.556 0 0)',
            '--accent': 'oklch(0.2 0 0)',
            '--accent-foreground': 'oklch(0.985 0 0)',
            '--secondary': 'oklch(0.15 0 0)',
            '--secondary-foreground': 'oklch(0.985 0 0)',
        },
        dark: {
            '--primary': 'oklch(0.2 0 0)',
            '--primary-foreground': 'oklch(0.985 0 0)',
            '--background': 'oklch(0.12 0 0)',
            '--foreground': 'oklch(0.985 0 0)',
            '--card': 'oklch(0.16 0 0)',
            '--card-foreground': 'oklch(0.985 0 0)',
            '--muted': 'oklch(0.25 0 0)',
            '--muted-foreground': 'oklch(0.708 0 0)',
            '--accent': 'oklch(0.2 0 0)',
            '--accent-foreground': 'oklch(0.985 0 0)',
            '--secondary': 'oklch(0.3 0 0)',
            '--secondary-foreground': 'oklch(0.985 0 0)',
        },
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

    // Apply complete color theme palette
    const themeMode = isDark ? 'dark' : 'light';
    const colorTheme = COLOR_THEMES[color][themeMode];
    
    Object.entries(colorTheme).forEach(([key, value]) => {
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
