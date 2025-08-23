const { PrismaClient } = require('@prisma/client');
const fetch = require('node-fetch');

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:3059';
const TEST_GROWER_ID = 'ad49dd9b-2186-49a6-abbf-913c594115e1';
const TEST_MARKET_SESSION_ID = 'cmeexp46g0000vlf0qn6exkx9';

async function debugAPI() {
  try {
    console.log('🔍 Debugging API POST /api/grower/stand-products');
    console.log('='.repeat(50));
    
    // 1. Vérifier l'existence du producteur
    console.log('1. Vérification du producteur...');
    const grower = await prisma.grower.findUnique({
      where: { id: TEST_GROWER_ID }
    });
    
    if (!grower) {
      console.log('❌ Producteur non trouvé:', TEST_GROWER_ID);
      return;
    }
    console.log('✅ Producteur trouvé:', grower.name || 'Nom non défini');
    
    // 2. Vérifier l'existence de la session de marché
    console.log('\n2. Vérification de la session de marché...');
    const marketSession = await prisma.marketSession.findUnique({
      where: { id: TEST_MARKET_SESSION_ID }
    });
    
    if (!marketSession) {
      console.log('❌ Session de marché non trouvée:', TEST_MARKET_SESSION_ID);
      return;
    }
    console.log('✅ Session de marché trouvée:', marketSession.name);
    
    // 3. Tester l'API POST avec des données valides
    console.log('\n3. Test de l\'API POST...');
    const testProduct = {
      growerId: TEST_GROWER_ID,
      name: 'Produit Test Debug',
      description: 'Description du produit test',
      price: 15.50,
      unit: 'kg',
      category: 'Légumes',
      marketSessionId: TEST_MARKET_SESSION_ID,
      stock: 10
    };
    
    console.log('Données envoyées:', JSON.stringify(testProduct, null, 2));
    
    const response = await fetch(`${BASE_URL}/api/grower/stand-products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testProduct)
    });
    
    console.log('\nStatut de la réponse:', response.status);
    console.log('Headers de la réponse:', Object.fromEntries(response.headers));
    
    const responseText = await response.text();
    console.log('\nCorps de la réponse (texte brut):');
    console.log(responseText);
    
    // Essayer de parser en JSON
    try {
      const responseJson = JSON.parse(responseText);
      console.log('\nCorps de la réponse (JSON):');
      console.log(JSON.stringify(responseJson, null, 2));
    } catch (parseError) {
      console.log('\n❌ Impossible de parser la réponse en JSON:', parseError.message);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du debug:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugAPI();