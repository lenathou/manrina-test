import { PrismaClient } from '@prisma/client';
import { IMarketAnnouncementRepository } from './IMarketAnnouncementRepository';
import { MarketAnnouncement, CreateMarketAnnouncementInput, UpdateMarketAnnouncementInput, MarketAnnouncementFilters } from './IMarketAnnouncement';

export class MarketAnnouncementRepositoryPrismaImplementation implements IMarketAnnouncementRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(filters?: MarketAnnouncementFilters): Promise<MarketAnnouncement[]> {
    const where: Record<string, unknown> = {};

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters?.priority) {
      where.priority = filters.priority;
    }

    if (filters?.publishedAfter || filters?.publishedBefore) {
      where.publishedAt = {};
      if (filters.publishedAfter) {
        (where.publishedAt as Record<string, unknown>).gte = filters.publishedAfter;
      }
      if (filters.publishedBefore) {
        (where.publishedAt as Record<string, unknown>).lte = filters.publishedBefore;
      }
    }

    return this.prisma.marketAnnouncement.findMany({
      where,
      orderBy: [
        { priority: 'desc' },
        { publishedAt: 'desc' }
      ]
    });
  }

  async findById(id: string): Promise<MarketAnnouncement | null> {
    return this.prisma.marketAnnouncement.findUnique({
      where: { id }
    });
  }

  async create(data: CreateMarketAnnouncementInput): Promise<MarketAnnouncement> {
    return this.prisma.marketAnnouncement.create({
      data
    });
  }

  async update(id: string, data: UpdateMarketAnnouncementInput): Promise<MarketAnnouncement> {
    return this.prisma.marketAnnouncement.update({
      where: { id },
      data
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.marketAnnouncement.delete({
      where: { id }
    });
  }

  async findActive(): Promise<MarketAnnouncement[]> {
    return this.findAll({ isActive: true });
  }
}