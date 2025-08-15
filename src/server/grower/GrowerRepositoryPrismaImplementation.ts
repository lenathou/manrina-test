import { PasswordService } from '@/server/services/PasswordService';
import { PrismaClient } from '@prisma/client';
import { IGrower } from './IGrower';
import {
    IGrowerCreateParams,
    IGrowerProduct,
    IGrowerProductWithRelations,
    IGrowerProductSuggestionCreateParams,
    IGrowerRepository,
    IGrowerUpdateParams,
} from './IGrowerRepository';
import { IGrowerProductSuggestion } from './IGrower';
import {
    IGrowerStockUpdate,
    IGrowerStockUpdateCreateParams,
    IGrowerStockUpdateApprovalParams,
    GrowerStockValidationStatus,
} from './IGrowerStockValidation';
import { IGrowerStockUpdateWithRelations } from '@/hooks/useGrowerStockValidation';

export class GrowerRepositoryPrismaImplementation implements IGrowerRepository {
    constructor(
        public prisma: PrismaClient,
        private passwordService: PasswordService,
    ) {}

    public async findByEmail(email: string): Promise<IGrower | undefined> {
        const grower = await this.prisma.grower.findUnique({
            where: { email },
        });
        return grower || undefined;
    }

    public async findBySiret(siret: string): Promise<IGrower | undefined> {
        const grower = await this.prisma.grower.findUnique({
            where: { siret },
        });
        return grower || undefined;
    }

