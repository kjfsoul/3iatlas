# Printify Product Integration Guide

## Executive Summary

This guide provides a complete, production-ready implementation for integrating Printify e-commerce products into Next.js applications. Based on a validated implementation from the 3IAtlas project, this solution supports multiple Printify shops with optimized performance, proper error handling, and responsive design.

## Architecture Overview

The integration follows a clean four-layer architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │ FeaturedRow.tsx │  │ProductCarousel  │  │ SafeImage   │ │
│  │ (Server)       │  │ (Client)        │  │ (Client)    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                     Business Logic Layer                    │
│              ┌─────────────────────────────────┐            │
│              │        lib/printify.ts         │            │
│              │   (API Integration & Utils)     │            │
│              └─────────────────────────────────┘            │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                      External APIs                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │ Printify API    │  │ Image CDN       │  │ Store URLs  │ │
│  │ (Products)      │  │ (Optimization)  │  │ (External)  │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Core Implementation

### 1. API Integration Layer (`lib/printify.ts`)

**Purpose**: Secure server-side communication with Printify API

**Key Features**:
- Bearer token authentication
- Strategic caching (1hr for shops, no-cache for products)
- Type-safe TypeScript interfaces
- Comprehensive error handling
- Multi-shop support via URL mapping

```typescript
// --- START OF FILE: lib/printify.ts ---

const API = "https://api.printify.com/v1";

// --- Type Definitions ---
export type Shop = {
  id: number;
  title: string;
  sales_channel?: string;
};

export type Product = {
  id: string;
  title: string;
  description?: string;
  tags?: string[];
  images?: {
    src: string;
    variant_ids?: number[];
    position?: string;
    is_default?: boolean;
  }[];
  visible?: boolean;
  published?: boolean;
  created_at?: string;
  updated_at?: string;
  variants?: {
    id: number;
    price: number;
  }[];
  external?: {
    id?: string;
    handle?: string;
  };
};

// --- Authentication ---
function auth() {
  const key = process.env.PRINTIFY_API_TOKEN;
  if (!key) return undefined;
  return { headers: { Authorization: `Bearer ${key}` } };
}

// --- Shop Mapping ---
const SHOP_TITLE_MAP: Record<string, string> = {
  "https://your-store.printify.me": "Your Store Name",
  // Add your store mappings here
};

// --- Shop Management ---
export async function getShops(): Promise<Shop[]> {
  if (!auth()) return [];
  const res = await fetch(`${API}/shops.json`, {
    ...auth(),
    next: { revalidate: 3600 }, // Cache for 1 hour
  });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function findShopIdByBase(base: string): Promise<number | null> {
  if (!base) return null;
  const shops = await getShops();
  const expectedTitle = SHOP_TITLE_MAP[base.toLowerCase().replace(/\/$/, "")];
  if (!expectedTitle) return null;
  const match = shops.find((s) => s.title === expectedTitle);
  return match ? match.id : null;
}

// --- Product Fetching ---
export async function getLatestPublishedProducts(
  shopId: number,
  limit = 3
): Promise<Product[]> {
  if (!auth()) return [];

  const res = await fetch(`${API}/shops/${shopId}/products.json`, {
    ...auth(),
    cache: "no-store", // Disable caching for large product data
  });
  if (!res.ok) return [];

  const response = await res.json();
  const all = Array.isArray(response) ? response : response.data || [];

  if (!Array.isArray(all)) {
    console.error("[Printify] Invalid product response format");
    return [];
  }

  const published = all
    .filter((p) => p.published || p.visible)
    .sort(
      (a, b) =>
        new Date(b.updated_at ?? b.created_at ?? 0).getTime() -
        new Date(a.updated_at ?? a.created_at ?? 0).getTime()
    );

  return published.slice(0, limit);
}

// --- Utility Functions ---
export function toPublicProductUrl(
  storeBase: string,
  product: Product
): string {
  if (product.external?.handle) {
    if (product.external.handle.startsWith("http")) {
      return product.external.handle;
    }
    const base = storeBase.replace(/\/$/, "");
    return `${base}${product.external.handle.startsWith("/") ? "" : "/"}${
      product.external.handle
    }`;
  }
  const base = storeBase.replace(/\/$/, "");
  if (product.external?.id) {
    return `${base}/product/${product.external.id}`;
  }
  return `${base}/product/${product.id}`;
}

export function productImage(p: Product): string {
  const defaultImg = p.images?.find((img) => img.is_default);
  const firstImg = p.images?.[0];
  const imageUrl =
    defaultImg?.src || firstImg?.src || "/images/default-product.png";
  if (imageUrl === "/images/default-product.png") {
    console.warn(
      "[Printify] No image found for product:",
      p.title,
      "ID:",
      p.id
    );
  }
  return imageUrl;
}

export function productPrice(p: Product): string {
  if (!p.variants || p.variants.length === 0) return "";
  const minPrice = Math.min(...p.variants.map((v) => v.price));
  return `$${(minPrice / 100).toFixed(2)}`;
}

export function productDescription(p: Product): string {
  if (!p.description) return "";
  const text = p.description.replace(/<[^>]*>/g, "");
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  const firstTwo = sentences.slice(0, 2).join(" ").trim();
  if (firstTwo) return firstTwo;
  const words = text.split(/\s+/).slice(0, 25).join(" ");
  return words + (text.split(/\s+/).length > 25 ? "..." : "");
}
```

