import { RefreshCw, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SyncStatusProps {
  status: 'idle' | 'syncing' | 'success' | 'error';
  lastSyncTime: Date | null;
  onSync: () => void;
  isLoading: boolean;
  error?: string | null;
}

export function SyncStatus({ status, lastSyncTime, onSync, isLoading, error }: SyncStatusProps) {
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
      text: "Ready to sync",
      color: "text-muted-foreground",
      bgColor: "bg-muted/50",
    },
    syncing: {
      icon: RefreshCw,
      text: "Syncing…",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    success: {
      icon: CheckCircle,
      text: "Up to date",
      color: "text-success",
      bgColor: "bg-success/10",
    },
    error: {
      icon: AlertCircle,
      text: "Sync issue",
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3 flex-wrap">
        <div
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium",
            config.bgColor,
          )}
        >
          <Icon
            className={cn(
              "w-4 h-4",
              config.color,
              status === "syncing" && "animate-sync-spin",
            )}
          />
          <span className={config.color}>{config.text}</span>
        </div>

        {lastSyncTime && status !== "syncing" && (
          <span className="text-xs text-muted-foreground">
            Last synced {formatTime(lastSyncTime)}
          </span>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={onSync}
          disabled={isLoading}
          className="border-primary/30 hover:border-primary hover:bg-primary/10"
        >
          <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-sync-spin")} />
          Sync now
        </Button>
      </div>

      
      {status === 'error' && error && (
        <p className="text-xs text-destructive font-mono max-w-md truncate">
          Error: {error}
        </p>
      )}
    </div>
  );
}