    public async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
        return this.passwordService.verify(plainPassword, hashedPassword);
    }

    public async createGrower(props: IGrowerCreateParams): Promise<IGrower> {
        const hashedPassword = await this.passwordService.hash(props.password);
        return this.prisma.grower.create({
            data: {
                name: props.name,
                email: props.email,
                password: hashedPassword,
                profilePhoto: props.profilePhoto,
                siret: props.siret,
            },
        });
    }

    public async updatePassword(growerId: string, newPassword: string): Promise<void> {
        const hashedPassword = await this.passwordService.hash(newPassword);
        await this.prisma.grower.update({
            where: { id: growerId },
            data: {
                password: hashedPassword,
            },
        });
    }

    public async deleteGrower(growerId: string): Promise<void> {
        await this.prisma.grower.delete({
            where: { id: growerId },
        });
    }

    public async listGrowers(): Promise<IGrower[]> {
        return this.prisma.grower.findMany();
    }

    public async updateGrower(props: IGrowerUpdateParams): Promise<IGrower> {
        return this.prisma.grower.update({
            where: { id: props.id },
            data: {
                name: props.name,
                profilePhoto: props.profilePhoto || '',
            },
        });
    }

    public async setPasswordResetToken(email: string, token: string, expires: Date): Promise<boolean> {
        try {
            await this.prisma.grower.update({
                where: { email },
                data: {
                    passwordResetToken: token,
                    passwordResetExpires: expires,
                },
            });
            return true;
        } catch (error) {
            console.error('Erreur lors de la définition du token de réinitialisation pour le producteur:', error);
            return false;
        }
    }

    public async findByPasswordResetToken(token: string): Promise<IGrower | null> {
        try {
            const grower = await this.prisma.grower.findFirst({
                where: {
                    passwordResetToken: token,
                    passwordResetExpires: { gt: new Date() },
                },
            });
            return grower;
        } catch (error) {
            console.error('Erreur lors de la recherche par token de réinitialisation pour le producteur:', error);
            return null;
        }
    }

    public async resetPassword(id: string, newPassword: string): Promise<void> {
        const hashedPassword = await this.passwordService.hash(newPassword);
        await this.prisma.grower.update({
            where: { id },
            data: {
                password: hashedPassword,
                passwordResetToken: null,
                passwordResetExpires: null,
            },
        });
    }

    public async addGrowerProduct(params: { growerId: string; productId: string; variantId: string; stock: number }): Promise<IGrowerProduct> {
        return this.prisma.growerProduct.create({
            data: {
                growerId: params.growerId,
                productId: params.productId,
                variantId: params.variantId,
                stock: params.stock,
            },
        }) as Promise<IGrowerProduct>;
    }

    public async removeGrowerProduct(params: { growerId: string; variantId: string }): Promise<void> {
        await this.prisma.growerProduct.delete({
            where: {
                growerId_variantId: {
                    growerId: params.growerId,
                    variantId: params.variantId,
                },
            },
        });
    }

    public async listGrowerProducts(growerId: string): Promise<IGrowerProductWithRelations[]> {
        const products = await this.prisma.growerProduct.findMany({
            where: { growerId },
            include: {
                product: true,
                variant: true,
            },
        });
        return products as IGrowerProductWithRelations[];
    }

    public async updateGrowerProductStock(params: { growerId: string; variantId: string; stock: number }): Promise<IGrowerProduct> {
        return this.prisma.growerProduct.update({
            where: {
                growerId_variantId: {
                    growerId: params.growerId,
                    variantId: params.variantId,
                },
            },
            data: {
                stock: params.stock,
            },
        }) as Promise<IGrowerProduct>;
    }

    public async updateGrowerProductPrice(params: { growerId: string; variantId: string; price: number }): Promise<IGrowerProduct> {
        // Mettre à jour le prix du producteur dans la table GrowerProduct
        return this.prisma.growerProduct.update({
            where: {
                growerId_variantId: {
                    growerId: params.growerId,
                    variantId: params.variantId,
                },
            },
            data: {
                price: params.price,
            },
        }) as Promise<IGrowerProduct>;
    }

    public async createGrowerProductSuggestion(params: IGrowerProductSuggestionCreateParams): Promise<IGrowerProductSuggestion> {
        return this.prisma.growerProductSuggestion.create({
            data: {
                growerId: params.growerId,
                name: params.name,
                description: params.description,
                pricing: params.pricing ?? '',
            },
        }) as Promise<IGrowerProductSuggestion>;
    }

    public async listGrowerProductSuggestions(growerId: string): Promise<IGrowerProductSuggestion[]> {
        const suggestions = await this.prisma.growerProductSuggestion.findMany({
            where: { growerId },
            orderBy: { createdAt: 'desc' },
        });
        return suggestions as IGrowerProductSuggestion[];
    }

    public async deleteGrowerProductSuggestion(id: string): Promise<void> {
        await this.prisma.growerProductSuggestion.delete({
            where: { id },
        });
    }

    // Stock validation methods
    public async createStockUpdateRequest(params: IGrowerStockUpdateCreateParams): Promise<IGrowerStockUpdate> {
        return this.prisma.growerStockUpdate.create({
            data: {
                growerId: params.growerId,
                variantId: params.variantId,
                newStock: params.newStock,
                reason: params.reason,
                status: params.status,
                requestDate: new Date(params.requestDate),
            },
        }) as Promise<IGrowerStockUpdate>;
    }

    public async getStockUpdateRequestById(requestId: string): Promise<IGrowerStockUpdate | null> {
        const request = await this.prisma.growerStockUpdate.findUnique({
            where: { id: requestId },
        });
        return request as IGrowerStockUpdate | null;
    }

    public async getStockUpdateRequestsByGrower(growerId: string): Promise<IGrowerStockUpdate[]> {
        const requests = await this.prisma.growerStockUpdate.findMany({
            where: { 
                growerId,
                status: GrowerStockValidationStatus.PENDING,
            },
            orderBy: { createdAt: 'desc' },
        });
        return requests as IGrowerStockUpdateWithRelations[];
    }

    public async getAllPendingStockRequests(): Promise<IGrowerStockUpdateWithRelations[]> {
        const requests = await this.prisma.growerStockUpdate.findMany({
            where: { 
                status: GrowerStockValidationStatus.PENDING,
            },
            include: {
                grower: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
                variant: {
                    include: {
                        product: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return requests as IGrowerStockUpdateWithRelations[];
    }

    public async updateStockUpdateRequestStatus(params: IGrowerStockUpdateApprovalParams): Promise<IGrowerStockUpdate> {
        return this.prisma.growerStockUpdate.update({
            where: { id: params.requestId },
            data: {
                status: params.status,
                adminComment: params.adminComment,
                processedDate: params.processedDate ? new Date(params.processedDate) : null,
                updatedAt: new Date(),
            },
        }) as Promise<IGrowerStockUpdate>;
    }

    public async deleteStockUpdateRequest(requestId: string): Promise<void> {
        await this.prisma.growerStockUpdate.delete({
            where: { id: requestId },
        });
    }
}
