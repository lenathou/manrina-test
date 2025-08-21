const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function approveGrowerByEmail(email) {
  try {
    const grower = await prisma.grower.findUnique({
      where: { email }
    });

    if (!grower) {
      console.log(`Aucun producteur trouvé avec l'email: ${email}`);
      return;
    }

    console.log(`Producteur trouvé: ${grower.name} (${grower.email})`);
    console.log(`Statut actuel: ${grower.approved ? 'Approuvé' : 'En attente'}`);

    if (grower.approved) {
      console.log('Le producteur est déjà approuvé!');
      return;
    }

    const updatedGrower = await prisma.grower.update({
      where: { email },
      data: {
        approved: true,
        approvedAt: new Date()
      }
    });

    console.log(`✅ Producteur ${updatedGrower.name} approuvé avec succès!`);
    console.log(`Date d'approbation: ${updatedGrower.approvedAt}`);

  } catch (error) {
    console.error('Erreur lors de l\'approbation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Récupérer l'email depuis les arguments de ligne de commande
const email = process.argv[2];

if (!email) {
  console.log('Usage: node approve-grower.js <email>');
  console.log('Exemple: node approve-grower.js producteur@example.com');
  process.exit(1);
}

approveGrowerByEmail(email);