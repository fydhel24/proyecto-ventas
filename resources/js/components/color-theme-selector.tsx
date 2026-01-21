import { ThemeColor, useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';
import { Palette } from 'lucide-react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

const colorThemes: { value: ThemeColor; label: string; color: string }[] = [
    { value: 'red', label: 'Rojo', color: 'bg-red-500' },
    { value: 'green', label: 'Verde', color: 'bg-green-500' },
    { value: 'blue', label: 'Azul', color: 'bg-blue-500' },
    { value: 'cyan', label: 'Celeste', color: 'bg-cyan-500' },
    { value: 'white', label: 'Blanco', color: 'bg-white border-2 border-neutral-300' },
    { value: 'black', label: 'Negro', color: 'bg-black' },
];

export function ColorThemeSelector() {
    const { themeColor, updateThemeColor } = useAppearance();

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button
                    className="inline-flex items-center justify-center rounded-md p-2 text-foreground/60 hover:bg-muted dark:text-foreground/60 dark:hover:bg-muted transition-colors cursor-pointer group"
                    title="Seleccionar color del tema"
                >
                    <Palette className="h-5 w-5" />
                    <span className="sr-only">Color del tema</span>
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-60 p-4" align="end">
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Palette className="h-4 w-4 text-foreground/60" />
                        <p className="text-sm font-semibold text-foreground">
                            Selecciona el color
                        </p>
                    </div>
                    <div className="grid grid-cols-6 gap-2">
                        {colorThemes.map(({ value, label, color }) => (
                            <button
                                key={value}
                                onClick={() => updateThemeColor(value)}
                                className={cn(
                                    'relative group rounded-lg h-10 w-10 transition-all duration-200 cursor-pointer hover:scale-110',
                                    color,
                                    themeColor === value && [
                                        'ring-2 ring-offset-2 ring-offset-background',
                                        value === 'white' ? 'ring-foreground' : 'ring-current',
                                    ],
                                )}
                                title={label}
                            >
                                {themeColor === value && (
                                    <div className="absolute inset-0 flex items-center justify-center rounded-md">
                                        <div className="w-1.5 h-1.5 rounded-full bg-foreground/80" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}

