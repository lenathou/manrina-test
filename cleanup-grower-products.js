const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupGrowerProducts() {
  console.log('Début du nettoyage des données GrowerProduct...');
  
  // Récupérer tous les enregistrements GrowerProduct
  const allGrowerProducts = await prisma.growerProduct.findMany({
    orderBy: [
      { growerId: 'asc' },
      { productId: 'asc' },
      { createdAt: 'desc' } // Garder le plus récent
    ]
  });
  
  console.log(`Trouvé ${allGrowerProducts.length} enregistrements GrowerProduct`);
  
  // Grouper par growerId + productId
  const grouped = {};
  const toDelete = [];
  
  for (const growerProduct of allGrowerProducts) {
    const key = `${growerProduct.growerId}_${growerProduct.productId}`;
    
    if (!grouped[key]) {
      grouped[key] = growerProduct; // Garder le premier (plus récent)
    } else {
      toDelete.push(growerProduct.id); // Marquer les autres pour suppression
    }
  }
  
  console.log(`${toDelete.length} doublons trouvés à supprimer`);
  
  if (toDelete.length > 0) {
    // Supprimer les doublons
    const deleteResult = await prisma.growerProduct.deleteMany({
      where: {
        id: {
          in: toDelete
        }
      }
    });
    
    console.log(`${deleteResult.count} enregistrements supprimés`);
  }
  
  console.log('Nettoyage terminé!');
}

cleanupGrowerProducts()
  .catch((e) => {
    console.error('Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });