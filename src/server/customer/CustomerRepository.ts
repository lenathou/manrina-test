import { Customer, CustomerCreatePayload } from './Customer';
import { ICustomerCreateParams, ICustomerUpdateParams } from './ICustomer';
import { Address } from './Address';
import { IAddressCreateParams, IAddressUpdateParams } from './IAddress';

export interface CustomerRepository {
    getMatchingCustomerOrCreate: (customer: CustomerCreatePayload) => Promise<Customer>;
    // Nouvelles méthodes pour l'authentification
    findById: (id: string) => Promise<Customer | null>;
    findByEmail: (email: string) => Promise<Customer | null>;
    findByEmailWithPassword: (email: string) => Promise<{ id: string; email: string; name: string; phone: string; password: string | null } | null>;
    verifyPassword: (plainPassword: string, hashedPassword: string) => Promise<boolean>;
    create: (params: ICustomerCreateParams) => Promise<Customer>;
    update: (params: ICustomerUpdateParams) => Promise<Customer>;
    delete: (id: string) => Promise<void>;
    list: () => Promise<Customer[]>;
    
    // Méthodes pour la réinitialisation de mot de passe
    setPasswordResetToken: (email: string, token: string, expires: Date) => Promise<boolean>;
    findByPasswordResetToken: (token: string) => Promise<Customer | null>;
    resetPassword: (id: string, newPassword: string) => Promise<void>;
    
    // Méthodes pour la gestion des adresses
    getCustomerAddresses: (customerId: string) => Promise<Address[]>;
    createCustomerAddress: (params: IAddressCreateParams) => Promise<Address>;
    updateCustomerAddress: (params: IAddressUpdateParams) => Promise<Address>;
    deleteCustomerAddress: (addressId: string) => Promise<void>;
}
