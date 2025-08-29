import { PrismaClient, Prisma } from '@prisma/client';
import { IAssignment, IAssignmentCreateInput, IAssignmentUpdateInput, IAssignmentFilters } from './IAssignment';
import { IAssignmentRepository } from './IAssignmentRepository';

export class AssignmentRepository implements IAssignmentRepository {
    constructor(private prisma: PrismaClient) {}

    async findAll(filters?: IAssignmentFilters): Promise<IAssignment[]> {
        const where: Prisma.AssignmentWhereInput = {};

        if (filters?.isActive !== undefined) {
            where.isActive = filters.isActive;
        }

        if (filters?.search) {
            where.OR = [
                { name: { contains: filters.search, mode: 'insensitive' } },
                { description: { contains: filters.search, mode: 'insensitive' } },
            ];
        }

        return this.prisma.assignment.findMany({
            where,
            orderBy: { name: 'asc' },
        });
    }

    async findById(id: string): Promise<IAssignment | null> {
        return this.prisma.assignment.findUnique({
            where: { id },
        });
    }

    async create(data: IAssignmentCreateInput): Promise<IAssignment> {
        return this.prisma.assignment.create({
            data,
        });
    }

    async update(id: string, data: IAssignmentUpdateInput): Promise<IAssignment> {
        return this.prisma.assignment.update({
            where: { id },
            data,
        });
    }

    async delete(id: string): Promise<void> {
        await this.prisma.assignment.delete({
            where: { id },
        });
    }

    async findByName(name: string): Promise<IAssignment | null> {
        return this.prisma.assignment.findFirst({
            where: { name: { equals: name, mode: 'insensitive' } },
        });
    }
}