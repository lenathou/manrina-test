import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding des profils utilisateurs...');
  
  // Seed des clients
  await seedCustomers();
  
  // Seed des producteurs
  await seedGrowers();
  
  // Seed des livreurs
  await seedDeliverers();
  
  console.log('✅ Seeding des profils terminé !');
}

async function seedCustomers() {
  console.log('👥 Création des clients...');
  
  const hashedPassword = await bcrypt.hash('client123', 10);
  
  const customers = [
    {
      email: 'client1@manrina.com',
      name: 'Marie Dupont',
      phone: '+596696123456',
      password: hashedPassword,
    },
    {
      email: 'client2@manrina.com', 
      name: 'Jean Martin',
      phone: '+596696789012',
      password: hashedPassword,
    },
    {
      email: 'client3@manrina.com',
      name: 'Sophie Leblanc',
      phone: '+596696345678',
      password: hashedPassword,
    },
  ];

  for (const customer of customers) {
    await prisma.customer.upsert({
      where: { email: customer.email },
      update: {},
      create: customer,
    });
    console.log(`  ✓ Client créé: ${customer.name} (${customer.email})`);
  }
}

async function seedGrowers() {
  console.log('🌱 Création des producteurs...');
  
  const hashedPassword = await bcrypt.hash('producteur123', 10);
  
  const growers = [
    {
      name: 'Ferme Bio Martinique',
      profilePhoto: '/images/grower1.jpg',
      email: 'producteur1@manrina.com',
      password: hashedPassword,
    },
    {
      name: 'Jardin Tropical des Antilles',
      profilePhoto: '/images/grower2.jpg', 
      email: 'producteur2@manrina.com',
      password: hashedPassword,
    },
    {
      name: 'Exploitation Familiale Caraïbe',
      profilePhoto: '/images/grower3.jpg',
      email: 'producteur3@manrina.com',
      password: hashedPassword,
    },
  ];

  for (const grower of growers) {
    await prisma.grower.upsert({
      where: { email: grower.email },
      update: {},
      create: grower,
    });
    console.log(`  ✓ Producteur créé: ${grower.name} (${grower.email})`);
  }
}

async function seedDeliverers() {
  console.log('🚚 Création des livreurs...');
  
  const hashedPassword = await bcrypt.hash('livreur123', 10);
  
  const deliverers = [
    {
      name: 'Pierre Livreur',
      email: 'livreur1@manrina.com',
      password: hashedPassword,
      phone: '+596696111222',
      vehicle: 'Camionnette',
      zone: 'Fort-de-France',
      isActive: true,
    },
    {
      name: 'Sophie Transport',
      email: 'livreur2@manrina.com',
      password: hashedPassword,
      phone: '+596696333444',
      vehicle: 'Scooter',
      zone: 'Lamentin',
      isActive: true,
    },
    {
      name: 'Marc Delivery',
      email: 'livreur3@manrina.com',
      password: hashedPassword,
      phone: '+596696555666',
      vehicle: 'Vélo électrique',
      zone: 'Schœlcher',
      isActive: true,
    },
  ];

  for (const deliverer of deliverers) {
    await prisma.deliverer.upsert({
      where: { email: deliverer.email },
      update: {},
      create: deliverer,
    });
    console.log(`  ✓ Livreur créé: ${deliverer.name} (${deliverer.email})`);
  }
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });