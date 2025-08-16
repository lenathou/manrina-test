import { MarketAnnouncementPriority } from '@prisma/client';
import { IMarketAnnouncementRepository } from './IMarketAnnouncementRepository';
import { MarketAnnouncement, CreateMarketAnnouncementInput, UpdateMarketAnnouncementInput, MarketAnnouncementFilters } from './IMarketAnnouncement';

export class MarketUseCases {
  constructor(private marketAnnouncementRepository: IMarketAnnouncementRepository) {}

  async getActiveAnnouncements(): Promise<MarketAnnouncement[]> {
    const announcements = await this.marketAnnouncementRepository.findActive();
    
    // Trier par priorité (HIGH > MEDIUM > LOW) puis par date de publication (plus récent en premier)
    return announcements.sort((a, b) => {
      const priorityOrder: Record<MarketAnnouncementPriority, number> = {
        HIGH: 3,
        MEDIUM: 2,
        LOW: 1
      };
      
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      
      if (priorityDiff !== 0) {
        return priorityDiff;
      }
      
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });
  }

  async getAllAnnouncements(filters?: MarketAnnouncementFilters): Promise<MarketAnnouncement[]> {
    return this.marketAnnouncementRepository.findAll(filters);
  }

  async getAnnouncementById(id: string): Promise<MarketAnnouncement | null> {
    return this.marketAnnouncementRepository.findById(id);
  }

  async createAnnouncement(data: CreateMarketAnnouncementInput): Promise<MarketAnnouncement> {
    // Validation des données
    if (!data.title?.trim()) {
      throw new Error('Le titre de l\'annonce est requis');
    }

    if (!data.content?.trim()) {
      throw new Error('Le contenu de l\'annonce est requis');
    }

    if (data.title.length > 200) {
      throw new Error('Le titre ne peut pas dépasser 200 caractères');
    }

    if (data.content.length > 2000) {
      throw new Error('Le contenu ne peut pas dépasser 2000 caractères');
    }

    return this.marketAnnouncementRepository.create(data);
  }

  async updateAnnouncement(id: string, data: UpdateMarketAnnouncementInput): Promise<MarketAnnouncement> {
    const existingAnnouncement = await this.marketAnnouncementRepository.findById(id);
    if (!existingAnnouncement) {
      throw new Error('Annonce non trouvée');
    }

    // Validation des données si elles sont fournies
    if (data.title !== undefined) {
      if (!data.title.trim()) {
        throw new Error('Le titre de l\'annonce ne peut pas être vide');
      }
      if (data.title.length > 200) {
        throw new Error('Le titre ne peut pas dépasser 200 caractères');
      }
    }

    if (data.content !== undefined) {
      if (!data.content.trim()) {
        throw new Error('Le contenu de l\'annonce ne peut pas être vide');
      }
      if (data.content.length > 2000) {
        throw new Error('Le contenu ne peut pas dépasser 2000 caractères');
      }
    }

    return this.marketAnnouncementRepository.update(id, data);
  }

  async deleteAnnouncement(id: string): Promise<void> {
    const existingAnnouncement = await this.marketAnnouncementRepository.findById(id);
    if (!existingAnnouncement) {
      throw new Error('Annonce non trouvée');
    }

    await this.marketAnnouncementRepository.delete(id);
  }

  async deactivateAnnouncement(id: string): Promise<MarketAnnouncement> {
    return this.updateAnnouncement(id, { isActive: false });
  }

  async activateAnnouncement(id: string): Promise<MarketAnnouncement> {
    return this.updateAnnouncement(id, { isActive: true });
  }
}