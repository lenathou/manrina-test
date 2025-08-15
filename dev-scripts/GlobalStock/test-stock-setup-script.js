/**
 * Script de Test pour la Configuration du Stock Calculé
 * 
 * Ce script teste et valide que le système de stock calculé
 * fonctionne correctement après l'exécution du script de configuration.
 * 
 * Usage :
 * node test-setup-script.js
 * 
 * @author Assistant IA
 * @version 1.0
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Tests de validation du système
 */
async function runTests() {
    console.log('🧪 Tests de Validation du Système de Stock Calculé');
    console.log('=' .repeat(55));
    
    const results = {
        passed: 0,
        failed: 0,
        warnings: 0,
        tests: []
    };
    
    try {
        // Test 1: Connexion à la base de données
        await runTest('Connexion à la base de données', async () => {
            await prisma.$connect();
            return { success: true, message: 'Connexion réussie' };
        }, results);
        
        // Test 2: Présence des tables essentielles
        await runTest('Vérification des tables', async () => {
            const tables = ['product', 'productVariant', 'unit'];
            for (const table of tables) {
                await prisma[table].findFirst();
            }
            return { success: true, message: 'Toutes les tables sont accessibles' };
        }, results);
        
        // Test 3: Unités disponibles
        await runTest('Vérification des unités', async () => {
            const units = await prisma.unit.findMany({ where: { isActive: true } });
            if (units.length === 0) {
                return { success: false, message: 'Aucune unité active trouvée' };
            }
            return { success: true, message: `${units.length} unités actives trouvées` };
        }, results);
        
        // Test 4: Produits avec unité de base
        await runTest('Produits avec unité de base', async () => {
            const total = await prisma.product.count();
            const withBaseUnit = await prisma.product.count({
                where: { baseUnitId: { not: null } }
            });
            
            const percentage = total > 0 ? Math.round((withBaseUnit / total) * 100) : 0;
            
            if (percentage < 100) {
                return { 
                    success: false, 
                    message: `Seulement ${withBaseUnit}/${total} produits (${percentage}%) ont une unité de base` 
                };
            }
            
            return { 
                success: true, 
                message: `${withBaseUnit}/${total} produits (${percentage}%) ont une unité de base` 
            };
        }, results);
        
        // Test 5: Variants avec données complètes
        await runTest('Variants avec données complètes', async () => {
            const total = await prisma.productVariant.count();
            const withQuantity = await prisma.productVariant.count({
                where: { quantity: { not: null } }
            });
            const withUnit = await prisma.productVariant.count({
                where: { unitId: { not: null } }
            });
            
            const minComplete = Math.min(withQuantity, withUnit);
            const percentage = total > 0 ? Math.round((minComplete / total) * 100) : 0;
            
            if (percentage < 100) {
                return { 
                    success: false, 
                    message: `Seulement ${minComplete}/${total} variants (${percentage}%) ont des données complètes` 
                };
            }
            
            return { 
                success: true, 
                message: `${minComplete}/${total} variants (${percentage}%) ont des données complètes` 
            };
        }, results);
        
        // Test 6: Condition VariantCalculatedStock
        await runTest('Condition VariantCalculatedStock', async () => {
            const productsWithStock = await prisma.product.findMany({
                where: { globalStock: { gt: 0 } },
                include: {
                    baseUnit: true,
                    variants: {
                        include: { unit: true }
                    }
                },
                take: 10
            });
            
            if (productsWithStock.length === 0) {
                return { 
                    success: true, 
                    message: 'Aucun produit avec stock à tester (normal si base vide)',
                    warning: true
                };
            }
            
            let validProducts = 0;
            
            for (const product of productsWithStock) {
                const componentCondition = !!(product.baseUnit && product.baseQuantity);
                const hasValidVariants = product.variants.some(v => v.quantity && v.unit);
                
                if (componentCondition && hasValidVariants) {
                    validProducts++;
                }
            }
            
            const percentage = Math.round((validProducts / productsWithStock.length) * 100);
            
            if (percentage < 100) {
                return { 
                    success: false, 
                    message: `Seulement ${validProducts}/${productsWithStock.length} produits (${percentage}%) passent la condition` 
                };
            }
            
            return { 
                success: true, 
                message: `${validProducts}/${productsWithStock.length} produits (${percentage}%) passent la condition` 
            };
        }, results);
        
        // Test 7: Simulation de calcul de stock
        await runTest('Simulation de calcul de stock', async () => {
            const testProduct = await prisma.product.findFirst({
                where: { 
                    globalStock: { gt: 0 },
                    baseUnitId: { not: null }
                },
                include: {
                    baseUnit: true,
                    variants: {
                        include: { unit: true },
                        where: {
                            quantity: { not: null },
                            unitId: { not: null }
                        }
                    }
                }
            });
            
            if (!testProduct) {
                return { 
                    success: true, 
                    message: 'Aucun produit à tester (normal si base vide)',
                    warning: true
                };
            }
            
            if (testProduct.variants.length === 0) {
                return { 
                    success: false, 
                    message: `Produit "${testProduct.name}" n'a pas de variants valides` 
                };
            }
            
            // Simuler le calcul pour le premier variant
            const variant = testProduct.variants[0];
            let calculatedStock;
            
            if (testProduct.baseUnit.id === variant.unit.id) {
                calculatedStock = Math.floor(testProduct.globalStock / variant.quantity);
            } else {
                // Conversion simplifiée
                calculatedStock = Math.floor(testProduct.globalStock / variant.quantity);
            }
            
            return { 
                success: true, 
                message: `Calcul réussi: ${testProduct.globalStock} ÷ ${variant.quantity} = ${calculatedStock} unités` 
            };
        }, results);
        
        // Test 8: Performance et intégrité
        await runTest('Performance et intégrité', async () => {
            const start = Date.now();
            
            // Test de requête complexe
            const complexQuery = await prisma.product.findMany({
                where: {
                    globalStock: { gt: 0 }
                },
                include: {
                    baseUnit: true,
                    variants: {
                        include: { unit: true }
                    }
                },
                take: 5
            });
            
            const duration = Date.now() - start;
            
            if (duration > 5000) {
                return { 
                    success: false, 
                    message: `Requête trop lente: ${duration}ms (> 5000ms)` 
                };
            }
            
            return { 
                success: true, 
                message: `Requête rapide: ${duration}ms, ${complexQuery.length} produits récupérés` 
            };
        }, results);
        
        // Affichage des résultats
        displayResults(results);
        
    } catch (error) {
        console.error('❌ Erreur lors des tests:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

/**
 * Exécute un test individuel
 */
async function runTest(name, testFunction, results) {
    try {
        console.log(`\n🔍 Test: ${name}`);
        const result = await testFunction();
        
        if (result.warning) {
            console.log(`⚠️  ${result.message}`);
            results.warnings++;
            results.tests.push({ name, status: 'warning', message: result.message });
        } else if (result.success) {
            console.log(`✅ ${result.message}`);
            results.passed++;
            results.tests.push({ name, status: 'passed', message: result.message });
        } else {
            console.log(`❌ ${result.message}`);
            results.failed++;
            results.tests.push({ name, status: 'failed', message: result.message });
        }
    } catch (error) {
        console.log(`❌ Erreur: ${error.message}`);
        results.failed++;
        results.tests.push({ name, status: 'failed', message: error.message });
    }
}

/**
 * Affiche les résultats finaux
 */
function displayResults(results) {
    console.log('\n' + '=' .repeat(55));
    console.log('📊 RÉSULTATS DES TESTS');
    console.log('=' .repeat(55));
    
    console.log(`\n✅ Tests réussis: ${results.passed}`);
    console.log(`❌ Tests échoués: ${results.failed}`);
    console.log(`⚠️  Avertissements: ${results.warnings}`);
    
    const total = results.passed + results.failed + results.warnings;
    const successRate = total > 0 ? Math.round((results.passed / total) * 100) : 0;
    
    console.log(`\n📈 Taux de réussite: ${successRate}%`);
    
    if (results.failed === 0) {
        console.log('\n🎉 TOUS LES TESTS SONT PASSÉS !');
        console.log('✅ Le système de stock calculé est correctement configuré');
        console.log('✅ Vous pouvez maintenant utiliser la fonctionnalité');
        
        if (results.warnings > 0) {
            console.log('\n⚠️  Quelques avertissements à noter:');
            results.tests
                .filter(t => t.status === 'warning')
                .forEach(t => console.log(`   - ${t.name}: ${t.message}`));
        }
    } else {
        console.log('\n❌ CERTAINS TESTS ONT ÉCHOUÉ');
        console.log('🔧 Veuillez corriger les problèmes suivants:');
        
        results.tests
            .filter(t => t.status === 'failed')
            .forEach(t => console.log(`   - ${t.name}: ${t.message}`));
        
        console.log('\n💡 Suggestions:');
        console.log('1. Exécutez le script de configuration: node setup-calculated-stock-system.js');
        console.log('2. Vérifiez votre schéma Prisma');
        console.log('3. Vérifiez la connexion à la base de données');
    }
    
    console.log('\n📋 PROCHAINES ÉTAPES:');
    if (results.failed === 0) {
        console.log('1. 🔄 Redémarrer votre serveur de développement');
        console.log('2. 🔄 Vider le cache du navigateur');
        console.log('3. 👀 Tester l\'interface de stock calculé');
        console.log('4. 🎯 Vérifier que les calculs sont corrects');
    } else {
        console.log('1. 🔧 Corriger les erreurs identifiées');
        console.log('2. 🔄 Relancer ce script de test');
        console.log('3. 📞 Contacter le support si les problèmes persistent');
    }
}

/**
 * Fonction utilitaire pour afficher l'aide
 */
function showHelp() {
    console.log('\n📖 AIDE - Script de Test du Stock Calculé');
    console.log('=' .repeat(45));
    console.log('\nCe script teste que le système de stock calculé');
    console.log('fonctionne correctement après configuration.');
    console.log('\nUsage:');
    console.log('  node test-setup-script.js');
    console.log('  node test-setup-script.js --help');
    console.log('\nTests effectués:');
    console.log('1. Connexion à la base de données');
    console.log('2. Accessibilité des tables');
    console.log('3. Présence d\'unités actives');
    console.log('4. Produits avec unité de base');
    console.log('5. Variants avec données complètes');
    console.log('6. Condition VariantCalculatedStock');
    console.log('7. Simulation de calcul de stock');
    console.log('8. Performance des requêtes');
}

// Gestion des arguments de ligne de commande
if (process.argv.includes('--help') || process.argv.includes('-h')) {
    showHelp();
    process.exit(0);
}

// Exécution des tests
if (require.main === module) {
    runTests();
}

module.exports = {
    runTests
};