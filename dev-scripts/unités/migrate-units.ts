import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const UNITS_DATA = [
    // Poids
    { name: 'gramme', symbol: 'g', category: 'weight', baseUnit: 'g', conversionFactor: 1 },
    { name: 'kilogramme', symbol: 'kg', category: 'weight', baseUnit: 'g', conversionFactor: 1000 },
    // Volume
    { name: 'millilitre', symbol: 'ml', category: 'volume', baseUnit: 'ml', conversionFactor: 1 },
    { name: 'litre', symbol: 'l', category: 'volume', baseUnit: 'ml', conversionFactor: 1000 },
    // Quantité
    { name: 'pièce', symbol: 'pcs', category: 'quantity', baseUnit: null, conversionFactor: null },
    { name: 'sachet', symbol: 'sachet', category: 'quantity', baseUnit: null, conversionFactor: null },
    { name: 'bouteille', symbol: 'btl', category: 'quantity', baseUnit: null, conversionFactor: null },
    { name: 'boîte', symbol: 'boîte', category: 'quantity', baseUnit: null, conversionFactor: null },
    { name: 'paquet', symbol: 'pqt', category: 'quantity', baseUnit: null, conversionFactor: null },
    { name: 'centimètre', symbol: 'cm', category: 'length', baseUnit: 'cm', conversionFactor: 1 },
    { name: 'mètre', symbol: 'm', category: 'length', baseUnit: 'cm', conversionFactor: 100 },
];

async function migrateUnits() {
    console.log('\n▶ Insertion des unités de mesure...');
    for (const unitData of UNITS_DATA) {
        await prisma.unit.upsert({
            where: { symbol: unitData.symbol },
            update: {},
            create: {
                ...unitData,
                isActive: true,
            },
        });
        console.log(`✅ ${unitData.name} (${unitData.symbol})`);
    }

    console.log('\n▶ Migration des variantes existantes (ProductVariant)...');
    const variants = await prisma.productVariant.findMany({
        where: {
            quantity: null, // on ne remplace que les anciens formats
            unitId: null,
        },
    });

    let updatedCount = 0;

    for (const variant of variants) {
        const match = variant.optionValue.match(/^(\d+(?:\.\d+)?)([a-zA-Zéèêûç\-]+)$/);
        if (!match) continue;

        const [, quantityStr, rawSymbol] = match;
        const quantity = parseFloat(quantityStr);
        const symbol = rawSymbol.trim().toLowerCase();

        const unit = await prisma.unit.findFirst({
            where: {
                OR: [
                    { symbol: { equals: symbol, mode: 'insensitive' } },
                    { name: { equals: symbol, mode: 'insensitive' } },
                ],
            },
        });

        if (!unit) {
            console.warn(`⚠️ Unité inconnue pour variant ID ${variant.id}: ${symbol}`);
            continue;
        }

        await prisma.productVariant.update({
            where: { id: variant.id },
            data: {
                quantity,
                unitId: unit.id,
            },
        });

        updatedCount++;
    }

    console.log(`\n✅ ${updatedCount} variantes mises à jour avec unités normalisées.`);

    await prisma.$disconnect();
}

migrateUnits()
    .then(() => {
        console.log('\n✅ Migration terminée avec succès.');
    })
    .catch((error) => {
        console.error('❌ Erreur lors de la migration :', error);
        prisma.$disconnect();
        process.exit(1);
    });
