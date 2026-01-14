import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  variant?: 'default' | 'primary' | 'warning' | 'success';
  className?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  variant = 'default',
  className
}: MetricCardProps) {
  const variantStyles = {
    default: 'border-border',
    primary: 'border-primary/30 shadow-[0_0_15px_hsl(var(--primary)/0.1)]',
    warning: 'border-warning/30',
    success: 'border-success/30 shadow-[0_0_15px_hsl(var(--success)/0.1)]',
  };

  const valueStyles = {
    default: 'text-foreground',
    primary: 'text-primary',
    warning: 'text-warning',
    success: 'text-success',
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg border bg-card p-6 transition-all duration-300 hover:border-primary/50',
        variantStyles[variant],
        className
      )}
    >
      {/* Subtle glow effect */}
      {variant !== 'default' && (
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5 pointer-events-none" />
      )}
      
      <div className="relative flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            {title}
          </p>
          <p className={cn('text-3xl font-bold font-mono tracking-tight', valueStyles[variant])}>
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
          {trend && trendValue && (
            <div className="flex items-center gap-1 text-xs">
              <span className={cn(
                trend === 'up' && 'text-success',
                trend === 'down' && 'text-destructive',
                trend === 'neutral' && 'text-muted-foreground'
              )}>
                {trend === 'up' && '↑'}
                {trend === 'down' && '↓'}
                {trend === 'neutral' && '→'}
                {trendValue}
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div className="text-primary/60">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
