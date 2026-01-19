import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export const StatusBadge = ({ status }: { status: string }) => {
    const isConnected = status === 'CONNECTED';
    return (
        <Badge
            variant="outline"
            className={cn(
                "capitalize",
                isConnected ? "bg-green-100 text-green-700 border-green-200" : "bg-yellow-100 text-yellow-700 border-yellow-200"
            )}
        >
            {status || 'OFFLINE'}
        </Badge>
    );
};
