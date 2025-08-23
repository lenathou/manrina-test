const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('🔍 Vérification de la base de données...');
    
    // Vérifier les producteurs
    const growers = await prisma.grower.findMany();
    console.log(`📊 Producteurs trouvés: ${growers.length}`);
    if (growers.length > 0) {
      console.log(`🆔 Premier producteur ID: ${growers[0].id}`);
      console.log(`👤 Nom: ${growers[0].firstName} ${growers[0].lastName}`);
    }
    
    // Vérifier les sessions de marché
    const marketSessions = await prisma.marketSession.findMany();
    console.log(`📊 Sessions de marché trouvées: ${marketSessions.length}`);
    if (marketSessions.length > 0) {
      console.log(`🆔 Première session ID: ${marketSessions[0].id}`);
    }
    
    // Vérifier les produits de marché
    const marketProducts = await prisma.marketProduct.findMany();
    console.log(`📊 Produits de marché trouvés: ${marketProducts.length}`);
    
    // Vérifier les suggestions
    const marketSuggestions = await prisma.marketProductSuggestion.findMany();
    console.log(`📊 Suggestions de marché trouvées: ${marketSuggestions.length}`);
    
    const growerSuggestions = await prisma.growerProductSuggestion.findMany();
    console.log(`📊 Suggestions de producteur trouvées: ${growerSuggestions.length}`);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();