## Deep refactor plan — AuraLift storefront

Four focused passes, each independently shippable. I'll execute them in order so each lands on a stable base.

### 1. Code quality & architecture
- Split `src/lib/shopify.ts` into `shopify/config.ts`, `shopify/types.ts`, `shopify/queries.ts`, `shopify/client.ts`, `shopify/helpers.ts`. Strip noisy `console.log` calls behind a `DEV` flag.
- Move the hard-coded Storefront token + store domain to `import.meta.env.VITE_SHOPIFY_*` with safe fallbacks; add `.env.example`.
- Refactor `src/pages/Index.tsx` (233 lines) into composed sections: `RealtimeMetricsSection`, `InventorySection`, `CatalogSection`, `DashboardFooter`.
- Refactor `src/pages/ProductPage.tsx` (326 lines) into `ProductGallery`, `ProductInfo`, `VariantSelector`, `QuantityStepper`.
- Add `src/lib/format.ts` for shared currency/number/date formatters; remove duplication.
- Promote `useDashboardStore` fetch loop into a `useShopifyAutoSync(intervalMs)` hook.
- Tighten types: remove `any`, narrow `Record<string, unknown>` returns with generics, add `ShopifyVariant` / `ShopifyImage` exports.

### 2. Performance
- Lazy-load `ProductPage`, `NotFound`, and `SalesChart` (recharts is heavy) via `React.lazy` + `Suspense` with skeleton fallbacks.
- Memoize `ProductGrid` cards and `useProductFilters` derivations; debounce search input (200 ms).
- Add `loading="lazy" decoding="async"` and explicit `width/height` to all product images; use Shopify CDN `?width=` transforms for grid thumbs (≈480 w) vs gallery (≈1200 w).
- Hoist `QueryClient` config: `staleTime` 5 min, `gcTime` 30 min, no refetch on focus.
- Replace per-render derived arrays in Index with `useMemo`.

### 3. SEO & metadata
- Install `react-helmet-async`, wrap the app in `HelmetProvider` (`src/main.tsx`).
- Update `index.html`: brand title, AuraLift description, Organization + WebSite JSON-LD, relative canonical/og:url, remove placeholder og:image until real asset exists.
- Add per-route `<Helmet>` blocks: home (FAQPage stub, WebSite SearchAction), product detail (Product JSON-LD with price/availability/sku, BreadcrumbList, canonical `/product/{handle}`), 404 (`noindex`).
- Add `public/robots.txt` (allow all) and `public/sitemap.xml` placeholder with TODO base URL.
- Ensure a single H1 per page; product page H1 = product title.

### 4. UX & visual polish
- Promote design tokens: add `--gradient-aura`, `--shadow-aura`, refined neon-on-charcoal contrast; expose in `tailwind.config.ts`.
- Replace ad-hoc loading states with consistent `Skeleton` patterns in metrics, grid, and product page.
- Real empty state for the product grid ("No products match these filters — clear filters") with reset action.
- Real error state surfaced in Header when sync fails, with retry.
- Smooth focus-visible rings, hover lift on cards, motion-reduce respect.
- Polished cart drawer: empty-cart illustration block, item count badge animation, sticky checkout footer.

### Technical notes
- No backend or schema changes — frontend-only refactor.
- Shopify wiring stays exactly as-is (same token, same query shape, same 15-min sync cadence); only the file layout and env-var indirection change.
- No fake reviews, no mock products — empty/loading/error UI only.
- Will verify after each pass: typecheck via build signal, then a quick visual check of `/` and `/product/:handle`.

### Out of scope
- Adding auth, accounts, wishlists, reviews, related products, or new routes.
- Publishing/deploying — I'll only suggest it at the end.
