import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import productos from '@/routes/productos';
import cuadernos from '@/routes/cuadernos';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Productos',
        href: productos.index(),
        icon: LayoutGrid,
    },
    {
        title: 'Cuaderno',
        href: cuadernos.index(),
        icon: LayoutGrid,
        items: [
            {
                title: 'Todos',
                href: cuadernos.index(),
            },
            {
                title: 'La Paz',
                href: cuadernos.index({ query: { filter: 'la_paz' } }).url,
            },
            {
                title: 'Enviado',
                href: cuadernos.index({ query: { filter: 'enviado' } }).url,
            },
            {
                title: 'Listo',
                href: cuadernos.index({ query: { filter: 'p_listo' } }).url,
            },
            {
                title: 'Pendiente',
                href: cuadernos.index({ query: { filter: 'p_pendiente' } }).url,
            },
        ],
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
