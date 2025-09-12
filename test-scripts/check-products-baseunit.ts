import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkProductsBaseUnit() {
  try {
    console.log('🔍 Vérification des produits et leurs baseUnit/baseQuantity...');
    
    const products = await prisma.product.findMany({
      include: {
        baseUnit: true,
        variants: {
          include: {
            unit: true
          }
        }
      }
    });
    
    console.log(`\n📊 Total produits trouvés: ${products.length}`);
    
    products.forEach((product, index) => {
      console.log(`\n${index + 1}. ${product.name}`);
      console.log(`   ID: ${product.id}`);
      console.log(`   baseUnitId: ${product.baseUnitId || 'NON DÉFINI'}`);
      console.log(`   baseQuantity: ${product.baseQuantity || 'NON DÉFINI'}`);
      console.log(`   baseUnit: ${product.baseUnit ? product.baseUnit.name + ' (' + product.baseUnit.symbol + ')' : 'NON DÉFINI'}`);
      console.log(`   Variants: ${product.variants.length}`);
      
      product.variants.forEach((variant, vIndex) => {
        console.log(`     ${vIndex + 1}. ${variant.optionValue}`);
        console.log(`        unitId: ${variant.unitId || 'NON DÉFINI'}`);
        console.log(`        quantity: ${variant.quantity || 'NON DÉFINI'}`);
        console.log(`        unit: ${variant.unit ? variant.unit.name + ' (' + variant.unit.symbol + ')' : 'NON DÉFINI'}`);
      });
    });
    
    // Statistiques
    const productsWithBaseUnit = products.filter(p => p.baseUnitId);
    const productsWithBaseQuantity = products.filter(p => p.baseQuantity);
    const variantsWithUnit = products.flatMap(p => p.variants).filter(v => v.unitId);
    const variantsWithQuantity = products.flatMap(p => p.variants).filter(v => v.quantity);
    
    console.log(`\n📈 Statistiques:`);
    console.log(`   Produits avec baseUnit: ${productsWithBaseUnit.length}/${products.length}`);
    console.log(`   Produits avec baseQuantity: ${productsWithBaseQuantity.length}/${products.length}`);
    console.log(`   Variants avec unit: ${variantsWithUnit.length}/${products.flatMap(p => p.variants).length}`);
    console.log(`   Variants avec quantity: ${variantsWithQuantity.length}/${products.flatMap(p => p.variants).length}`);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProductsBaseUnit();