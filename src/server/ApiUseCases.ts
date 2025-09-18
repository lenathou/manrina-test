import { INotificationManager } from '@/pwa/INotificationManager';
import { AdminUseCases } from '@/server/admin/AdminUseCases';
import { IAdminLoginPayload } from '@/server/admin/IAdmin';
import { CheckoutUseCases } from '@/server/checkout/CheckoutUseCases';
import { CustomerUseCases } from '@/server/customer/CustomerUseCases';
import { ICustomerLoginPayload, ICustomerCreateParams, ICustomerUpdateParams } from '@/server/customer/ICustomer';
import { DelivererUseCases } from '@/server/deliverer/DelivererUseCases';
import { IDelivererLoginPayload } from '@/server/deliverer/IDeliverer';
import { GrowerUseCases } from '@/server/grower/GrowerUseCases';
import { IGrowerLoginPayload } from '@/server/grower/IGrower';
import { ICheckoutCreatePayload } from '@/server/payment/CheckoutSession';
import { CheckoutSessionSuccessPayload } from '@/server/payment/CheckoutSessionSuccessPayload';
import { PaymentUseCases } from '@/server/payment/PaymentUseCases';
import { ProductUseCases } from '@/server/product/ProductUseCases';
import { BrevoEmailNotificationService } from '@/server/services/NotificationService/BrevoEmailNotificationService';
import { StockUseCases } from '@/server/stock/StockUseCases';
import { ReqInfos } from '@/service/BackendFetchService';
import { PrismaClient } from '@prisma/client';

import {
    IGrowerCreateParams,
    IGrowerProductSuggestionCreateParams,
    IGrowerUpdateParams,
    IMarketProductSuggestionCreateParams,
} from './grower/IGrowerRepository';
import { PanyenUseCases } from '@/server/panyen/PanyenUseCases';
import { IPanyenCreateInput, IPanyenUpdateInput } from '@/server/panyen/IPanyen';
import { MarketUseCases } from '@/server/market/MarketUseCases';
import {
    CreateMarketAnnouncementInput,
    UpdateMarketAnnouncementInput,
    MarketAnnouncementFilters,
} from '@/server/market/IMarketAnnouncement';
import { AssignmentUseCases } from '@/server/assignment/AssignmentUseCases';
import { IAssignmentCreateInput, IAssignmentUpdateInput, IAssignmentFilters } from '@/server/assignment/IAssignment';
import { GrowerPricingService } from '@/server/grower/GrowerPricingService';
import { GrowerStockService } from '@/server/grower/GrowerStockService';
import { ProductStockService } from '@/server/grower/ProductStockService';

export class ApiUseCases {
    // Dans le constructeur, ajouter :
    constructor(
        private paymentUseCases: PaymentUseCases,
        private productUseCases: ProductUseCases,
        private stockUseCases: StockUseCases,
        private checkoutUseCases: CheckoutUseCases,
        private notificationManager: INotificationManager,
        private adminUseCases: AdminUseCases,
        private growerUseCases: GrowerUseCases,
        private delivererUseCases: DelivererUseCases,
        private customerUseCases: CustomerUseCases,
        private panyenUseCases: PanyenUseCases,
        private marketUseCases: MarketUseCases,
        private assignmentUseCases: AssignmentUseCases,
        private growerPricingService: GrowerPricingService,
        private growerStockService: GrowerStockService,
        private productStockService: ProductStockService,
        private prisma: PrismaClient,
    ) {}

    // Admin methods
    public adminLogin = async (loginPayload: IAdminLoginPayload, { res }: ReqInfos) => {
        try {
            const jwt = await this.adminUseCases.login(loginPayload);
            res.setHeader('Set-Cookie', `adminToken=${jwt.jwt}; HttpOnly; Path=/; Max-Age=36000;`); // 10 hours
            return { success: true };
        } catch (error) {
            return { success: false, message: (error as Error).message };
        }
    };

    public adminLogout = ({ res }: ReqInfos) => {
        res.setHeader('Set-Cookie', 'adminToken=; HttpOnly; Path=/; Max-Age=0;');
        return { success: true };
    };

    public verifyAdminToken = ({ req }: ReqInfos) => {
        const token = req.cookies.adminToken;
        if (!token) return false;
        return this.adminUseCases.verifyToken(token);
    };

    public changeAdminPassword = async (currentPassword: string, newPassword: string, { req }: ReqInfos) => {
        try {
            const token = req.cookies.adminToken;
            if (!token) {
                throw new Error("Token d'authentification manquant");
            }
            const adminData = this.adminUseCases.verifyToken(token);
            if (!adminData || typeof adminData === 'boolean') {
                throw new Error('Token invalide');
            }
            await this.adminUseCases.changePassword(adminData.id, currentPassword, newPassword);
            return { success: true, message: 'Mot de passe modifié avec succès' };
        } catch (error) {
            return { success: false, message: (error as Error).message };
        }
    };

