import { CustomerUseCases } from '@/server/customer/CustomerUseCases';
import { ICustomerLoginPayload } from '@/server/customer/ICustomer';
import { ReqInfos } from '@/service/BackendFetchService';

export class CustomerAuthUseCases {
    constructor(private customerUseCases: CustomerUseCases) {}

    public customerLogin = async (loginPayload: ICustomerLoginPayload, { res }: Pick<ReqInfos, 'res'>) => {
        try {
            const jwt = await this.customerUseCases.login(loginPayload);
            res.setHeader('Set-Cookie', `customerToken=${jwt.jwt}; HttpOnly; Path=/; Max-Age=36000;`); // 10 hours
            return { success: true };
        } catch (error) {
            return { success: false, message: (error as Error).message };
        }
    };

    public customerLogout = ({ res }: Pick<ReqInfos, 'res'>) => {
        res.setHeader('Set-Cookie', 'customerToken=; HttpOnly; Path=/; Max-Age=0;');
        return { success: true };
    };

    public verifyCustomerToken = ({ req }: Pick<ReqInfos, 'req'>) => {
        const token = req.cookies.customerToken;
        if (!token) return false;
        return this.customerUseCases.verifyToken(token);
    };

    async changeCustomerPassword(currentPassword: string, newPassword: string, { req }: ReqInfos) {
        const token = req.cookies.customerToken;
        if (!token) throw new Error("Token d'authentification manquant");
        const customerData = await this.customerUseCases.verifyToken(token);
        if (!customerData || typeof customerData === 'boolean') throw new Error('Token invalide');
        return await this.customerUseCases.changePassword(customerData.id, currentPassword, newPassword);
    }

    requestCustomerPasswordReset = (email: string) => this.customerUseCases.requestPasswordReset(email);
    
    resetCustomerPassword = (token: string, newPassword: string) => this.customerUseCases.resetPassword(token, newPassword);
}