import { MarketAnnouncement, CreateMarketAnnouncementInput, UpdateMarketAnnouncementInput, MarketAnnouncementFilters } from './IMarketAnnouncement';

export interface IMarketAnnouncementRepository {
  findAll(filters?: MarketAnnouncementFilters): Promise<MarketAnnouncement[]>;
  findById(id: string): Promise<MarketAnnouncement | null>;
  create(data: CreateMarketAnnouncementInput): Promise<MarketAnnouncement>;
  update(id: string, data: UpdateMarketAnnouncementInput): Promise<MarketAnnouncement>;
  delete(id: string): Promise<void>;
  findActive(): Promise<MarketAnnouncement[]>;
}