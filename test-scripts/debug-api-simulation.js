const { PrismaClient, Prisma } = require('@prisma/client');

const prisma = new PrismaClient();
const TEST_GROWER_ID = 'ad49dd9b-2186-49a6-abbf-913c594115e1';
const TEST_MARKET_SESSION_ID = 'cmeexp46g0000vlf0qn6exkx9';

async function simulateAPIPost() {
  try {
    console.log('🔍 Simulation de l\'API POST /api/grower/stand-products');
    console.log('='.repeat(60));
    
    // Données de test (exactement comme dans l'API)
    const requestBody = {
      growerId: TEST_GROWER_ID,
      name: 'Produit Test API Simulation',
      description: 'Description du produit test',
      price: 15.50,
      unit: 'kg',
      category: 'Légumes',
      marketSessionId: TEST_MARKET_SESSION_ID,
      stock: 10
    };
    
    const { growerId, name, description, imageUrl, price, stock, unit, category, marketSessionId } = requestBody;
    
    console.log('1. Validation des données...');
    
    // Validation des données (comme dans l'API)
    if (!growerId || !name || price === undefined || !marketSessionId) {
      console.log('❌ Validation échouée: données manquantes');
      return;
    }
    
    if (price < 0) {
      console.log('❌ Validation échouée: prix négatif');
      return;
    }
    
    console.log('✅ Validation réussie');
    
    console.log('\n2. Vérification de l\'existence du produit...');
    
    // Vérifier si le produit existe déjà dans le stand pour cette session
    const existingStandProduct = await prisma.marketProduct.findFirst({
      where: {
        growerId,
        name,
        marketSessionId
      }
    });
    
    if (existingStandProduct) {
      console.log('❌ Produit déjà existant:', existingStandProduct.id);
      return;
    }
    
    console.log('✅ Produit non existant, peut être créé');
    
    console.log('\n3. Vérification du producteur et de la session...');
    
    // Vérifier que le producteur et la session de marché existent
    const [grower, marketSession] = await Promise.all([
      prisma.grower.findUnique({ where: { id: growerId } }),
      prisma.marketSession.findUnique({ where: { id: marketSessionId } })
    ]);
    
    if (!grower) {
      console.log('❌ Producteur non trouvé');
      return;
    }
    
    if (!marketSession) {
      console.log('❌ Session de marché non trouvée');
      return;
    }
    
    console.log('✅ Producteur et session trouvés');
    console.log('   - Producteur:', grower.name || 'Nom non défini');
    console.log('   - Session:', marketSession.name);
    
    console.log('\n4. Création du produit...');
    
    // Préparer les données exactement comme dans l'API
    const createData = {
      name,
      description,
      imageUrl,
      price: new Prisma.Decimal(price.toString()),
      stock: stock || 0,
      unit,
      category,
      growerId,
      marketSessionId,
      isActive: true
    };
    
    console.log('Données de création:', JSON.stringify({
      ...createData,
      price: price.toString() // Pour l'affichage
    }, null, 2));
    
    // Créer le produit du stand
    const standProduct = await prisma.marketProduct.create({
      data: createData,
      include: {
        grower: true,
        marketSession: true
      }
    });
    
    console.log('\n✅ Produit créé avec succès:');
    console.log('ID:', standProduct.id);
    console.log('Nom:', standProduct.name);
    console.log('Prix:', standProduct.price.toString());
    
    // Nettoyer
    await prisma.marketProduct.delete({
      where: { id: standProduct.id }
    });
    console.log('\n🧹 Produit supprimé pour nettoyage');
    
  } catch (error) {
    console.error('\n❌ Erreur lors de la simulation:');
    console.error('Type:', error.constructor.name);
    console.error('Message:', error.message);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error('Code Prisma:', error.code);
      console.error('Meta:', error.meta);
      
      if (error.code === 'P2002') {
        console.log('\n🔍 Erreur de contrainte unique détectée');
      }
    }
    
    console.error('\nStack trace:');
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

simulateAPIPost();