import { PasswordService } from '@/server/services/PasswordService';
import { PrismaClient } from '@prisma/client';
import { IGrower } from './IGrower';
import {
    IGrowerCreateParams,
    IGrowerProductSuggestionCreateParams,
    IGrowerRepository,
    IGrowerUpdateParams,
} from './IGrowerRepository';

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
                profilePhoto: props.profilePhoto || '',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        });
    }

    public async updatePassword(growerId: string, newPassword: string): Promise<void> {
        const hashedPassword = await this.passwordService.hash(newPassword);
        await this.prisma.grower.update({
            where: { id: growerId },
            data: {
                password: hashedPassword,
                updatedAt: new Date(),
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
                updatedAt: new Date(),
            },
        });
    }

    public async addGrowerProduct(params: { growerId: string; productId: string; variantId: string; stock: number }) {
        return this.prisma.growerProduct.create({
            data: {
                growerId: params.growerId,
                productId: params.productId,
                variantId: params.variantId,
                stock: params.stock,
            },
        });
    }

    public async removeGrowerProduct(params: { growerId: string; variantId: string }) {
        return this.prisma.growerProduct.delete({
            where: {
                growerId_variantId: {
                    growerId: params.growerId,
                    variantId: params.variantId,
                },
            },
        });
    }

    public async listGrowerProducts(growerId: string) {
        return this.prisma.growerProduct.findMany({
            where: { growerId },
            include: {
                product: true,
                variant: true,
            },
        });
    }

    public async updateGrowerProductStock(params: { growerId: string; variantId: string; stock: number }) {
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
        });
    }

    public async createGrowerProductSuggestion(params: IGrowerProductSuggestionCreateParams) {
        return this.prisma.growerProductSuggestion.create({
            data: {
                growerId: params.growerId,
                name: params.name,
                description: params.description,
                pricing: params.pricing ?? '',
            },
        });
    }

    public async listGrowerProductSuggestions(growerId: string) {
        return this.prisma.growerProductSuggestion.findMany({
            where: { growerId },
            orderBy: { createdAt: 'desc' },
        });
    }

    public async deleteGrowerProductSuggestion(id: string) {
        return this.prisma.growerProductSuggestion.delete({
            where: { id },
        });
    }
}
