import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const initialAssignments = [
  {
    name: 'Fruits & Légumes Tropicaux',
    description: 'Bananes, mangues, ananas, christophines, ignames, patates douces',
    color: '#10b981'
  },
  {
    name: 'Viandes & Charcuteries',
    description: 'Porc, bœuf, agneau, volaille, charcuteries locales',
    color: '#ef4444'
  },
  {
    name: 'Épices & Condiments',
    description: 'Piment, curcuma, gingembre, cannelle, muscade, vanille',
    color: '#f59e0b'
  },
  {
    name: 'Poissons & Fruits de Mer',
    description: 'Poissons frais, langoustes, crabes, ouassous',
    color: '#3b82f6'
  },
  {
    name: 'Produits Transformés',
    description: 'Confitures, sirops, rhums arrangés, conserves',
    color: '#8b5cf6'
  },
  {
    name: 'Artisanat Local',
    description: 'Paniers, poteries, bijoux, textiles traditionnels',
    color: '#06b6d4'
  },
  {
    name: 'Fleurs & Plantes',
    description: 'Fleurs tropicales, plantes ornementales, herbes aromatiques',
    color: '#ec4899'
  },
  {
    name: 'Boulangerie Créole',
    description: 'Pain de mie, cassave, tourments d\'amour, doucelettes',
    color: '#f97316'
  }
];

async function seedAssignments() {
  console.log('🌱 Seeding assignments...');

  try {
    // Vérifier si des affectations existent déjà
    const existingAssignments = await prisma.assignment.count();
    
    if (existingAssignments > 0) {
      console.log('✅ Des affectations existent déjà, seed ignoré');
      return;
    }

    // Créer les affectations initiales
    for (const assignment of initialAssignments) {
      await prisma.assignment.create({
        data: assignment
      });
      console.log(`✅ Affectation créée: ${assignment.name}`);
    }

    console.log('🎉 Seed des affectations terminé avec succès!');
  } catch (error) {
    console.error('❌ Erreur lors du seed des affectations:', error);
    throw error;
  }
}

if (require.main === module) {
  seedAssignments()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export { seedAssignments };