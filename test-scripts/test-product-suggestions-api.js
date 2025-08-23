const fetch = require('node-fetch');

// Configuration
const BASE_URL = 'http://localhost:3059';
const TEST_GROWER_ID = 'ad49dd9b-2186-49a6-abbf-913c594115e1'; // ID du producteur de test
const TEST_MARKET_ID = 'cmeexp46g0000vlf0qn6exkx9'; // ID de la session de marché de test

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

// Test de l'API POST pour créer une suggestion de produit marché
async function testCreateMarketProductSuggestion() {
  log('\n=== TEST POST Market Product Suggestion ===', 'blue');
  
  const testSuggestion = {
    growerId: TEST_GROWER_ID,
    name: `Suggestion Test ${Date.now()}`,
    description: 'Description de test automatique',
    category: 'Légumes',
    unit: 'kg',
    pricing: '3.50€/kg'
  };
  
  try {
    const response = await fetch(`${BASE_URL}/api/market/product-suggestions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testSuggestion)
    });
    
    const data = await response.json();
    
    log(`Status: ${response.status}`, response.status === 201 || response.status === 200 ? 'green' : 'red');
    log(`Request body:`, 'yellow');
    console.log(JSON.stringify(testSuggestion, null, 2));
    log(`Response:`, 'yellow');
    console.log(JSON.stringify(data, null, 2));
    
    if (response.status === 201 || response.status === 200) {
      log(`✅ Market suggestion creation passed`, 'green');
      return data;
    } else {
      log(`❌ Market suggestion creation failed`, 'red');
      return null;
    }
  } catch (error) {
    log(`❌ Market suggestion creation error: ${error.message}`, 'red');
    return null;
  }
}

// Test de l'API GET pour récupérer les suggestions
async function testGetMarketProductSuggestions() {
  log('\n=== TEST GET Market Product Suggestions ===', 'blue');
  
  try {
    const response = await fetch(`${BASE_URL}/api/market/product-suggestions`);
    const data = await response.json();
    
    log(`Status: ${response.status}`, response.status === 200 ? 'green' : 'red');
    log(`Response:`, 'yellow');
    console.log(JSON.stringify(data, null, 2));
    
    if (response.status === 200) {
      log(`✅ GET suggestions passed - Found ${data.length || 0} suggestions`, 'green');
      return data;
    } else {
      log(`❌ GET suggestions failed`, 'red');
      return null;
    }
  } catch (error) {
    log(`❌ GET suggestions error: ${error.message}`, 'red');
    return null;
  }
}

// Test de l'API POST pour créer une suggestion de producteur
async function testCreateGrowerProductSuggestion() {
  log('\n=== TEST POST Grower Product Suggestion ===', 'blue');
  
  const testSuggestion = {
    growerId: TEST_GROWER_ID,
    productName: `Grower Suggestion ${Date.now()}`,
    description: 'Suggestion de producteur test',
    category: 'Fruits',
    estimatedPrice: 4.20,
    unit: 'pièce',
    availability: 'Disponible maintenant',
    reason: 'Test automatique'
  };
  
  try {
    const response = await fetch(`${BASE_URL}/api/grower/product-suggestions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testSuggestion)
    });
    
    const data = await response.json();
    
    log(`Status: ${response.status}`, response.status === 201 || response.status === 200 ? 'green' : 'red');
    log(`Request body:`, 'yellow');
    console.log(JSON.stringify(testSuggestion, null, 2));
    log(`Response:`, 'yellow');
    console.log(JSON.stringify(data, null, 2));
    
    if (response.status === 201 || response.status === 200) {
      log(`✅ Grower suggestion creation passed`, 'green');
      return data;
    } else {
      log(`❌ Grower suggestion creation failed`, 'red');
      return null;
    }
  } catch (error) {
    log(`❌ Grower suggestion creation error: ${error.message}`, 'red');
    return null;
  }
}

// Test de l'API GET pour récupérer les suggestions de producteur
async function testGetGrowerProductSuggestions() {
  log('\n=== TEST GET Grower Product Suggestions ===', 'blue');
  
  try {
    const response = await fetch(`${BASE_URL}/api/grower/product-suggestions?growerId=${TEST_GROWER_ID}`);
    const data = await response.json();
    
    log(`Status: ${response.status}`, response.status === 200 ? 'green' : 'red');
    log(`Response:`, 'yellow');
    console.log(JSON.stringify(data, null, 2));
    
    if (response.status === 200) {
      log(`✅ GET grower suggestions passed - Found ${data.length || 0} suggestions`, 'green');
      return data;
    } else {
      log(`❌ GET grower suggestions failed`, 'red');
      return null;
    }
  } catch (error) {
    log(`❌ GET grower suggestions error: ${error.message}`, 'red');
    return null;
  }
}

// Test de suppression d'une suggestion
async function testDeleteSuggestion(suggestionId, type = 'market') {
  log(`\n=== TEST DELETE ${type} Suggestion ===`, 'blue');
  
  const endpoint = type === 'market' 
    ? `/api/market/product-suggestions/${suggestionId}`
    : `/api/grower/product-suggestions/${suggestionId}`;
  
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'DELETE'
    });
    
    const data = await response.json();
    
    log(`Status: ${response.status}`, response.status === 200 ? 'green' : 'red');
    log(`Response:`, 'yellow');
    console.log(JSON.stringify(data, null, 2));
    
    if (response.status === 200) {
      log(`✅ DELETE suggestion passed`, 'green');
      return true;
    } else {
      log(`❌ DELETE suggestion failed`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ DELETE suggestion error: ${error.message}`, 'red');
    return false;
  }
}

// Fonction principale
async function runTests() {
  log('🚀 Démarrage des tests API Product Suggestions', 'blue');
  log(`Base URL: ${BASE_URL}`, 'yellow');
  log(`Test Grower ID: ${TEST_GROWER_ID}`, 'yellow');
  log(`Test Market ID: ${TEST_MARKET_ID}`, 'yellow');
  
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
  
  // Tests des suggestions de marché
  const marketSuggestion = await testCreateMarketProductSuggestion();
  await testGetMarketProductSuggestions();
  
  // Tests des suggestions de producteur
  const growerSuggestion = await testCreateGrowerProductSuggestion();
  await testGetGrowerProductSuggestions();
  
  // Tests de suppression
  if (marketSuggestion && marketSuggestion.id) {
    await testDeleteSuggestion(marketSuggestion.id, 'market');
  }
  
  if (growerSuggestion && growerSuggestion.id) {
    await testDeleteSuggestion(growerSuggestion.id, 'grower');
  }
  
  log('\n🏁 Tests des suggestions terminés', 'blue');
}

// Exporter pour utilisation en module ou exécuter directement
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { 
  runTests, 
  testCreateMarketProductSuggestion, 
  testGetMarketProductSuggestions,
  testCreateGrowerProductSuggestion,
  testGetGrowerProductSuggestions,
  testDeleteSuggestion
};