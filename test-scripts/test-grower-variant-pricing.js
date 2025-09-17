// Simple validation script for per-grower per-variant pricing mapping
// Usage:
//   node test-scripts/test-grower-variant-pricing.js <GROWER_ID> <PRODUCT_ID>
// Requires DATABASE_URL env and Prisma schema migrated.

const { PrismaClient } = require('@prisma/client');

async function main() {
  const growerId = process.argv[2];
  const productId = process.argv[3];
  if (!growerId || !productId) {
    console.error('Usage: node test-scripts/test-grower-variant-pricing.js <GROWER_ID> <PRODUCT_ID>');
    process.exit(1);
  }

  const prisma = new PrismaClient();
  try {
    const row = await prisma.growerProduct.findUnique({
      where: { growerId_productId: { growerId, productId } },
      include: {
        product: {
          include: {
            variants: {
              include: {
                unit: true,
                growerVariantPrices: { where: { growerId } },
              },
            },
          },
        },
      },
    });

    if (!row || !row.product) {
      console.error('No growerProduct or product found for the given ids');
      process.exit(2);
    }

    const results = row.product.variants.map((v) => {
      const gv = (v.growerVariantPrices && v.growerVariantPrices[0]) || null;
      const gvPrice = gv ? Number(gv.price) : undefined;
      const globalPrice = Number(v.price);
      const chosen = gvPrice ?? globalPrice;
      return {
        variantId: v.id,
        optionValue: v.optionValue,
        gvPrice,
        globalPrice,
        chosen,
      };
    });

    let ok = true;
    for (const r of results) {
      if (r.gvPrice !== undefined && r.chosen !== r.gvPrice) ok = false;
      if (r.gvPrice === undefined && r.chosen !== r.globalPrice) ok = false;
    }

    console.log(JSON.stringify({ productId, growerId, variants: results }, null, 2));
    if (!ok) {
      console.error('FAIL: mapping did not prefer growerVariantPrice as expected');
      process.exit(3);
    }
    console.log('PASS: growerVariantPrice mapping preferred over global variant price');
  } catch (e) {
    console.error('Error:', e);
    process.exit(4);
  } finally {
    await prisma.$disconnect();
  }
}

main();

