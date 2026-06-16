// Shared formatters — single source of truth for currency, numbers, dates.

export function formatCurrency(amount: string | number, currencyCode = "USD"): string {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  }).format(Number.isFinite(value) ? value : 0);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/**
 * Append a Shopify CDN width transform to an image URL so the browser
 * downloads an appropriately sized variant. Falls back to the original
 * on any non-Shopify URL.
 */
export function shopifyImage(url: string | undefined | null, width = 800): string {
  if (!url) return "";
  try {
    const u = new URL(url);
    if (!u.hostname.includes("shopify")) return url;
    u.searchParams.set("width", String(width));
    return u.toString();
  } catch {
    return url;
  }
}
