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
import { EmailService } from '../services/EmailService';
import { PrismaClient, Prisma } from '@prisma/client';
import { CustomerRepositoryPrismaImplementation } from './CustomerRepositoryPrismaImplementation';
import crypto from 'crypto';

export class CustomerUseCases {
    constructor(
        private customerRepository: CustomerRepository,
        private jwtService: JwtService,
        private checkoutRepository: CheckoutRepository,
        private emailService: EmailService,
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
            
            // Vérifier que toutes les propriétés requises sont présentes
            if (!payload.email || !payload.id || !payload.name) {
                return false;
            }
            
            // Retourner les données actuelles du client plutôt que le payload du token
            // pour s'assurer que les données sont à jour
            return {
                id: customer.id,
                email: customer.email,
                name: customer.name,
                phone: customer.phone,
            };
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

    async listCustomersWithPagination(params: {
        page?: number;
        limit?: number;
        search?: string;
    }): Promise<{
        customers: Array<{
            id: string;
            name: string;
            email: string;
            phone?: string;
            registrationDate: string;
            totalOrders: number;
            totalSpent: string;
        }>;
        total: number;
        totalPages: number;
        currentPage: number;
    }> {
        const { page = 1, limit = 7, search = '' } = params;
        const offset = (page - 1) * limit;

        // Utiliser le repository Prisma directement pour cette requête complexe
        const prisma = (this.customerRepository as CustomerRepositoryPrismaImplementation).prisma;
        
        // Construire les conditions de filtrage
        const whereConditions: Prisma.CustomerWhereInput = {};
        
        if (search) {
            whereConditions.OR = [
                {
                    name: {
                        contains: search,
                        mode: 'insensitive',
                    },
                },
                {
                    email: {
                        contains: search,
                        mode: 'insensitive',
                    },
                },
            ];
        }

        // Récupérer les clients avec leurs commandes pour calculer les statistiques
        const customers = await prisma.customer.findMany({
            where: whereConditions,
            include: {
                basketSession: {
                    where: {
                        paymentStatus: 'paid',
                    },
                    select: {
                        total: true,
                        createdAt: true,
                    },
                },
            },
            skip: offset,
            take: limit,
            orderBy: {
                createdAt: 'desc',
            },
        });

        // Compter le total des clients
        const totalCustomers = await prisma.customer.count({
            where: whereConditions,
        });

        // Transformer les données
        const transformedCustomers = customers.map((customer: Prisma.CustomerGetPayload<{
            include: { 
                basketSession: {
                    where: { paymentStatus: string },
                    select: { total: true, createdAt: true }
                }
            }
        }>) => {
            const totalOrders = customer.basketSession.length;
            const totalSpent = customer.basketSession.reduce((sum: number, basket: { total: number, createdAt: Date }) => sum + basket.total, 0);

            return {
                id: customer.id,
                name: customer.name,
                email: customer.email,
                phone: customer.phone || undefined,
                registrationDate: customer.createdAt.toLocaleDateString('fr-FR'),
                totalOrders,
                totalSpent: `${totalSpent.toFixed(2)} €`,
            };
        });

        const totalPages = Math.ceil(totalCustomers / limit);

        return {
            customers: transformedCustomers,
            total: totalCustomers,
            totalPages,
            currentPage: page,
        };
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

    async getCustomerWalletBalance(customerId: string): Promise<number> {
        // Récupérer toutes les commandes du client
        const basketSessions = await this.checkoutRepository.getBasketSessions();
        const customerOrders = basketSessions.filter(
            (basketSession) => basketSession.customer.id === customerId
        );

        let totalBalance = 0;

        customerOrders.forEach((order) => {
            // Ajouter les remboursements
            order.basket.items.forEach((item) => {
                if (item.refundStatus === 'refunded') {
                    const refundAmount = item.quantity * item.price;
                    totalBalance += refundAmount;
                }
            });

            // Déduire les montants d'avoir utilisés
            const walletAmountUsed = order.basket.walletAmountUsed || 0;
            totalBalance -= walletAmountUsed;
        });

        return totalBalance;
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

    // Méthodes pour la réinitialisation de mot de passe
    async requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
        try {
            const customer = await this.customerRepository.findByEmail(email);
            if (!customer) {
                // Pour la sécurité, on ne révèle pas si l'email existe
                return { 
                    success: true, 
                    message: 'Si un compte avec cet email existe, un lien de réinitialisation a été envoyé.' 
                };
            }

            const resetToken = crypto.randomBytes(32).toString('hex');
            const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
            const expires = new Date(Date.now() + 3600000); // 1 heure

            const tokenSet = await this.customerRepository.setPasswordResetToken(email, hashedToken, expires);
            
            if (tokenSet) {
                await this.emailService.sendPasswordResetEmail(email, resetToken, 'customer');
            }
            
            return { 
                success: true, 
                message: 'Si un compte avec cet email existe, un lien de réinitialisation a été envoyé.' 
            };
        } catch (error) {
            console.error('Erreur lors de la demande de réinitialisation de mot de passe:', error);
            return { 
                success: false, 
                message: 'Une erreur interne s\'est produite.' 
            };
        }
    }

    async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
        try {
            if (!token || !newPassword) {
                return { 
                    success: false, 
                    message: 'Le token et le mot de passe sont requis.' 
                };
            }

            if (newPassword.length < 8) {
                return { 
                    success: false, 
                    message: 'Le mot de passe doit contenir au moins 8 caractères.' 
                };
            }

            const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
            const customer = await this.customerRepository.findByPasswordResetToken(hashedToken);
            
            if (!customer) {
                return { 
                    success: false, 
                    message: 'Token invalide ou expiré.' 
                };
            }

            await this.customerRepository.resetPassword(customer.id, newPassword);
            
            return { 
                success: true, 
                message: 'Mot de passe réinitialisé avec succès.' 
            };
        } catch (error) {
            console.error('Erreur lors de la réinitialisation de mot de passe:', error);
            return { 
                success: false, 
                message: 'Une erreur interne s\'est produite.' 
            };
        }
    }

    async changePassword(customerId: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
        try {
            // Récupérer le client avec le mot de passe
            const customer = await this.customerRepository.findByIdWithPassword(customerId);
            if (!customer || !customer.password) {
                throw new Error('Client non trouvé');
            }

            // Vérifier le mot de passe actuel
            const isCurrentPasswordValid = await this.customerRepository.verifyPassword(
                currentPassword,
                customer.password
            );
            
            if (!isCurrentPasswordValid) {
                throw new Error('Mot de passe actuel incorrect');
            }

            // Mettre à jour le mot de passe
            await this.customerRepository.updatePassword(customerId, newPassword);

            return { success: true, message: 'Mot de passe modifié avec succès' };
        } catch (error) {
            throw new Error(`Erreur lors du changement de mot de passe: ${(error as Error).message}`);
        }
    }
}