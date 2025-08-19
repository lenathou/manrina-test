const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3059';

// Fonction pour extraire les cookies de la réponse
function extractCookies(response) {
    const setCookieHeader = response.headers.get('set-cookie');
    if (!setCookieHeader) return '';
    
    // Extraire le token admin
    const adminTokenMatch = setCookieHeader.match(/adminToken=([^;]+)/);
    return adminTokenMatch ? `adminToken=${adminTokenMatch[1]}` : '';
}

// Fonction pour tester la connexion admin
async function testAdminLogin() {
    console.log('🔐 Test de connexion admin...');
    
    try {
        const response = await fetch(`${BASE_URL}/api/adminLogin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                params: [{
                    username: 'admin',
                    password: 'admin123'
                }]
            })
        });
        
        const result = await response.json();
        
        if (response.ok && result.data?.success) {
            console.log('✅ Connexion admin réussie');
            // Extraire les cookies de la réponse
            const cookies = extractCookies(response);
            return cookies;
        } else {
            console.log('❌ Échec de la connexion admin:', result);
            return null;
        }
    } catch (error) {
        console.error('❌ Erreur lors de la connexion admin:', error.message);
        return null;
    }
}

// Fonction pour tester l'abonnement aux notifications push
async function testPushSubscription() {
    console.log('\n📱 Test d\'abonnement aux notifications push...');
    
    const testSubscription = {
        endpoint: 'https://fcm.googleapis.com/fcm/send/test-endpoint-final-' + Date.now(),
        keys: {
            p256dh: 'test-p256dh-key-final',
            auth: 'test-auth-key-final'
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
        
        if (response.ok) {
            console.log('✅ Abonnement push réussi:', result);
            return true;
        } else {
            console.log('❌ Échec de l\'abonnement push:', result);
            return false;
        }
    } catch (error) {
        console.error('❌ Erreur lors de l\'abonnement push:', error.message);
        return false;
    }
}

// Fonction pour tester l'envoi direct de notification
async function testDirectNotification() {
    console.log('\n🔔 Test d\'envoi direct de notification...');
    
    try {
        const response = await fetch(`${BASE_URL}/api/sendNotification`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: 'Test final de notification push - Système fonctionnel !'
            })
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            console.log('✅ Envoi direct de notification réussi:', result);
            return true;
        } else {
            console.log('❌ Échec de l\'envoi direct:', result);
            return false;
        }
    } catch (error) {
        console.error('❌ Erreur lors de l\'envoi direct:', error.message);
        return false;
    }
}

// Fonction pour tester la création de notification avec authentification
async function testCreateNotification(adminCookies) {
    console.log('\n📝 Test de création de notification avec authentification...');
    
    const notificationData = {
        title: 'Test Final - Notification Admin',
        message: 'Ceci est un test final du système de notifications avec authentification admin',
        type: 'GENERAL_ANNOUNCEMENT',
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
        
        if (response.ok) {
            console.log('✅ Création de notification réussie:', result.id);
            return true;
        } else {
            console.log('❌ Échec de la création de notification:', result);
            return false;
        }
    } catch (error) {
        console.error('❌ Erreur lors de la création de notification:', error.message);
        return false;
    }
}

// Fonction pour tester la récupération des notifications
async function testGetNotifications(adminCookies) {
    console.log('\n📋 Test de récupération des notifications...');
    
    try {
        const response = await fetch(`${BASE_URL}/api/notifications`, {
            method: 'GET',
            headers: {
                'Cookie': adminCookies
            }
        });
        
        const notifications = await response.json();
        
        if (response.ok && Array.isArray(notifications)) {
            console.log(`✅ Récupération réussie: ${notifications.length} notification(s) trouvée(s)`);
            return true;
        } else {
            console.log('❌ Échec de la récupération:', notifications);
            return false;
        }
    } catch (error) {
        console.error('❌ Erreur lors de la récupération:', error.message);
        return false;
    }
}

// Fonction pour tester l'annulation de marché avec notifications
async function testMarketCancellation() {
    console.log('\n🚫 Test d\'annulation de marché avec notifications...');
    
    try {
        const response = await fetch(`${BASE_URL}/api/sendNotification`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: 'Test final - Marché annulé pour maintenance système'
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            console.log('✅ Notification d\'annulation envoyée:', result);
            return true;
        } else {
            console.log('❌ Échec de l\'annulation:', result);
            return false;
        }
    } catch (error) {
        console.error('❌ Erreur lors de l\'annulation:', error.message);
        return false;
    }
}

// Fonction principale de test
async function runFinalTests() {
    console.log('🧪 TEST FINAL DU SYSTÈME DE NOTIFICATIONS');
    console.log('=' .repeat(60));
    
    const results = {
        adminLogin: false,
        pushSubscription: false,
        directNotification: false,
        createNotification: false,
        getNotifications: false,
        marketCancellation: false
    };
    
    try {
        // 1. Test de connexion admin
        const adminCookies = await testAdminLogin();
        results.adminLogin = !!adminCookies;
        
        if (!adminCookies) {
            console.log('\n❌ Impossible de continuer sans authentification admin');
            return;
        }
        
        // 2. Test d'abonnement push
        results.pushSubscription = await testPushSubscription();
        
        // Attendre un peu pour que l'abonnement soit traité
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 3. Test d'envoi direct
        results.directNotification = await testDirectNotification();
        
        // 4. Test de création de notification
        results.createNotification = await testCreateNotification(adminCookies);
        
        // 5. Test de récupération
        results.getNotifications = await testGetNotifications(adminCookies);
        
        // 6. Test d'annulation de marché
        results.marketCancellation = await testMarketCancellation();
        
    } catch (error) {
        console.error('❌ Erreur générale lors des tests:', error.message);
    }
    
    // Affichage du résumé final
    console.log('\n' + '=' .repeat(60));
    console.log('📊 RÉSUMÉ FINAL DES TESTS');
    console.log('=' .repeat(60));
    
    const testNames = {
        adminLogin: 'Connexion Admin',
        pushSubscription: 'Abonnement Push',
        directNotification: 'Notification Directe',
        createNotification: 'Création Notification',
        getNotifications: 'Récupération Notifications',
        marketCancellation: 'Annulation Marché'
    };
    
    let successCount = 0;
    let totalTests = Object.keys(results).length;
    
    for (const [key, success] of Object.entries(results)) {
        const status = success ? '✅ SUCCÈS' : '❌ ÉCHEC';
        console.log(`${status} - ${testNames[key]}`);
        if (success) successCount++;
    }
    
    console.log('\n' + '-'.repeat(60));
    console.log(`🎯 RÉSULTAT GLOBAL: ${successCount}/${totalTests} tests réussis`);
    
    if (successCount === totalTests) {
        console.log('🎉 TOUS LES TESTS SONT PASSÉS ! Le système de notifications fonctionne parfaitement.');
    } else if (successCount >= totalTests * 0.8) {
        console.log('⚠️  La plupart des tests sont passés. Quelques ajustements mineurs peuvent être nécessaires.');
    } else {
        console.log('🔧 Plusieurs tests ont échoué. Le système nécessite des corrections.');
    }
    
    console.log('\n💡 Pour plus de détails, vérifiez les logs du serveur de développement.');
}

// Exécuter les tests
runFinalTests();