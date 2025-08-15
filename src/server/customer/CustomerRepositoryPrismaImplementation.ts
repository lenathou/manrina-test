import { PrismaClient } from '@prisma/client';
import { Customer, CustomerCreatePayload } from './Customer';
import { CustomerRepository } from './CustomerRepository';
import { ICustomerCreateParams, ICustomerUpdateParams } from './ICustomer';
import { Address } from './Address';
import { IAddressCreateParams, IAddressUpdateParams } from './IAddress';
import { IdGenerator } from '../../service/IdGenerator';
import { PasswordService } from '@/server/services/PasswordService';

export class CustomerRepositoryPrismaImplementation implements CustomerRepository {
    constructor(
        private prisma: PrismaClient,
        private passwordService: PasswordService,
    ) {}

    public getMatchingCustomerOrCreate = async (customer: CustomerCreatePayload): Promise<Customer> => {
        try {
            const existingCustomer = await this.findByEmail(customer.email);
            if (existingCustomer) {
                return existingCustomer;
            }
        } catch (error) {
            // Log l'erreur pour le debugging
            console.warn('Erreur lors de la recherche du client par email:', error);
            // Continue to create new customer si le client n'existe pas
        }
        // Générer un mot de passe temporaire pour les clients créés automatiquement
        const temporaryPassword = 'temp123!' + Math.random().toString(36).substring(7);
        return this.create({
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            password: temporaryPassword, // Mot de passe temporaire généré
        });
    };

    public async findById(id: string): Promise<Customer | null> {
        try {
            const customer = await this.prisma.customer.findUnique({
                where: { id },
            });
            return customer ? new Customer(customer) : null;
        } catch (error) {
            console.error('Erreur lors de la recherche du client par ID:', error);
            return null;
        }
    }

    public async findByEmail(email: string): Promise<Customer | null> {
        try {
            const customer = await this.prisma.customer.findUnique({
                where: { email },
            });
            return customer ? new Customer(customer) : null;
        } catch (error) {
            console.error('Erreur lors de la recherche du client par email:', error);
            return null;
        }
    }

    public async findByEmailWithPassword(email: string): Promise<{ id: string; email: string; name: string; phone: string; password: string } | null> {
        try {
            const customer = await this.prisma.customer.findUnique({
                where: { email },
                select: { id: true, email: true, name: true, phone: true, password: true }
            });
            
            // Vérifier que le customer existe et que le password n'est pas null
            if (customer && customer.password !== null) {
                return {
                    id: customer.id,
                    email: customer.email,
                    name: customer.name,
                    phone: customer.phone,
                    password: customer.password
                };
            }
            return null;
        } catch (error) {
            console.error('Erreur lors de la recherche du client par email avec mot de passe:', error);
            return null;
        }
    }

