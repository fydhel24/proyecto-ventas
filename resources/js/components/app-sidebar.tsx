import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
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
import usuarios from '@/routes/usuarios';
import roles from '@/routes/roles';
import ventas from '@/routes/ventas';
import cuadernos from '@/routes/cuadernos';
import sucursales from '@/routes/sucursales';
import inventarios from '@/routes/inventarios';
import solicitudes from '@/routes/solicitudes';
import envios from '@/routes/envios';
import cajas from '@/routes/cajas';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';

import { BarChart3, BookOpenText, Boxes, Building, CheckCircle2, Clock, LayoutGrid, List, MapPin, MessageCircle, Package, Plus, Send, ShieldCheck, ShoppingCart, Truck, Users, Wallet } from 'lucide-react';
import AppLogo from './app-logo';
import { usePermissions } from '@/hooks/use-permissions';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
        icon: LayoutGrid,
        permission: 'ver dashboard',
    },
    {
        title: 'Productos',
        href: productos.index().url,
        icon: Package,
        permission: 'ver productos',
    },
    {
        title: 'Ventas',
        href: '/ventas',
        icon: ShoppingCart,
        permission: 'ver ventas',
        items: [
            {
                title: 'Nueva Venta',
                href: '/ventas/create',
                icon: Plus,
            },
            {
                title: 'Historial',
                href: '/ventas/historial',
                icon: List,
            },
        ],
    },
    {
        title: 'Cuadernos',
        href: cuadernos.index().url,
        icon: BookOpenText,
        permission: 'ver ventas',
        items: [
            {
                title: 'Todos',
                href: cuadernos.index().url,
                icon: List,
            },
            {
                title: 'La Paz',
                href: cuadernos.index({ filter: 'la_paz' }).url,
                icon: MapPin,
            },
            {
                title: 'Enviado',
                href: cuadernos.index({ filter: 'enviado' }).url,
                icon: Send,
            },
            {
                title: 'Listo',
                href: cuadernos.index({ filter: 'p_listo' }).url,
                icon: CheckCircle2,
            },
            {
                title: 'Pendiente',
                href: cuadernos.index({ filter: 'p_pendiente' }).url,
                icon: Clock,
            },
        ],
    },
    {
        title: 'Inventarios',
        href: inventarios.index().url,
        icon: Boxes,
        permission: 'ver inventarios',
        items: [
            {
                title: 'Administrar Stock',
                href: inventarios.index().url,
                icon: Boxes,
            },
            {
                title: 'Solicitudes',
                href: solicitudes.index().url,
                icon: Send,
                permission: 'ver solicitudes',
            },
            {
                title: 'Envíos',
                href: envios.index().url,
                icon: Truck,
                permission: 'ver envios',
            },
        ],
    },
    {
        title: 'Sucursales',
        href: sucursales.index().url,
        icon: Building,
        permission: 'ver sucursales',
    },
    {
        title: 'Administración',
        href: '#',
        icon: ShieldCheck,
        permission: 'ver usuarios',
        items: [
            {
                title: 'Usuarios',
                href: usuarios.index().url,
                icon: Users,
                permission: 'ver usuarios',
            },
            {
                title: 'Roles',
                href: roles.index().url,
                icon: ShieldCheck,
                permission: 'ver roles',
            },
        ],
    },
    {
        title: 'Reportes',
        href: '/reportes/ventas',
        icon: BarChart3,
        permission: 'ver reportes',
        items: [
            {
                title: 'Ventas',
                href: '/reportes/ventas',
                icon: BarChart3,
            },
            {
                title: 'Pedidos',
                href: '/reports/orders',
                icon: CheckCircle2,
            },
            {
                title: 'Productos',
                href: '/reports/products',
                icon: Package,
            },
        ],
    },
    {
        title: 'WhatsApp Bot',
        href: whatsappMiranda().url,
        icon: MessageCircle,
        permission: 'ver whatsapp',
    },
    {
        title: 'Cajas',
        href: cajas.index().url,
        icon: Wallet,
        permission: 'ver cajas',
    },
];

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
    const { hasPermission } = usePermissions();

    const filteredNavItems = mainNavItems.filter(item => {
        if (!item.permission) return true;
        return hasPermission(item.permission);
    });

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard().url} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={filteredNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
            </SidebarFooter>
        </Sidebar>
    );
}
