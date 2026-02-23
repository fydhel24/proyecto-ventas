import { Link, usePage } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';
import { type SharedData } from '@/types';
import { cn } from '@/lib/utils';

interface AuthLayoutProps {
    title?: string;
    description?: string;
}

export default function AuthGlassLayout({
    children,
    title,
    description,
}: PropsWithChildren<AuthLayoutProps>) {
    const { name } = usePage<SharedData>().props;

    return (
        <div className="relative min-h-svh w-full overflow-hidden flex items-center justify-center p-4 selection:bg-primary/30">
            {/* Main Background Video */}
            <div className="fixed inset-0 z-0">
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="h-full w-full object-cover  "
                >
                    <source src="/videos/fondologin1.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-transparent to-black/60" />
            </div>

            {/* Main Content Container */}
            <div className="relative z-10 w-full max-w-[1000px] grid lg:grid-cols-2 overflow-hidden rounded-3xl border border-white/10 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] bg-black/20 backdrop-blur-sm">

                {/* Left Side: Decorative Panel with Ladologo.mp4 */}
                <div className="relative hidden lg:block overflow-hidden min-h-[600px] border-r border-white/10">
                    <div className="absolute inset-0 z-0">
                        <video
                            autoPlay
                            muted
                            loop
                            playsInline
                            className="h-full w-full object-cover opacity-90 scale-105"
                        >
                            <source src="/videos/Ladologo.mp4" type="video/mp4" />
                        </video>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    </div>

                    <div className="relative z-10 h-full flex flex-col justify-between p-12 text-white">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
                                <img src="/favicon.ico" className="size-8" alt="Logo" />
                            </div>
                            <span className="text-xl font-bold tracking-tighter uppercase italic drop-shadow-lg">{name}</span>
                        </div>
                    </div>
                </div>

                {/* Right Side: Login Form with Glassmorphism */}
                <div className="relative flex flex-col justify-center p-8 md:p-14 bg-white/5 backdrop-blur-[32px] border-t lg:border-t-0 lg:border-l border-white/10">
                    {/* Floating Glow Effects */}
                    <div className="absolute -top-[10%] -right-[10%] size-64 bg-[var(--theme-primary)]/20 rounded-full blur-[80px]" />
                    <div className="absolute -bottom-[10%] -left-[10%] size-64 bg-[var(--theme-primary)]/10 rounded-full blur-[80px]" />

                    <div className="relative z-10">
                        {/* Mobile Logo */}
                        <div className="lg:hidden flex flex-col items-center mb-10">
                            <img src="/favicon.ico" className="size-16 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" alt="Logo" />
                            <h1 className="mt-4 text-2xl font-black italic text-white ">{name}</h1>
                        </div>

                        <div className="mb-10 space-y-3">
                            <h2 className="text-3xl font-black italic  text-white  drop-shadow-sm">
                                {title}
                            </h2>
                            <p className="text-white/60 font-medium text-sm">
                                {description}
                            </p>
                        </div>

                        <div className="text-white">
                            {children}
                        </div>

                        <footer className="mt-12 text-center text-xs text-white/30 font-medium uppercase tracking-[0.2em]">
                            &copy; {new Date().getFullYear()} {name} &bull; v2.0
                        </footer>
                    </div>
                </div>
            </div>

            {/* Themed Bottom Glow Line (Consistent with App UI) */}
            <div className="fixed bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--theme-primary)]/50 to-transparent shadow-[0_0_15px_var(--theme-primary)] z-50 opacity-40" />
        </div>
    );
}
