const standProductsTests = require('./test-stand-products-api');
const suggestionsApiTests = require('./test-product-suggestions-api');
const growerStandHooksTests = require('./test-hooks-grower-stand');
const suggestionsHooksTests = require('./test-hooks-suggestions');

// Couleurs pour les logs
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(message) {
  const border = '='.repeat(60);
  log(`\n${border}`, 'cyan');
  log(`${message}`, 'cyan');
  log(`${border}`, 'cyan');
}

function logSection(message) {
  const border = '-'.repeat(40);
  log(`\n${border}`, 'blue');
  log(`${message}`, 'blue');
  log(`${border}`, 'blue');
}

// Fonction pour capturer les résultats des tests
class TestResults {
  constructor() {
    this.results = [];
    this.startTime = Date.now();
  }
  
  addResult(testName, status, details = '') {
    this.results.push({
      testName,
      status, // 'passed', 'failed', 'error'
      details,
      timestamp: Date.now()
    });
  }
  
  getReport() {
    const endTime = Date.now();
    const duration = endTime - this.startTime;
    
    const passed = this.results.filter(r => r.status === 'passed').length;
    const failed = this.results.filter(r => r.status === 'failed').length;
    const errors = this.results.filter(r => r.status === 'error').length;
    const total = this.results.length;
    
    return {
      summary: {
        total,
        passed,
        failed,
        errors,
        duration: `${duration}ms`,
        successRate: total > 0 ? `${Math.round((passed / total) * 100)}%` : '0%'
      },
      details: this.results
    };
  }
}

// Fonction pour exécuter un test avec gestion d'erreur
async function runTestSafely(testName, testFunction, results) {
  try {
    log(`\n🧪 Exécution: ${testName}`, 'yellow');
    const result = await testFunction();
    
    if (result !== null && result !== false) {
      results.addResult(testName, 'passed', 'Test réussi');
      log(`✅ ${testName} - RÉUSSI`, 'green');
    } else {
      results.addResult(testName, 'failed', 'Test échoué');
      log(`❌ ${testName} - ÉCHOUÉ`, 'red');
    }
  } catch (error) {
    results.addResult(testName, 'error', error.message);
    log(`💥 ${testName} - ERREUR: ${error.message}`, 'red');
  }
}

