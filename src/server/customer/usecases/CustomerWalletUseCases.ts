import { CustomerUseCases } from '@/server/customer/CustomerUseCases';
import { ReqInfos } from '@/service/BackendFetchService';

export class CustomerWalletUseCases {
    constructor(private customerUseCases: CustomerUseCases) {}

    public getCustomerWalletBalance = async ({ req }: Pick<ReqInfos, 'req'>) => {
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

    public getCustomerWalletBalanceById = async (customerId: string) => {
        return await this.customerUseCases.getCustomerWalletBalance(customerId);
    };
}