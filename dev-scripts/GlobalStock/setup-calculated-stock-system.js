/**
 * Script de Configuration du Système de Stock Calculé
 * 
 * Ce script configure automatiquement une base de données existante
 * pour que le système de "stock calculé" fonctionne correctement.
 * 
 * Prérequis :
 * - Base de données avec le schéma Prisma identique
 * - Node.js et Prisma installés
 * - Variables d'environnement configurées (DATABASE_URL)
 * 
 * Usage :
 * node setup-calculated-stock-system.js
 * 
 * @author Assistant IA
 * @version 1.0
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Configuration par défaut
const CONFIG = {
    // Unité par défaut si aucune unité n'existe
    DEFAULT_UNIT: {
        name: 'Gramme',
        symbol: 'g',
        category: 'WEIGHT',
        conversionFactor: 1,
        isActive: true
    },
    // Quantité par défaut pour les variants
    DEFAULT_VARIANT_QUANTITY: 1,
    // Quantité de base par défaut pour les produits
    DEFAULT_BASE_QUANTITY: 1,
    // Limite pour les opérations en lot
    BATCH_SIZE: 100
};

/**
 * Fonction principale d'installation
 */
async function setupCalculatedStockSystem() {
    console.log('🚀 Configuration du Système de Stock Calculé');
    console.log('=' .repeat(50));
    
    try {
        // Étape 1: Vérification de l'environnement
        await checkEnvironment();
        
        // Étape 2: Création/vérification des unités de base
        const defaultUnit = await ensureDefaultUnits();
        
        // Étape 3: Configuration des produits
        await configureProducts(defaultUnit);
        
        // Étape 4: Configuration des variants
        await configureVariants(defaultUnit);
        
        // Étape 5: Vérification finale
        await finalVerification();
        
        console.log('\n✅ Configuration terminée avec succès !');
        console.log('\n📋 Prochaines étapes :');
        console.log('1. Redémarrer votre serveur de développement');
        console.log('2. Vider le cache du navigateur');
        console.log('3. Vérifier que la colonne "Stock calculé" s\'affiche');
        
    } catch (error) {
        console.error('❌ Erreur lors de la configuration:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

/**
 * Vérification de l'environnement et des prérequis
 */
async function checkEnvironment() {
    console.log('\n🔍 Vérification de l\'environnement...');
    
    try {
        // Test de connexion à la base de données
        await prisma.$connect();
        console.log('✅ Connexion à la base de données réussie');
        
        // Vérification des tables essentielles
        const tables = ['Product', 'ProductVariant', 'Unit'];
        for (const table of tables) {
            try {
                await prisma[table.toLowerCase()].findFirst();
                console.log(`✅ Table ${table} accessible`);
            } catch (error) {
                throw new Error(`Table ${table} non accessible: ${error.message}`);
            }
        }
        
    } catch (error) {
        throw new Error(`Erreur de connexion: ${error.message}`);
    }
}

/**
 * Création ou vérification des unités par défaut
 */
async function ensureDefaultUnits() {
    console.log('\n🏗️  Configuration des unités...');
    
    // Vérifier si des unités existent déjà
    const existingUnits = await prisma.unit.findMany();
    console.log(`📊 ${existingUnits.length} unités existantes trouvées`);
    
    let defaultUnit;
    
    if (existingUnits.length === 0) {
        // Créer l'unité par défaut
        console.log('🔧 Création de l\'unité par défaut...');
        defaultUnit = await prisma.unit.create({
            data: CONFIG.DEFAULT_UNIT
        });
        console.log(`✅ Unité créée: ${defaultUnit.name} (${defaultUnit.symbol})`);
    } else {
        // Utiliser la première unité active
        defaultUnit = existingUnits.find(unit => unit.isActive) || existingUnits[0];
        console.log(`✅ Unité par défaut sélectionnée: ${defaultUnit.name} (${defaultUnit.symbol})`);
    }
    
    return defaultUnit;
}

/**
 * Configuration des produits (ajout d'unité de base si manquante)
 */
async function configureProducts(defaultUnit) {
    console.log('\n🛍️  Configuration des produits...');
    
    // Compter les produits sans unité de base
    const productsWithoutBaseUnit = await prisma.product.count({
        where: {
            baseUnitId: null
        }
    });
    
    console.log(`📊 ${productsWithoutBaseUnit} produits sans unité de base`);
    
    if (productsWithoutBaseUnit > 0) {
        console.log('🔧 Attribution de l\'unité de base aux produits...');
        
        // Mettre à jour par lots pour éviter les timeouts
        let updated = 0;
        const batchSize = CONFIG.BATCH_SIZE;
        
        while (updated < productsWithoutBaseUnit) {
            const result = await prisma.product.updateMany({
                where: {
                    baseUnitId: null
                },
                data: {
                    baseUnitId: defaultUnit.id,
                    baseQuantity: CONFIG.DEFAULT_BASE_QUANTITY
                },
                // Prisma ne supporte pas LIMIT dans updateMany, on fait par petits lots
            });
            
            updated += result.count;
            console.log(`  ✅ ${updated}/${productsWithoutBaseUnit} produits mis à jour`);
            
            // Si aucune mise à jour, on sort de la boucle
            if (result.count === 0) break;
        }
    }
    
    // Vérification finale
    const totalProducts = await prisma.product.count();
    const productsWithBaseUnit = await prisma.product.count({
        where: {
            baseUnitId: {
                not: null
            }
        }
    });
    
    console.log(`✅ ${productsWithBaseUnit}/${totalProducts} produits ont une unité de base`);
}

/**
 * Configuration des variants (ajout de quantity et unitId si manquants)
 */
async function configureVariants(defaultUnit) {
    console.log('\n🎯 Configuration des variants...');
    
    // Compter les variants avec des problèmes
    const variantsWithIssues = await prisma.productVariant.count({
        where: {
            OR: [
                { quantity: null },
                { unitId: null }
            ]
        }
    });
    
    console.log(`📊 ${variantsWithIssues} variants avec des données manquantes`);
    
    if (variantsWithIssues > 0) {
        console.log('🔧 Correction des variants...');
        
        // Récupérer les variants problématiques avec leurs produits
        const variants = await prisma.productVariant.findMany({
            where: {
                OR: [
                    { quantity: null },
                    { unitId: null }
                ]
            },
            include: {
                product: true
            }
        });
        
        let fixed = 0;
        
        for (const variant of variants) {
            const updates = {};
            
            // Fixer la quantité si manquante
            if (variant.quantity === null) {
                updates.quantity = variant.product.baseQuantity || CONFIG.DEFAULT_VARIANT_QUANTITY;
            }
            
            // Fixer l'unité si manquante
            if (variant.unitId === null) {
                updates.unitId = variant.product.baseUnitId || defaultUnit.id;
            }
            
            // Appliquer les corrections
            if (Object.keys(updates).length > 0) {
                await prisma.productVariant.update({
                    where: { id: variant.id },
                    data: updates
                });
                fixed++;
                
                if (fixed % 50 === 0) {
                    console.log(`  ✅ ${fixed}/${variants.length} variants corrigés`);
                }
            }
        }
        
        console.log(`✅ ${fixed} variants corrigés au total`);
    }
}

/**
 * Vérification finale du système
 */
async function finalVerification() {
    console.log('\n🔍 Vérification finale...');
    
    // Statistiques globales
    const stats = {
        totalProducts: await prisma.product.count(),
        productsWithBaseUnit: await prisma.product.count({
            where: { baseUnitId: { not: null } }
        }),
        totalVariants: await prisma.productVariant.count(),
        variantsWithQuantity: await prisma.productVariant.count({
            where: { quantity: { not: null } }
        }),
        variantsWithUnit: await prisma.productVariant.count({
            where: { unitId: { not: null } }
        }),
        productsWithStock: await prisma.product.count({
            where: { globalStock: { gt: 0 } }
        })
    };
    
    console.log('\n📊 STATISTIQUES FINALES:');
    console.log(`Produits avec unité de base: ${stats.productsWithBaseUnit}/${stats.totalProducts} (${Math.round(stats.productsWithBaseUnit/stats.totalProducts*100)}%)`);
    console.log(`Variants avec quantité: ${stats.variantsWithQuantity}/${stats.totalVariants} (${Math.round(stats.variantsWithQuantity/stats.totalVariants*100)}%)`);
    console.log(`Variants avec unité: ${stats.variantsWithUnit}/${stats.totalVariants} (${Math.round(stats.variantsWithUnit/stats.totalVariants*100)}%)`);
    console.log(`Produits avec stock > 0: ${stats.productsWithStock}`);
    
    // Test sur quelques produits avec stock
    if (stats.productsWithStock > 0) {
        console.log('\n🧪 Test sur des produits avec stock...');
        
        const testProducts = await prisma.product.findMany({
            where: {
                globalStock: { gt: 0 }
            },
            include: {
                baseUnit: true,
                variants: {
                    include: {
                        unit: true
                    }
                }
            },
            take: 3
        });
        
        let successfulTests = 0;
        
        for (const product of testProducts) {
            const canCalculateStock = !!(product.baseUnit && product.baseQuantity) &&
                product.variants.some(v => v.quantity && v.unit);
            
            if (canCalculateStock) {
                successfulTests++;
                console.log(`✅ ${product.name}: Peut calculer le stock`);
            } else {
                console.log(`❌ ${product.name}: Ne peut pas calculer le stock`);
            }
        }
        
        console.log(`\n🎯 ${successfulTests}/${testProducts.length} produits testés peuvent afficher leur stock calculé`);
    }
    
    // Vérification de l'intégrité
    const allProductsHaveBaseUnit = stats.productsWithBaseUnit === stats.totalProducts;
    const allVariantsHaveData = stats.variantsWithQuantity === stats.totalVariants && 
                               stats.variantsWithUnit === stats.totalVariants;
    
    if (allProductsHaveBaseUnit && allVariantsHaveData) {
        console.log('\n🎉 CONFIGURATION PARFAITE !');
        console.log('✅ Tous les produits ont une unité de base');
        console.log('✅ Tous les variants ont des données complètes');
        console.log('✅ Le système de stock calculé devrait fonctionner parfaitement');
    } else {
        console.log('\n⚠️  CONFIGURATION PARTIELLE');
        if (!allProductsHaveBaseUnit) {
            console.log(`❌ ${stats.totalProducts - stats.productsWithBaseUnit} produits sans unité de base`);
        }
        if (!allVariantsHaveData) {
            console.log(`❌ Des variants ont encore des données manquantes`);
        }
    }
}

/**
 * Fonction utilitaire pour afficher l'aide
 */
function showHelp() {
    console.log('\n📖 AIDE - Script de Configuration du Stock Calculé');
    console.log('=' .repeat(50));
    console.log('\nCe script configure automatiquement votre base de données pour');
    console.log('que le système de "stock calculé" fonctionne correctement.');
    console.log('\nPrérequis:');
    console.log('- Base de données avec le schéma Prisma correct');
    console.log('- Variable DATABASE_URL configurée');
    console.log('- Node.js et Prisma installés');
    console.log('\nUsage:');
    console.log('  node setup-calculated-stock-system.js');
    console.log('  node setup-calculated-stock-system.js --help');
    console.log('\nLe script va:');
    console.log('1. Vérifier la connexion à la base de données');
    console.log('2. Créer une unité par défaut si nécessaire');
    console.log('3. Assigner une unité de base à tous les produits');
    console.log('4. Corriger les données manquantes des variants');
    console.log('5. Vérifier que tout fonctionne correctement');
}

// Gestion des arguments de ligne de commande
if (process.argv.includes('--help') || process.argv.includes('-h')) {
    showHelp();
    process.exit(0);
}

// Exécution du script principal
if (require.main === module) {
    setupCalculatedStockSystem();
}

module.exports = {
    setupCalculatedStockSystem,
    CONFIG
};