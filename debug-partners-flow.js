// Script de débogage pour tester le flux des partenaires
// Exécuter avec: node debug-partners-flow.js

// Utiliser fetch natif de Node.js (disponible depuis Node 18+)

const BASE_URL = 'http://localhost:3059';

async function testPartnersFlow() {
  console.log('🔍 Test du flux complet des partenaires\n');
  
  try {
    // 1. Récupérer les partenaires disponibles
    console.log('1. Récupération des partenaires disponibles...');
    const partnersResponse = await fetch(`${BASE_URL}/api/admin/partners`);
    const partners = await partnersResponse.json();
    console.log('✅ Partenaires récupérés:', partners.length, 'partenaires');
    console.log('   Premiers partenaires:', partners.slice(0, 2).map(p => ({ id: p.id, name: p.name })));
    
    if (partners.length === 0) {
      console.log('❌ Aucun partenaire trouvé. Créons-en un pour le test.');
      
      // Créer un partenaire de test
      const createPartnerResponse = await fetch(`${BASE_URL}/api/admin/partners`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Partenaire Test Debug',
          description: 'Partenaire créé pour le débogage'
        })
      });
      
      if (createPartnerResponse.ok) {
        const newPartner = await createPartnerResponse.json();
        console.log('✅ Partenaire de test créé:', newPartner);
        partners.push(newPartner);
      } else {
        console.log('❌ Erreur lors de la création du partenaire de test');
        return;
      }
    }
    
    // 2. Créer une session avec des partenaires
    console.log('\n2. Création d\'une session avec partenaires...');
    const sessionData = {
      name: `Session Test Debug ${Date.now()}`,
      date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Demain
      status: 'UPCOMING',
      description: 'Session créée pour tester le flux des partenaires',
      location: 'Lieu de test',
      startTime: '10:00',
      endTime: '18:00',
      partnerIds: [partners[0].id] // Utiliser le premier partenaire
    };
    
    const createSessionResponse = await fetch(`${BASE_URL}/api/market/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sessionData)
    });
    
    if (!createSessionResponse.ok) {
      const error = await createSessionResponse.text();
      console.log('❌ Erreur lors de la création de session:', error);
      return;
    }
    
    const createdSession = await createSessionResponse.json();
    console.log('✅ Session créée avec ID:', createdSession.id);
    console.log('   Partenaires envoyés:', sessionData.partnerIds);
    
    // 3. Récupérer la session créée pour vérifier les partenaires
    console.log('\n3. Récupération de la session créée...');
    const getSessionsResponse = await fetch(`${BASE_URL}/api/market/sessions`);
    const sessions = await getSessionsResponse.json();
    
    const testSession = sessions.find(s => s.id === createdSession.id);
    if (testSession) {
      console.log('✅ Session récupérée:', testSession.name);
      console.log('   Partenaires dans la session:', testSession.partners?.length || 0);
      
      if (testSession.partners && testSession.partners.length > 0) {
        console.log('   Détails des partenaires:');
        testSession.partners.forEach((sp, index) => {
          console.log(`     ${index + 1}. ID: ${sp.partner.id}, Nom: ${sp.partner.name}`);
        });
      } else {
        console.log('❌ PROBLÈME: Aucun partenaire trouvé dans la session récupérée!');
        console.log('   Structure de la session:', JSON.stringify(testSession, null, 2));
      }
    } else {
      console.log('❌ Session non trouvée dans la liste');
    }
    
    // 4. Test de modification de session
    console.log('\n4. Test de modification de session...');
    const updateData = {
      id: createdSession.id,
      name: testSession.name + ' (Modifiée)',
      date: testSession.date,
      status: testSession.status,
      description: testSession.description,
      location: testSession.location,
      startTime: '14:00',
      endTime: '20:00',
      partnerIds: [] // Supprimer tous les partenaires
    };
    
    const updateSessionResponse = await fetch(`${BASE_URL}/api/market/sessions`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });
    
    if (updateSessionResponse.ok) {
      console.log('✅ Session modifiée avec succès');
      console.log('   Nouveaux partenaires envoyés:', updateData.partnerIds);
      
      // Récupérer à nouveau pour vérifier
      const getUpdatedSessionsResponse = await fetch(`${BASE_URL}/api/market/sessions`);
      const updatedSessions = await getUpdatedSessionsResponse.json();
      const updatedSession = updatedSessions.find(s => s.id === createdSession.id);
      
      if (updatedSession) {
        console.log('   Partenaires après modification:', updatedSession.partners?.length || 0);
        if (updatedSession.partners && updatedSession.partners.length > 0) {
          updatedSession.partners.forEach((sp, index) => {
            console.log(`     ${index + 1}. ID: ${sp.partner.id}, Nom: ${sp.partner.name}`);
          });
        }
      }
    } else {
      const error = await updateSessionResponse.text();
      console.log('❌ Erreur lors de la modification:', error);
    }
    
    // 5. Nettoyage - Supprimer la session de test
    console.log('\n5. Nettoyage...');
    const deleteResponse = await fetch(`${BASE_URL}/api/market/sessions`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: createdSession.id })
    });
    
    if (deleteResponse.ok) {
      console.log('✅ Session de test supprimée');
    }
    
  } catch (error) {
    console.error('❌ Erreur durant le test:', error.message);
  }
}

// Vérifier que le serveur est démarré
async function checkServer() {
  try {
    const response = await fetch(`${BASE_URL}/api/admin/partners`);
    return response.status === 200 || response.status === 404; // 404 est OK, cela signifie que le serveur répond
  } catch {
    return false;
  }
}

async function main() {
  console.log('Vérification du serveur...');
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.log('❌ Le serveur ne semble pas démarré sur', BASE_URL);
    console.log('   Veuillez démarrer le serveur avec: pnpm dev');
    return;
  }
  
  console.log('✅ Serveur détecté\n');
  await testPartnersFlow();
}

main().catch(console.error);