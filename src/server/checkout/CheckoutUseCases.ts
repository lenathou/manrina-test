import { CustomerRepository } from '@/server/customer/CustomerRepository';
import { ICheckoutCreatePayload } from '@/server/payment/CheckoutSession';
import { StockUseCases } from '@/server/stock/StockUseCases';
import { BasketSessionFilters, CheckoutRepository } from '@/server/checkout/CheckoutRepository';
import { Basket } from '@/server/checkout/IBasket';
import { CheckoutSession } from '@/server/checkout/ICheckout';
import { ProductUseCases } from '@/server/product/ProductUseCases';
import { DeliveryMethod, DeliveryMethodsData } from '@/types/DeliveryMethodsType';
import { BasketElement } from '@/types/BasketElement';
import { CheckoutSessionSuccessPayload } from '@/server/payment/CheckoutSessionSuccessPayload';
import { ICustomer } from '@/server/customer/ICustomer';
import commands from '@/mock/commands.json';

interface MockCommandItem {
    productId: string;
    productVariantId: string;
    quantity: number;
    name: string;
    price: number;
}

interface MockCommandDeliveryLocation {
    address: string;
    postalCode: string;
    city: string;
    phone?: string;
    name?: string;
}

interface MockCommandDeliveryMethod {
    id: string;
    name: string;
    basePrice: number;
    location: MockCommandDeliveryLocation;
}

interface MockCommand {
    customerId?: string;
    customerEmail: string;
    customerName: string;
    customerPhone?: string;
    items: MockCommandItem[];
    deliveryMethod?: MockCommandDeliveryMethod;
    dayChosen?: string;
    deliveryMessage?: string;
    paymentStatus?: string;
}

interface CommandDebugInfo {
    index: number;
    customerName: string;
    customerEmail: string;
    itemsCount: number;
    error: string | null;
    success: boolean;
}

interface TestingDebugInfo {
    totalCommands: number;
    deliveryMethods: DeliveryMethodsData | null;
    processedCommands: CommandDebugInfo[];
}

export class CheckoutUseCases {
    constructor(
        private checkoutRepository: CheckoutRepository,
        private stockUseCases: StockUseCases,
        private customerRepository: CustomerRepository,
        private productUseCases: ProductUseCases,
    ) {}

    public saveBasketSession = async (checkoutPayload: ICheckoutCreatePayload) => {
        const customer = await this.customerRepository.getMatchingCustomerOrCreate(checkoutPayload.contact);
        const basketToSave = Basket.fromCheckoutPayload(customer.id, checkoutPayload);
        const basketSaved = await this.checkoutRepository.createBasketSession(basketToSave);
        return {
            basket: basketSaved,
            customer,
        };
    };

    public getBasketSessions = async (filters?: BasketSessionFilters) => {
        return (await this.checkoutRepository.getBasketSessions(filters)).map((basket) => basket.toCommandToShow());
    };

    public getBasketSessionById = async (basketId: string) => {
        return await this.checkoutRepository.getBasketSessionById(basketId);
    };

    public createCheckoutSession = async (basket: Basket) => {
        const checkoutSessionToSave = CheckoutSession.newCheckoutSession(basket.id, basket.total);
        const checkoutSession = await this.checkoutRepository.saveCheckoutSession(checkoutSessionToSave);
        return checkoutSession;
    };

    public getCheckoutSessionById = this.checkoutRepository.getCheckoutSessionById;

    public handleSuccessfulPayment = async (checkoutSessionId: string, rawPayload: CheckoutSessionSuccessPayload) => {
        const checkoutSession = await this.checkoutRepository.getCheckoutSessionById(checkoutSessionId);

        if (!checkoutSession) {
            throw new Error('Checkout session not found');
        }

        await this.checkoutRepository.markCheckoutSessionAsPaid(checkoutSession.checkoutSession, rawPayload);

        await this.stockUseCases.updateStockAfterCheckout({
            checkoutSessionId,
            items: checkoutSession.basketSession.items.map((item) => ({
                variantId: item.productVariantId,
                quantity: item.quantity,
            })),
            reason: 'Checkout completed',
        });
    };