    public async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
        return this.passwordService.verify(plainPassword, hashedPassword);
    }

    public async create(params: ICustomerCreateParams): Promise<Customer> {
        // Vérifier que le password existe avant de le hasher
        if (!params.password) {
            throw new Error('Le mot de passe est requis pour créer un client');
        }
        
        const customerData = {
            id: IdGenerator.generateIdWithPrefix('cus'),
            name: params.name,
            email: params.email.trim(),
            phone: params.phone,
            password: await this.passwordService.hash(params.password),
        };
        
        const customerCreated = await this.prisma.customer.create({
            data: customerData,
        });
        return new Customer(customerCreated);
    }

    public async update(params: ICustomerUpdateParams): Promise<Customer> {
        const { id, ...updateData } = params;
        const customerUpdated = await this.prisma.customer.update({
            where: { id },
            data: updateData,
        });
        return new Customer(customerUpdated);
    }

    public async delete(id: string): Promise<void> {
        await this.prisma.customer.delete({
            where: { id },
        });
    }

    public async setPasswordResetToken(email: string, token: string, expires: Date): Promise<boolean> {
        try {
            await this.prisma.customer.update({
                where: { email },
                data: {
                    passwordResetToken: token,
                    passwordResetExpires: expires,
                },
            });
            return true;
        } catch (error) {
            console.error('Erreur lors de la définition du token de réinitialisation:', error);
            return false;
        }
    }

    public async findByPasswordResetToken(token: string): Promise<Customer | null> {
        try {
            const customer = await this.prisma.customer.findFirst({
                where: {
                    passwordResetToken: token,
                    passwordResetExpires: { gt: new Date() },
                },
            });
            return customer ? new Customer(customer) : null;
        } catch (error) {
            console.error('Erreur lors de la recherche par token de réinitialisation:', error);
            return null;
        }
    }

    public async resetPassword(id: string, newPassword: string): Promise<void> {
        const hashedPassword = await this.passwordService.hash(newPassword);
        await this.prisma.customer.update({
            where: { id },
            data: {
                password: hashedPassword,
                passwordResetToken: null,
                passwordResetExpires: null,
            },
        });
    }

    public async list(): Promise<Customer[]> {
        const customers = await this.prisma.customer.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return customers.map(customer => new Customer(customer));
    }

    // Méthodes pour la gestion des adresses
    public async getCustomerAddresses(customerId: string): Promise<Address[]> {
        const addresses = await this.prisma.address.findMany({
            where: { customerId },
            orderBy: { createdAt: 'desc' },
        });
        return addresses.map(address => new Address({
             id: address.id,
             postalCode: address.postalCode,
             address: address.address,
             city: address.city,
             country: address.country,
             name: address.name || undefined,
             type: address.type,
             customerId: address.customerId || undefined,
             createdAt: address.createdAt,
             updatedAt: address.updatedAt,
         }));
    }

    public async createCustomerAddress(params: IAddressCreateParams): Promise<Address> {
        // Vérifier si le client a déjà 2 adresses
        const existingAddresses = await this.prisma.address.count({
            where: { customerId: params.customerId }
        });

        if (existingAddresses >= 2) {
            throw new Error('Un client ne peut avoir que 2 adresses maximum');
        }

        const addressData = Address.createNew(params);
        const createdAddress = await this.prisma.address.create({
            data: {
                id: addressData.id,
                customerId: addressData.customerId,
                postalCode: addressData.postalCode,
                address: addressData.address,
                city: addressData.city,
                country: addressData.country,
                name: addressData.name,
                type: addressData.type,
                createdAt: addressData.createdAt,
                updatedAt: addressData.updatedAt,
            },
        });

        return new Address({
            id: createdAddress.id,
            postalCode: createdAddress.postalCode,
            address: createdAddress.address,
            city: createdAddress.city,
            country: createdAddress.country,
            name: createdAddress.name || undefined,
            type: createdAddress.type,
            customerId: createdAddress.customerId || undefined,
            createdAt: createdAddress.createdAt,
            updatedAt: createdAddress.updatedAt,
        });
    }

    public async updateCustomerAddress(params: IAddressUpdateParams): Promise<Address> {
        const updatedAddress = await this.prisma.address.update({
            where: { id: params.id },
            data: {
                postalCode: params.postalCode,
                address: params.address,
                city: params.city,
                country: params.country,
                name: params.name,
                type: params.type,
                updatedAt: new Date(),
            },
        });

        return new Address({
            id: updatedAddress.id,
            postalCode: updatedAddress.postalCode,
            address: updatedAddress.address,
            city: updatedAddress.city,
            country: updatedAddress.country,
            name: updatedAddress.name || undefined,
            type: updatedAddress.type,
            customerId: updatedAddress.customerId || undefined,
            createdAt: updatedAddress.createdAt,
            updatedAt: updatedAddress.updatedAt,
        });
    }

    public async deleteCustomerAddress(addressId: string): Promise<void> {
        await this.prisma.address.delete({
            where: { id: addressId },
        });
    }

    // Alias pour compatibilité avec l'interface existante
    public createCustomer = this.create;
    public getCustomerById = this.findById;
    public getCustomerByEmail = this.findByEmail;
}
