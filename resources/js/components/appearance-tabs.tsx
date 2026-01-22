import { Appearance, useAppearance, ThemeColor } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';
import { LucideIcon, Monitor, Moon, Sun, Palette } from 'lucide-react';
import { HTMLAttributes } from 'react';

const appearanceTabs: { value: Appearance; icon: LucideIcon; label: string }[] = [
    { value: 'light', icon: Sun, label: 'Claro' },
    { value: 'dark', icon: Moon, label: 'Oscuro' },
    { value: 'system', icon: Monitor, label: 'Sistema' },
];

const colorThemes: { value: ThemeColor; label: string; color: string }[] = [
    { value: 'red', label: 'Rojo', color: 'bg-red-500' },
    { value: 'green', label: 'Verde', color: 'bg-green-500' },
    { value: 'blue', label: 'Azul', color: 'bg-blue-500' },
    { value: 'cyan', label: 'Celeste', color: 'bg-cyan-500' },
    { value: 'white', label: 'Blanco', color: 'bg-white border-2 border-neutral-300' },
    { value: 'black', label: 'Negro', color: 'bg-black' },
];

export default function AppearanceToggleTab({
    className = '',
    ...props
}: HTMLAttributes<HTMLDivElement>) {
    const { appearance, updateAppearance, themeColor, updateThemeColor } = useAppearance();

    return (
        <div className={cn('w-full space-y-8', className)} {...props}>
            {/* Appearance Mode Selection */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Monitor className="h-5 w-5 text-foreground/60" />
                    <label className="text-base font-semibold text-foreground">
                        Modo de Apariencia
                    </label>
                </div>
                <div className="inline-flex gap-1 rounded-lg bg-muted p-1">
                    {appearanceTabs.map(({ value, icon: Icon, label }) => (
                        <button
                            key={value}
                            onClick={() => updateAppearance(value)}
                            className={cn(
                                'flex items-center rounded-md px-4 py-2 transition-all duration-200 gap-2',
                                appearance === value
                                    ? 'bg-background shadow-sm font-medium text-foreground'
                                    : 'text-foreground/60 hover:text-foreground/80',
                            )}
                            title={label}
                        >
                            <Icon className="h-4 w-4" />
                            <span className="text-sm">{label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Color Theme Selection */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Palette className="h-5 w-5 text-foreground/60" />
                    <label className="text-base font-semibold text-foreground">
                        Color del Tema
                    </label>
                </div>
                <div className="flex flex-wrap gap-4">
                    {colorThemes.map(({ value, label, color }) => (
                        <div key={value} className="flex flex-col items-center gap-2">
                            <button
                                onClick={() => updateThemeColor(value)}
                                className={cn(
                                    'relative group rounded-lg h-12 w-12 transition-all duration-200 cursor-pointer',
                                    'hover:scale-110',
                                    color,
                                    themeColor === value && [
                                        'ring-2 ring-foreground ring-offset-2 ring-offset-background shadow-md',
                                    ],
                                )}
                                title={label}
                            >
                                {themeColor === value && (
                                    <div className="absolute inset-0 flex items-center justify-center rounded-md">
                                        <div className="w-2 h-2 rounded-full bg-foreground" />
                                    </div>
                                )}
                            </button>
                            <span className="text-xs font-medium text-foreground/70">{label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
