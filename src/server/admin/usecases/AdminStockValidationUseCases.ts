import { GrowerUseCases } from '@/server/grower/GrowerUseCases';
import { StockUseCases } from '@/server/stock/StockUseCases';
import { PrismaClient } from '@prisma/client';

export class AdminStockValidationUseCases {
  constructor(
    private growerUseCases: GrowerUseCases,
    private stockUseCases: StockUseCases,
    private prisma: PrismaClient
  ) {}

  async approveStockUpdateRequest(requestId: string, adminComment?: string) {
    // Récupérer les détails de la demande avant approbation
    const request = await this.growerUseCases.getStockUpdateRequestById(requestId);
    if (!request) {
      throw new Error('Stock update request not found');
    }

    // Approuver la demande (met à jour le stock du producteur avec la nouvelle valeur)
    const result = await this.growerUseCases.approveStockUpdateRequest(requestId, adminComment);

    // Recalculer le stock global en sommant tous les stocks des producteurs pour ce produit
    const allGrowerProducts = await this.prisma.growerProduct.findMany({
      where: {
        productId: request.productId,
        variantId: null, // Seulement les stocks de produits, pas de variants
      },
      select: {
        stock: true,
      },
    });

    // Calculer le nouveau stock global total
    const newGlobalStock = allGrowerProducts.reduce((total, gp) => total + Number(gp.stock), 0);

    // Mettre à jour le stock global du produit avec la valeur recalculée
    await this.stockUseCases.adjustGlobalStock({
      productId: request.productId,
      newGlobalStock: newGlobalStock,
      reason: `Recalcul après validation de demande de stock (producteur: ${request.growerId})`,
      adjustedBy: 'admin',
    });

    return result;
  }

  async rejectStockUpdateRequest(requestId: string, adminComment?: string) {
    return this.growerUseCases.rejectStockUpdateRequest(requestId, adminComment);
  }
}