const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const TEST_GROWER_ID = 'ad49dd9b-2186-49a6-abbf-913c594115e1';
const TEST_MARKET_SESSION_ID = 'cmeexp46g0000vlf0qn6exkx9';

async function debugPrismaCreate() {
  try {
    console.log('🔍 Test direct de création MarketProduct avec Prisma');
    console.log('='.repeat(60));
    
    const testData = {
      name: 'Produit Test Prisma',
      description: 'Description du produit test',
      price: 15.50,
      unit: 'kg',
      category: 'Légumes',
      marketSessionId: TEST_MARKET_SESSION_ID,
      growerId: TEST_GROWER_ID,
      stock: 10
    };
    
    console.log('Données à créer:', JSON.stringify(testData, null, 2));
    console.log('\nTentative de création...');
    
    const newProduct = await prisma.marketProduct.create({
      data: testData
    });
    
    console.log('✅ Produit créé avec succès:');
    console.log(JSON.stringify(newProduct, null, 2));
    
    // Nettoyer le produit créé
    await prisma.marketProduct.delete({
      where: { id: newProduct.id }
    });
    console.log('\n🧹 Produit supprimé pour nettoyage');
    
  } catch (error) {
    console.error('❌ Erreur Prisma détaillée:');
    console.error('Code:', error.code);
    console.error('Message:', error.message);
    console.error('Meta:', error.meta);
    console.error('Stack:', error.stack);
    
    if (error.code === 'P2002') {
      console.log('\n🔍 Erreur de contrainte unique détectée');
      console.log('Champs concernés:', error.meta?.target);
    }
    
    if (error.code === 'P2003') {
      console.log('\n🔍 Erreur de clé étrangère détectée');
      console.log('Champ concerné:', error.meta?.field_name);
    }
  } finally {
    await prisma.$disconnect();
  }
}

debugPrismaCreate();