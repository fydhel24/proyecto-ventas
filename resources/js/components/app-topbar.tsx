import { Breadcrumbs } from '@/components/breadcrumbs';
import { ColorThemeSelector } from '@/components/color-theme-selector';
import { NavUser } from '@/components/nav-user';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';

interface AppTopbarProps {
    breadcrumbs?: BreadcrumbItem[];
    className?: string;
}

export function AppTopbar({ breadcrumbs = [], className }: AppTopbarProps) {
    return (
        <header
            className={cn(
                'flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border/50 bg-sidebar px-4 transition-[width,height] ease-linear md:px-6 relative',
                className,
            )}
        >
            {/* Bottom Separator Line */}
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--theme-primary)]/50 to-transparent shadow-[0_0_8px_var(--theme-primary)] z-50 opacity-50" />

            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <div className="w-px h-4 bg-border/30 mx-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>

            <div className="flex items-center gap-3 ml-auto">
                <ColorThemeSelector />
                <div className="w-px h-6 bg-border/30" />
                <NavUser />
            </div>
        </header>
    );
}
