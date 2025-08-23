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

// Simulation du hook useGrowerStandProducts - fetchStandProducts
async function testFetchStandProducts() {
  log('\n=== TEST Hook fetchStandProducts ===', 'blue');
  
  try {
    // Simulation de l'appel fait par le hook
    const response = await fetch(`${BASE_URL}/api/grower/stand-products?growerId=${TEST_GROWER_ID}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    log(`Status: ${response.status}`, response.status === 200 ? 'green' : 'red');
    log(`Response type: ${Array.isArray(data) ? 'Array' : typeof data}`, 'yellow');
    log(`Products count: ${Array.isArray(data) ? data.length : 'N/A'}`, 'yellow');
    
    if (Array.isArray(data)) {
      log('Sample product structure:', 'yellow');
      if (data.length > 0) {
        console.log(JSON.stringify(data[0], null, 2));
      } else {
        log('No products found', 'yellow');
      }
    } else {
      log('Response data:', 'yellow');
      console.log(JSON.stringify(data, null, 2));
    }
    
    if (response.status === 200) {
      log(`✅ fetchStandProducts hook simulation passed`, 'green');
      return data;
    } else {
      log(`❌ fetchStandProducts hook simulation failed`, 'red');
      return null;
    }
  } catch (error) {
    log(`❌ fetchStandProducts hook error: ${error.message}`, 'red');
    return null;
  }
}

// Simulation du hook useGrowerStandProducts - addStandProduct
async function testAddStandProduct() {
  log('\n=== TEST Hook addStandProduct ===', 'blue');
  
  const testProduct = {
    growerId: TEST_GROWER_ID,
    name: `Hook Test Product ${Date.now()}`,
    description: 'Produit ajouté via simulation du hook',
    price: 7.50,
    unit: 'kg',
    category: 'Légumes',
    marketSessionId: TEST_MARKET_SESSION_ID,
    availability: true,
    stock: 10
  };
  
  try {
    // Simulation de l'appel fait par le hook
    const response = await fetch(`${BASE_URL}/api/grower/stand-products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testProduct)
    });
    
    const data = await response.json();
    
    log(`Status: ${response.status}`, response.status === 201 || response.status === 200 ? 'green' : 'red');
    log(`Request payload:`, 'yellow');
    console.log(JSON.stringify(testProduct, null, 2));
    log(`Response:`, 'yellow');
    console.log(JSON.stringify(data, null, 2));
    
    if (response.status === 201 || response.status === 200) {
      log(`✅ addStandProduct hook simulation passed`, 'green');
      return data;
    } else {
      log(`❌ addStandProduct hook simulation failed`, 'red');
      return null;
    }
  } catch (error) {
    log(`❌ addStandProduct hook error: ${error.message}`, 'red');
    return null;
  }
}

// Test de la cohérence des données après ajout
async function testDataConsistency() {
  log('\n=== TEST Data Consistency ===', 'blue');
  
  // 1. Récupérer la liste initiale
  const initialProducts = await testFetchStandProducts();
  const initialCount = Array.isArray(initialProducts) ? initialProducts.length : 0;
  
  log(`Initial products count: ${initialCount}`, 'yellow');
  
  // 2. Ajouter un produit
  const addedProduct = await testAddStandProduct();
  
  if (!addedProduct) {
    log('❌ Cannot test consistency - product addition failed', 'red');
    return false;
  }
  
  // 3. Récupérer la liste mise à jour
  await new Promise(resolve => setTimeout(resolve, 1000)); // Attendre 1 seconde
  const updatedProducts = await testFetchStandProducts();
  const updatedCount = Array.isArray(updatedProducts) ? updatedProducts.length : 0;
  
  log(`Updated products count: ${updatedCount}`, 'yellow');
  
  // 4. Vérifier la cohérence
  if (updatedCount === initialCount + 1) {
    log('✅ Data consistency test passed - Product count increased by 1', 'green');
    
    // Vérifier que le produit ajouté est dans la liste
    if (Array.isArray(updatedProducts)) {
      const foundProduct = updatedProducts.find(p => p.id === addedProduct.id);
      if (foundProduct) {
        log('✅ Added product found in updated list', 'green');
        return true;
      } else {
        log('❌ Added product not found in updated list', 'red');
        return false;
      }
    }
  } else {
    log(`❌ Data consistency test failed - Expected ${initialCount + 1}, got ${updatedCount}`, 'red');
    return false;
  }
}

// Test des paramètres de requête
async function testQueryParameters() {
  log('\n=== TEST Query Parameters ===', 'blue');
  
  // Test sans growerId
  try {
    const response = await fetch(`${BASE_URL}/api/grower/stand-products`);
    const data = await response.json();
    
    log(`Without growerId - Status: ${response.status}`, response.status >= 400 ? 'green' : 'red');
    
    if (response.status >= 400) {
      log('✅ Query parameter validation works', 'green');
    } else {
      log('❌ Missing growerId should return error', 'red');
    }
  } catch (error) {
    log(`Query parameter test error: ${error.message}`, 'red');
  }
  
  // Test avec growerId invalide
  try {
    const response = await fetch(`${BASE_URL}/api/grower/stand-products?growerId=invalid`);
    const data = await response.json();
    
    log(`Invalid growerId - Status: ${response.status}`, response.status >= 400 ? 'green' : 'red');
    
    if (response.status >= 400) {
      log('✅ Invalid growerId validation works', 'green');
    } else {
      log('❌ Invalid growerId should return error', 'red');
    }
  } catch (error) {
    log(`Invalid growerId test error: ${error.message}`, 'red');
  }
}

// Fonction principale
async function runTests() {
  log('🚀 Démarrage des tests Hook useGrowerStandProducts', 'blue');
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
  await testFetchStandProducts();
  await testAddStandProduct();
  await testDataConsistency();
  await testQueryParameters();
  
  log('\n🏁 Tests des hooks terminés', 'blue');
}

// Exporter pour utilisation en module ou exécuter directement
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { 
  runTests, 
  testFetchStandProducts, 
  testAddStandProduct, 
  testDataConsistency,
  testQueryParameters
};