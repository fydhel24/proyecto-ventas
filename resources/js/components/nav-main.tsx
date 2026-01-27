import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn, resolveUrl } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();
    return (
        <SidebarGroup className="px-2 py-4">
            <SidebarGroupLabel className="px-4 text-[10px] uppercase tracking-widest text-sidebar-foreground/40 font-bold">Plataforma</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => {
                    const hasSubItems = item.items && item.items.length > 0;

                    // Check if the item itself is active
                    let isActive = page.url.startsWith(resolveUrl(item.href));

                    // Also check if any sub-item is active (to keep parent open/highlighted)
                    if (hasSubItems && item.items) {
                        const isChildActive = item.items.some(subItem => page.url.startsWith(resolveUrl(subItem.href)));
                        if (isChildActive) isActive = true;
                    }

                    if (!hasSubItems) {
                        return (
                            <SidebarMenuItem key={item.title} className="relative px-2">
                                {isActive && (
                                    <div
                                        className="absolute left-0 top-1 bottom-1 w-1.5 rounded-full bg-[var(--theme-primary)] shadow-[0_0_12px_var(--theme-primary)] z-20"
                                    />
                                )}
                                <SidebarMenuButton
                                    asChild
                                    isActive={isActive}
                                    tooltip={{ children: item.title }}
                                    className={cn(
                                        "transition-all duration-300 relative group/btn overflow-hidden",
                                        isActive
                                            ? "translate-x-1.5 bg-gradient-to-r from-[var(--theme-primary)]/20 via-[var(--theme-primary)]/5 to-transparent"
                                            : "hover:translate-x-1 hover:bg-sidebar-accent/50"
                                    )}
                                >
                                    <Link href={item.href} prefetch>
                                        {item.icon && (
                                            <item.icon
                                                className={cn(
                                                    "transition-all duration-300",
                                                    isActive ? "text-[var(--theme-primary)] scale-110 drop-shadow-[0_0_3px_var(--theme-primary)]" : "group-hover/btn:text-foreground"
                                                )}
                                            />
                                        )}
                                        <span className={cn(
                                            "transition-all duration-300 ml-1 truncate",
                                            isActive ? "font-bold tracking-tight text-[var(--theme-primary)]" : "group-hover/btn:text-foreground font-medium"
                                        )}>
                                            {item.title}
                                        </span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        );
                    }

                    return (
                        <Collapsible key={item.title} asChild defaultOpen={isActive} className="group/collapsible">
                            <SidebarMenuItem className="px-2">
                                <CollapsibleTrigger asChild>
                                    <SidebarMenuButton
                                        tooltip={{ children: item.title }}
                                        className={cn(
                                            "transition-all duration-300 relative group/btn overflow-hidden",
                                            isActive
                                                ? "bg-gradient-to-r from-[var(--theme-primary)]/10 to-transparent"
                                                : "hover:bg-sidebar-accent/50"
                                        )}
                                    >
                                        {item.icon && (
                                            <item.icon
                                                className={cn(
                                                    "transition-all duration-300",
                                                    isActive ? "text-[var(--theme-primary)] scale-110 drop-shadow-[0_0_3px_var(--theme-primary)]" : "group-hover/btn:text-foreground"
                                                )}
                                            />
                                        )}
                                        <span className={cn(
                                            "transition-all duration-300 ml-1 truncate",
                                            isActive ? "font-bold tracking-tight text-[var(--theme-primary)]" : "group-hover/btn:text-foreground font-medium"
                                        )}>
                                            {item.title}
                                        </span>
                                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                    </SidebarMenuButton>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <SidebarMenuSub className="mt-1">
                                        {item.items?.map((subItem) => {
                                            const isSubActive = page.url === resolveUrl(subItem.href);
                                            return (
                                                <SidebarMenuSubItem key={subItem.title} className="pl-9 pr-1 relative">
                                                    {isSubActive && (
                                                        <div className="absolute left-7 top-2 bottom-2 w-1 rounded-full bg-[var(--theme-primary)]/60" />
                                                    )}
                                                    <SidebarMenuSubButton
                                                        asChild
                                                        isActive={isSubActive}
                                                        className={cn(
                                                            "h-9 transition-all duration-300",
                                                            isSubActive && "bg-[var(--theme-primary)]/10 translate-x-1"
                                                        )}
                                                    >
                                                        <Link href={subItem.href}>
                                                            <span className={cn(
                                                                "transition-colors text-sm",
                                                                isSubActive ? "font-bold text-[var(--theme-primary)]" : "font-medium"
                                                            )}>
                                                                {subItem.title}
                                                            </span>
                                                        </Link>
                                                    </SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                            );
                                        })}
                                    </SidebarMenuSub>
                                </CollapsibleContent>
                            </SidebarMenuItem>
                        </Collapsible>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
