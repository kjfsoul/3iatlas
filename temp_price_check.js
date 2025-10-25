const { getLatestPublishedProducts, productPrice } = require('./lib/printify.ts');

async function checkPrices() {
  const shopId = 24436338; // 3I/Atlas shop ID
  const products = await getLatestPublishedProducts(shopId, 10); // Get up to 10 products

  console.log('Product Prices from Printify API:');
  products.forEach(product => {
    const price = productPrice(product);
    console.log(`${product.title}: ${price}`);
  });
}

checkPrices().catch(console.error);
