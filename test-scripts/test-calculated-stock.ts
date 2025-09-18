import { calculateVariantUnitsFromGlobalStock } from '../src/utils/unitConversion';
import { IUnit } from '../src/server/product/IProduct';

function makeUnit(id: string, symbol: string, category: string, factor: number): IUnit {
  return { id, name: id, symbol, category, conversionFactor: factor, isActive: true } as IUnit;
}

// Base units
const kg = makeUnit('kg-id', 'kg', 'weight', 1);
const g = makeUnit('g-id', 'g', 'weight', 0.001);
const L = makeUnit('L-id', 'L', 'volume', 1);
const ml = makeUnit('ml-id', 'ml', 'volume', 0.001);
const m = makeUnit('m-id', 'm', 'length', 1);
const cm = makeUnit('cm-id', 'cm', 'length', 0.01);

const tests = [
  { global: 20, base: kg, qty: 2, unit: kg, expect: 10, label: '20 kg / 2 kg' },
  { global: 20, base: kg, qty: 0.5, unit: kg, expect: 40, label: '20 kg / 0.5 kg' },
  { global: 20, base: kg, qty: 500, unit: g, expect: 40, label: '20 kg / 500 g' },
  { global: 3, base: L, qty: 250, unit: ml, expect: 12, label: '3 L / 250 ml' },
  { global: 5, base: m, qty: 20, unit: cm, expect: 25, label: '5 m / 20 cm' },
];

let allPass = true;
for (const t of tests) {
  const res = calculateVariantUnitsFromGlobalStock(t.global, t.base, t.qty, t.unit);
  const ok = res === t.expect;
  // eslint-disable-next-line no-console
  console.log(`${t.label} -> ${res} ${ok ? 'OK' : `FAIL (expected ${t.expect})`}`);
  if (!ok) allPass = false;
}

if (!allPass) {
  // eslint-disable-next-line no-console
  console.error('Some tests failed');
  process.exit(1);
}

// eslint-disable-next-line no-console
console.log('All calculated stock tests passed.');

