import { getLatestPublishedProducts, productPrice } from './lib/printify.ts';

async function comparePrices() {
  const shopId = 24436338; // 3I/Atlas shop ID
  const products = await getLatestPublishedProducts(shopId, 10); // Get up to 10 products

  console.log('Products from Printify API:');
  products.forEach(product => {
    const price = productPrice(product);
    console.log(`${product.title}: ${price}`);
    if (product.variants) {
      const defaultVariant = product.variants.find(v => v.is_default);
      if (defaultVariant) {
        console.log(`  Default variant: ${defaultVariant.title}: $${(defaultVariant.price / 100).toFixed(2)}`);
      }
      console.log('  Variants:');
      product.variants.forEach(v => {
        console.log(`    ${v.title}: $${(v.price / 100).toFixed(2)}`);
      });
    }
    if (product.variants) {
      console.log('  Variants:');
      product.variants.forEach(v => {
        console.log(`    ${v.title}: ${(v.price / 100).toFixed(2)}`);
      });
    }
  });
}

comparePrices().catch(console.error);
