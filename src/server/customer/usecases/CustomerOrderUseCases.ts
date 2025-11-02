import { CustomerUseCases } from '@/server/customer/CustomerUseCases';
import { ReqInfos } from '@/service/BackendFetchService';

export class CustomerOrderUseCases {
    constructor(private customerUseCases: CustomerUseCases) {}

    public getCustomerOrders = async (
        clientIdOrContext?: string | { limit?: number; offset?: number } | ReqInfos,
        optionsOrContext?: { limit?: number; offset?: number } | ReqInfos,
        maybeContext?: ReqInfos,
    ) => {
        const isReqInfos = (value: unknown): value is ReqInfos => {
            return typeof value === 'object' && value !== null && 'req' in (value as Record<string, unknown>);
        };

        let clientId: string | undefined;
        let context: ReqInfos | undefined;

        if (typeof clientIdOrContext === 'string') {
            clientId = clientIdOrContext;
        } else if (clientIdOrContext && isReqInfos(clientIdOrContext)) {
            context = clientIdOrContext;
        }

        if (optionsOrContext && isReqInfos(optionsOrContext)) {
            context = optionsOrContext;
        }

        if (!context && maybeContext) {
            context = maybeContext;
        }

        if (clientId) {
            return await this.customerUseCases.getCustomerOrders(clientId);
        }

        const req = context?.req;

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
        return await this.customerUseCases.getCustomerOrders(customerData.id);
    };
}