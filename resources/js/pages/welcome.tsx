import React, { cloneElement, ReactElement } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    Plus,
    ShoppingBag,
    PhoneCall,
    Clock,
    MapPin,
    ShieldCheck,
    Zap,
    Heart,
    Search,
    ChevronRight,
    ArrowRight,
    MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function Welcome() {
    return (
        <div className="flex flex-col min-h-screen bg-white font-outfit">
            <Head title="Nexus Farma - Tu Salud, Nuestra Prioridad" />

            {/* Navbar */}
            <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
                <div className="container flex items-center justify-between h-16 px-4 mx-auto md:px-6">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#16A34A] text-white">
                            <Plus className="w-6 h-6" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-slate-900">NEXUS <span className="text-[#16A34A]">FARMA</span></span>
                    </div>

                    <nav className="items-center hidden gap-8 md:flex">
                        <a href="#servicios" className="text-sm font-medium hover:text-[#16A34A] transition-colors">Servicios</a>
                        <a href="#promociones" className="text-sm font-medium hover:text-[#16A34A] transition-colors">Promociones</a>
                        <a href="#sucursales" className="text-sm font-medium hover:text-[#16A34A] transition-colors">Sucursales</a>
                        <a href="#contacto" className="text-sm font-medium hover:text-[#16A34A] transition-colors">Contacto</a>
                    </nav>

                    <div className="flex items-center gap-4">
                        <Link href="/login">
                            <Button variant="ghost" className="hidden sm:flex">Ingresar</Button>
                        </Link>
                        <Button className="bg-[#16A34A] hover:bg-[#15803d]">
                            Pide por WhatsApp
                        </Button>
                    </div>
                </div>
            </header>

            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative overflow-hidden py-20 lg:py-32 bg-slate-50">
                    <div className="container relative z-10 px-4 mx-auto md:px-6">
                        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
                            <div className="space-y-8 animate-in fade-in slide-in-from-left duration-700">
                                <Badge className="px-3 py-1 text-sm bg-green-100 text-[#16A34A] hover:bg-green-100 border-none rounded-full">
                                    Farmacia #1 en Bolivia
                                </Badge>
                                <h1 className="text-5xl font-extrabold leading-tight text-slate-900 md:text-6xl lg:text-7xl">
                                    Cuidamos tu salud, <br />
                                    <span className="text-[#16A34A]">estamos cerca de ti.</span>
                                </h1>
                                <p className="max-w-[600px] text-lg text-slate-600 md:text-xl">
                                    Nexus Farma ofrece medicamentos certificados, atención farmacéutica especializada 24/7 y envíos a domicilio en toda La Paz.
                                </p>
                                <div className="flex flex-col gap-4 sm:flex-row">
                                    <Button size="lg" className="h-14 px-8 text-lg bg-[#16A34A] hover:bg-[#15803d] rounded-full">
                                        Explorar Catálogo
                                        <ArrowRight className="w-5 h-5 ml-2" />
                                    </Button>
                                    <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full">
                                        Nuestras Sucursales
                                    </Button>
                                </div>
                                <div className="flex items-center gap-6 pt-4 text-slate-500">
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck className="w-5 h-5 text-[#16A34A]" />
                                        <span className="text-sm font-medium">Garantizado</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-[#16A34A]" />
                                        <span className="text-sm font-medium">24/7 Atención</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Zap className="w-5 h-5 text-[#16A34A]" />
                                        <span className="text-sm font-medium">Envío Rápido</span>
                                    </div>
                                </div>
                            </div>
                            <div className="relative hidden lg:block animate-in fade-in slide-in-from-right duration-700">
                                <div className="absolute -inset-4 bg-green-200/50 rounded-[40px] blur-3xl"></div>
                                <img
                                    src="https://images.unsplash.com/photo-1576091160550-217359f4ecf8?auto=format&fit=crop&q=80&w=1000"
                                    alt="Farmacéutico atendiendo"
                                    className="relative z-10 w-full h-auto rounded-[32px] shadow-2xl"
                                />
                                <div className="absolute -bottom-8 -left-8 z-20 bg-white p-6 rounded-2xl shadow-xl flex items-center gap-4">
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                                                <img src={`https://i.pravatar.cc/100?u=${i}`} alt="user" />
                                            </div>
                                        ))}
                                    </div>
                                    <div>
                                        <div className="flex text-yellow-400">
                                            {[1, 2, 3, 4, 5].map(i => <Plus key={i} className="w-3 h-3 fill-current" />)}
                                        </div>
                                        <p className="text-xs font-bold text-slate-900">+500 Clientes Felices</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Categories */}
                <section id="servicios" className="py-24 bg-white">
                    <div className="container px-4 mx-auto md:px-6">
                        <div className="text-center space-y-4 mb-16">
                            <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">Categorías Destacadas</h2>
                            <p className="max-w-[700px] mx-auto text-slate-500">Encuentra todo lo que necesitas para tu bienestar y el de tu familia.</p>
                        </div>
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {[
                                { name: 'Medicamentos', icon: <Plus />, color: 'bg-green-100 text-[#16A34A]' },
                                { name: 'Cuidado Personal', icon: <Heart />, color: 'bg-red-100 text-red-600' },
                                { name: 'Cuidado del Bebé', icon: <Zap />, color: 'bg-blue-100 text-blue-600' },
                                { name: 'Vitaminas', icon: <ShoppingBag />, color: 'bg-orange-100 text-orange-600' },
                            ].map((cat, i) => (
                                <div key={i} className="group p-8 text-center bg-slate-50 rounded-3xl transition-all hover:bg-white hover:shadow-xl hover:-translate-y-1 cursor-pointer">
                                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 ${cat.color}`}>
                                        {cloneElement(cat.icon as any, { className: "w-8 h-8" })}
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">{cat.name}</h3>
                                    <p className="text-sm text-slate-500 mb-4">Productos seleccionados con la máxima calidad.</p>
                                    <span className="text-sm font-bold text-[#16A34A] group-hover:underline">Ver productos</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Featured Promo */}
                <section id="promociones" className="py-24 bg-[#16A34A]">
                    <div className="container px-4 mx-auto md:px-6 text-center text-white space-y-8">
                        <h2 className="text-4xl font-extrabold md:text-5xl">Descuento del 20% en tu primer pedido</h2>
                        <p className="max-w-[800px] mx-auto text-xl opacity-90">
                            Regístrate hoy y obtén un descuento exclusivo en tu primera compra online o a través de WhatsApp.
                        </p>
                        <div className="flex justify-center pt-4">
                            <Button size="lg" className="h-16 px-12 text-xl bg-white text-[#16A34A] hover:bg-slate-100 rounded-full font-bold">
                                ¡Canjear ahora!
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Sucursales & Info */}
                <section id="sucursales" className="py-24 bg-slate-50">
                    <div className="container px-4 mx-auto md:px-6">
                        <div className="grid gap-12 lg:grid-cols-2 items-center">
                            <div className="space-y-8">
                                <h2 className="text-4xl font-bold text-slate-900">Estamos donde nos necesitas</h2>
                                <div className="space-y-6">
                                    <div className="flex gap-4">
                                        <div className="flex-shrink-0 w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
                                            <MapPin className="text-[#16A34A]" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900">Sucursal Central</h4>
                                            <p className="text-slate-500">Av. 16 de Julio, El Prado, Edif. San Pablo</p>
                                            <p className="text-[#16A34A] text-sm font-medium">La Paz - Bolivia</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex-shrink-0 w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
                                            <PhoneCall className="text-[#16A34A]" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900">Atención Telefónica</h4>
                                            <p className="text-slate-500">+591 2 2441122</p>
                                            <p className="text-slate-500">Lunes a Domingo, 24 horas.</p>
                                        </div>
                                    </div>
                                </div>
                                <Button variant="outline" size="lg" className="rounded-full">
                                    Ver todas las sucursales
                                </Button>
                            </div>
                            <div className="h-[400px] bg-slate-200 rounded-[32px] overflow-hidden shadow-lg relative">
                                <img
                                    src="https://images.unsplash.com/photo-1526948531399-320e7e40f0ca?auto=format&fit=crop&q=80&w=1000"
                                    alt="Mapa de ubicación"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                    <div className="w-12 h-12 bg-[#16A34A] rounded-full flex items-center justify-center text-white animate-bounce shadow-2xl border-4 border-white">
                                        <MapPin className="w-6 h-6" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="py-12 bg-white border-t">
                <div className="container px-4 mx-auto md:px-6">
                    <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
                        <div className="flex items-center gap-2">
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#16A34A] text-white">
                                <Plus className="w-5 h-5" />
                            </div>
                            <span className="font-bold text-slate-900">NEXUS FARMA</span>
                        </div>
                        <p className="text-sm text-slate-500">© 2026 Nexus Farma Bolivia. Todos los derechos reservados.</p>
                        <div className="flex gap-6">
                            <a href="#" className="p-2 bg-slate-50 rounded-lg hover:text-[#16A34A] transition-colors"><Search className="w-5 h-5" /></a>
                            <a href="#" className="p-2 bg-slate-50 rounded-lg hover:text-[#16A34A] transition-colors"><MessageCircle className="w-5 h-5" /></a>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Floating Contact */}
            <div className="fixed bottom-8 right-8 z-50">
                <button className="flex items-center justify-center w-16 h-16 bg-[#25D366] text-white rounded-full shadow-2xl hover:scale-110 transition-transform">
                    <MessageCircle className="w-8 h-8" />
                </button>
            </div>
        </div>
    );
}
