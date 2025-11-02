import { CustomerUseCases } from '@/server/customer/CustomerUseCases';
import { ReqInfos } from '@/service/BackendFetchService';

export class CustomerAddressUseCases {
    constructor(private customerUseCases: CustomerUseCases) {}

    public getCustomerAddresses = async (clientIdOrContext?: string | ReqInfos, maybeContext?: ReqInfos) => {
        const isClientIdString = typeof clientIdOrContext === 'string';
        const clientId = isClientIdString ? (clientIdOrContext as string) : undefined;
        const context = (isClientIdString ? maybeContext : clientIdOrContext) ?? ({} as ReqInfos);
        const req = context?.req;

        if (clientId) {
            return await this.customerUseCases.getCustomerAddresses(clientId);
        }

        if (!req) {
            throw new Error('Token client requis');
        }

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
        { req }: Pick<ReqInfos, 'req'>
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
        { req }: Pick<ReqInfos, 'req'>
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

    public deleteCustomerAddress = async (addressId: string, { req }: Pick<ReqInfos, 'req'>) => {
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
}