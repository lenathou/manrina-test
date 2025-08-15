import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

interface ProductWithVariant {
    productId: string;
    variantId: string;
    name: string;
    price: number;
    quantity: number;
}

// Produits réels basés sur le fichier products.json
const PRODUCTS_FOR_ORDERS: ProductWithVariant[] = [
    // Commande 1 - Fruits
    {
        productId: "2849c32d-9d22-4495-9450-5c805ea21659", // Ananas
        variantId: "7e50147d-214a-437e-97a6-70f076e3d855", // Unité
        name: "Ananas Unité",
        price: 6.00,
        quantity: 2
    },
    {
        productId: "499b35ea-515b-45fa-9d3d-a773de33a822", // Abricot pays Bio
        variantId: "3ba10d10-f43f-448b-b5de-e6f04a0b28da",
        name: "Abricot pays Bio",
        price: 6.00,
        quantity: 1
    },
    {
        productId: "c4fc31cb-4edc-4c2b-af09-dcad9ef24c69", // Ananas bio
        variantId: "b0d4eea9-bb83-4f28-844a-b4c2d7dd9ac8",
        name: "Ananas bio",
        price: 6.00,
        quantity: 1
    },
    // Commande 2 - Légumes et autres
    {
        productId: "2849c32d-9d22-4495-9450-5c805ea21659", // Ananas (différente quantité)
        variantId: "7e50147d-214a-437e-97a6-70f076e3d855",
        name: "Ananas Unité",
        price: 6.00,
        quantity: 3
    },
    {
        productId: "499b35ea-515b-45fa-9d3d-a773de33a822", // Abricot pays Bio
        variantId: "3ba10d10-f43f-448b-b5de-e6f04a0b28da",
        name: "Abricot pays Bio",
        price: 6.00,
        quantity: 2
    },
    {
        productId: "c4fc31cb-4edc-4c2b-af09-dcad9ef24c69", // Ananas bio
        variantId: "b0d4eea9-bb83-4f28-844a-b4c2d7dd9ac8",
        name: "Ananas bio",
        price: 6.00,
        quantity: 1
    }
];

const CUSTOMER_EMAIL = "client1@manrina.com";

async function createPaidOrders() {
    try {
        console.log('🚀 Début de la création des commandes payées...');

        // 1. Vérifier/créer le client
        let customer = await prisma.customer.findUnique({
            where: { email: CUSTOMER_EMAIL }
        });

        if (!customer) {
            console.log(`📝 Création du client ${CUSTOMER_EMAIL}...`);
            customer = await prisma.customer.create({
                data: {
                    id: uuidv4(),
                    email: CUSTOMER_EMAIL,
                    name: "Client Test",
                    phone: "+596696123456",
                    password: "$2b$10$hashedpassword" // Mot de passe hashé fictif
                }
            });
        } else {
            console.log(`✅ Client ${CUSTOMER_EMAIL} trouvé.`);
        }

        // 2. Créer une adresse de livraison
        const address = await prisma.address.create({
            data: {
                id: uuidv4(),
                address: "123 Rue de la Martinique",
                city: "Fort-de-France",
                postalCode: "97200",
                country: "Martinique",
                name: "Domicile",
                type: "home",
                customerId: customer.id
            }
        });

        console.log(`📍 Adresse créée: ${address.address}`);

        // 3. Créer la première commande
        const order1Products = PRODUCTS_FOR_ORDERS.slice(0, 3);
        const order1Total = order1Products.reduce((sum, product) => sum + (product.price * product.quantity), 0);
        
        const basketSession1 = await prisma.basketSession.create({
            data: {
                id: uuidv4(),
                customerId: customer.id,
                addressId: address.id,
                deliveryCost: 5.0,
                deliveryDay: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Dans 2 jours
                total: order1Total + 5.0, // Total + frais de livraison
                paymentStatus: "paid",
                deliveryMessage: "Merci de sonner à l'interphone",
                items: {
                    create: order1Products.map(product => ({
                        id: uuidv4(),
                        quantity: product.quantity,
                        productVariantId: product.variantId,
                        productId: product.productId,
                        name: product.name,
                        price: product.price
                    }))
                }
            }
        });

        // 4. Créer une session de checkout pour la première commande
        const checkoutSession1 = await prisma.checkoutSession.create({
            data: {
                id: uuidv4(),
                basketSessionId: basketSession1.id,
                paymentStatus: "paid",
                paymentAmount: order1Total + 5.0,
                successPayload: {
                    status: "complete",
                    payment_intent: "pi_test_" + uuidv4(),
                    amount_total: (order1Total + 5.0) * 100 // En centimes
                }
            }
        });

        console.log(`✅ Commande 1 créée: #${basketSession1.orderIndex} - Total: ${order1Total + 5.0}€`);

        // 5. Créer la deuxième commande
        const order2Products = PRODUCTS_FOR_ORDERS.slice(3, 6);
        const order2Total = order2Products.reduce((sum, product) => sum + (product.price * product.quantity), 0);
        
        const basketSession2 = await prisma.basketSession.create({
            data: {
                id: uuidv4(),
                customerId: customer.id,
                addressId: address.id,
                deliveryCost: 5.0,
                deliveryDay: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Dans 3 jours
                total: order2Total + 5.0,
                paymentStatus: "paid",
                deliveryMessage: "Livraison en matinée de préférence",
                items: {
                    create: order2Products.map(product => ({
                        id: uuidv4(),
                        quantity: product.quantity,
                        productVariantId: product.variantId,
                        productId: product.productId,
                        name: product.name,
                        price: product.price
                    }))
                }
            }
        });

        // 6. Créer une session de checkout pour la deuxième commande
        const checkoutSession2 = await prisma.checkoutSession.create({
            data: {
                id: uuidv4(),
                basketSessionId: basketSession2.id,
                paymentStatus: "paid",
                paymentAmount: order2Total + 5.0,
                successPayload: {
                    status: "complete",
                    payment_intent: "pi_test_" + uuidv4(),
                    amount_total: (order2Total + 5.0) * 100
                }
            }
        });

        console.log(`✅ Commande 2 créée: #${basketSession2.orderIndex} - Total: ${order2Total + 5.0}€`);

        console.log('\n📊 Résumé des commandes créées:');
        console.log(`👤 Client: ${customer.email}`);
        console.log(`📦 Commande 1: #${basketSession1.orderIndex} - ${order1Products.length} produits - ${order1Total + 5.0}€`);
        console.log(`📦 Commande 2: #${basketSession2.orderIndex} - ${order2Products.length} produits - ${order2Total + 5.0}€`);
        console.log(`💰 Total des commandes: ${(order1Total + order2Total + 10.0)}€`);
        
        console.log('\n🎉 Seed terminé avec succès!');

    } catch (error) {
        console.error('❌ Erreur lors de la création des commandes:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Exécuter le script si appelé directement
if (require.main === module) {
    createPaidOrders()
        .then(() => {
            console.log('✅ Script terminé');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Erreur:', error);
            process.exit(1);
        });
}

export { createPaidOrders };