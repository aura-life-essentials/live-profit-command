import { Sparkles, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SyncStatus } from "./SyncStatus";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { SHOPIFY_CONFIG } from "@/lib/shopify";

interface HeaderProps {
  syncStatus: "idle" | "syncing" | "success" | "error";
  lastSyncTime: Date | null;
  onSync: () => void;
  isLoading: boolean;
  error?: string | null;
}

export function Header({ syncStatus, lastSyncTime, onSync, isLoading, error }: HeaderProps) {
  const storeAdminSlug = SHOPIFY_CONFIG.STORE_DOMAIN.replace(".myshopify.com", "");

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <a href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shadow-aura"
                style={{ background: "var(--gradient-aura)" }}
              >
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-success border-2 border-background" />
            </div>
            <div className="leading-tight">
              <h1 className="text-xl font-bold tracking-tight text-aura">
                AuraLift for the Spirit
              </h1>
              <p className="text-[11px] text-muted-foreground font-mono">
                Time is now ageless
              </p>
            </div>
          </a>

          <div className="hidden md:flex items-center gap-4">
            <SyncStatus
              status={syncStatus}
              lastSyncTime={lastSyncTime}
              onSync={onSync}
              isLoading={isLoading}
              error={error}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:flex border-primary/30 hover:border-primary"
              onClick={() =>
                window.open(`https://admin.shopify.com/store/${storeAdminSlug}`, "_blank")
              }
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Shopify Admin
            </Button>
            <CartDrawer />
          </div>
        </div>

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