### 2. Server Component (`components/FeaturedRow.tsx`)

**Purpose**: Server-side data fetching with proper error handling

**Key Features**:
- Async server component for secure API calls
- Empty state handling
- Configurable product limits
- Clean separation of concerns

```typescript
import ProductCarousel from "@/components/ProductCarousel";
import { findShopIdByBase, getLatestPublishedProducts } from "@/lib/printify";

export default async function FeaturedRow({ 
  storeBase, 
  title 
}: { 
  storeBase: string; 
  title?: string 
}) {
  const shopId = await findShopIdByBase(storeBase);
  // Fetch more products (12) to enable carousel navigation
  const prods = shopId ? await getLatestPublishedProducts(shopId, 12) : [];

  return (
    <>
      {title && <h4 className="mb-2 text-sm font-semibold text-white/80">{title}</h4>}
      {prods.length === 0 ? (
        <p className="text-sm text-white/60">No products found.</p>
      ) : (
        <ProductCarousel products={prods} storeBase={storeBase} productsPerPage={3} />
      )}
    </>
  );
}
```

### 3. Client Component (`components/ProductCarousel.tsx`)

**Purpose**: Interactive product display with carousel navigation

**Key Features**:
- Responsive grid layout
- Touch-friendly navigation
- Page indicators
- Graceful empty state handling
- External link handling