    public changeCustomerPassword = async (currentPassword: string, newPassword: string, { req }: ReqInfos) => {
        try {
            const token = req.cookies.customerToken;
            if (!token) {
                throw new Error("Token d'authentification manquant");
            }
            const customerData = await this.customerUseCases.verifyToken(token);
            if (!customerData || typeof customerData === 'boolean') {
                throw new Error('Token invalide');
            }
            return await this.customerUseCases.changePassword(customerData.id, currentPassword, newPassword);
        } catch (error) {
            throw new Error(`Erreur lors du changement de mot de passe: ${error}`);
        }
    };

    public changeGrowerPassword = async (currentPassword: string, newPassword: string, { req }: ReqInfos) => {
        try {
            const token = req.cookies.growerToken;
            if (!token) {
                throw new Error("Token d'authentification manquant");
            }
            const growerData = this.growerUseCases.verifyToken(token);
            if (!growerData || typeof growerData === 'boolean') {
                throw new Error('Token invalide');
            }
            return await this.growerUseCases.changePassword(growerData.id, currentPassword, newPassword);
        } catch (error) {
            throw new Error(`Erreur lors du changement de mot de passe: ${error}`);
        }
    };

    public changeDelivererPassword = async (currentPassword: string, newPassword: string, { req }: ReqInfos) => {
        try {
            const token = req.cookies.delivererToken;
            if (!token) {
                throw new Error("Token d'authentification manquant");
            }
            const delivererData = this.delivererUseCases.verifyToken(token);
            if (!delivererData || typeof delivererData === 'boolean') {
                throw new Error('Token invalide');
            }
            return await this.delivererUseCases.changePassword(delivererData.id, currentPassword, newPassword);
        } catch (error) {
            throw new Error(`Erreur lors du changement de mot de passe: ${error}`);
        }
    };

    public createCheckoutSession = async (checkoutCreatePayload: ICheckoutCreatePayload, checkoutStatusUrl: string) => {
        const { basket, customer } = await this.checkoutUseCases.saveBasketSession(checkoutCreatePayload);
        const checkoutSession = await this.checkoutUseCases.createCheckoutSession(basket);
        const { defaultTaxRate } = await this.paymentUseCases.getTaxRates();
        const basketWithVatRates = await this.productUseCases.addVatRateToBasket(basket, defaultTaxRate.taxId);
        const { paymentUrl } = await this.paymentUseCases.getPaymentLink(
            customer,
            basketWithVatRates,
            checkoutSession,
            checkoutStatusUrl,
        );

        return {
            basketId: basket.id,
            paymentUrl,
            checkoutSessionId: checkoutSession.id,
        };
    };

    public createFreeCheckoutSession = async (checkoutCreatePayload: ICheckoutCreatePayload) => {
        // Validation côté serveur : vérifier que la session gratuite est justifiée
        const walletAmountUsed = checkoutCreatePayload.walletAmountUsed || 0;

        if (walletAmountUsed <= 0) {
            throw new Error("Une session de checkout gratuite nécessite l'utilisation d'avoirs");
        }

        const { basket, customer } = await this.checkoutUseCases.saveBasketSession(checkoutCreatePayload);

        // Vérifier que le montant des avoirs utilisés couvre bien le total du panier
        if (walletAmountUsed < basket.total) {
            throw new Error('Le montant des avoirs utilisés ne couvre pas le total de la commande');
        }

        // Validation supplémentaire : vérifier que le client a suffisamment d'avoirs
        const customerWalletBalance = await this.customerUseCases.getCustomerWalletBalance(customer.id);
        if (customerWalletBalance < walletAmountUsed) {
            throw new Error("Solde d'avoirs insuffisant pour cette transaction");
        }

        const checkoutSession = await this.checkoutUseCases.createCheckoutSession(basket);

        // Marquer immédiatement la session comme payée puisque le montant est 0€
        await this.checkoutUseCases.handleSuccessfulPayment(checkoutSession.id, {
            id: checkoutSession.id,
            payment_status: 'paid',
            amount_total: 0,
            currency: 'eur',
            customer_details: {
                email: customer.email,
                name: checkoutCreatePayload.contact.name,
            },
            metadata: {
                wallet_amount_used: checkoutCreatePayload.walletAmountUsed?.toString() || '0',
            },
        } as unknown as CheckoutSessionSuccessPayload);

        return {
            basketId: basket.id,
            checkoutSessionId: checkoutSession.id,
        };
    };
    public getCheckoutSessionById = this.checkoutUseCases.getCheckoutSessionById;

