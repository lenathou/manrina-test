import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedUnits() {
  console.log('🌱 Seeding units...');

  // Unités de poids
  const weightUnits = [
    { name: 'Gramme', symbol: 'g', category: 'weight', conversionFactor: 0.001 },
    { name: 'Kilogramme', symbol: 'kg', category: 'weight', conversionFactor: 1 },
    { name: 'Tonne', symbol: 't', category: 'weight', conversionFactor: 1000 },
  ];

  // Unités de volume
  const volumeUnits = [
    { name: 'Millilitre', symbol: 'ml', category: 'volume', conversionFactor: 0.001 },
    { name: 'Litre', symbol: 'L', category: 'volume', conversionFactor: 1 },
    { name: 'Centilitre', symbol: 'cl', category: 'volume', conversionFactor: 0.01 },
  ];

  // Units de longueur
  const lengthUnits = [
    { name: 'Centimetre', symbol: 'cm', category: 'length', conversionFactor: 0.01 }, // 1 cm = 0.01 m
    { name: 'Metre', symbol: 'm', category: 'length', conversionFactor: 1 }, // base unit = m
  ];

  // Unités de quantité
  const quantityUnits = [
    { name: 'Pièce', symbol: 'pièce', category: 'quantity', conversionFactor: 1 },
    { name: 'Unité', symbol: 'unité', category: 'quantity', conversionFactor: 1 },
    { name: 'Paquet', symbol: 'paquet', category: 'quantity', conversionFactor: 1 },
    { name: 'Botte', symbol: 'botte', category: 'quantity', conversionFactor: 1 },
    { name: 'Barquette', symbol: 'barquette', category: 'quantity', conversionFactor: 1 },
  ];

  const allUnits = [...weightUnits, ...volumeUnits, ...lengthUnits, ...quantityUnits];

  for (const unit of allUnits) {
    try {
      const existingUnit = await prisma.unit.findFirst({
        where: {
          OR: [
            { name: unit.name },
            { symbol: unit.symbol }
          ]
        }
      });

      if (!existingUnit) {
        await prisma.unit.create({
          data: {
            name: unit.name,
            symbol: unit.symbol,
            category: unit.category,
            conversionFactor: unit.conversionFactor,
            isActive: true,
          },
        });
        console.log(`✅ Created unit: ${unit.name} (${unit.symbol})`);
      } else {
        console.log(`⏭️  Unit already exists: ${unit.name} (${unit.symbol})`);
      }
    } catch (error) {
      console.error(`❌ Error creating unit ${unit.name}:`, error);
    }
  }

  console.log('✅ Units seeding completed!');
}

seedUnits()
  .catch((e) => {
    console.error('❌ Error seeding units:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
