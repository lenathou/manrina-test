import { backendFetchService } from '../src/service/BackendFetchService';
import { IProduct } from '../src/server/product/IProduct';

async function main() {
  try {
    const products: IProduct[] = await backendFetchService.getAllProducts();
    let issues = 0;

    for (const p of products) {
      const baseUnitOk = Boolean(p.baseUnitId || p.baseUnit);
      if (!baseUnitOk) {
        console.log(`Product without base unit: ${p.name} (${p.id})`);
        issues++;
      }
      for (const v of p.variants) {
        const qOk = typeof v.quantity === 'number' && v.quantity! > 0;
        const uOk = Boolean(v.unitId || v.unit);
        if (!qOk || !uOk) {
          console.log(`Variant missing data: product=${p.name} variant=${v.optionValue} id=${v.id} quantity=${v.quantity} unitId=${v.unitId}`);
          issues++;
        }
      }
    }

    if (issues === 0) {
      console.log('All products/variants have required data for calculated stock.');
    } else {
      console.log(`Found ${issues} issue(s) to fix.`);
    }
  } catch (e) {
    console.error('Error running check:', e);
    console.error('Hint: this script calls Next.js API routes; run the dev server and re-run: pnpm dev, then pnpm tsx test-scripts/check-calculated-stock-prereqs.ts');
    process.exit(1);
  }
}

main();

