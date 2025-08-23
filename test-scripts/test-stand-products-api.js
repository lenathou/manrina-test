const fetch = require('node-fetch');

// Configuration
const BASE_URL = 'http://localhost:3059';
const TEST_GROWER_ID = 'ad49dd9b-2186-49a6-abbf-913c594115e1'; // ID du producteur de test
const TEST_MARKET_SESSION_ID = 'cmeexp46g0000vlf0qn6exkx9'; // ID de la session de marché de test

// Couleurs pour les logs
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Test de l'API GET /api/grower/stand-products
async function testGetStandProducts() {
  log('\n=== TEST GET /api/grower/stand-products ===', 'blue');
  
  try {
    const response = await fetch(`${BASE_URL}/api/grower/stand-products?growerId=${TEST_GROWER_ID}`);
    const data = await response.json();
    
    log(`Status: ${response.status}`, response.status === 200 ? 'green' : 'red');
    log(`Response:`, 'yellow');
    console.log(JSON.stringify(data, null, 2));
    
    if (response.status === 200) {
      log(`✅ GET test passed - Found ${data.length || 0} products`, 'green');
      return data;
    } else {
      log(`❌ GET test failed`, 'red');
      return null;
    }
  } catch (error) {
    log(`❌ GET test error: ${error.message}`, 'red');
    return null;
  }
}

// Test de l'API POST /api/grower/stand-products
async function testPostStandProduct() {
  log('\n=== TEST POST /api/grower/stand-products ===', 'blue');
  
  const testProduct = {
    growerId: TEST_GROWER_ID,
    name: `Test Product ${Date.now()}`,
    description: 'Produit de test automatique',
    price: 5.99,
    unit: 'kg',
    category: 'Légumes',
    marketSessionId: TEST_MARKET_SESSION_ID,
    availability: true
  };
  
  try {
    const response = await fetch(`${BASE_URL}/api/grower/stand-products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testProduct)
    });
    
    const data = await response.json();
    
    log(`Status: ${response.status}`, response.status === 201 || response.status === 200 ? 'green' : 'red');
    log(`Request body:`, 'yellow');
    console.log(JSON.stringify(testProduct, null, 2));
    log(`Response:`, 'yellow');
    console.log(JSON.stringify(data, null, 2));
    
    if (response.status === 201 || response.status === 200) {
      log(`✅ POST test passed - Product created`, 'green');
      return data;
    } else {
      log(`❌ POST test failed`, 'red');
      return null;
    }
  } catch (error) {
    log(`❌ POST test error: ${error.message}`, 'red');
    return null;
  }
}

// Test de validation des données
async function testPostValidation() {
  log('\n=== TEST POST Validation ===', 'blue');
  
  const invalidProduct = {
    // Données invalides pour tester la validation
    growerId: 'invalid',
    name: '', // nom vide
    price: -5 // prix négatif
  };
  
  try {
    const response = await fetch(`${BASE_URL}/api/grower/stand-products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(invalidProduct)
    });
    
    const data = await response.json();
    
    log(`Status: ${response.status}`, response.status >= 400 ? 'green' : 'red');
    log(`Response:`, 'yellow');
    console.log(JSON.stringify(data, null, 2));
    
    if (response.status >= 400) {
      log(`✅ Validation test passed - Invalid data rejected`, 'green');
    } else {
      log(`❌ Validation test failed - Invalid data accepted`, 'red');
    }
  } catch (error) {
    log(`❌ Validation test error: ${error.message}`, 'red');
  }
}

// Fonction principale
async function runTests() {
  log('🚀 Démarrage des tests API stand-products', 'blue');
  log(`Base URL: ${BASE_URL}`, 'yellow');
  log(`Test Grower ID: ${TEST_GROWER_ID}`, 'yellow');
  
  // Vérifier que le serveur est accessible
  try {
    const healthCheck = await fetch(`${BASE_URL}/api/grower/stand-products?growerId=${TEST_GROWER_ID}`);
    if (!healthCheck.ok && healthCheck.status !== 400) {
      throw new Error('Server not accessible');
    }
    log('✅ Server is accessible', 'green');
  } catch (error) {
    if (error.code === 'ECONNREFUSED' || error.message.includes('fetch')) {
      log(`❌ Server not accessible: ${error.message}`, 'red');
      log('Assurez-vous que le serveur Next.js est démarré sur le port 3059', 'yellow');
      return;
    }
    log('✅ Server is accessible', 'green');
  }
  
  // Exécuter les tests
  const getResult = await testGetStandProducts();
  const postResult = await testPostStandProduct();
  await testPostValidation();
  
  // Vérifier que le produit ajouté apparaît dans la liste
  if (postResult) {
    log('\n=== TEST Vérification ajout ===', 'blue');
    const updatedList = await testGetStandProducts();
    if (updatedList && updatedList.some(p => p.id === postResult.id)) {
      log('✅ Le produit ajouté apparaît dans la liste', 'green');
    } else {
      log('❌ Le produit ajouté n\'apparaît pas dans la liste', 'red');
    }
  }
  
  log('\n🏁 Tests terminés', 'blue');
}

// Exporter pour utilisation en module ou exécuter directement
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests, testGetStandProducts, testPostStandProduct };