    public setDeliveryDate = async (basketId: string, deliveryDate: string) => {
        const basket = await this.checkoutRepository.getBasketById(basketId);
        basket.validateDeliveryStatus();
        return await this.checkoutRepository.setDeliveryDate(basketId, deliveryDate);
    };

    public updateBasketItemRefundStatus = async (basketItemId: string, refundStatus: 'refunded' | 'none') => {
        return await this.checkoutRepository.updateBasketItemRefundStatus(basketItemId, refundStatus);
    };

    public getBasketItemById = async (basketItemId: string) => {
        return await this.checkoutRepository.getBasketItemById(basketItemId);
    };

    public createCommandsFromTesting = async (): Promise<{
        message: string;
        commands: { basket: Basket; customer: ICustomer }[];
        errors: string[];
        debugInfo: TestingDebugInfo;
    }> => {
        const mockCommands = commands as MockCommand[];
        const errors: string[] = [];
        const debugInfo: TestingDebugInfo = {
            totalCommands: mockCommands.length,
            deliveryMethods: null,
            processedCommands: []
        };
        
        if (mockCommands.length === 0) {
            throw new Error('Aucune commande trouvée dans commands.json');
        }
    
        console.log(`🚀 Début du traitement de ${mockCommands.length} commandes de test`);
    
        // Récupérer les méthodes de livraison avec gestion d'erreur
        let defaultDeliveryMethod: DeliveryMethod;
        try {
            const deliveryMethods = await this.productUseCases.getDeliveryMethods();
            debugInfo.deliveryMethods = deliveryMethods;
            console.log('📦 Méthodes de livraison récupérées:', deliveryMethods);
            defaultDeliveryMethod = deliveryMethods.categories[0]?.methods[0];
            
            if (!defaultDeliveryMethod) {
                // Créer une méthode de livraison par défaut pour les tests
                defaultDeliveryMethod = {
                    id: 'test_delivery',
                    name: 'Livraison Test',
                    basePrice: 0,
                    location: {
                        address: 'Adresse Test',
                        postalCode: '97200',
                        city: 'Fort-de-France',
                        phone: '0596000000',
                        name: 'Point de livraison Test'
                    }
                };
                errors.push('Aucune méthode de livraison trouvée, utilisation d\'une méthode par défaut');
            }
        } catch (error) {
            const errorMsg = `Erreur lors de la récupération des méthodes de livraison: ${error instanceof Error ? error.message : String(error)}`;
            errors.push(errorMsg);
            console.error('❌', errorMsg);
            // Méthode de livraison de secours
            defaultDeliveryMethod = {
                id: 'fallback_delivery',
                name: 'Livraison Fallback',
                basePrice: 0,
                location: {
                    address: 'Adresse Fallback',
                    postalCode: '97200',
                    city: 'Fort-de-France',
                    phone: '0596000000',
                    name: 'Point de livraison Fallback'
                }
            };
        }
    
        const results = [];
        let successCount = 0;
        let errorCount = 0;
        
        // Traiter toutes les commandes
        const commandsToProcess = mockCommands;
        console.log(`🔍 Traitement de ${commandsToProcess.length} commandes`);
        
        for (const [index, commandData] of Array.from(commandsToProcess.entries())) {
            const commandDebug: CommandDebugInfo = {
                index: index + 1,
                customerName: commandData.customerName,
                customerEmail: commandData.customerEmail,
                itemsCount: commandData.items?.length || 0,
                error: null,
                success: false
            };
            
            try {
                console.log(`\n📝 [${index + 1}/${commandsToProcess.length}] Traitement de la commande pour ${commandData.customerName}`);
                
                // Vérifier que les données requises sont présentes
                if (!commandData.customerName || !commandData.customerEmail || !commandData.items) {
                    throw new Error(`Données manquantes: name=${!!commandData.customerName}, email=${!!commandData.customerEmail}, items=${!!commandData.items}`);
                }
                
                // Transformer les données de commande en format ICheckoutCreatePayload
                const checkoutPayload: ICheckoutCreatePayload = {
                    contact: {
                        name: commandData.customerName,
                        email: commandData.customerEmail,
                        phone: commandData.customerPhone || '0596000000',
                        comments: `Commande de test - ${commandData.customerName}`
                    },
                    dayChosen: commandData.dayChosen || new Date().toISOString().split('T')[0],
                    deliveryMethod: {
                        id: commandData.deliveryMethod?.id || 'default_delivery',
                        name: commandData.deliveryMethod?.name || 'Livraison par défaut',
                        basePrice: commandData.deliveryMethod?.basePrice || 0,
                        location: {
                            address: commandData.deliveryMethod?.location?.address || 'Adresse par défaut',
                            postalCode: commandData.deliveryMethod?.location?.postalCode || '97200',
                            city: commandData.deliveryMethod?.location?.city || 'Fort-de-France',
                            phone: commandData.deliveryMethod?.location?.phone || '0596000000',
                            name: commandData.deliveryMethod?.location?.name || 'Point de livraison'
                        }
                    },
                    items: commandData.items.map((item: MockCommandItem) => {
                        // Créer un nom de produit propre
                        const productName = item.name.includes(' ') 
                            ? item.name.split(' ').slice(0, -1).join(' ') 
                            : item.name;
                        const variantName = item.name.includes(' ') 
                            ? item.name.split(' ').slice(-1)[0] 
                            : 'Unité';
                        
                        return {
                            productVariant: {
                                id: item.productVariantId,
                                optionSet: 'Unité',
                                optionValue: variantName,
                                productId: item.productId,
                                description: item.name,
                                imageUrl: '/images/default-product.svg',
                                price: item.price,
                                stock: 100,
                                vatRate: null,
                                showDescriptionOnPrintDelivery: false,
                                unit: null,
                                unitId: null,
                                quantity: null
                            },
                            product: {
                                id: item.productId,
                                category: 'Produits Test',
                                name: productName,
                                description: `Produit ${productName} pour tests`,
                                imageUrl: '/images/default-product.svg',
                                showInStore: true,
                                variants: [],
                                globalStock: 100,
                                baseQuantity: 1
                            },
                            quantity: item.quantity,
                            name: item.name,
                            price: item.price
                        } as BasketElement;
                    }),
                    lastUpdated: new Date().toISOString(),
                    deliveryMessage: commandData.deliveryMessage || 'Commande de test'
                };
                
                console.log('🔄 Tentative de création de la session panier...');
                
                // Créer la commande via la logique existante
                const result = await this.saveBasketSession(checkoutPayload);
                results.push(result);
                successCount++;
                commandDebug.success = true;
                
                console.log(`✅ [${index + 1}] Commande créée avec succès pour ${commandData.customerName}`);
                
            } catch (error) {
                errorCount++;
                const errorMsg = `[${index + 1}] Erreur pour ${commandData.customerName}: ${error instanceof Error ? error.message : String(error)}`;
                errors.push(errorMsg);
                commandDebug.error = error instanceof Error ? error.message : String(error);
                console.error(`❌ ${errorMsg}`);
                if (error instanceof Error && error.stack) {
                    console.error('   📋 Stack trace:', error.stack);
                }
            }
            
            debugInfo.processedCommands.push(commandDebug);
        }
        
        const message = `${successCount} commandes de test créées à partir de commands.json (${errorCount} erreurs sur ${commandsToProcess.length} traitées)`;
        console.log(`\n🏁 Résultat final: ${message}`);
        
        return {
            message,
            commands: results,
            errors,
            debugInfo
        };
    };
}
