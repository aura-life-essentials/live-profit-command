import { Skull, Zap, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SyncStatus } from './SyncStatus';
import { CartDrawer } from '@/components/cart/CartDrawer';

interface HeaderProps {
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
  lastSyncTime: Date | null;
  onSync: () => void;
  isLoading: boolean;
  error?: string | null;
}

export function Header({ syncStatus, lastSyncTime, onSync, isLoading, error }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg animate-pulse-glow">
                <Skull className="w-7 h-7 text-primary-foreground" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-success border-2 border-background" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  PROFIT REAPER
                </span>
                <Zap className="w-5 h-5 text-primary" />
              </h1>
              <p className="text-xs text-muted-foreground font-mono">
                COMMAND CENTER • lovable-project-i664s.myshopify.com
              </p>
            </div>
          </div>
          
          {/* Sync Status */}
          <div className="hidden md:flex items-center gap-4">
            <SyncStatus
              status={syncStatus}
              lastSyncTime={lastSyncTime}
              onSync={onSync}
              isLoading={isLoading}
              error={error}
            />
          </div>
          
          {/* Quick Actions */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:flex border-primary/30 hover:border-primary"
              onClick={() => window.open('https://admin.shopify.com/store/lovable-project-i664s', '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Shopify Admin
            </Button>
            <CartDrawer />
          </div>
        </div>
        
        {/* Mobile Sync Status */}
        <div className="md:hidden mt-4">
          <SyncStatus
            status={syncStatus}
            lastSyncTime={lastSyncTime}
            onSync={onSync}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </div>
    </header>
  );
}
