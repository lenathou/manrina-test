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
import {
    IGrowerCreateParams,
    IGrowerProductSuggestionCreateParams,
    IGrowerUpdateParams,
} from './grower/IGrowerRepository';
import { PanyenUseCases } from '@/server/panyen/PanyenUseCases';
import { IPanyenCreateInput, IPanyenUpdateInput } from '@/server/panyen/IPanyen';

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
        const { basket, customer } = await this.checkoutUseCases.saveBasketSession(checkoutCreatePayload);
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

    public getBasketSessions = this.checkoutUseCases.getBasketSessions;

    public updateVariant = this.productUseCases.updateVariant;
    createVariant = this.productUseCases.createVariant;

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

    public createGrowerAccount = async (props: {
        name: string;
        email: string;
        password: string;
        profilePhoto?: string;
    }) => {
        const existing = await this.growerUseCases.findByEmail(props.email);
        if (existing) {
            return { success: false, message: 'Cet email est déjà utilisé.' };
        }
        const grower = await this.growerUseCases.createGrower(props);
        return { success: true, grower };
    };

    public updateGrowerPassword = async (id: string, password: string) => {
        return await this.growerUseCases.updatePassword(id, password);
    };

    public addGrowerProduct = async (params: {
        growerId: string;
        productId: string;
        variantId: string;
        stock: number;
    }) => {
        return await this.growerUseCases.addGrowerProduct(params);
    };

    public removeGrowerProduct = async (params: { growerId: string; variantId: string }) => {
        return await this.growerUseCases.removeGrowerProduct(params);
    };

    public listGrowerProducts = async (growerId: string) => {
        return await this.growerUseCases.listGrowerProducts(growerId);
    };

    public updateGrowerProductStock = async (params: { growerId: string; variantId: string; stock: number }) => {
        return await this.growerUseCases.updateGrowerProductStock(params);
    };

    public createGrowerProductSuggestion = async (params: IGrowerProductSuggestionCreateParams) => {
        return await this.growerUseCases.createGrowerProductSuggestion(params);
    };

    public listGrowerProductSuggestions = async (growerId: string) => {
        return await this.growerUseCases.listGrowerProductSuggestions(growerId);
    };

    public deleteGrowerProductSuggestion = async (id: string) => {
        return await this.growerUseCases.deleteGrowerProductSuggestion(id);
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

    public getCustomerOrders = async ({ req }: ReqInfos) => {
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

    // Méthodes pour la gestion des adresses client
    public getCustomerAddresses = async ({ req }: ReqInfos) => {
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

    public createCustomerAddress = async (addressData: { address: string; city: string; postalCode: string; country: string; name?: string; type: string }, { req }: ReqInfos) => {
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

    public updateCustomerAddress = async (addressId: string, addressData: { address?: string; city?: string; postalCode?: string; country?: string; name?: string; type?: string }, { req }: ReqInfos) => {
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

    public deleteCustomerAddress = async (addressId: string, { req }: ReqInfos) => {
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
}
