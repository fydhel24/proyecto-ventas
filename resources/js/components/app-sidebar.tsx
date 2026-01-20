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
import { dashboard, whatsappMiranda } from '@/routes';
import productos from '@/routes/productos';
import cuadernos from '@/routes/cuadernos';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, BookOpenText, CheckCircle2, Clock, Folder, LayoutGrid, List, MapPin, MessageCircle, Package, Send } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
        icon: LayoutGrid,
    },
    {
        title: 'Productos',
        href: productos.index().url,
        icon: Package,
    },
    {
        title: 'Cuaderno',
        href: cuadernos.index().url,
        icon: BookOpenText,
        items: [
            {
                title: 'Todos',
                href: cuadernos.index(),
                icon: List,
            },
            {
                title: 'La Paz',
                href: cuadernos.index({ query: { filter: 'la_paz' } }).url,
                icon: MapPin,
            },
            {
                title: 'Enviado',
                href: cuadernos.index({ query: { filter: 'enviado' } }).url,
                icon: Send,
            },
            {
                title: 'Listo',
                href: cuadernos.index({ query: { filter: 'p_listo' } }).url,
                icon: CheckCircle2,
            },
            {
                title: 'Pendiente',
                href: cuadernos.index({ query: { filter: 'p_pendiente' } }).url,
                icon: Clock,
            },
        ],
    },
    {
        title: 'WhatsApp Miranda',
        href: whatsappMiranda().url,
        icon: MessageCircle,
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
