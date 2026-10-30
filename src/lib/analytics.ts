// Microsoft Clarity (heatmaps + session recordings) and Bing site verification.
// Both IDs are public, set via env vars.

export function initMicrosoftTools() {
  if (typeof window === "undefined") return;

  const bingCode = import.meta.env.VITE_BING_SITE_VERIFICATION;
  if (bingCode && !document.querySelector('meta[name="msvalidate.01"]')) {
    const m = document.createElement("meta");
    m.name = "msvalidate.01";
    m.content = bingCode;
    document.head.appendChild(m);
  }

  const clarityId = import.meta.env.VITE_CLARITY_PROJECT_ID;
  if (!clarityId || import.meta.env.DEV) return;
  const w = window as unknown as { clarity?: { (...a: unknown[]): void; q?: unknown[] } };
  if (w.clarity) return;
  const fn = (...args: unknown[]) => {
    (fn.q = fn.q || []).push(args);
  };
  fn.q = [] as unknown[];
  w.clarity = fn;
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.clarity.ms/tag/${clarityId}`;
  document.head.appendChild(s);
}
