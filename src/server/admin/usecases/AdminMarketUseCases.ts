import { MarketUseCases } from '@/server/market/MarketUseCases';
import { CreateMarketAnnouncementInput, UpdateMarketAnnouncementInput } from '@/server/market/IMarketAnnouncement';

export class AdminMarketUseCases {
  constructor(private marketUseCases: MarketUseCases) {}

  createMarketAnnouncement = (data: CreateMarketAnnouncementInput) => this.marketUseCases.createAnnouncement(data);
  updateMarketAnnouncement = (id: string, data: UpdateMarketAnnouncementInput) => this.marketUseCases.updateAnnouncement(id, data);
  deleteMarketAnnouncement = (id: string) => this.marketUseCases.deleteAnnouncement(id);
  activateMarketAnnouncement = (id: string) => this.marketUseCases.activateAnnouncement(id);
  deactivateMarketAnnouncement = (id: string) => this.marketUseCases.deactivateAnnouncement(id);
}