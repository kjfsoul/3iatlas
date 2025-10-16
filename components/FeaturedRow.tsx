import ProductCarousel from "@/components/ProductCarousel";
import { findShopIdByBase, getLatestPublishedProducts } from "@/lib/printify";

export default async function FeaturedRow({ storeBase, title }: { storeBase: string; title?: string }) {
  // TEMPORARILY DISABLED: Printify API calls causing server-side rendering failure
  // const shopId = await findShopIdByBase(storeBase);
  // const prods = shopId ? await getLatestPublishedProducts(shopId, 12) : [];
  const prods: any[] = [];

  return (
    <>
      {title && (
        <h4 className="mb-2 text-sm font-semibold text-white/80">{title}</h4>
      )}
      {prods.length === 0 ? (
        <p className="text-sm text-white/60">Products temporarily disabled for debugging.</p>
      ) : (
        <ProductCarousel
          products={prods}
          storeBase={storeBase}
          productsPerPage={3}
        />
      )}
    </>
  );
}
