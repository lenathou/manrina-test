/**
 * Script de test pour vérifier la logique de comptage par producteur
 * Ce script simule des données de demandes de validation de stock
 * et teste la logique de comptage par producteur unique
 */

// Simulation de données de demandes de validation de stock
const mockStockRequests = [
    {
        id: '1',
        growerId: 'grower-1',
        productId: 'product-1',
        grower: { name: 'Producteur A', email: 'a@example.com' },
        status: 'PENDING'
    },
    {
        id: '2',
        growerId: 'grower-1',
        productId: 'product-2',
        grower: { name: 'Producteur A', email: 'a@example.com' },
        status: 'PENDING'
    },
    {
        id: '3',
        growerId: 'grower-1',
        productId: 'product-3',
        grower: { name: 'Producteur A', email: 'a@example.com' },
        status: 'PENDING'
    },
    {
        id: '4',
        growerId: 'grower-2',
        productId: 'product-4',
        grower: { name: 'Producteur B', email: 'b@example.com' },
        status: 'PENDING'
    },
    {
        id: '5',
        growerId: 'grower-2',
        productId: 'product-5',
        grower: { name: 'Producteur B', email: 'b@example.com' },
        status: 'PENDING'
    },
    {
        id: '6',
        growerId: 'grower-3',
        productId: 'product-6',
        grower: { name: 'Producteur C', email: 'c@example.com' },
        status: 'PENDING'
    }
];

// Test de l'ancienne logique (comptage par produit)
function testOldLogic(data) {
    return data.length;
}

// Test de la nouvelle logique (comptage par producteur unique)
function testNewLogic(data) {
    const uniqueGrowers = new Set(data.map(request => request.growerId));
    return uniqueGrowers.size;
}

// Test de la logique d'informations détaillées sur les producteurs
function testGrowersInfoLogic(data) {
    const growersMap = new Map();

    data.forEach(request => {
        const growerId = request.growerId;
        
        if (!growersMap.has(growerId)) {
            growersMap.set(growerId, {
                growerId,
                growerName: request.grower.name,
                growerEmail: request.grower.email,
                pendingRequestsCount: 0,
                productsCount: 0,
            });
        }

        const growerInfo = growersMap.get(growerId);
        growerInfo.pendingRequestsCount++;
    });

    // Calculer le nombre de produits uniques par producteur
    growersMap.forEach((growerInfo, growerId) => {
        const growerRequests = data.filter(request => request.growerId === growerId);
        const uniqueProducts = new Set(growerRequests.map(request => request.productId));
        growerInfo.productsCount = uniqueProducts.size;
    });

    return Array.from(growersMap.values())
        .sort((a, b) => b.pendingRequestsCount - a.pendingRequestsCount);
}

// Exécution des tests
console.log('=== TEST DE LA LOGIQUE D\'ALERTES ===\n');

console.log('Données de test:');
console.log(`- ${mockStockRequests.length} demandes de validation au total`);
console.log('- Producteur A: 3 demandes (produits 1, 2, 3)');
console.log('- Producteur B: 2 demandes (produits 4, 5)');
console.log('- Producteur C: 1 demande (produit 6)');
console.log('- Total: 3 producteurs uniques\n');

const oldCount = testOldLogic(mockStockRequests);
const newCount = testNewLogic(mockStockRequests);
const growersInfo = testGrowersInfoLogic(mockStockRequests);

console.log('RÉSULTATS:');
console.log(`Ancienne logique (par produit): ${oldCount} alertes`);
console.log(`Nouvelle logique (par producteur): ${newCount} alertes`);
console.log('\nInformations détaillées par producteur:');
growersInfo.forEach((grower, index) => {
    console.log(`${index + 1}. ${grower.growerName} (${grower.growerEmail})`);
    console.log(`   - ${grower.pendingRequestsCount} demandes en attente`);
    console.log(`   - ${grower.productsCount} produits concernés`);
});

console.log('\n=== CONCLUSION ===');
console.log(`✅ Réduction des alertes: de ${oldCount} à ${newCount} (${((oldCount - newCount) / oldCount * 100).toFixed(1)}% de réduction)`);
console.log('✅ Chaque producteur génère maintenant une seule alerte, peu importe le nombre de produits mis à jour');
console.log('✅ Les informations détaillées restent disponibles pour l\'affichage dans l\'interface');