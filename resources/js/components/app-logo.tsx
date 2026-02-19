import { Pill } from 'lucide-react';

export default function AppLogo() {
    return (
        <div className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform duration-300">
                <Pill className="size-6 text-white" />
            </div>
            <div className="flex flex-col leading-none">
                <span className="text-lg font-black tracking-tighter text-foreground uppercase italic underline decoration-emerald-500/50 underline-offset-4">
                    NEXUS
                </span>
                <span className="text-[10px] font-bold tracking-[0.2em] text-emerald-500 uppercase ml-0.5">
                    FARMA
                </span>
            </div>
        </div>
    );
}