    public createProductsFromTesting = this.productUseCases.createProductFromTesting;

    public createCommandsFromTesting = this.checkoutUseCases.createCommandsFromTesting;

    public createProductsFromAirtable = this.productUseCases.createProductsFromAirtable;

    public getAllProductsWithStock = async () => {
        return await this.productUseCases.getAllProductsWithStock();
    };
    public getAllProducts = this.productUseCases.getAllProducts;

    public getDeliveryMethods = async () => {
        return await this.productUseCases.getDeliveryMethods();
    };

    public subscribeUser = this.notificationManager.subscribeUser;
    public unsubscribeUser = this.notificationManager.unsubscribeUser;
    public sendNotification = this.notificationManager.sendNotification;

    public adjustStock = this.stockUseCases.adjustStock;
    public getStockMovements = this.stockUseCases.getStockMovements;
    public updateGlobalStockAfterCheckout = this.stockUseCases.updateGlobalStockAfterCheckout;
    public calculateGlobalStock = this.stockUseCases.calculateGlobalStock;

    public getBasketSessions = this.checkoutUseCases.getBasketSessions;

    public updateVariant = this.productUseCases.updateVariant;
    createVariant = this.productUseCases.createVariant;
    deleteVariant = this.productUseCases.deleteVariant;

    public updateProduct = this.productUseCases.updateProduct;
    public createProduct = this.productUseCases.createProduct;
    public deleteProduct = this.productUseCases.deleteProduct;

    public getTaxRates = async () => {
        return await this.paymentUseCases.getTaxRates();
    };

    public markBasketAsDelivered = async (basketId: string) => {
        const deliveryDate = new Date().toISOString();
        await this.sendDeliveryEmail(basketId);
        return await this.checkoutUseCases.setDeliveryDate(basketId, deliveryDate);
    };

    public sendDeliveryEmail = async (basketId: string) => {
        const basket = await this.checkoutUseCases.getBasketSessionById(basketId);
        const emailNotificationService = new BrevoEmailNotificationService();
        return await emailNotificationService.sendEmail(
            basket.customer.email,
            'Livraison de votre commande manrina',
            `<html><body><h1>Votre commande a été livrée</h1>
<div>Vous pouvez venir la retirer</div>
<div>Adresse de livraison: ${basket.basket.address?.address}</div>
<div>Code postal: ${basket.basket.address?.postalCode}</div>
<div>Ville: ${basket.basket.address?.city}</div>
<p>Merci pour votre commande.</p>
<p>Cordialement,</p>
<p>L'équipe manrina</p>
</body></html>`,
        );
    };

    public validateBasketItems = async (items: { productId: string; variantId: string; quantity: number }[]) => {
        return await this.productUseCases.validateBasketItems(items);
    };

    public updateBasketItemRefundStatus = this.checkoutUseCases.updateBasketItemRefundStatus;
    public getBasketItemById = this.checkoutUseCases.getBasketItemById;

    // Grower methods
    public growerLogin = async (loginPayload: IGrowerLoginPayload, { res }: ReqInfos) => {
        try {
            const jwt = await this.growerUseCases.login(loginPayload);
            res.setHeader('Set-Cookie', `growerToken=${jwt.jwt}; HttpOnly; Path=/; Max-Age=36000;`); // 10 hours
            return { success: true };
        } catch (error) {
            return { success: false, message: (error as Error).message };
        }
    };

    public growerLogout = ({ res }: ReqInfos) => {
        res.setHeader('Set-Cookie', 'growerToken=; HttpOnly; Path=/; Max-Age=0;');
        return { success: true };
    };

    public verifyGrowerToken = ({ req }: ReqInfos) => {
        const token = req.cookies.growerToken;
        if (!token) return false;
        return this.growerUseCases.verifyToken(token);
    };

    public listGrowers = async () => {
        return await this.growerUseCases.listGrowers();
    };

    public createGrower = async (props: IGrowerCreateParams) => {
        return await this.growerUseCases.createGrower(props);
    };

    public updateGrower = async (props: IGrowerUpdateParams) => {
        return await this.growerUseCases.updateGrower(props);
    };

    public deleteGrower = async (id: string) => {
        return await this.growerUseCases.deleteGrower(id);
    };

    public updateGrowerApproval = async (id: string, approved: boolean) => {
        try {
            const grower = await this.growerUseCases.updateGrowerApproval(id, approved);
            return {
                success: true,
                message: approved ? 'Producteur approuvé avec succès' : 'Approbation du producteur révoquée',
                data: grower,
            };
        } catch (error) {
            return {
                success: false,
                message: (error as Error).message,
            };
        }
    };

