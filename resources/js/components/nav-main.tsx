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
        <SidebarGroup className="px-3 py-4">
            <SidebarGroupLabel className="px-3 pb-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 font-black">
                Navegación Principal
            </SidebarGroupLabel>
            <SidebarMenu className="gap-1">
                {items.map((item) => {
                    const hasSubItems = item.items && item.items.length > 0;
                    let isActive = page.url.startsWith(resolveUrl(item.href));

                    if (hasSubItems && item.items) {
                        const isChildActive = item.items.some(subItem => page.url.startsWith(resolveUrl(subItem.href)));
                        if (isChildActive) isActive = true;
                    }

                    if (!hasSubItems) {
                        return (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={isActive}
                                    tooltip={{ children: item.title }}
                                    className={cn(
                                        "h-10 transition-all duration-300 relative group/btn rounded-lg overflow-hidden",
                                        isActive
                                            ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 font-bold"
                                            : "hover:bg-sidebar-accent/80 text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <Link href={item.href} prefetch>
                                        {item.icon && (
                                            <item.icon
                                                className={cn(
                                                    "transition-all duration-300 size-5",
                                                    isActive ? "text-emerald-500 scale-110 drop-shadow-[0_0_5px_rgba(16,185,129,0.3)]" : "opacity-70 group-hover/btn:opacity-100"
                                                )}
                                            />
                                        )}
                                        <span className="ml-2">{item.title}</span>
                                        {isActive && (
                                            <div className="absolute right-0 top-2 bottom-2 w-1 rounded-l-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                        )}
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        );
                    }

                    return (
                        <Collapsible key={item.title} asChild defaultOpen={isActive} className="group/collapsible">
                            <SidebarMenuItem>
                                <CollapsibleTrigger asChild>
                                    <SidebarMenuButton
                                        tooltip={{ children: item.title }}
                                        className={cn(
                                            "h-10 transition-all duration-300 rounded-lg",
                                            isActive
                                                ? "bg-emerald-500/5 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 font-bold"
                                                : "text-muted-foreground hover:bg-sidebar-accent/80 hover:text-foreground"
                                        )}
                                    >
                                        {item.icon && (
                                            <item.icon
                                                className={cn(
                                                    "transition-all duration-300 size-5",
                                                    isActive ? "text-emerald-500" : "opacity-70"
                                                )}
                                            />
                                        )}
                                        <span className="ml-2">{item.title}</span>
                                        <ChevronRight className="ml-auto size-4 transition-transform duration-300 group-data-[state=open]/collapsible:rotate-90 opacity-40" />
                                    </SidebarMenuButton>
                                </CollapsibleTrigger>
                                <CollapsibleContent className="px-2">
                                    <SidebarMenuSub className="mt-1 border-l-2 border-emerald-500/20 ml-4 py-1 gap-1">
                                        {item.items?.map((subItem) => {
                                            const isSubActive = page.url === resolveUrl(subItem.href);
                                            return (
                                                <SidebarMenuSubItem key={subItem.title}>
                                                    <SidebarMenuSubButton
                                                        asChild
                                                        isActive={isSubActive}
                                                        className={cn(
                                                            "h-8 transition-all duration-300 rounded-md px-3",
                                                            isSubActive
                                                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold"
                                                                : "text-muted-foreground/80 hover:text-foreground hover:bg-emerald-500/5"
                                                        )}
                                                    >
                                                        <Link href={subItem.href}>
                                                            <span className="text-xs tracking-tight">{subItem.title}</span>
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
