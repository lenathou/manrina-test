import { PasswordService } from '@/server/services/PasswordService';
import { PrismaClient, Grower, Prisma } from '@prisma/client';
import { IGrower } from './IGrower';
import {
    IGrowerCreateParams,
    IGrowerProduct,
    IGrowerProductWithRelations,
    IGrowerProductSuggestionCreateParams,
    IGrowerRepository,
    IGrowerUpdateParams,
    IGrowerApprovalUpdateParams,
    IMarketProductSuggestionCreateParams,
    IMarketProductSuggestionUpdateParams,
} from './IGrowerRepository';
import { IGrowerProductSuggestion, IMarketProductSuggestion } from './IGrower';
import {
    IGrowerStockUpdate,
    IGrowerStockUpdateCreateParams,
    IGrowerStockUpdateApprovalParams,
    GrowerStockValidationStatus,
} from './IGrowerStockValidation';
import { IGrowerStockUpdateWithRelations } from '@/hooks/useGrowerStockValidation';

// Types Prisma pour les requêtes avec relations
type GrowerProductWithProduct = Prisma.GrowerProductGetPayload<{
    include: {
        product: {
            include: {
                variants: {
                    include: {
                        unit: true;
                        growerVariantPrices: {
                            where: { growerId: string };
                        };
                    };
                };
            };
        };
    };
}>;

type ProductVariantWithPrices = Prisma.ProductVariantGetPayload<{
    include: {
        unit: true;
        growerVariantPrices: {
            where: { growerId: string };
        };
    };
}>;



export class GrowerRepositoryPrismaImplementation implements IGrowerRepository {
    constructor(
        public prisma: PrismaClient,
        private passwordService: PasswordService,
    ) {}

    private convertPrismaGrowerToIGrower(grower: Grower): IGrower {
        return {
            ...grower,
            commissionRate: grower.commissionRate ? Number(grower.commissionRate) : 0,
            deliveryCommissionRate: grower.deliveryCommissionRate ? Number(grower.deliveryCommissionRate) : null,
        };
    }

    public async findByEmail(email: string): Promise<IGrower | undefined> {
        const grower = await this.prisma.grower.findUnique({
            where: { email },
        });
        return grower ? this.convertPrismaGrowerToIGrower(grower) : undefined;
    }

    public async findById(id: string): Promise<IGrower | undefined> {
        const grower = await this.prisma.grower.findUnique({
            where: { id },
            include: {
                assignment: true,
            },
        });
        return grower ? this.convertPrismaGrowerToIGrower(grower) : undefined;
    }

    public async findByIdWithPassword(growerId: string): Promise<IGrower | undefined> {
        const grower = await this.prisma.grower.findUnique({
            where: { id: growerId },
        });
        return grower ? this.convertPrismaGrowerToIGrower(grower) : undefined;
    }

    public async findBySiret(siret: string): Promise<IGrower | undefined> {
        const grower = await this.prisma.grower.findUnique({
            where: { siret },
        });
        return grower ? this.convertPrismaGrowerToIGrower(grower) : undefined;
    }