    public createGrowerAccount = async (props: {
        name: string;
        email: string;
        password: string;
        siret?: string;
        profilePhoto?: string;
    }) => {
        // Vérifier si l'email existe déjà
        const existingEmail = await this.growerUseCases.findByEmail(props.email);
        if (existingEmail) {
            return { success: false, message: 'Cet email est déjà utilisé.' };
        }

        // Vérifier si le SIRET existe déjà (si fourni)
        if (props.siret) {
            const existingSiret = await this.growerUseCases.findBySiret(props.siret);
            if (existingSiret) {
                return { success: false, message: 'Ce numéro SIRET est déjà utilisé par un autre producteur.' };
            }
        }

        try {
            const grower = await this.growerUseCases.createGrower({
                ...props,
                profilePhoto: props.profilePhoto || '',
                siret: props.siret ?? null,
                approved: false, // Le producteur n'est pas approuvé par défaut
                commissionRate: 0.1, // 10% par défaut
            });
            return {
                success: true,
                message:
                    "Votre demande d'inscription a été envoyée. Un administrateur va examiner votre demande et vous serez notifié par email une fois approuvé.",
                grower: {
                    id: grower.id,
                    name: grower.name,
                    email: grower.email,
                    approved: grower.approved,
                },
            };
        } catch (error: unknown) {
            // Gérer les erreurs de contrainte d'unicité au niveau base de données
            if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
                const prismaError = error as { code: string; meta?: { target?: string[] } };
                if (prismaError.meta?.target?.includes('siret')) {
                    return { success: false, message: 'Ce numéro SIRET est déjà utilisé par un autre producteur.' };
                }
                if (prismaError.meta?.target?.includes('email')) {
                    return { success: false, message: 'Cet email est déjà utilisé.' };
                }
            }
            throw error;
        }
    };

    public createClientAccount = async (props: { name: string; email: string; password: string; phone?: string }) => {
        const existing = await this.customerUseCases.findByEmail(props.email);
        if (existing) {
            return { success: false, message: 'Cet email est déjà utilisé.' };
        }
        const customer = await this.customerUseCases.createCustomer({
            ...props,
            phone: props.phone || '',
        });
        return { success: true, customer };
    };

    public updateGrowerPassword = async (id: string, password: string) => {
        return await this.growerUseCases.updatePassword(id, password);
    };

    public addGrowerProduct = async (
        growerId: string,
        productId: string,
        stock: number,
        forceReplace?: boolean
    ): Promise<import('@/server/grower/IGrowerRepository').IGrowerProduct> => {
        return await this.growerUseCases.addGrowerProduct({ growerId, productId, stock, forceReplace });
    };

    public removeGrowerProduct = async (params: { growerId: string; productId: string }): Promise<void> => {
        return await this.growerUseCases.removeGrowerProduct(params);
    };

    public listGrowerProducts = async (
        growerId: string,
    ): Promise<import('@/server/grower/IGrowerRepository').IGrowerProductWithRelations[]> => {
        return await this.growerUseCases.listGrowerProducts(growerId);
    };

    public updateGrowerProductPrice = async (params: {
        growerId: string;
        variantId: string;
        price: number;
    }): Promise<import('@/server/grower/IGrowerRepository').IGrowerProduct> => {
        return await this.growerUseCases.updateGrowerProductPrice(params);
    };

    public createGrowerProductSuggestion = async (
        params: IGrowerProductSuggestionCreateParams,
    ): Promise<import('@/server/grower/IGrower').IGrowerProductSuggestion> => {
        return await this.growerUseCases.createGrowerProductSuggestion(params);
    };

    public listGrowerProductSuggestions = async (
        growerId: string,
    ): Promise<import('@/server/grower/IGrower').IGrowerProductSuggestion[]> => {
        return await this.growerUseCases.listGrowerProductSuggestions(growerId);
    };

    public deleteGrowerProductSuggestion = async (id: string): Promise<void> => {
        return await this.growerUseCases.deleteGrowerProductSuggestion(id);
    };

    public createMarketProductSuggestion = async (
        params: IMarketProductSuggestionCreateParams,
    ): Promise<import('@/server/grower/IGrower').IMarketProductSuggestion> => {
        return await this.growerUseCases.createMarketProductSuggestion(params);
    };

    public listMarketProductSuggestions = async (
        growerId: string,
    ): Promise<import('@/server/grower/IGrower').IMarketProductSuggestion[]> => {
        return await this.growerUseCases.listMarketProductSuggestions(growerId);
    };

    public getAllMarketProductSuggestions = async (): Promise<
        import('@/server/grower/IGrower').IMarketProductSuggestion[]
    > => {
        return await this.growerUseCases.getAllMarketProductSuggestions();
    };

    public updateMarketProductSuggestionStatus = async (
        id: string,
        status: 'APPROVED' | 'REJECTED',
        adminComment?: string,
    ): Promise<import('@/server/grower/IGrower').IMarketProductSuggestion> => {
        return await this.growerUseCases.updateMarketProductSuggestionStatus(id, status, adminComment);
    };

    public getAllUnits = async () => {
        return await this.productUseCases.getAllUnits();
    };

    // Corriger la méthode delivererLogin pour suivre le même pattern
    public delivererLogin = async (loginPayload: IDelivererLoginPayload, { res }: ReqInfos) => {
        try {
            const jwt = await this.delivererUseCases.login(loginPayload);
            res.setHeader('Set-Cookie', `delivererToken=${jwt.jwt}; HttpOnly; Path=/; Max-Age=36000;`); // 10 hours
            return { success: true };
        } catch (error) {
            return { success: false, message: (error as Error).message };
        }
    };

    // Ajouter la méthode delivererLogout qui manque
    public delivererLogout = ({ res }: ReqInfos) => {
        res.setHeader('Set-Cookie', 'delivererToken=; HttpOnly; Path=/; Max-Age=0;');
        return { success: true };
    };

    public async getDelivererDeliveries(delivererId: string) {
        return this.delivererUseCases.getMyDeliveries(delivererId);
    }

    public verifyDelivererToken = ({ req }: ReqInfos) => {
        const token = req.cookies.delivererToken;
        if (!token) return false;
        return this.delivererUseCases.verifyToken(token);
    };

    // Ajouter ces méthodes à la fin de la classe :

    // Customer methods
    public customerLogin = async (loginPayload: ICustomerLoginPayload, { res }: ReqInfos) => {
        try {
            const jwt = await this.customerUseCases.login(loginPayload);
            res.setHeader('Set-Cookie', `customerToken=${jwt.jwt}; HttpOnly; Path=/; Max-Age=36000;`); // 10 hours
            return { success: true };
        } catch (error) {
            return { success: false, message: (error as Error).message };
        }
    };

    public customerLogout = ({ res }: ReqInfos) => {
        res.setHeader('Set-Cookie', 'customerToken=; HttpOnly; Path=/; Max-Age=0;');
        return { success: true };
    };

    public verifyCustomerToken = ({ req }: ReqInfos) => {
        const token = req.cookies.customerToken;
        if (!token) return false;
        return this.customerUseCases.verifyToken(token);
    };

    public listCustomers = async () => {
        return await this.customerUseCases.listCustomers();
    };

    public createCustomer = async (props: ICustomerCreateParams) => {
        return await this.customerUseCases.createCustomer(props);
    };

    public updateCustomer = async (props: ICustomerUpdateParams) => {
        return await this.customerUseCases.updateCustomer(props);
    };

    public deleteCustomer = async (id: string) => {
        return await this.customerUseCases.deleteCustomer(id);
    };

    public getCustomerOrders = async (
        clientId?: string,
        options?: { limit?: number; offset?: number },
        { req }: ReqInfos = {} as ReqInfos,
    ) => {
        // Si clientId est fourni (appel admin), l'utiliser directement
        if (clientId) {
            return await this.customerUseCases.getCustomerOrders(clientId);
        }

        // Sinon, utiliser le token client (appel client)
        const token = req.cookies.customerToken;
        if (!token) {
            throw new Error('Token client requis');
        }
        const customerData = await this.customerUseCases.verifyToken(token);
        if (!customerData) {
            throw new Error('Token client invalide');
        }
        return await this.customerUseCases.getCustomerOrders(customerData.id);
    };

    public getCustomerWalletBalance = async ({ req }: ReqInfos) => {
        const token = req.cookies.customerToken;
        if (!token) {
            throw new Error('Token client requis');
        }
        const customerData = await this.customerUseCases.verifyToken(token);
        if (!customerData) {
            throw new Error('Token client invalide');
        }
        return await this.customerUseCases.getCustomerWalletBalance(customerData.id);
    };

    public listCustomersWithPagination = async (
        options: {
            page?: number;
            limit?: number;
            search?: string;
        } = {},
    ) => {
        return await this.customerUseCases.listCustomersWithPagination(options);
    };

    public getCustomerWalletBalanceById = async (customerId: string) => {
        return await this.customerUseCases.getCustomerWalletBalance(customerId);
    };

    // Méthodes pour la gestion des adresses client
    public getCustomerAddresses = async (clientId?: string, { req }: ReqInfos = {} as ReqInfos) => {
        // Si clientId est fourni (appel admin), l'utiliser directement
        if (clientId) {
            return await this.customerUseCases.getCustomerAddresses(clientId);
        }

        // Sinon, utiliser le token client (appel client)
        const token = req.cookies.customerToken;
        if (!token) {
            throw new Error('Token client requis');
        }
        const customerData = await this.customerUseCases.verifyToken(token);
        if (!customerData) {
            throw new Error('Token client invalide');
        }
        return await this.customerUseCases.getCustomerAddresses(customerData.id);
    };

    public createCustomerAddress = async (
        addressData: {
            address: string;
            city: string;
            postalCode: string;
            country: string;
            name?: string;
            type: string;
            customerId?: string;
        },
        { req }: ReqInfos = {} as ReqInfos,
    ) => {
        // Si customerId est fourni (appel admin), l'utiliser directement
        if (addressData.customerId) {
            return await this.customerUseCases.createCustomerAddress({
                ...addressData,
                customerId: addressData.customerId,
            });
        }

        // Sinon, utiliser le token client (appel client)
        const token = req.cookies.customerToken;
        if (!token) {
            throw new Error('Token client requis');
        }
        const customerData = await this.customerUseCases.verifyToken(token);
        if (!customerData) {
            throw new Error('Token client invalide');
        }
        return await this.customerUseCases.createCustomerAddress({
            customerId: customerData.id,
            ...addressData,
        });
    };

    public updateCustomerAddress = async (
        addressId: string,
        addressData: {
            address?: string;
            city?: string;
            postalCode?: string;
            country?: string;
            name?: string;
            type?: string;
            customerId?: string;
        },
        { req }: ReqInfos = {} as ReqInfos,
    ) => {
        // Si customerId est fourni (appel admin), utiliser directement
        if (addressData.customerId) {
            return await this.customerUseCases.updateCustomerAddress({
                id: addressId,
                ...addressData,
            });
        }

        // Sinon, utiliser le token client (appel client)
        const token = req.cookies.customerToken;
        if (!token) {
            throw new Error('Token client requis');
        }
        const customerData = await this.customerUseCases.verifyToken(token);
        if (!customerData) {
            throw new Error('Token client invalide');
        }
        return await this.customerUseCases.updateCustomerAddress({
            id: addressId,
            ...addressData,
        });
    };

    public deleteCustomerAddress = async (addressId: string, { req }: ReqInfos = {} as ReqInfos) => {
        // Pour la suppression, on vérifie toujours le token client car on ne peut pas
        // déterminer le propriétaire de l'adresse sans requête supplémentaire
        const token = req.cookies.customerToken;
        if (!token) {
            throw new Error('Token client requis');
        }
        const customerData = await this.customerUseCases.verifyToken(token);
        if (!customerData) {
            throw new Error('Token client invalide');
        }
        return await this.customerUseCases.deleteCustomerAddress(addressId);
    };

    // Méthodes de réinitialisation de mot de passe pour les clients
    public requestCustomerPasswordReset = async (email: string) => {
        return await this.customerUseCases.requestPasswordReset(email);
    };

    public resetCustomerPassword = async (token: string, newPassword: string) => {
        return await this.customerUseCases.resetPassword(token, newPassword);
    };

    // Méthodes de réinitialisation de mot de passe pour les cultivateurs
    public requestGrowerPasswordReset = async (email: string) => {
        return await this.growerUseCases.requestPasswordReset(email);
    };

    public resetGrowerPassword = async (token: string, newPassword: string) => {
        return await this.growerUseCases.resetPassword(token, newPassword);
    };

    // Panyen methods
    public getAllPanyen = async (includeStock?: boolean) => {
        if (includeStock) {
            return this.panyenUseCases.getAllPanyenWithCalculatedStock();
        }
        return this.panyenUseCases.getAllPanyen();
    };

    public getPanyenById = async (id: string, includeStock?: boolean) => {
        const panyen = await this.panyenUseCases.getPanyenById(id);
        if (includeStock && panyen) {
            const calculatedStock = await this.panyenUseCases.calculatePanyenStock(id);
            return { ...panyen, calculatedStock };
        }
        return panyen;
    };

    public createPanyen = async (data: IPanyenCreateInput) => {
        return this.panyenUseCases.createPanyen(data);
    };

    public updatePanyen = async (id: string, data: IPanyenUpdateInput) => {
        return this.panyenUseCases.updatePanyen(id, data);
    };

    public deletePanyen = async (id: string) => {
        return this.panyenUseCases.deletePanyen(id);
    };

    // Grower Stock Validation methods
    public createGrowerStockUpdateRequest = async (params: {
        growerId: string;
        productId: string;
        newStock: number;
        reason: string;
    }) => {
        return await this.growerUseCases.createStockUpdateRequest(params);
    };

    public cancelGrowerStockUpdateRequest = async (requestId: string) => {
        return await this.growerUseCases.cancelStockUpdateRequest(requestId);
    };

    public getGrowerPendingStockRequests = async (growerId: string) => {
        return await this.growerUseCases.getPendingStockRequests(growerId);
    };

    public getAllPendingStockRequests = async (): Promise<
        import('@/hooks/useGrowerStockValidation').IGrowerStockUpdateWithRelations[]
    > => {
        return await this.growerUseCases.getAllPendingStockRequests();
    };

    public approveStockUpdateRequest = async (requestId: string, adminComment?: string) => {
        // Récupérer les détails de la demande avant approbation
        const request = await this.growerUseCases.getStockUpdateRequestById(requestId);
        if (!request) {
            throw new Error('Stock update request not found');
        }

        // Approuver la demande (met à jour le stock du producteur avec la nouvelle valeur)
        const result = await this.growerUseCases.approveStockUpdateRequest(requestId, adminComment);

        // Recalculer le stock global en sommant tous les stocks des producteurs pour ce produit
        const allGrowerProducts = await this.prisma.growerProduct.findMany({
            where: {
                productId: request.productId,
                variantId: null, // Seulement les stocks de produits, pas de variants
            },
            select: {
                stock: true,
            },
        });

        // Calculer le nouveau stock global total
        const newGlobalStock = allGrowerProducts.reduce((total, gp) => total + Number(gp.stock), 0);

        // Mettre à jour le stock global du produit avec la valeur recalculée
        await this.stockUseCases.adjustGlobalStock({
            productId: request.productId,
            newGlobalStock: newGlobalStock,
            reason: `Recalcul après validation de demande de stock (producteur: ${request.growerId})`,
            adjustedBy: 'admin',
        });

        return result;
    };

    public rejectStockUpdateRequest = async (requestId: string, adminComment?: string) => {
        return this.growerUseCases.rejectStockUpdateRequest(requestId, adminComment);
    };

    // Market Announcements methods
    public getActiveMarketAnnouncements = async () => {
        return this.marketUseCases.getActiveAnnouncements();
    };

    public getAllMarketAnnouncements = async (filters?: MarketAnnouncementFilters) => {
        return this.marketUseCases.getAllAnnouncements(filters);
    };

    public getMarketAnnouncementById = async (id: string) => {
        return this.marketUseCases.getAnnouncementById(id);
    };

    public createMarketAnnouncement = async (data: CreateMarketAnnouncementInput) => {
        return this.marketUseCases.createAnnouncement(data);
    };

    public updateMarketAnnouncement = async (id: string, data: UpdateMarketAnnouncementInput) => {
        return this.marketUseCases.updateAnnouncement(id, data);
    };

    public deleteMarketAnnouncement = async (id: string) => {
        return this.marketUseCases.deleteAnnouncement(id);
    };

    public activateMarketAnnouncement = async (id: string) => {
        return this.marketUseCases.activateAnnouncement(id);
    };

    public deactivateMarketAnnouncement = async (id: string) => {
        return await this.marketUseCases.deactivateAnnouncement(id);
    };

    // Méthodes pour vérifier l'existence des emails
    public findCustomerByEmail = async (email: string) => {
        return await this.customerUseCases.findByEmail(email);
    };

    public getCustomer = async (id: string) => {
        return await this.customerUseCases.findById(id);
    };

    public findGrowerByEmail = async (email: string) => {
        return this.growerUseCases.findByEmail(email);
    };

    public findGrowerById = async (id: string) => {
        return this.growerUseCases.findById(id);
    };

    // Assignment methods
    public getAllAssignments = async (filters?: IAssignmentFilters) => {
        return this.assignmentUseCases.getAllAssignments(filters);
    };

    public getAssignmentById = async (id: string) => {
        return this.assignmentUseCases.getAssignmentById(id);
    };

    public createAssignment = async (data: IAssignmentCreateInput) => {
        return this.assignmentUseCases.createAssignment(data);
    };

    public updateAssignment = async (id: string, data: IAssignmentUpdateInput) => {
        return this.assignmentUseCases.updateAssignment(id, data);
    };

    public deleteAssignment = async (id: string) => {
        return this.assignmentUseCases.deleteAssignment(id);
    };

    public getActiveAssignments = async () => {
        return await this.assignmentUseCases.getActiveAssignments();
    };

    // Grower Pricing Service methods
    public getLowestPriceForVariant = async (variantId: string) => {
        return await this.growerPricingService.getLowestPriceForVariant(variantId);
    };

    public getProductPriceInfo = async (productId: string) => {
        return await this.growerPricingService.getProductPriceInfo(productId);
    };

    public getGrowerPricesForVariant = async (variantId: string) => {
        return await this.growerPricingService.getGrowerPricesForVariant(variantId);
    };

    public getAllProductsPriceRanges = async () => {
        return await this.growerPricingService.getAllProductsPriceRanges();
    };

    public getAllVariantsPriceRanges = async () => {
        return await this.growerPricingService.getAllVariantsPriceRanges();
    };

    // Grower Stock Service methods
    public getProductStockInfo = async (productId: string) => {
        return await this.growerStockService.getProductStockInfo(productId);
    };

    // Product-level stock methods
    public getGrowerStocksForProduct = async (productId: string) => {
        return await this.growerStockService.getGrowerStocksForProduct(productId);
    };

    // Batch method to get all products global stock
    public getAllProductsGlobalStock = async (productIds: string[]) => {
        const stockMap: Record<string, number> = {};
        
        // Récupérer tous les stocks en une seule requête
        // NOTE: On ne filtre plus sur variantId=null pour inclure d’éventuelles lignes historiques
        // où le stock aurait été enregistré avec un variantId par erreur.
        const allGrowerProducts = await this.prisma.growerProduct.findMany({
            where: {
                productId: { in: productIds },
            },
            select: {
                productId: true,
                stock: true,
            },
        });
        
        // Grouper par productId et calculer le total (somme de toutes les lignes)
        productIds.forEach(productId => {
            const productStocks = allGrowerProducts.filter(gp => gp.productId === productId);
            const totalStock = productStocks.reduce((total, gp) => total + Number(gp.stock), 0);
            stockMap[productId] = totalStock;
        });
        
        return stockMap;
    };

    public getTotalStockForProduct = async (productId: string) => {
        return await this.productStockService.getTotalStockForProduct(productId);
    };

    public adjustGlobalStock = async (params: { productId: string; adjustment: number; type: 'add' | 'subtract' }) => {
        // Calculer le nouveau stock global basé sur l'ajustement
        const currentStock = await this.stockUseCases.calculateGlobalStock(params.productId);
        const currentValue = currentStock?.globalStock || 0;
        const newGlobalStock =
            params.type === 'add' ? currentValue + params.adjustment : currentValue - params.adjustment;

        return await this.stockUseCases.adjustGlobalStock({
            productId: params.productId,
            newGlobalStock: Math.max(0, newGlobalStock),
            reason: `Ajustement ${params.type === 'add' ? '+' : '-'}${params.adjustment}`,
            adjustedBy: 'admin',
        });
    };

    public updateGrowerProductStock = async (params: { growerId: string; productId: string; stock: number }) => {
        return await this.growerUseCases.updateGrowerProductStock(params);
    };

    // Méthode optimisée pour charger toutes les données de la page stocks du producteur en une fois
    public getGrowerStockPageData = async (growerId: string) => {
        // Exécuter toutes les requêtes en parallèle pour optimiser les performances
        const [growerProducts, allProducts, units, allPendingStockRequests] = await Promise.all([
            // Récupérer les produits du producteur avec leurs variants
            this.growerUseCases.listGrowerProducts(growerId),
            // Récupérer tous les produits disponibles
            this.productUseCases.getAllProducts(),
            // Récupérer les unités
            this.productUseCases.getAllUnits(),
            // Récupérer toutes les demandes de validation de stock en attente avec relations
            this.growerUseCases.getAllPendingStockRequests(),
        ]);

        // Filtrer les demandes pour ce producteur spécifique
        const pendingStockRequests = allPendingStockRequests.filter(request => request.growerId === growerId);

        return {
            growerProducts,
            allProducts,
            units,
            pendingStockRequests,
        };
    };

    // Méthode optimisée pour mettre à jour les prix de plusieurs variants en une fois
    public updateMultipleVariantPrices = async (params: {
        growerId: string;
        variantPrices: Array<{ variantId: string; price: number }>;
    }) => {
        const { growerId, variantPrices } = params;
        
        // Utiliser une transaction pour s'assurer que toutes les mises à jour sont atomiques
        const results = await this.prisma.$transaction(
            variantPrices.map(({ variantId, price }) =>
                this.prisma.growerVariantPrice.upsert({
                    where: {
                        growerId_variantId: {
                            growerId,
                            variantId,
                        },
                    },
                    update: { price },
                    create: { growerId, variantId, price },
                })
            )
        );

        return results;
    };
}


