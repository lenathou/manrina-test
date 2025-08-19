const fetch = require('node-fetch');

// Configuration
const BASE_URL = 'http://localhost:3059';
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
};

// Fonction pour extraire les cookies de la réponse
function extractCookies(response) {
    const setCookieHeader = response.headers.get('set-cookie');
    if (!setCookieHeader) return '';
    
    // Extraire le token admin
    const adminTokenMatch = setCookieHeader.match(/adminToken=([^;]+)/);
    return adminTokenMatch ? `adminToken=${adminTokenMatch[1]}` : '';
}

// Fonction pour se connecter en tant qu'admin
async function loginAsAdmin() {
    console.log('🔐 Connexion en tant qu\'admin...');
    
    try {
        const response = await fetch(`${BASE_URL}/api/adminLogin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                params: [ADMIN_CREDENTIALS]
            })
        });
        
        const result = await response.json();
        console.log('Résultat login:', result);
        console.log('Status:', response.status);
        
        if (response.ok && result.data?.success) {
            const cookies = extractCookies(response);
            console.log('✅ Connexion admin réussie');
            console.log('Cookies:', cookies);
            return cookies;
        } else {
            console.log('❌ Échec de la connexion admin');
            return null;
        }
    } catch (error) {
        console.error('Erreur lors de la connexion admin:', error.message);
        return null;
    }
}

// Fonction pour tester l'abonnement aux notifications
async function testSubscription() {
    console.log('\n1. Test de l\'abonnement aux notifications push...');
    
    // Créer une souscription de test
    const testSubscription = {
        endpoint: 'https://fcm.googleapis.com/fcm/send/test-endpoint-123',
        keys: {
            p256dh: 'test-p256dh-key-123',
            auth: 'test-auth-key-123'
        }
    };
    
    try {
        const response = await fetch(`${BASE_URL}/api/subscribeUser`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testSubscription)
        });
        
        const result = await response.json();
        console.log('✅ Résultat abonnement:', result);
        console.log('Status:', response.status);
        
        return response.ok;
    } catch (error) {
        console.error('❌ Erreur lors de l\'abonnement:', error.message);
        return false;
    }
}

// Fonction pour tester l'envoi direct de notification
async function testDirectNotification() {
    console.log('\n2. Test d\'envoi direct de notification push...');
    
    try {
        const response = await fetch(`${BASE_URL}/api/sendNotification`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: 'Test de notification depuis le script de test'
            })
        });
        
        const result = await response.json();
        console.log('Résultat notification:', result);
        console.log('Status:', response.status);
        
        return response.ok;
    } catch (error) {
        console.error('❌ Erreur lors de l\'envoi de notification:', error.message);
        return false;
    }
}

// Fonction pour tester la création de notification avec authentification
async function testCreateNotificationWithAuth(adminCookies) {
    console.log('\n3. Test de création de notification avec authentification admin...');
    
    const notificationData = {
        title: 'Test Notification Admin',
        message: 'Ceci est un test de notification créée avec authentification admin',
        type: 'MARKET_CANCELLATION',
        targetUsers: ['ALL']
    };
    
    try {
        const response = await fetch(`${BASE_URL}/api/notifications`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': adminCookies
            },
            body: JSON.stringify(notificationData)
        });
        
        const result = await response.json();
        console.log('✅ Résultat création notification:', result);
        console.log('Status:', response.status);
        
        return response.ok;
    } catch (error) {
        console.error('❌ Erreur lors de la création de notification:', error.message);
        return false;
    }
}

// Fonction pour tester la récupération des notifications
async function testGetNotifications(adminCookies) {
    console.log('\n4. Test de récupération des notifications...');
    
    try {
        const response = await fetch(`${BASE_URL}/api/notifications`, {
            method: 'GET',
            headers: {
                'Cookie': adminCookies
            }
        });
        
        const result = await response.json();
        console.log('✅ Notifications récupérées:', result);
        console.log('Status:', response.status);
        
        return response.ok;
    } catch (error) {
        console.error('❌ Erreur lors de la récupération des notifications:', error.message);
        return false;
    }
}

// Fonction pour tester l'annulation de marché avec notifications
async function testMarketCancellationWithNotifications(adminCookies) {
    console.log('\n5. Test d\'annulation de marché avec notifications...');
    
    // Simuler l'annulation d'un marché
    const cancellationData = {
        marketId: 'test-market-123',
        reason: 'Test d\'annulation depuis le script de test',
        notifyUsers: true
    };
    
    try {
        // D'abord, essayer d'envoyer une notification d'annulation
        const notificationResponse = await fetch(`${BASE_URL}/api/sendNotification`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': adminCookies
            },
            body: JSON.stringify({
                message: `Marché ${cancellationData.marketId} annulé: ${cancellationData.reason}`
            })
        });
        
        const notificationResult = await notificationResponse.json();
        console.log('Résultat notification d\'annulation:', notificationResult);
        console.log('Status:', notificationResponse.status);
        
        return notificationResponse.ok;
    } catch (error) {
        console.error('❌ Erreur lors du test d\'annulation de marché:', error.message);
        return false;
    }
}

// Fonction principale
async function runTests() {
    console.log('🚀 Démarrage des tests de notifications avec authentification\n');
    
    // 1. Se connecter en tant qu'admin
    const adminCookies = await loginAsAdmin();
    if (!adminCookies) {
        console.log('❌ Impossible de continuer sans authentification admin');
        return;
    }
    
    // 2. Tester l'abonnement
    const subscriptionSuccess = await testSubscription();
    
    // 3. Tester l'envoi direct de notification
    const directNotificationSuccess = await testDirectNotification();
    
    // 4. Tester la création de notification avec auth
    const createNotificationSuccess = await testCreateNotificationWithAuth(adminCookies);
    
    // 5. Tester la récupération des notifications
    const getNotificationsSuccess = await testGetNotifications(adminCookies);
    
    // 6. Tester l'annulation de marché avec notifications
    const marketCancellationSuccess = await testMarketCancellationWithNotifications(adminCookies);
    
    // Résumé des tests
    console.log('\n📊 Résumé des tests:');
    console.log(`✅ Connexion admin: ${adminCookies ? 'SUCCÈS' : 'ÉCHEC'}`);
    console.log(`${subscriptionSuccess ? '✅' : '❌'} Abonnement: ${subscriptionSuccess ? 'SUCCÈS' : 'ÉCHEC'}`);
    console.log(`${directNotificationSuccess ? '✅' : '❌'} Notification directe: ${directNotificationSuccess ? 'SUCCÈS' : 'ÉCHEC'}`);
    console.log(`${createNotificationSuccess ? '✅' : '❌'} Création notification: ${createNotificationSuccess ? 'SUCCÈS' : 'ÉCHEC'}`);
    console.log(`${getNotificationsSuccess ? '✅' : '❌'} Récupération notifications: ${getNotificationsSuccess ? 'SUCCÈS' : 'ÉCHEC'}`);
    console.log(`${marketCancellationSuccess ? '✅' : '❌'} Annulation marché: ${marketCancellationSuccess ? 'SUCCÈS' : 'ÉCHEC'}`);
    
    console.log('\n🔍 Vérifiez les logs du serveur pour plus de détails sur les erreurs.');
}

// Exécuter les tests
runTests().catch(console.error);