// Fonction principale
async function runAllTests() {
  logHeader('🚀 DÉMARRAGE DE TOUS LES TESTS AUTOMATISÉS');
  
  const results = new TestResults();
  
  // Vérification préliminaire du serveur
  log('\n🔍 Vérification de l\'accessibilité du serveur...', 'yellow');
  try {
    const fetch = require('node-fetch');
    const response = await fetch('http://localhost:3059/api/hello');
    if (response.ok) {
      log('✅ Serveur accessible sur le port 3059', 'green');
    } else {
      throw new Error(`Server responded with status ${response.status}`);
    }
  } catch (error) {
    log('❌ Serveur non accessible. Assurez-vous que le serveur Next.js est démarré.', 'red');
    log('💡 Commande pour démarrer: pnpm dev', 'yellow');
    return;
  }
  
  // Tests API Stand Products
  logSection('📦 TESTS API STAND PRODUCTS');
  await runTestSafely('API GET Stand Products', standProductsTests.testGetStandProducts, results);
  await runTestSafely('API POST Stand Product', standProductsTests.testPostStandProduct, results);
  
  // Tests API Product Suggestions
  logSection('💡 TESTS API PRODUCT SUGGESTIONS');
  await runTestSafely('API Create Market Suggestion', suggestionsApiTests.testCreateMarketProductSuggestion, results);
  await runTestSafely('API Get Market Suggestions', suggestionsApiTests.testGetMarketProductSuggestions, results);
  await runTestSafely('API Create Grower Suggestion', suggestionsApiTests.testCreateGrowerProductSuggestion, results);
  await runTestSafely('API Get Grower Suggestions', suggestionsApiTests.testGetGrowerProductSuggestions, results);
  
  // Tests Hooks Grower Stand
  logSection('🎣 TESTS HOOKS GROWER STAND');
  await runTestSafely('Hook Fetch Stand Products', growerStandHooksTests.testFetchStandProducts, results);
  await runTestSafely('Hook Add Stand Product', growerStandHooksTests.testAddStandProduct, results);
  await runTestSafely('Hook Data Consistency', growerStandHooksTests.testDataConsistency, results);
  await runTestSafely('Hook Query Parameters', growerStandHooksTests.testQueryParameters, results);
  
  // Tests Hooks Suggestions
  logSection('🎣 TESTS HOOKS SUGGESTIONS');
  await runTestSafely('Hook Create Market Suggestion', suggestionsHooksTests.testCreateMarketProductSuggestionHook, results);
  await runTestSafely('Hook Get Market Suggestions', suggestionsHooksTests.testMarketProductSuggestionsHook, results);
  await runTestSafely('Hook Get Grower Suggestions', suggestionsHooksTests.testGrowerProductSuggestionsHook, results);
  await runTestSafely('Hook Suggestion Consistency', suggestionsHooksTests.testSuggestionConsistency, results);
  
  // Génération du rapport final
  logHeader('📊 RAPPORT FINAL DES TESTS');
  
  const report = results.getReport();
  
  log(`\n📈 RÉSUMÉ:`, 'cyan');
  log(`   Total des tests: ${report.summary.total}`, 'white');
  log(`   ✅ Réussis: ${report.summary.passed}`, 'green');
  log(`   ❌ Échoués: ${report.summary.failed}`, 'red');
  log(`   💥 Erreurs: ${report.summary.errors}`, 'red');
  log(`   ⏱️  Durée: ${report.summary.duration}`, 'yellow');
  log(`   📊 Taux de réussite: ${report.summary.successRate}`, report.summary.successRate === '100%' ? 'green' : 'yellow');
  
  // Détails des échecs
  const failures = report.details.filter(r => r.status !== 'passed');
  if (failures.length > 0) {
    log(`\n🔍 DÉTAILS DES ÉCHECS:`, 'red');
    failures.forEach(failure => {
      log(`   ❌ ${failure.testName}: ${failure.details}`, 'red');
    });
    
    log(`\n💡 RECOMMANDATIONS:`, 'yellow');
    
    if (failures.some(f => f.testName.includes('API'))) {
      log('   • Vérifiez les endpoints API dans src/pages/api/', 'yellow');
      log('   • Vérifiez la base de données et les modèles Prisma', 'yellow');
    }
    
    if (failures.some(f => f.testName.includes('Hook'))) {
      log('   • Vérifiez les hooks dans src/hooks/', 'yellow');
      log('   • Vérifiez BackendFetchService.tsx', 'yellow');
    }
    
    if (failures.some(f => f.testName.includes('Consistency'))) {
      log('   • Problème de cohérence des données détecté', 'yellow');
      log('   • Vérifiez les invalidations de cache React Query', 'yellow');
    }
  } else {
    log(`\n🎉 TOUS LES TESTS SONT RÉUSSIS !`, 'green');
    log('   Le système fonctionne correctement.', 'green');
  }
  
  logHeader('🏁 TESTS TERMINÉS');
  
  return report;
}

// Fonction pour générer un rapport JSON
async function generateJsonReport() {
  const report = await runAllTests();
  const fs = require('fs');
  const path = require('path');
  
  const reportPath = path.join(__dirname, 'test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  log(`\n📄 Rapport JSON généré: ${reportPath}`, 'cyan');
  
  return report;
}

// Exporter pour utilisation en module ou exécuter directement
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--json')) {
    generateJsonReport().catch(console.error);
  } else {
    runAllTests().catch(console.error);
  }
}

module.exports = { runAllTests, generateJsonReport };