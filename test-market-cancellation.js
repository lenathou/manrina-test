const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3059';

async function testNotificationSystem() {
    console.log('🧪 Diagnostic du système de notifications');
    console.log('=' .repeat(50));

    try {
        // Test 1: Vérifier l'état du NotificationManager
        console.log('\n1. Test de l\'état du NotificationManager...');
        
        // Créer une subscription de test
        const testSubscription = {
            endpoint: 'https://fcm.googleapis.com/fcm/send/test-endpoint-' + Date.now(),
            keys: {
                p256dh: 'BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlUls0VJXg7A8YlKtxiHiWhHXmVrow0XgzZSrUcHs',
                auth: 'tBHItJI5svbpez7KI4CCXg'
            }
        };

        // Test d'abonnement
        console.log('Tentative d\'abonnement avec subscription de test...');
        const subscribeResponse = await fetch(`${BASE_URL}/api/subscribeUser`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testSubscription)
        });
        
        const subscribeResult = await subscribeResponse.json();
        console.log('✅ Résultat abonnement:', subscribeResult);
        console.log('Status:', subscribeResponse.status);

        // Attendre un peu pour que l'abonnement soit traité
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Test 2: Envoi direct de notification push (maintenant que nous avons une subscription)
        console.log('\n2. Test d\'envoi direct de notification push...');
        const notificationResponse = await fetch(`${BASE_URL}/api/sendNotification`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: 'Test de notification après abonnement'
            })
        });
        
        const notificationResult = await notificationResponse.json();
        console.log('Résultat notification:', notificationResult);
        console.log('Status:', notificationResponse.status);

        // Test 3: Vérifier les logs du serveur pour plus de détails
        console.log('\n3. Vérifiez les logs du serveur pour plus de détails sur les erreurs.');
        
        // Test 4: Test avec authentification admin pour les notifications
        console.log('\n4. Test de création de notification (nécessite authentification)...');
        console.log('⚠️  Ce test échouera car nous n\'avons pas de token d\'authentification.');
        console.log('Pour tester complètement, vous devez vous connecter en tant qu\'admin d\'abord.');

    } catch (error) {
        console.error('❌ Erreur lors du test:', error.message);
    }
}

testNotificationSystem();