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
import productos from '@/routes/productos';
import usuarios from '@/routes/usuarios';
import roles from '@/routes/roles';
import sucursales from '@/routes/sucursales';
import inventarios from '@/routes/inventarios';
import envios from '@/routes/envios';
import cajas from '@/routes/cajas';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';

import {
    LayoutGrid,
    Pill,
    ShoppingCart,
    Truck,
    Users,
    Building,
    ShieldCheck,
    BarChart3,
    MessageCircle,
    Wallet,
    Plus,
    List,
    Boxes,
    FileText,
    CalendarClock,
    Factory,
    Package,
    ShoppingBag,
    Clock,
    Palette
} from 'lucide-react';
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
        title: 'Ventas (POS)',
        href: '/ventas/create',
        icon: ShoppingCart,
        permission: 'ver ventas',
        items: [
            {
                title: 'Punto de Venta',
                href: '/ventas/create',
                icon: Plus,
            },
            {
                title: 'Historial de Ventas',
                href: '/ventas/historial',
                icon: List,
            },
            {
                title: 'Reservas',
                href: '/reservas',
                icon: CalendarClock,
            }
        ],
    },
    {
        title: 'Inventario',
        href: productos.index().url,
        icon: Pill,
        permission: 'ver productos',
        items: [
            {
                title: 'Medicamentos',
                href: productos.index().url,
                icon: Pill,
            },
            {
                title: 'Lotes y Vencimientos',
                href: '/lotes',
                icon: Clock,
            },
            {
                title: 'Administrar Stock',
                href: inventarios.index().url,
                icon: Boxes,
            },
            {
                title: 'Categorías',
                href: '/categorias',
                icon: List,
            },
            {
                title: 'Laboratorios',
                href: '/laboratorios',
                icon: Factory,
            },
        ],
    },
    {
        title: 'Compras',
        href: '/compras',
        icon: ShoppingBag,
        permission: 'ver ventas',
        items: [
            {
                title: 'Nueva Compra',
                href: '/compras/create',
                icon: Plus,
            },
            {
                title: 'Historial Compras',
                href: '/compras',
                icon: List,
            },
            {
                title: 'Proveedores',
                href: '/proveedores',
                icon: Users,
            },
        ],
    },
    {
        title: 'Entidades',
        href: '/clientes',
        icon: Users,
        permission: 'ver ventas',
        items: [
            {
                title: 'Clientes',
                href: '/clientes',
                icon: Users,
            },
            {
                title: 'Proveedores',
                href: '/proveedores',
                icon: Building,
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
        title: 'Finanzas',
        href: cajas.index().url,
        icon: Wallet,
        permission: 'ver cajas',
        items: [
            {
                title: 'Control de Cajas',
                href: cajas.index().url,
                icon: Wallet,
            },
            {
                title: 'Reportes de Ventas',
                href: '/reportes/ventas',
                icon: BarChart3,
            }
        ]
    },
    {
        title: 'Configuraciones',
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
                title: 'Roles y Permisos',
                href: roles.index().url,
                icon: ShieldCheck,
                permission: 'ver roles',
            },
            {
                title: 'Ajustes de Farmacia',
                href: '/settings',
                icon: Palette,
            },
        ],
    },
    {
        title: 'WhatsApp Bot',
        href: '/whatsapp-bot',
        icon: MessageCircle,
        permission: 'ver whatsapp',
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
