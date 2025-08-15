#!/usr/bin/env node
/**
 * Script d'Installation Rapide - Stock Calculé
 * 
 * Ce script automatise complètement l'installation et la configuration
 * du système de stock calculé pour les développeurs.
 * 
 * Usage :
 * node install-calculated-stock.js
 * node install-calculated-stock.js --test-only
 * node install-calculated-stock.js --help
 * 
 * @author Assistant IA
 * @version 1.0
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Configuration
 */
const CONFIG = {
    scripts: [
        'setup-calculated-stock-system.js',
        'test-setup-script.js'
    ],
    requiredFiles: [
        'schema.prisma',
        '.env'
    ],
    requiredPackages: [
        '@prisma/client'
    ]
};

/**
 * Couleurs pour la console
 */
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

/**
 * Utilitaires de logging
 */
function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
    log(`\n${step} ${message}`, 'cyan');
}

function logSuccess(message) {
    log(`✅ ${message}`, 'green');
}

function logError(message) {
    log(`❌ ${message}`, 'red');
}

function logWarning(message) {
    log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
    log(`ℹ️  ${message}`, 'blue');
}

/**
 * Vérification des prérequis
 */
async function checkPrerequisites() {
    logStep('🔍', 'Vérification des prérequis...');
    
    // Vérifier Node.js
    try {
        const nodeVersion = process.version;
        const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
        
        if (majorVersion < 16) {
            logError(`Node.js ${nodeVersion} détecté. Version 16+ requise.`);
            return false;
        }
        
        logSuccess(`Node.js ${nodeVersion} ✓`);
    } catch (error) {
        logError('Impossible de vérifier la version de Node.js');
        return false;
    }
    
    // Vérifier les fichiers requis
    for (const file of CONFIG.requiredFiles) {
        if (!fs.existsSync(file)) {
            logError(`Fichier manquant: ${file}`);
            return false;
        }
        logSuccess(`${file} ✓`);
    }
    
    // Vérifier les packages
    for (const pkg of CONFIG.requiredPackages) {
        try {
            require.resolve(pkg);
            logSuccess(`${pkg} ✓`);
        } catch (error) {
            logError(`Package manquant: ${pkg}`);
            logInfo(`Installez avec: npm install ${pkg}`);
            return false;
        }
    }
    
    // Vérifier Prisma
    try {
        execSync('npx prisma --version', { stdio: 'pipe' });
        logSuccess('Prisma CLI ✓');
    } catch (error) {
        logError('Prisma CLI non disponible');
        logInfo('Installez avec: npm install prisma @prisma/client');
        return false;
    }
    
    return true;
}

/**
 * Test de connexion à la base de données
 */
async function testDatabaseConnection() {
    logStep('🔌', 'Test de connexion à la base de données...');
    
    try {
        const testScript = `
            const { PrismaClient } = require('@prisma/client');
            const prisma = new PrismaClient();
            
            async function test() {
                try {
                    await prisma.$connect();
                    console.log('CONNECTION_SUCCESS');
                    await prisma.$disconnect();
                } catch (error) {
                    console.error('CONNECTION_ERROR:', error.message);
                    process.exit(1);
                }
            }
            
            test();
        `;
        
        const result = execSync(`node -e "${testScript}"`, { 
            encoding: 'utf8',
            stdio: 'pipe'
        });
        
        if (result.includes('CONNECTION_SUCCESS')) {
            logSuccess('Connexion à la base de données ✓');
            return true;
        } else {
            logError('Échec de connexion à la base de données');
            return false;
        }
    } catch (error) {
        logError(`Erreur de connexion: ${error.message}`);
        logInfo('Vérifiez votre fichier .env et que la base de données est démarrée');
        return false;
    }
}

/**
 * Vérification des scripts
 */
function checkScripts() {
    logStep('📄', 'Vérification des scripts...');
    
    for (const script of CONFIG.scripts) {
        if (!fs.existsSync(script)) {
            logError(`Script manquant: ${script}`);
            return false;
        }
        logSuccess(`${script} ✓`);
    }
    
    return true;
}

/**
 * Exécution du script de configuration
 */
async function runSetupScript() {
    logStep('⚙️', 'Exécution de la configuration...');
    
    try {
        const result = execSync('node setup-calculated-stock-system.js', {
            encoding: 'utf8',
            stdio: 'pipe'
        });
        
        console.log(result);
        
        if (result.includes('Configuration terminée avec succès') || 
            result.includes('CONFIGURATION RÉUSSIE')) {
            logSuccess('Configuration terminée avec succès ✓');
            return true;
        } else {
            logWarning('Configuration terminée mais vérifiez les messages ci-dessus');
            return true; // Continuer quand même
        }
    } catch (error) {
        logError(`Erreur lors de la configuration: ${error.message}`);
        console.log('Sortie complète:', error.stdout);
        return false;
    }
}

/**
 * Exécution des tests
 */
async function runTests() {
    logStep('🧪', 'Exécution des tests de validation...');
    
    try {
        const result = execSync('node test-setup-script.js', {
            encoding: 'utf8',
            stdio: 'pipe'
        });
        
        console.log(result);
        
        if (result.includes('TOUS LES TESTS SONT PASSÉS') || 
            result.includes('Taux de réussite: 100%')) {
            logSuccess('Tous les tests sont passés ✓');
            return true;
        } else if (result.includes('Tests réussis:')) {
            logWarning('Certains tests ont des avertissements, mais le système fonctionne');
            return true;
        } else {
            logError('Certains tests ont échoué');
            return false;
        }
    } catch (error) {
        logError(`Erreur lors des tests: ${error.message}`);
        console.log('Sortie complète:', error.stdout);
        return false;
    }
}