    public async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
        return this.passwordService.verify(plainPassword, hashedPassword);
    }

    public async createGrower(props: IGrowerCreateParams): Promise<IGrower> {
        const hashedPassword = await this.passwordService.hash(props.password);
        const data: Prisma.GrowerCreateInput = {
            name: props.name,
            email: props.email,
            password: hashedPassword,
            profilePhoto: props.profilePhoto || '',
            phone: props.phone,
            bio: props.bio,
            approved: props.approved ?? false,
            approvedAt: props.approved ? new Date() : null,
            commissionRate: props.commissionRate ?? 7.0,
            deliveryCommissionRate: props.deliveryCommissionRate ?? null,
        };

        // Handle assignment relation if assignmentId is provided
        if (props.assignmentId) {
            data.assignment = {
                connect: { id: props.assignmentId },
            };
        }

        // Only include siret if it's not null/undefined/empty
        if (props.siret && props.siret.trim() !== '') {
            data.siret = props.siret;
        }

        const grower = await this.prisma.grower.create({ data });
        return this.convertPrismaGrowerToIGrower(grower);
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

    public async incrementGrowerProductStock(params: {
        growerId: string;
        productId: string;
        increment: number;
    }): Promise<void> {
        await this.prisma.growerProduct.upsert({
            where: {
                growerId_productId: {
                    growerId: params.growerId,
                    productId: params.productId,
                },
            },
            update: {
                stock: { increment: params.increment },
                variantId: null,
            },
            create: {
                growerId: params.growerId,
                productId: params.productId,
                stock: params.increment,
                variantId: null,
                price: null,
            },
        });
    }

    public async deleteGrower(growerId: string): Promise<void> {
        await this.prisma.grower.delete({
            where: { id: growerId },
        });
    }

    public async listGrowers(): Promise<IGrower[]> {
        const growers = await this.prisma.grower.findMany();

        return growers.map(grower => this.convertPrismaGrowerToIGrower(grower));
    }

    public async getGrowersWithNewMarketParticipations(sessionId: string): Promise<string[]> {
        const participations = await this.prisma.marketParticipation.findMany({
            where: {
                sessionId,
                status: 'CONFIRMED',
                viewedAt: null
            },
            select: {
                growerId: true
            }
        });

        return participations.map(p => p.growerId);
    }

    public async updateGrower(props: IGrowerUpdateParams): Promise<IGrower> {
        const data: Prisma.GrowerUpdateInput = {
            name: props.name,
            email: props.email,
            phone: props.phone,
            profilePhoto: props.profilePhoto || '',
            bio: props.bio,
            approved: props.approved,
            approvedAt: props.approvedAt,
            updatedAt: props.updatedAt,
            commissionRate: props.commissionRate,
            deliveryCommissionRate: props.deliveryCommissionRate,
        };

        // Handle assignment relation if assignmentId is provided
        if (props.assignmentId !== undefined) {
            if (props.assignmentId) {
                data.assignment = {
                    connect: { id: props.assignmentId },
                };
            } else {
                data.assignment = {
                    disconnect: true,
                };
            }
        }

        // Only include siret if it's not null/undefined/empty
        if (props.siret && props.siret.trim() !== '') {
            data.siret = props.siret;
        }

        const grower = await this.prisma.grower.update({
            where: { id: props.id },
            data,
        });
        return this.convertPrismaGrowerToIGrower(grower);
    }

    public async updateGrowerApproval(props: IGrowerApprovalUpdateParams): Promise<IGrower> {
        const grower = await this.prisma.grower.update({
            where: { id: props.id },
            data: {
                approved: props.approved,
                approvedAt: props.approvedAt,
                updatedAt: props.updatedAt,
            },
        });
        return this.convertPrismaGrowerToIGrower(grower);
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
            return grower ? this.convertPrismaGrowerToIGrower(grower) : null;
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

    public async addGrowerProduct(params: {
        growerId: string;
        productId: string;
        stock: number;
        forceReplace?: boolean;
    }): Promise<IGrowerProduct> {
        // Si forceReplace est true, on utilise upsert pour écraser l'existant
        if (params.forceReplace) {
            const result = await this.prisma.growerProduct.upsert({
                where: {
                    growerId_productId: {
                        growerId: params.growerId,
                        productId: params.productId,
                    },
                },
                update: {
                    stock: params.stock,
                    updatedAt: new Date(),
                },
                create: {
                    growerId: params.growerId,
                    productId: params.productId,
                    variantId: null, // Plus de variantId spécifique, stock au niveau produit
                    stock: params.stock,
                    price: null, // Prix par défaut null, sera défini plus tard
                },
            });
            return {
                ...result,
                stock: Number(result.stock),
                price: result.price ? Number(result.price) : null,
            } as IGrowerProduct;
        }

        // Sinon, on essaie de créer normalement et on laisse l'erreur remonter
        const result = await this.prisma.growerProduct.create({
            data: {
                growerId: params.growerId,
                productId: params.productId,
                variantId: null, // Plus de variantId spécifique, stock au niveau produit
                stock: params.stock,
                price: null, // Prix par défaut null, sera défini plus tard
            },
        });
        return {
            ...result,
            stock: Number(result.stock),
            price: result.price ? Number(result.price) : null,
        } as IGrowerProduct;
    }

    public async removeGrowerProduct(params: { growerId: string; productId: string }): Promise<void> {
        await this.prisma.growerProduct.delete({
            where: {
                growerId_productId: {
                    growerId: params.growerId,
                    productId: params.productId,
                },
            },
        });
    }

    public async listGrowerProducts(growerId: string): Promise<IGrowerProductWithRelations[]> {
        // Do not include the single `variant` relation. Instead include product with all variants
        // and attach grower-specific prices so UI can rely on per-producer variant pricing.
        const rows = await this.prisma.growerProduct.findMany({
            where: { growerId },
            include: {
                product: {
                    include: {
                        variants: {
                            include: {
                                unit: true,
                                growerVariantPrices: {
                                    where: { growerId },
                                },
                            },
                        },
                    },
                },
            },
        });

        return rows.map((gp: GrowerProductWithProduct) => {
            const product = gp.product
                ? {
                      ...gp.product,
                      variants: (gp.product.variants || []).map((v: ProductVariantWithPrices) => {
                          const gvPrice = Array.isArray(v.growerVariantPrices) && v.growerVariantPrices[0]
                              ? Number(v.growerVariantPrices[0].price)
                              : undefined;
                          return {
                              ...v,
                              price: gvPrice ?? Number(v.price) ?? 0,
                              stock: Number(v.stock) ?? 0,
                              quantity: v.quantity == null ? null : Number(v.quantity),
                          };
                      }),
                  }
                : null;

            return {
                ...gp,
                product,
                stock: Number(gp.stock) ?? 0,
                price: gp.price == null ? null : Number(gp.price),
                variant: null,
            } as IGrowerProductWithRelations;
        });
    }

    public async updateGrowerProductStock(params: {
        growerId: string;
        productId: string;
        stock: number;
    }): Promise<void> {
        // Utiliser upsert pour créer l'enregistrement s'il n'existe pas
        await this.prisma.growerProduct.upsert({
            where: {
                growerId_productId: {
                    growerId: params.growerId,
                    productId: params.productId,
                },
            },
            update: {
                stock: params.stock,
            },
            create: {
                growerId: params.growerId,
                productId: params.productId,
                variantId: null, // Stock au niveau produit, pas variant
                stock: params.stock,
                price: null, // Prix par défaut null
            },
        });
    }

    public async updateGrowerProductPrice(params: {
        growerId: string;
        variantId: string;
        price: number;
    }): Promise<IGrowerProduct> {
        // Write only to growerVariantPrice (per-grower per-variant). Do not touch GrowerProduct.price/variantId
        const variant = await this.prisma.productVariant.findUnique({
            where: { id: params.variantId },
            select: { productId: true },
        });

        if (!variant) {
            throw new Error(`Variant with id ${params.variantId} not found`);
        }

        await this.prisma.growerVariantPrice.upsert({
            where: {
                growerId_variantId: {
                    growerId: params.growerId,
                    variantId: params.variantId,
                },
            },
            update: { price: params.price },
            create: { growerId: params.growerId, variantId: params.variantId, price: params.price },
        });

        // Ensure GrowerProduct exists (product-level stock holder)
        const gp = await this.prisma.growerProduct.upsert({
            where: {
                growerId_productId: {
                    growerId: params.growerId,
                    productId: variant.productId,
                },
            },
            update: {},
            create: {
                growerId: params.growerId,
                productId: variant.productId,
                stock: 0,
                price: null,
                variantId: null,
            },
        });

        return {
            ...gp,
            stock: Number(gp.stock),
            price: gp.price ? Number(gp.price) : null,
            variantId: gp.variantId || null,
        } as IGrowerProduct;
    }

    public async createGrowerProductSuggestion(
        params: IGrowerProductSuggestionCreateParams,
    ): Promise<IGrowerProductSuggestion> {
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
        const result = await this.prisma.growerStockUpdate.create({
            data: {
                growerId: params.growerId,
                productId: params.productId,
                newStock: params.newStock,
                variantPrices: params.variantPrices ? JSON.stringify(params.variantPrices) : undefined,
                reason: params.reason,
                status: params.status,
                requestDate: new Date(params.requestDate),
            },
        });
        return {
            ...result,
            currentStock: result.currentStock ? Number(result.currentStock) : undefined,
            newStock: Number(result.newStock),
            variantPrices: result.variantPrices ? JSON.parse(result.variantPrices as string) : undefined,
        } as IGrowerStockUpdate;
    }

    public async getStockUpdateRequestById(requestId: string): Promise<IGrowerStockUpdate | null> {
        const request = await this.prisma.growerStockUpdate.findUnique({
            where: { id: requestId },
        });
        if (!request) return null;
        return {
            ...request,
            currentStock: request.currentStock ? Number(request.currentStock) : undefined,
            newStock: Number(request.newStock),
            variantPrices: request.variantPrices ? JSON.parse(request.variantPrices as string) : undefined,
        } as IGrowerStockUpdate;
    }

    public async getStockUpdateRequestsByGrower(growerId: string): Promise<IGrowerStockUpdate[]> {
        const requests = await this.prisma.growerStockUpdate.findMany({
            where: {
                growerId,
                status: GrowerStockValidationStatus.PENDING,
            },
            orderBy: { createdAt: 'desc' },
        });
        return requests.map((request) => ({
            ...request,
            currentStock: request.currentStock ? Number(request.currentStock) : undefined,
            newStock: Number(request.newStock),
            variantPrices: request.variantPrices ? JSON.parse(request.variantPrices as string) : undefined,
        })) as IGrowerStockUpdate[];
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
                product: {
                    select: {
                        name: true,
                        baseUnitId: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return requests.map((request) => ({
            ...request,
            currentStock: request.currentStock ? Number(request.currentStock) : undefined,
            newStock: Number(request.newStock),
            variantPrices: request.variantPrices ? JSON.parse(request.variantPrices as string) : undefined,
        })) as IGrowerStockUpdateWithRelations[];
    }

    public async updateStockUpdateRequestStatus(params: IGrowerStockUpdateApprovalParams): Promise<IGrowerStockUpdate> {
        const result = await this.prisma.growerStockUpdate.update({
            where: { id: params.requestId },
            data: {
                status: params.status,
                adminComment: params.adminComment,
                processedDate: params.processedDate ? new Date(params.processedDate) : null,
                updatedAt: new Date(),
            },
        });
        return {
            ...result,
            currentStock: result.currentStock ? Number(result.currentStock) : undefined,
            newStock: Number(result.newStock),
            variantPrices: result.variantPrices ? JSON.parse(result.variantPrices as string) : undefined,
        } as IGrowerStockUpdate;
    }

    public async deleteStockUpdateRequest(requestId: string): Promise<void> {
        await this.prisma.growerStockUpdate.delete({
            where: { id: requestId },
        });
    }

    // Market product suggestions methods
    public async createMarketProductSuggestion(
        params: IMarketProductSuggestionCreateParams,
    ): Promise<IMarketProductSuggestion> {
        const suggestion = await this.prisma.marketProductSuggestion.create({
            data: {
                ...params,
                status: 'PENDING',
            },
        });
        return suggestion as IMarketProductSuggestion;
    }

    public async listMarketProductSuggestions(growerId: string): Promise<IMarketProductSuggestion[]> {
        const suggestions = await this.prisma.marketProductSuggestion.findMany({
            where: { growerId },
            orderBy: { createdAt: 'desc' },
        });
        return suggestions as IMarketProductSuggestion[];
    }

    public async getAllMarketProductSuggestions(): Promise<IMarketProductSuggestion[]> {
        const suggestions = await this.prisma.marketProductSuggestion.findMany({
            include: {
                grower: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return suggestions as IMarketProductSuggestion[];
    }

    public async updateMarketProductSuggestionStatus(
        params: IMarketProductSuggestionUpdateParams,
    ): Promise<IMarketProductSuggestion> {
        const suggestion = await this.prisma.marketProductSuggestion.update({
            where: { id: params.id },
            data: {
                status: params.status,
                adminComment: params.adminComment,
                processedAt: new Date(),
            },
        });
        return suggestion as IMarketProductSuggestion;
    }

    public async deleteMarketProductSuggestion(id: string): Promise<void> {
        await this.prisma.marketProductSuggestion.delete({
            where: { id },
        });
    }

    public async findActiveOrUpcomingMarketSession(): Promise<import('./IGrowerRepository').IMarketSession | null> {
        const session = await this.prisma.marketSession.findFirst({
            where: {
                OR: [{ status: 'ACTIVE' }, { status: 'UPCOMING' }],
            },
            orderBy: [
                { status: 'desc' }, // ACTIVE en premier
                { date: 'asc' }, // Puis par date croissante
            ],
        });

        if (!session) {
            return null;
        }

        return {
            id: session.id,
            name: session.name,
            date: session.date,
            status: session.status,
        };
    }

    public async createMarketProductFromSuggestion(
        params: import('./IGrowerRepository').ICreateMarketProductFromSuggestionParams,
    ): Promise<void> {
        // Vérifier si le produit existe déjà dans le stand pour cette session
        const existingProduct = await this.prisma.marketProduct.findFirst({
            where: {
                growerId: params.growerId,
                name: params.name,
                marketSessionId: params.marketSessionId,
            },
        });

        if (existingProduct) {
            console.warn(`Le produit "${params.name}" existe déjà dans le stand pour cette session. Création ignorée.`);
            return;
        }

        await this.prisma.marketProduct.create({
            data: {
                name: params.name,
                description: params.description,
                imageUrl: params.imageUrl,
                price: params.price,
                stock: params.stock,
                unit: params.unit,
                category: params.category,
                marketSessionId: params.marketSessionId,
                growerId: params.growerId,
                isActive: params.isActive,
                sourceType: 'SUGGESTION',
                suggestionId: params.suggestionId,
            },
        });
    }

    public async markMarketParticipationAsViewed(sessionId: string, growerId: string): Promise<void> {
        await this.prisma.marketParticipation.updateMany({
            where: {
                sessionId: sessionId,
                growerId: growerId,
            },
            data: {
                viewedAt: new Date(),
            },
        });
    }
}
