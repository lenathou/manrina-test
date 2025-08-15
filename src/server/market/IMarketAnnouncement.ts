import { MarketAnnouncementPriority } from '@prisma/client';

// Export MarketAnnouncement type directly from Prisma
export type { MarketAnnouncement } from '@prisma/client';

export interface CreateMarketAnnouncementInput {
  title: string;
  content: string;
  priority?: MarketAnnouncementPriority;
  publishedAt?: Date;
}

export interface UpdateMarketAnnouncementInput {
  title?: string;
  content?: string;
  priority?: MarketAnnouncementPriority;
  publishedAt?: Date;
  isActive?: boolean;
}

export interface MarketAnnouncementFilters {
  isActive?: boolean;
  priority?: MarketAnnouncementPriority;
  publishedAfter?: Date;
  publishedBefore?: Date;
}