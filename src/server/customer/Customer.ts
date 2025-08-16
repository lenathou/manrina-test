import { IdGenerator } from '../../service/IdGenerator';

export interface ICustomer {
    id: string;
    name: string;
    email: string;
    phone: string;
}

export type CustomerCreatePayload = {
    name: string;
    email: string;
    phone: string;
};

export class Customer implements ICustomer {
    readonly id: string;
    readonly name: string;
    readonly email: string;
    readonly phone: string;

    constructor(customer: ICustomer) {
        this.id = customer.id;
        this.name = customer.name;
        this.email = customer.email.trim();
        this.phone = customer.phone;
    }

    static createNew(customer: CustomerCreatePayload) {
        return new Customer({
            id: IdGenerator.generateIdWithPrefix('cus'),
            ...customer,
            email: customer.email.trim(),
        });
    }
}
