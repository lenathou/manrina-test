import { CustomerUseCases } from '@/server/customer/CustomerUseCases';
import { ICustomerCreateParams, ICustomerUpdateParams } from '@/server/customer/ICustomer';

export class CustomerAccountUseCases {
    constructor(private customerUseCases: CustomerUseCases) {}

    listCustomers = () => this.customerUseCases.listCustomers();
    
    createCustomer = (props: ICustomerCreateParams) => this.customerUseCases.createCustomer(props);
    
    updateCustomer = (props: ICustomerUpdateParams) => this.customerUseCases.updateCustomer(props);
    
    deleteCustomer = (id: string) => this.customerUseCases.deleteCustomer(id);
    
    listCustomersWithPagination = (options?: {
        page?: number;
        limit?: number;
        search?: string;
    }) => this.customerUseCases.listCustomersWithPagination(options || {});
    
    findCustomerByEmail = (email: string) => this.customerUseCases.findByEmail(email);
    
    getCustomer = (id: string) => this.customerUseCases.findById(id);
}