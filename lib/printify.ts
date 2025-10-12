// --- START OF FILE: lib/printify.ts (Rewritten & Fixed) ---

const API = "https://api.printify.com/v1";

// --- Type Definitions (Unchanged) ---
type Shop = {
  id: number;
  title: string;
  sales_channel?: string;
};

type Product = {
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

// --- CORRECTED HELPER FUNCTIONS ---

/**
 * FIX #1: The auth() function now ONLY handles authorization.
 * Caching logic has been removed from here to prevent conflicts.
 */
function auth() {
  const key = process.env.PRINTIFY_API_TOKEN;
  if (!key) return undefined;
  return { headers: { Authorization: `Bearer ${key}` } };
}

// Map of store URLs to Printify shop titles (Unchanged)
const SHOP_TITLE_MAP: Record<string, string> = {
  "https://3iatlas.printify.me": "3iAtlas",
  "https://mystic-arcana-pop-up.printify.me": "Mystic Arcana Pop-up",
  "https://edm-shuffle-pop-up.printify.me": "EDM Shuffle pop-up",
  "https://birthdaygen-popup.printify.me": "BirthdayGen Popup",
};

// --- CORRECTED DATA FETCHING FUNCTIONS ---

/**
 * FIX #2: getShops() now explicitly defines its own caching strategy.
 * This data is small and changes rarely, so caching for 1 hour is efficient.
 */
export async function getShops(): Promise<Shop[]> {
  if (!auth()) return [];
  const res = await fetch(`${API}/shops.json`, {
    ...auth(),
    next: { revalidate: 3600 }, // Revalidate once per hour
  });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function findShopIdByBase(base: string): Promise<number | null> {
  // This function is unchanged as it correctly uses getShops()
  if (!base) return null;
  const shops = await getShops();
  const expectedTitle = SHOP_TITLE_MAP[base.toLowerCase().replace(/\/$/, "")];
  if (!expectedTitle) {
    console.warn("[Printify] No shop mapping for:", base);
    return null;
  }
  const match = shops.find((s) => s.title === expectedTitle);
  return match ? match.id : null;
}

/**
 * FIX #3: getLatestPublishedProducts() now explicitly disables caching.
 * This solves both the "conflicting options" warning and the "over 2MB" error.
 */
export async function getLatestPublishedProducts(
  shopId: number,
  limit = 3
): Promise<Product[]> {
  if (!auth()) return [];

  const res = await fetch(`${API}/shops/${shopId}/products.json`, {
    ...auth(),
    cache: "no-store", // Explicitly disable caching for this large request
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

  return published.slice(0, Math.min(limit, 6));
}

// --- UTILITY FUNCTIONS (Unchanged) ---

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
    defaultImg?.src || firstImg?.src || "/images/placeholder-product.png";
  if (imageUrl === "/images/placeholder-product.png") {
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
