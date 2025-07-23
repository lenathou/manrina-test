/* eslint-disable @typescript-eslint/no-unused-vars */
import { JwtService } from '../services/JwtService';
import { CustomerRepository } from './CustomerRepository';
import { Customer } from './Customer';
import { Address } from './Address';
import { IAddressCreateParams, IAddressUpdateParams } from './IAddress';
import {
    ICustomerLoginPayload,
    ICustomerLoginResponse,
    ICustomerTokenPayload,
    ICustomerCreateParams,
    ICustomerUpdateParams,
} from './ICustomer';
import { CheckoutRepository } from '../checkout/CheckoutRepository';

export class CustomerUseCases {
    constructor(
        private customerRepository: CustomerRepository,
        private jwtService: JwtService,
        private checkoutRepository: CheckoutRepository,
    ) {}

    async login(payload: ICustomerLoginPayload): Promise<ICustomerLoginResponse> {
        const customer = await this.customerRepository.findByEmail(payload.email);
        if (!customer) {
            throw new Error('Email ou mot de passe incorrect');
        }

        // Récupérer le client avec le mot de passe depuis la base de données
        const customerWithPassword = await this.customerRepository.findByEmailWithPassword(payload.email);

        if (!customerWithPassword || !customerWithPassword.password) {
            throw new Error('Email ou mot de passe incorrect');
        }

        const isPasswordValid = await this.customerRepository.verifyPassword(
            payload.password, 
            customerWithPassword.password
        );
        
        if (!isPasswordValid) {
            throw new Error('Email ou mot de passe incorrect');
        }

        const tokenPayload: ICustomerTokenPayload = {
            id: customer.id,
            email: customer.email,
            name: customer.name,
            phone: customer.phone,
        };

        const jwt = this.jwtService.generateToken(tokenPayload);
        return { success: true, jwt };
    }

    async verifyToken(token: string): Promise<ICustomerTokenPayload | false> {
        try {
            const payload = this.jwtService.verifyToken(token) as ICustomerTokenPayload;
            const customer = await this.customerRepository.findById(payload.id);
            if (!customer) return false;
            return payload;
        } catch {
            return false;
        }
    }

    async findByEmail(email: string): Promise<Customer | null> {
        return await this.customerRepository.findByEmail(email);
    }

    async findById(id: string): Promise<Customer | null> {
        return await this.customerRepository.findById(id);
    }

    async createCustomer(params: ICustomerCreateParams): Promise<Customer> {
        if (params.password) {
            // const hashedPassword = await bcrypt.hash(params.password, 10);
            // params.password = hashedPassword;
        }
        return await this.customerRepository.create(params);
    }

    async updateCustomer(params: ICustomerUpdateParams): Promise<Customer> {
        return await this.customerRepository.update(params);
    }

    async deleteCustomer(id: string): Promise<void> {
        return await this.customerRepository.delete(id);
    }

    async listCustomers(): Promise<Customer[]> {
        return await this.customerRepository.list();
    }

    async getCustomerOrders(customerId: string) {
        // Récupérer toutes les commandes du client
        const basketSessions = await this.checkoutRepository.getBasketSessions();
        // Filtrer par customerId (afficher toutes les commandes, pas seulement les payées)
        const customerOrders = basketSessions.filter(
            (basketSession) => basketSession.customer.id === customerId
        );
        return customerOrders.map(order => order.toCommandToShow());
    }

    // Méthodes pour la gestion des adresses
    async getCustomerAddresses(customerId: string): Promise<Address[]> {
        return await this.customerRepository.getCustomerAddresses(customerId);
    }

    async createCustomerAddress(params: IAddressCreateParams): Promise<Address> {
        return await this.customerRepository.createCustomerAddress(params);
    }

    async updateCustomerAddress(params: IAddressUpdateParams): Promise<Address> {
        return await this.customerRepository.updateCustomerAddress(params);
    }

    async deleteCustomerAddress(addressId: string): Promise<void> {
        return await this.customerRepository.deleteCustomerAddress(addressId);
    }
}