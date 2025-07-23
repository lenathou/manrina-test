import { PrismaClient } from '@prisma/client';

export interface IProductHistoryRepository {
    logProductUpdate(type: string, changes: any): Promise<void>;
}

export class ProductHistoryRepositoryPrismaImplementation implements IProductHistoryRepository {
    constructor(private prisma: PrismaClient) {}

    async logProductUpdate(type: string, changes: any): Promise<void> {
        await this.prisma.productUpdateHistory.create({
            data: {
                type,
                changes,
            },
        });
    }
}
