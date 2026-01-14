import { RefreshCw, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SyncStatusProps {
  status: 'idle' | 'syncing' | 'success' | 'error';
  lastSyncTime: Date | null;
  onSync: () => void;
  isLoading: boolean;
}

export function SyncStatus({ status, lastSyncTime, onSync, isLoading }: SyncStatusProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const statusConfig = {
    idle: {
      icon: Clock,
      text: 'Waiting to sync',
      color: 'text-muted-foreground',
      bgColor: 'bg-muted/50',
    },
    syncing: {
      icon: RefreshCw,
      text: 'Syncing with Shopify...',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    success: {
      icon: CheckCircle,
      text: 'Live data synced',
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    error: {
      icon: AlertCircle,
      text: 'Sync failed',
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-4">
      <div className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium',
        config.bgColor
      )}>
        <Icon className={cn(
          'w-4 h-4',
          config.color,
          status === 'syncing' && 'animate-sync-spin'
        )} />
        <span className={config.color}>{config.text}</span>
      </div>
      
      {lastSyncTime && status !== 'syncing' && (
        <span className="text-xs text-muted-foreground font-mono">
          Last sync: {formatTime(lastSyncTime)}
        </span>
      )}
      
      <Button
        variant="outline"
        size="sm"
        onClick={onSync}
        disabled={isLoading}
        className="border-primary/30 hover:border-primary hover:bg-primary/10"
      >
        <RefreshCw className={cn('w-4 h-4 mr-2', isLoading && 'animate-sync-spin')} />
        Force Sync
      </Button>
    </div>
  );
}