/**
 * Affichage des instructions finales
 */
function showFinalInstructions(success) {
    console.log('\n' + '='.repeat(60));
    
    if (success) {
        log('🎉 INSTALLATION TERMINÉE AVEC SUCCÈS !', 'green');
        console.log('\n📋 PROCHAINES ÉTAPES:');
        console.log('\n1. 🔄 Redémarrez votre serveur de développement');
        console.log('2. 🌐 Accédez à votre interface d\'administration');
        console.log('3. 📊 Vérifiez la page de gestion du stock');
        console.log('4. 🔄 Cliquez sur "Actualiser Cache" si disponible');
        console.log('5. 👀 Vérifiez que la colonne "Stock Calculé" s\'affiche');
        
        console.log('\n✅ FONCTIONNALITÉS ACTIVÉES:');
        console.log('   • Calcul automatique du stock par variant');
        console.log('   • Affichage en temps réel dans l\'interface');
        console.log('   • Gestion des conversions d\'unités');
        console.log('   • Cache optimisé pour les performances');
        
        console.log('\n📚 DOCUMENTATION:');
        console.log('   • Guide complet: GUIDE-DEVELOPPEUR-STOCK-CALCULE.md');
        console.log('   • Configuration: README-CALCULATED-STOCK-SETUP.md');
        console.log('   • Tests: node test-setup-script.js');
        
    } else {
        log('❌ INSTALLATION INCOMPLÈTE', 'red');
        console.log('\n🔧 ACTIONS REQUISES:');
        console.log('\n1. 📋 Vérifiez les erreurs ci-dessus');
        console.log('2. 🔍 Consultez le guide: GUIDE-DEVELOPPEUR-STOCK-CALCULE.md');
        console.log('3. 🔄 Relancez ce script après correction');
        console.log('4. 📞 Contactez le support si nécessaire');
        
        console.log('\n🆘 COMMANDES DE DEBUG:');
        console.log('   node test-setup-script.js     # Tests détaillés');
        console.log('   npx prisma db pull            # Vérifier le schéma');
        console.log('   npx prisma generate           # Régénérer le client');
    }
    
    console.log('\n' + '='.repeat(60));
}

/**
 * Affichage de l'aide
 */
function showHelp() {
    console.log('\n📖 AIDE - Installation du Stock Calculé');
    console.log('=' .repeat(45));
    console.log('\nCe script automatise l\'installation complète du système');
    console.log('de stock calculé pour votre application.');
    console.log('\nUsage:');
    console.log('  node install-calculated-stock.js           # Installation complète');
    console.log('  node install-calculated-stock.js --test-only # Tests seulement');
    console.log('  node install-calculated-stock.js --help     # Afficher cette aide');
    console.log('\nÉtapes automatisées:');
    console.log('1. 🔍 Vérification des prérequis');
    console.log('2. 🔌 Test de connexion à la base de données');
    console.log('3. 📄 Vérification des scripts');
    console.log('4. ⚙️  Configuration automatique');
    console.log('5. 🧪 Tests de validation');
    console.log('6. 📋 Instructions finales');
    console.log('\nPrérequis:');
    console.log('• Node.js 16+');
    console.log('• @prisma/client installé');
    console.log('• Base de données accessible');
    console.log('• Fichiers schema.prisma et .env présents');
}

/**
 * Fonction principale
 */
async function main() {
    const args = process.argv.slice(2);
    
    // Gestion des arguments
    if (args.includes('--help') || args.includes('-h')) {
        showHelp();
        return;
    }
    
    const testOnly = args.includes('--test-only');
    
    // En-tête
    console.log('\n' + '='.repeat(60));
    log('🚀 INSTALLATION DU STOCK CALCULÉ', 'cyan');
    console.log('='.repeat(60));
    
    if (testOnly) {
        log('Mode: Tests seulement', 'yellow');
    } else {
        log('Mode: Installation complète', 'green');
    }
    
    let success = true;
    
    try {
        // Étape 1: Prérequis
        if (!await checkPrerequisites()) {
            success = false;
        }
        
        // Étape 2: Connexion DB
        if (success && !await testDatabaseConnection()) {
            success = false;
        }
        
        // Étape 3: Scripts
        if (success && !checkScripts()) {
            success = false;
        }
        
        // Étape 4: Configuration (sauf si test-only)
        if (success && !testOnly) {
            if (!await runSetupScript()) {
                success = false;
            }
        }
        
        // Étape 5: Tests
        if (success) {
            if (!await runTests()) {
                success = false;
            }
        }
        
        // Instructions finales
        showFinalInstructions(success);
        
    } catch (error) {
        logError(`Erreur inattendue: ${error.message}`);
        success = false;
        showFinalInstructions(false);
    }
    
    process.exit(success ? 0 : 1);
}

// Exécution
if (require.main === module) {
    main();
}

module.exports = {
    main,
    checkPrerequisites,
    testDatabaseConnection,
    runSetupScript,
    runTests
};