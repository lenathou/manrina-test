import { IdGenerator } from '../../service/IdGenerator';
import { ICustomer } from './ICustomer';

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
    readonly password: string;
    readonly passwordResetToken?: string | null;
    readonly passwordResetExpires?: Date | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;

    constructor(customer: ICustomer) {
        this.id = customer.id;
        this.name = customer.name;
        this.email = customer.email.trim();
        this.phone = customer.phone;
        this.password = customer.password;
        this.passwordResetToken = customer.passwordResetToken;
        this.passwordResetExpires = customer.passwordResetExpires;
        this.createdAt = customer.createdAt;
        this.updatedAt = customer.updatedAt;
    }

    static createNew(customer: CustomerCreatePayload) {
        const now = new Date();
        return new Customer({
            id: IdGenerator.generateIdWithPrefix('cus'),
            ...customer,
            email: customer.email.trim(),
            password: '', // Sera défini lors de la création
            passwordResetToken: null,
            passwordResetExpires: null,
            createdAt: now,
            updatedAt: now,
        });
    }
}
