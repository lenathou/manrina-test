import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🔐 Seeding des profils administrateurs...');
  
  // Seed des administrateurs
  await seedAdmins();
  
  console.log('✅ Seeding des administrateurs terminé !');
}

async function seedAdmins() {
  console.log('👨‍💼 Création des administrateurs...');
  
  const hashedPassword = await bcrypt.hash('staging_test', 10);
  
  const admins = [
    {
      username: 'staging',
      password: hashedPassword,
    },
    {
      username: 'admin',
      password: await bcrypt.hash('admin123', 10),
    },
    {
      username: 'superadmin',
      password: await bcrypt.hash('superadmin456', 10),
    },
  ];

  for (const admin of admins) {
    await prisma.admin.upsert({
      where: { username: admin.username },
      update: {},
      create: admin,
    });
    console.log(`  ✓ Administrateur créé: ${admin.username}`);
  }
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding des administrateurs:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });