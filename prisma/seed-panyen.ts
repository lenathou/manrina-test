import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  console.log('🥬 Seeding des panyen...');
  
  // D'abord, s'assurer qu'il y a des produits de base
  await seedBaseProducts();
  
  // Ensuite, créer les panyen
  await seedPanyen();
  
  console.log('✅ Seeding des panyen terminé !');
}

async function seedBaseProducts() {
  console.log('📦 Création des produits de base...');
  
  const baseProducts = [
    {
      id: '2849c32d-9d22-4495-9450-5c805ea21659',
      name: 'Ananas',
      description: 'Ananas frais de Martinique',
      imageUrl: '/images/ananas.jpg',
      category: 'Fruits',
      variants: [
        {
          id: '7e50147d-214a-437e-97a6-70f076e3d855',
          optionSet: 'Unité',
          optionValue: 'Pièce',
          price: 6.00,
          stock: 50
        }
      ]
    },
    {
      id: 'banana-id-123',
      name: 'Bananes',
      description: 'Bananes douces de Martinique',
      imageUrl: '/images/bananes.jpg',
      category: 'Fruits',
      variants: [
        {
          id: 'banana-variant-123',
          optionSet: 'Poids',
          optionValue: 'Kg',
          price: 3.50,
          stock: 100
        }
      ]
    },
    {
      id: 'mango-id-123',
      name: 'Mangues',
      description: 'Mangues juteuses de Martinique',
      imageUrl: '/images/mangues.jpg',
      category: 'Fruits',
      variants: [
        {
          id: 'mango-variant-123',
          optionSet: 'Unité',
          optionValue: 'Pièce',
          price: 2.50,
          stock: 75
        }
      ]
    },
    {
      id: 'carrot-id-123',
      name: 'Carottes',
      description: 'Carottes fraîches locales',
      imageUrl: '/images/carottes.jpg',
      category: 'Légumes',
      variants: [
        {
          id: 'carrot-variant-123',
          optionSet: 'Poids',
          optionValue: 'Kg',
          price: 4.00,
          stock: 60
        }
      ]
    },
    {
      id: 'tomato-id-123',
      name: 'Tomates',
      description: 'Tomates cerises locales',
      imageUrl: '/images/tomates.jpg',
      category: 'Légumes',
      variants: [
        {
          id: 'tomato-variant-123',
          optionSet: 'Poids',
          optionValue: 'Kg',
          price: 5.50,
          stock: 40
        }
      ]
    },
    {
      id: 'lettuce-id-123',
      name: 'Salade',
      description: 'Salade verte fraîche',
      imageUrl: '/images/salade.jpg',
      category: 'Légumes',
      variants: [
        {
          id: 'lettuce-variant-123',
          optionSet: 'Unité',
          optionValue: 'Pièce',
          price: 2.00,
          stock: 30
        }
      ]
    }
  ];

  for (const product of baseProducts) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: {},
      create: {
        id: product.id,
        name: product.name,
        description: product.description,
        imageUrl: product.imageUrl,
        category: product.category,
        showInStore: true,
        variants: {
          create: product.variants.map(variant => ({
            id: variant.id,
            optionSet: variant.optionSet,
            optionValue: variant.optionValue,
            price: variant.price,
            stock: variant.stock
          }))
        }
      }
    });
    console.log(`  ✓ Produit créé: ${product.name}`);
  }
}

async function seedPanyen() {
  console.log('🥬 Création des panyen...');
  
  const panyenData = [
    {
      id: uuidv4(),
      name: 'Panier Fruits Tropicaux',
      description: 'Un assortiment de fruits tropicaux frais de Martinique',
      imageUrl: '/images/panier-fruits.jpg',
      price: 15.00,
      showInStore: true,
      components: [
        {
          productId: '2849c32d-9d22-4495-9450-5c805ea21659', // Ananas
          productVariantId: '7e50147d-214a-437e-97a6-70f076e3d855',
          quantity: 1
        },
        {
          productId: 'banana-id-123', // Bananes
          productVariantId: 'banana-variant-123',
          quantity: 1
        },
        {
          productId: 'mango-id-123', // Mangues
          productVariantId: 'mango-variant-123',
          quantity: 2
        }
      ]
    },
    {
      id: uuidv4(),
      name: 'Panier Légumes Frais',
      description: 'Sélection de légumes frais cultivés localement',
      imageUrl: '/images/panier-legumes.jpg',
      price: 12.00,
      showInStore: true,
      components: [
        {
          productId: 'carrot-id-123', // Carottes
          productVariantId: 'carrot-variant-123',
          quantity: 1
        },
        {
          productId: 'tomato-id-123', // Tomates
          productVariantId: 'tomato-variant-123',
          quantity: 1
        },
        {
          productId: 'lettuce-id-123', // Salade
          productVariantId: 'lettuce-variant-123',
          quantity: 2
        }
      ]
    },
    {
      id: uuidv4(),
      name: 'Panier Mixte Famille',
      description: 'Panier complet avec fruits et légumes pour toute la famille',
      imageUrl: '/images/panier-famille.jpg',
      price: 25.00,
      showInStore: true,
      components: [
        {
          productId: '2849c32d-9d22-4495-9450-5c805ea21659', // Ananas
          productVariantId: '7e50147d-214a-437e-97a6-70f076e3d855',
          quantity: 1
        },
        {
          productId: 'banana-id-123', // Bananes
          productVariantId: 'banana-variant-123',
          quantity: 1
        },
        {
          productId: 'carrot-id-123', // Carottes
          productVariantId: 'carrot-variant-123',
          quantity: 1
        },
        {
          productId: 'tomato-id-123', // Tomates
          productVariantId: 'tomato-variant-123',
          quantity: 1
        },
        {
          productId: 'lettuce-id-123', // Salade
          productVariantId: 'lettuce-variant-123',
          quantity: 1
        }
      ]
    },
    {
      id: uuidv4(),
      name: 'Panier Découverte',
      description: 'Panier pour découvrir nos meilleurs produits locaux',
      imageUrl: '/images/panier-decouverte.jpg',
      price: 18.00,
      showInStore: true,
      components: [
        {
          productId: 'mango-id-123', // Mangues
          productVariantId: 'mango-variant-123',
          quantity: 3
        },
        {
          productId: 'banana-id-123', // Bananes
          productVariantId: 'banana-variant-123',
          quantity: 1
        },
        {
          productId: 'lettuce-id-123', // Salade
          productVariantId: 'lettuce-variant-123',
          quantity: 1
        }
      ]
    }
  ];

  for (const panyen of panyenData) {
    const createdPanyen = await prisma.panyenProduct.upsert({
      where: { id: panyen.id },
      update: {},
      create: {
        id: panyen.id,
        name: panyen.name,
        description: panyen.description,
        imageUrl: panyen.imageUrl,
        price: panyen.price,
        showInStore: panyen.showInStore
      }
    });

    // Créer les composants du panyen
    for (const component of panyen.components) {
      await prisma.panyenComponent.upsert({
        where: {
          id: uuidv4() // Générer un nouvel ID pour chaque composant
        },
        update: {},
        create: {
          id: uuidv4(),
          panyenProductId: createdPanyen.id,
          productId: component.productId,
          productVariantId: component.productVariantId,
          quantity: component.quantity
        }
      });
    }

    console.log(`  ✓ Panyen créé: ${panyen.name} avec ${panyen.components.length} composants`);
  }
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding des panyen:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });