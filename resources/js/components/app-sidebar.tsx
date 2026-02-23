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
import { dashboard } from '@/routes';
import cajas from '@/routes/cajas';
import cuadernos from '@/routes/cuadernos';
import inventarios from '@/routes/inventarios';
import productos from '@/routes/productos';
import roles from '@/routes/roles';
import sucursales from '@/routes/sucursales';
import usuarios from '@/routes/usuarios';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';

import { usePermissions } from '@/hooks/use-permissions';
import {
    BarChart3,
    Boxes,
    Building,
    Clock,
    LayoutGrid,
    List,
    Package,
    Plus,
    ShieldCheck,
    ShoppingCart,
    Users,
    Utensils,
    Wallet,
} from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
        icon: LayoutGrid,
        permission: 'ver dashboard',
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
        title: 'Platillos',
        href: productos.index().url,
        icon: Package,
        permission: 'ver productos',
    },
    {
        title: 'Cajas',
        href: cajas.index().url,
        icon: Wallet,
        permission: 'ver cajas',
    },
    {
        title: 'Sucursales',
        href: sucursales.index().url,
        icon: Building,
        permission: 'ver sucursales',
    },
    {
        title: 'Ventas',
        href: '/ventas',
        icon: ShoppingCart,
        permission: 'ver ventas',
        items: [
            {
                title: 'Venta Rápida',
                href: '/ventas/create',
                icon: Plus,
            },
            {
                title: 'Monitor Cocina',
                href: '/ventas/cocina',
                icon: Utensils,
            },
            {
                title: 'Historial de ventas',
                href: '/ventas/historial',
                icon: List,
            },
        ],
    },
    {
        title: 'Reservas Llevar',
        href: cuadernos.index().url,
        icon: Clock,
        permission: 'ver ventas',
        items: [
            {
                title: 'Ver Todas',
                href: cuadernos.index().url,
                icon: List,
            },
        ],
    },
    {
        title: 'Reparticion',
        href: inventarios.index().url,
        icon: Boxes,
        permission: 'ver inventarios',
        items: [
            {
                title: 'Administrar Cantidades',
                href: inventarios.index().url,
                icon: Boxes,
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
                title: 'Ventas de ventas',
                href: '/reportes/ventas',
                icon: BarChart3,
            },
        ],
    },
    
];

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
    const { hasPermission } = usePermissions();

    const filteredNavItems = mainNavItems.filter((item) => {
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
