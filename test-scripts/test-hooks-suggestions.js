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

// Test du hook useCreateMarketProductSuggestion
async function testCreateMarketProductSuggestionHook() {
  log('\n=== TEST Hook useCreateMarketProductSuggestion ===', 'blue');
  
  const suggestionData = {
    marketId: TEST_MARKET_ID,
    growerId: TEST_GROWER_ID,
    productName: `Hook Test Suggestion ${Date.now()}`,
    description: 'Suggestion créée via simulation du hook',
    category: 'Légumes',
    estimatedPrice: 4.99,
    unit: 'kg',
    seasonality: 'Automne',
    reason: 'Test automatique du hook'
  };
  
  try {
    // Simulation de l'appel fait par le hook useCreateMarketProductSuggestion
    // qui devrait maintenant utiliser backendFetchService.createMarketProductSuggestion
    const response = await fetch(`${BASE_URL}/api/market/product-suggestions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(suggestionData)
    });
    
    const data = await response.json();
    
    log(`Status: ${response.status}`, response.status === 201 || response.status === 200 ? 'green' : 'red');
    log(`Request payload:`, 'yellow');
    console.log(JSON.stringify(suggestionData, null, 2));
    log(`Response:`, 'yellow');
    console.log(JSON.stringify(data, null, 2));
    
    if (response.status === 201 || response.status === 200) {
      log(`✅ useCreateMarketProductSuggestion hook simulation passed`, 'green');
      return data;
    } else {
      log(`❌ useCreateMarketProductSuggestion hook simulation failed`, 'red');
      return null;
    }
  } catch (error) {
    log(`❌ useCreateMarketProductSuggestion hook error: ${error.message}`, 'red');
    return null;
  }
}

// Test du hook useMarketProductSuggestions (récupération)
async function testMarketProductSuggestionsHook() {
  log('\n=== TEST Hook useMarketProductSuggestions ===', 'blue');
  
  try {
    // Simulation de l'appel fait par le hook useMarketProductSuggestions
    const response = await fetch(`${BASE_URL}/api/market/product-suggestions?marketId=${TEST_MARKET_ID}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    log(`Status: ${response.status}`, response.status === 200 ? 'green' : 'red');
    log(`Response type: ${Array.isArray(data) ? 'Array' : typeof data}`, 'yellow');
    log(`Suggestions count: ${Array.isArray(data) ? data.length : 'N/A'}`, 'yellow');
    
    if (Array.isArray(data)) {
      log('Sample suggestion structure:', 'yellow');
      if (data.length > 0) {
        console.log(JSON.stringify(data[0], null, 2));
      } else {
        log('No suggestions found', 'yellow');
      }
    } else {
      log('Response data:', 'yellow');
      console.log(JSON.stringify(data, null, 2));
    }
    
    if (response.status === 200) {
      log(`✅ useMarketProductSuggestions hook simulation passed`, 'green');
      return data;
    } else {
      log(`❌ useMarketProductSuggestions hook simulation failed`, 'red');
      return null;
    }
  } catch (error) {
    log(`❌ useMarketProductSuggestions hook error: ${error.message}`, 'red');
    return null;
  }
}

// Test du hook useDeleteMarketProductSuggestion
async function testDeleteMarketProductSuggestionHook(suggestionId) {
  log('\n=== TEST Hook useDeleteMarketProductSuggestion ===', 'blue');
  
  if (!suggestionId) {
    log('❌ No suggestion ID provided for deletion test', 'red');
    return false;
  }
  
  try {
    // Simulation de l'appel fait par le hook useDeleteMarketProductSuggestion
    const response = await fetch(`${BASE_URL}/api/market/product-suggestions/${suggestionId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    log(`Status: ${response.status}`, response.status === 200 ? 'green' : 'red');
    log(`Suggestion ID: ${suggestionId}`, 'yellow');
    log(`Response:`, 'yellow');
    console.log(JSON.stringify(data, null, 2));
    
    if (response.status === 200) {
      log(`✅ useDeleteMarketProductSuggestion hook simulation passed`, 'green');
      return true;
    } else {
      log(`❌ useDeleteMarketProductSuggestion hook simulation failed`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ useDeleteMarketProductSuggestion hook error: ${error.message}`, 'red');
    return false;
  }
}

// Test du hook useGrowerProductSuggestions
async function testGrowerProductSuggestionsHook() {
  log('\n=== TEST Hook useGrowerProductSuggestions ===', 'blue');
  
  try {
    // Simulation de l'appel fait par le hook useGrowerProductSuggestions
    const response = await fetch(`${BASE_URL}/api/grower/product-suggestions?growerId=${TEST_GROWER_ID}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    log(`Status: ${response.status}`, response.status === 200 ? 'green' : 'red');
    log(`Response type: ${Array.isArray(data) ? 'Array' : typeof data}`, 'yellow');
    log(`Grower suggestions count: ${Array.isArray(data) ? data.length : 'N/A'}`, 'yellow');
    
    if (Array.isArray(data)) {
      log('Sample grower suggestion structure:', 'yellow');
      if (data.length > 0) {
        console.log(JSON.stringify(data[0], null, 2));
      } else {
        log('No grower suggestions found', 'yellow');
      }
    } else {
      log('Response data:', 'yellow');
      console.log(JSON.stringify(data, null, 2));
    }
    
    if (response.status === 200) {
      log(`✅ useGrowerProductSuggestions hook simulation passed`, 'green');
      return data;
    } else {
      log(`❌ useGrowerProductSuggestions hook simulation failed`, 'red');
      return null;
    }
  } catch (error) {
    log(`❌ useGrowerProductSuggestions hook error: ${error.message}`, 'red');
    return null;
  }
}

// Test de cohérence des suggestions
async function testSuggestionConsistency() {
  log('\n=== TEST Suggestion Consistency ===', 'blue');
  
  // 1. Récupérer la liste initiale
  const initialSuggestions = await testMarketProductSuggestionsHook();
  const initialCount = Array.isArray(initialSuggestions) ? initialSuggestions.length : 0;
  
  log(`Initial suggestions count: ${initialCount}`, 'yellow');
  
  // 2. Créer une nouvelle suggestion
  const newSuggestion = await testCreateMarketProductSuggestionHook();
  
  if (!newSuggestion) {
    log('❌ Cannot test consistency - suggestion creation failed', 'red');
    return false;
  }
  
  // 3. Récupérer la liste mise à jour
  await new Promise(resolve => setTimeout(resolve, 1000)); // Attendre 1 seconde
  const updatedSuggestions = await testMarketProductSuggestionsHook();
  const updatedCount = Array.isArray(updatedSuggestions) ? updatedSuggestions.length : 0;
  
  log(`Updated suggestions count: ${updatedCount}`, 'yellow');
  
  // 4. Vérifier la cohérence
  if (updatedCount === initialCount + 1) {
    log('✅ Suggestion consistency test passed - Count increased by 1', 'green');
    
    // Vérifier que la suggestion ajoutée est dans la liste
    if (Array.isArray(updatedSuggestions)) {
      const foundSuggestion = updatedSuggestions.find(s => s.id === newSuggestion.id);
      if (foundSuggestion) {
        log('✅ New suggestion found in updated list', 'green');
        
        // Test de suppression
        const deleteResult = await testDeleteMarketProductSuggestionHook(newSuggestion.id);
        if (deleteResult) {
          // Vérifier que la suggestion a été supprimée
          await new Promise(resolve => setTimeout(resolve, 1000));
          const finalSuggestions = await testMarketProductSuggestionsHook();
          const finalCount = Array.isArray(finalSuggestions) ? finalSuggestions.length : 0;
          
          if (finalCount === initialCount) {
            log('✅ Suggestion deletion consistency test passed', 'green');
            return true;
          } else {
            log(`❌ Deletion consistency failed - Expected ${initialCount}, got ${finalCount}`, 'red');
            return false;
          }
        }
      } else {
        log('❌ New suggestion not found in updated list', 'red');
        return false;
      }
    }
  } else {
    log(`❌ Suggestion consistency test failed - Expected ${initialCount + 1}, got ${updatedCount}`, 'red');
    return false;
  }
}

// Fonction principale
async function runTests() {
  log('🚀 Démarrage des tests Hooks Product Suggestions', 'blue');
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
  
  // Exécuter les tests
  await testMarketProductSuggestionsHook();
  await testCreateMarketProductSuggestionHook();
  await testGrowerProductSuggestionsHook();
  await testSuggestionConsistency();
  
  log('\n🏁 Tests des hooks suggestions terminés', 'blue');
}

// Exporter pour utilisation en module ou exécuter directement
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { 
  runTests, 
  testCreateMarketProductSuggestionHook,
  testMarketProductSuggestionsHook,
  testDeleteMarketProductSuggestionHook,
  testGrowerProductSuggestionsHook,
  testSuggestionConsistency
};