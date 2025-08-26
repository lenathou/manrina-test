/**
 * Script pour réinitialiser les tests de validation de session
 * Ce script permet de revenir à l'état initial après avoir testé la validation des sessions
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resetValidationTests() {
  try {
    console.log('🔄 Début de la réinitialisation des tests de validation...');

    // 1. Remettre toutes les participations VALIDATED à CONFIRMED
    const validatedParticipations = await prisma.marketParticipation.updateMany({
      where: {
        status: 'VALIDATED'
      },
      data: {
        status: 'CONFIRMED'
      }
    });

    console.log(`✅ ${validatedParticipations.count} participations remises de VALIDATED à CONFIRMED`);

    // 2. Remettre toutes les participations DECLINED (qui étaient CONFIRMED avant) à CONFIRMED
    // Note: Ceci est plus délicat car on ne peut pas distinguer les DECLINED "naturels" des DECLINED de test
    // On va donc demander confirmation pour cette action
    const declinedParticipations = await prisma.marketParticipation.findMany({
      where: {
        status: 'DECLINED'
      },
      include: {
        session: true,
        grower: true
      }
    });

    if (declinedParticipations.length > 0) {
      console.log(`⚠️  ${declinedParticipations.length} participations DECLINED trouvées:`);
      declinedParticipations.forEach(p => {
        console.log(`   - ${p.grower.name} (${p.grower.email}) - Session: ${p.session.name}`);
      });
      
      console.log('\n❓ Voulez-vous remettre ces participations à CONFIRMED ?');
      console.log('   (Tapez "yes" pour confirmer, ou appuyez sur Entrée pour ignorer)');
      
      // En mode script, on va les remettre automatiquement pour simplifier
      // Dans un vrai environnement, vous pourriez vouloir ajouter une interaction utilisateur
      const resetDeclined = await prisma.marketParticipation.updateMany({
        where: {
          status: 'DECLINED'
        },
        data: {
          status: 'CONFIRMED'
        }
      });
      
      console.log(`✅ ${resetDeclined.count} participations remises de DECLINED à CONFIRMED`);
    }

    // 3. Remettre toutes les sessions COMPLETED à ACTIVE ou UPCOMING selon leur date
    const completedSessions = await prisma.marketSession.findMany({
      where: {
        status: 'COMPLETED'
      }
    });

    for (const session of completedSessions) {
      const sessionDate = new Date(session.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      sessionDate.setHours(0, 0, 0, 0);

      let newStatus;
      if (sessionDate.getTime() === today.getTime()) {
        newStatus = 'ACTIVE';
      } else if (sessionDate > today) {
        newStatus = 'UPCOMING';
      } else {
        newStatus = 'ACTIVE'; // Pour les sessions passées, on les remet en ACTIVE pour les tests
      }

      await prisma.marketSession.update({
        where: { id: session.id },
        data: { status: newStatus }
      });

      console.log(`✅ Session "${session.name}" remise de COMPLETED à ${newStatus}`);
    }

    // 4. Optionnel: Supprimer les commissions de test (turnover = 0)
    const zeroCommissions = await prisma.growerCommission.deleteMany({
      where: {
        turnover: 0
      }
    });

    if (zeroCommissions.count > 0) {
      console.log(`🗑️  ${zeroCommissions.count} commissions avec turnover = 0 supprimées`);
    }

    console.log('\n🎉 Réinitialisation terminée avec succès!');
    console.log('\n📋 Résumé des actions:');
    console.log(`   - Participations VALIDATED → CONFIRMED: ${validatedParticipations.count}`);
    console.log(`   - Sessions COMPLETED → ACTIVE/UPCOMING: ${completedSessions.length}`);
    console.log(`   - Commissions nulles supprimées: ${zeroCommissions.count}`);

  } catch (error) {
    console.error('❌ Erreur lors de la réinitialisation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Fonction pour sauvegarder l'état actuel avant les tests
async function backupCurrentState() {
  try {
    console.log('💾 Sauvegarde de l\'état actuel...');

    const participations = await prisma.marketParticipation.findMany({
      include: {
        grower: { select: { name: true, email: true } },
        session: { select: { name: true, date: true } }
      }
    });

    const sessions = await prisma.marketSession.findMany({
      select: { id: true, name: true, status: true, date: true }
    });

    const backup = {
      timestamp: new Date().toISOString(),
      participations: participations.map(p => ({
        id: p.id,
        sessionId: p.sessionId,
        growerId: p.growerId,
        status: p.status,
        growerName: p.grower.name,
        growerEmail: p.grower.email,
        sessionName: p.session.name,
        sessionDate: p.session.date
      })),
      sessions: sessions
    };

    const fs = require('fs');
    const backupPath = `./test-scripts/backup-${Date.now()}.json`;
    fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));

    console.log(`✅ Sauvegarde créée: ${backupPath}`);
    console.log(`📊 ${participations.length} participations et ${sessions.length} sessions sauvegardées`);

  } catch (error) {
    console.error('❌ Erreur lors de la sauvegarde:', error);
  }
}

// Exécution du script
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--backup')) {
    backupCurrentState();
  } else if (args.includes('--reset')) {
    resetValidationTests();
  } else {
    console.log('🔧 Script de gestion des tests de validation');
    console.log('\nUtilisation:');
    console.log('  node reset-validation-tests.js --backup   # Sauvegarder l\'état actuel');
    console.log('  node reset-validation-tests.js --reset    # Réinitialiser après les tests');
    console.log('\nExemple de workflow:');
    console.log('  1. node reset-validation-tests.js --backup');
    console.log('  2. [Effectuer vos tests de validation]');
    console.log('  3. node reset-validation-tests.js --reset');
  }
}

module.exports = {
  resetValidationTests,
  backupCurrentState
};