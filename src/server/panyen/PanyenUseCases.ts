import { IPanyenRepository } from './PanyenRepository';
import { IPanyenProduct, IPanyenCreateInput, IPanyenUpdateInput } from './IPanyen';

export class PanyenUseCases {
  constructor(private panyenRepository: IPanyenRepository) {}

  async getAllPanyen(): Promise<IPanyenProduct[]> {
    return this.panyenRepository.findAll();
  }

  async getPanyenById(id: string): Promise<IPanyenProduct | null> {
    return this.panyenRepository.findById(id);
  }

  async createPanyen(data: IPanyenCreateInput): Promise<IPanyenProduct> {
    // Validation
    if (!data.name.trim()) {
      throw new Error('Le nom du panyen est requis');
    }

    if (!data.imageUrl.trim()) {
      throw new Error('L\'URL de l\'image est requise');
    }

    if (!data.components || data.components.length === 0) {
      throw new Error('Au moins un composant est requis');
    }

    // Vérifier que les quantités sont valides (permettre 0 pour les admins)
    for (const component of data.components) {
      if (component.quantity < 0) {
        throw new Error('La quantité de chaque composant ne peut pas être négative');
      }
    }

    return this.panyenRepository.create(data);
  }

  async updatePanyen(id: string, data: IPanyenUpdateInput): Promise<IPanyenProduct> {
    const existingPanyen = await this.panyenRepository.findById(id);
    if (!existingPanyen) {
      throw new Error('Panyen non trouvé');
    }

    // Validation
    if (data.name !== undefined && !data.name.trim()) {
      throw new Error('Le nom du panyen ne peut pas être vide');
    }

    if (data.imageUrl !== undefined && !data.imageUrl.trim()) {
      throw new Error('L\'URL de l\'image ne peut pas être vide');
    }

    if (data.components !== undefined) {
      if (data.components.length === 0) {
        throw new Error('Au moins un composant est requis');
      }

      // Vérifier que les quantités sont valides (permettre 0 pour les admins)
      for (const component of data.components) {
        if (component.quantity < 0) {
          throw new Error('La quantité de chaque composant ne peut pas être négative');
        }
      }
    }

    return this.panyenRepository.update(id, data);
  }

  async deletePanyen(id: string): Promise<void> {
    const existingPanyen = await this.panyenRepository.findById(id);
    if (!existingPanyen) {
      throw new Error('Panyen non trouvé');
    }

    return this.panyenRepository.delete(id);
  }

  async calculatePanyenStock(id: string): Promise<number> {
    return this.panyenRepository.calculateStock(id);
  }

  async getAllPanyenWithCalculatedStock(): Promise<(IPanyenProduct & { calculatedStock: number })[]> {
    const panyenProducts = await this.panyenRepository.findAll();
    
    const panyenWithStock = await Promise.all(
      panyenProducts.map(async (panyen) => {
        const calculatedStock = await this.calculatePanyenStock(panyen.id);
        return {
          ...panyen,
          calculatedStock
        };
      })
    );

    return panyenWithStock;
  }
}