const fetch = require('node-fetch');

async function importProducts() {
    try {
        console.log('🚀 Début de l\'importation des produits...');
        
        const response = await fetch('http://localhost:3059/api/admin/import-products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
        }

        const result = await response.json();
        console.log('✅ Importation réussie !');
        console.log('Résultat:', result);
        
    } catch (error) {
        console.error('❌ Erreur lors de l\'importation:', error.message);
        process.exit(1);
    }
}

importProducts();