```typescript
"use client";
import SafeImage from "@/components/SafeImage";
import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/lib/printify";

type Props = {
  products: Product[];
  storeBase: string;
  productsPerPage?: number;
};

export default function ProductCarousel({ 
  products, 
  storeBase, 
  productsPerPage = 3 
}: Props) {
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(products.length / productsPerPage));
  
  const startIdx = currentPage * productsPerPage;
  const currentProducts = products.slice(startIdx, startIdx + productsPerPage);
  
  // Pad with nulls if we have fewer than productsPerPage
  const displayProducts = [...currentProducts, ...Array(productsPerPage - currentProducts.length).fill(null)];

  const nextPage = () => setCurrentPage((prev) => (prev + 1) % totalPages);
  const prevPage = () => setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  
  const getProductUrl = (p: Product) => {
    if (p.external?.handle?.startsWith('http')) {
      return p.external.handle;
    }
    const base = storeBase.replace(/\/$/, "");
    if (p.external?.handle) {
      return `${base}${p.external.handle.startsWith('/') ? '' : '/'}${p.external.handle}`;
    }
    if (p.external?.id) {
      return `${base}/product/${p.external.id}`;
    }
    return `${base}/product/${p.id}`;
  };

  const getProductImage = (p: Product) => {
    const defaultImg = p.images?.find(img => img.is_default);
    const firstImg = p.images?.[0];
    return defaultImg?.src || firstImg?.src || "/images/default-product.png";
  };

  const getProductPrice = (p: Product) => {
    if (!p.variants || p.variants.length === 0) return "";
    const minPrice = Math.min(...p.variants.map(v => v.price));
    return `$${(minPrice / 100).toFixed(2)}`;
  };

  const getProductDescription = (p: Product) => {
    if (!p.description) return "";
    const text = p.description.replace(/<[^>]*>/g, '');
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    const firstTwo = sentences.slice(0, 2).join(' ').trim();
    if (firstTwo) return firstTwo;
    const words = text.split(/\s+/).slice(0, 25).join(' ');
    return words + (text.split(/\s+/).length > 25 ? '...' : '');
  };

  return (
    <section className="mt-4">
      <div className="relative">
        {/* Left Navigation Arrow */}
        {products.length > productsPerPage && (
          <button
            onClick={prevPage}
            aria-label="Previous products"
            className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/90 p-3 hover:bg-white shadow-lg transition-all hover:scale-110"
          >
            <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {displayProducts.map((p, i) => {
            // Use a unique key that includes currentPage to force re-render
            const uniqueKey = `${currentPage}-${i}-${p?.id || 'default'}`;
            const url = p ? getProductUrl(p) : (storeBase || "#");
            const img = p ? getProductImage(p) : "/images/default-product.png";
            const name = p?.title ?? "Product coming soon";
            const price = p ? getProductPrice(p) : "";
            const description = p ? getProductDescription(p) : "";
            
            return (
              <Link
                key={uniqueKey}
                href={url}
                target="_blank"
                rel="noopener"
                aria-label={`Open ${name} in new tab`}
                className="group block rounded-xl border border-white/10 bg-white/5 p-3 hover:border-white/20 transition-all"
              >
                <div className="relative h-56 w-full overflow-hidden rounded-lg bg-amber-300 flex items-center justify-center">
                  <SafeImage
                    src={img}
                    alt={name}
                    className="object-contain transition-transform duration-300 group-hover:scale-[1.05] max-h-full"
                  />
                </div>
                <div className="mt-3 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <h5 className="text-sm font-semibold text-white/90 line-clamp-2 flex-1">
                      {name}
                    </h5>
                    {price && (
                      <span className="text-sm font-bold text-green-400 whitespace-nowrap">
                        {price}
                      </span>
                    )}
                  </div>
                  {description && (
                    <p className="text-xs text-white/60 line-clamp-2">
                      {description}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
        
        {/* Right Navigation Arrow */}
        {products.length > productsPerPage && (
          <button
            onClick={nextPage}
            aria-label="Next products"
            className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/90 p-3 hover:bg-white shadow-lg transition-all hover:scale-110"
          >
            <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
        
        {/* Page Indicator */}
        {products.length > productsPerPage && (
          <div className="mt-3 flex justify-center gap-1.5">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i)}
                aria-label={`Go to page ${i + 1}`}
                className={`h-2 rounded-full transition-all ${
                  i === currentPage ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
```

### 4. Safe Image Component (`components/SafeImage.tsx`)

**Purpose**: Robust image handling with fallbacks and optimization

**Key Features**:
- Automatic fallback to default image
- Next.js Image optimization
- Responsive sizing
- Error boundary protection

```typescript
"use client";
import Image from "next/image";
import React, { useState } from "react";

type Props = Omit<React.ComponentProps<typeof Image>, 'src' | 'onError'> & { 
  src: string;
  fallbackSrc?: string;
};

export default function SafeImage({ 
  src, 
  alt, 
  fallbackSrc = "/images/default-product.png",
  width,
  height,
  ...rest 
}: Props) {
  const [imgSrc, setImgSrc] = useState(src);
  
  return (
    <Image
      {...rest}
      src={imgSrc || fallbackSrc}
      alt={alt || "Product image"}
      fill={!width && !height}
      width={width}
      height={height}
      sizes={!width ? "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" : undefined}
      onError={() => setImgSrc(fallbackSrc)}
    />
  );
}
```

## Setup Instructions

### 1. Environment Configuration

Create `.env.local` with your Printify credentials:

```env
# Printify API Token (get from Printify dashboard)
PRINTIFY_API_TOKEN=your_api_token_here

# Store base URLs (must end with trailing slash)
NEXT_PUBLIC_STORE1_BASE=https://your-store1.printify.me/
NEXT_PUBLIC_STORE2_BASE=https://your-store2.printify.me/
```

### 2. Next.js Configuration

Update `next.config.mjs` to allow Printify image domains:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images-api.printify.com",
        pathname: "/**",
      },
      {
        protocol: "https", 
        hostname: "images.printify.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.printify.com", 
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
```

### 3. Page Implementation

```typescript
// app/page.tsx
import FeaturedRow from "@/components/FeaturedRow";

const BASES = {
  store1: process.env.NEXT_PUBLIC_STORE1_BASE || "",
  store2: process.env.NEXT_PUBLIC_STORE2_BASE || "",
};

export default function Page() {
  return (
    <main>
      {/* Store 1 Section */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <a href={BASES.store1} target="_blank" rel="noopener" 
           className="flex items-center gap-3 text-lg font-semibold hover:text-white/80">
          <img src="/images/store1-logo.png" alt="Store 1" className="h-8 w-8" />
          Store 1
        </a>
        <FeaturedRow storeBase={BASES.store1} />
      </div>

      {/* Store 2 Section */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <a href={BASES.store2} target="_blank" rel="noopener"
           className="flex items-center gap-3 text-lg font-semibold hover:text-white/80">
          <img src="/images/store2-logo.png" alt="Store 2" className="h-8 w-8" />
          Store 2
        </a>
        <FeaturedRow storeBase={BASES.store2} />
      </div>
    </main>
  );
}
```

## Key Features & Benefits

### ✅ **Multi-Shop Support**
- Supports unlimited Printify stores
- Automatic shop ID resolution via URL mapping
- Independent product fetching per store
- Centralized configuration management

### ✅ **Performance Optimized**
- Server-side rendering for initial load
- Strategic caching (1hr for shops, no-cache for products)
- Client-side carousel navigation
- Next.js Image optimization
- Lazy loading and code splitting

### ✅ **Error Handling & Resilience**
- Graceful fallbacks for missing images
- API failure handling with empty states
- Type-safe implementation throughout
- Comprehensive logging for debugging

### ✅ **SEO & Accessibility**
- Server components for initial HTML
- Proper meta tags and alt text
- External link handling with `rel="noopener"`
- ARIA labels for interactive elements
- Semantic HTML structure

### ✅ **Responsive Design**
- Mobile-first carousel implementation
- Touch-friendly navigation
- Adaptive image sizing
- Flexible grid layouts
- Progressive enhancement

## API Rate Limits & Best Practices

### Printify API Limits
- **Global limit**: 600 requests/minute
- **Catalog endpoints**: 100 requests/minute
- **Product publishing**: 200 requests/30 minutes

### Caching Strategy
- **Shop data**: 1 hour (rarely changes)
- **Product data**: No cache (frequently updated)
- **Images**: Next.js automatic optimization
- **Client state**: React state management

### Performance Optimization
- Use `next: { revalidate: 3600 }` for shop data
- Use `cache: "no-store"` for product data
- Implement proper image sizing and lazy loading
- Consider implementing webhooks for real-time updates

## Troubleshooting Guide

### Common Issues & Solutions

#### 1. "No products showing"
**Symptoms**: Empty carousel or "No products found" message

**Diagnosis**:
```bash
# Check environment variables
echo $PRINTIFY_API_TOKEN

# Verify shop mapping
grep -r "SHOP_TITLE_MAP" lib/printify.ts
```

**Solutions**:
- Verify `PRINTIFY_API_TOKEN` is set correctly
- Check shop URL mappings in `SHOP_TITLE_MAP`
- Ensure products are published in Printify dashboard
- Check browser console for API errors

#### 2. "Images not loading"
**Symptoms**: Broken image icons or fallback images

**Diagnosis**:
```bash
# Check Next.js config
cat next.config.mjs | grep -A 10 "remotePatterns"

# Verify default image exists
ls -la public/images/default-product.png
```

**Solutions**:
- Add Printify domains to `next.config.mjs`
- Ensure `/images/default-product.png` exists
- Check image URLs in Printify dashboard
- Verify CORS settings

#### 3. "429 Too Many Requests"
**Symptoms**: API rate limit errors in console

**Solutions**:
- Implement proper caching strategy
- Add request throttling
- Use webhooks for real-time updates
- Consider implementing a queue system

#### 4. "TypeScript errors"
**Symptoms**: Build failures or type mismatches

**Solutions**:
- Ensure `Product` type is exported from `lib/printify.ts`
- Import types correctly in components
- Run `npm run typecheck` to identify issues
- Use proper type assertions where needed

## Extension Points

### Adding More Stores
```typescript
const SHOP_TITLE_MAP: Record<string, string> = {
  "https://store1.printify.me": "Store 1",
  "https://store2.printify.me": "Store 2",
  "https://store3.printify.me": "Store 3",
  // Add more stores as needed
};
```

### Custom Product Filtering
```typescript
export async function getProductsByTag(
  shopId: number, 
  tag: string, 
  limit = 3
): Promise<Product[]> {
  const allProducts = await getLatestPublishedProducts(shopId, 100);
  return allProducts.filter(p => p.tags?.includes(tag)).slice(0, limit);
}
```

### Webhook Integration
```typescript
// Handle product updates
app.post('/webhooks/printify', (req, res) => {
  const { type, resource } = req.body;
  if (type === 'product:publish:started') {
    // Invalidate cache and notify clients
    revalidateTag('products');
  }
  res.sendStatus(200);
});
```

### Advanced Caching
```typescript
// Implement Redis caching for high-traffic sites
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export async function getCachedProducts(shopId: number): Promise<Product[]> {
  const cacheKey = `products:${shopId}`;
  const cached = await redis.get(cacheKey);
  
  if (cached) {
    return JSON.parse(cached);
  }
  
  const products = await getLatestPublishedProducts(shopId);
  await redis.setex(cacheKey, 300, JSON.stringify(products)); // 5 min cache
  
  return products;
}
```

## Security Considerations

### API Token Security
- Store tokens in environment variables only
- Never expose tokens in client-side code
- Use server components for API calls
- Implement token rotation if possible

### Image Security
- Validate image URLs before rendering
- Use Next.js Image component for optimization
- Implement CSP headers for external images
- Consider using a proxy for image serving

### Data Validation
- Validate API responses before processing
- Sanitize product descriptions and titles
- Implement rate limiting on your side
- Use TypeScript for type safety

## Performance Metrics

### Expected Performance
- **Initial Load**: < 2 seconds
- **Carousel Navigation**: < 100ms
- **Image Loading**: < 500ms per image
- **API Response**: < 1 second

### Monitoring
```typescript
// Add performance monitoring
export async function getLatestPublishedProducts(
  shopId: number,
  limit = 3
): Promise<Product[]> {
  const start = performance.now();
  
  try {
    const products = await fetchProducts(shopId, limit);
    const duration = performance.now() - start;
    
    console.log(`[Printify] Fetched ${products.length} products in ${duration}ms`);
    
    return products;
  } catch (error) {
    console.error('[Printify] Error fetching products:', error);
    return [];
  }
}
```

## Conclusion

This Printify integration provides a robust, scalable solution for e-commerce product display in Next.js applications. The implementation follows best practices for performance, security, and user experience while maintaining flexibility for customization and extension.

Key success factors:
- Proper separation of server and client concerns
- Strategic caching and performance optimization
- Comprehensive error handling and fallbacks
- Type-safe implementation throughout
- Responsive and accessible design

For questions or support, refer to the troubleshooting section or consult the Printify API documentation.

---

**Last Updated**: October 2025  
**Version**: 1.0  
**Compatibility**: Next.js 14+, React 18+, TypeScript 5+
