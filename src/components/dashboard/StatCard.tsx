import { cn } from '@/lib/utils';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ElementType;
    description?: string;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    className?: string;
}

export function StatCard({ title, value, icon: Icon, description, trend, className }: StatCardProps) {
    return (
        <div
            className={cn(
                'bg-card border border-border rounded-lg p-5 transition-shadow hover:shadow-md',
                className
            )}
        >
            <div className="flex items-start justify-between">
                <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">{title}</p>
                    <p className="text-2xl font-bold text-foreground">{value}</p>
                    {description && (
                        <p className="text-xs text-muted-foreground">{description}</p>
                    )}
                    {trend && (
                        <p
                            className={cn(
                                'text-xs font-medium',
                                trend.isPositive ? 'text-green-600' : 'text-red-600'
                            )}
                        >
                            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                            <span className="text-muted-foreground ml-1">so với tháng trước</span>
                        </p>
                    )}
                </div>
                <div className="p-3 bg-primary/10 rounded-lg text-primary">
                    <Icon className="h-5 w-5" />
                </div>
            </div>
        </div>
    );
}
