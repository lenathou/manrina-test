🔧 Tâche : extraire la logique de validation des mises à jour de stock

Nous continuons la refactorisation de ApiUseCases.ts pour isoler la partie “validation de stock” effectuée par les administrateurs.

🎯 Objectif :
Créer un nouveau fichier :

src/server/admin/usecases/AdminStockValidationUseCases.ts


et y déplacer les deux méthodes suivantes :

approveStockUpdateRequest

rejectStockUpdateRequest

Ces deux méthodes se trouvent actuellement dans ApiUseCases.ts.

Étapes détaillées :

Créer le fichier :

src/server/admin/usecases/AdminStockValidationUseCases.ts


Déplacer ces deux méthodes depuis ApiUseCases.ts :

public approveStockUpdateRequest = async (requestId: string, adminComment?: string) => {
  const request = await this.growerUseCases.getStockUpdateRequestById(requestId);
  if (!request) {
    throw new Error('Stock update request not found');
  }

  const result = await this.growerUseCases.approveStockUpdateRequest(requestId, adminComment);

  const allGrowerProducts = await this.prisma.growerProduct.findMany({
    where: { productId: request.productId, variantId: null },
    select: { stock: true },
  });

  const newGlobalStock = allGrowerProducts.reduce((total, gp) => total + Number(gp.stock), 0);

  await this.stockUseCases.adjustGlobalStock({
    productId: request.productId,
    newGlobalStock: newGlobalStock,
    reason: `Recalcul après validation de demande de stock (producteur: ${request.growerId})`,
    adjustedBy: 'admin',
  });

  return result;
};

public rejectStockUpdateRequest = async (requestId: string, adminComment?: string) => {
  return this.growerUseCases.rejectStockUpdateRequest(requestId, adminComment);
};


Créer une nouvelle classe :

import { GrowerUseCases } from '@/server/grower/GrowerUseCases';
import { StockUseCases } from '@/server/stock/StockUseCases';
import { PrismaClient } from '@prisma/client';

export class AdminStockValidationUseCases {
  constructor(
    private growerUseCases: GrowerUseCases,
    private stockUseCases: StockUseCases,
    private prisma: PrismaClient,
  ) {}

  async approveStockUpdateRequest(requestId: string, adminComment?: string) {
    const request = await this.growerUseCases.getStockUpdateRequestById(requestId);
    if (!request) {
      throw new Error('Stock update request not found');
    }

    const result = await this.growerUseCases.approveStockUpdateRequest(requestId, adminComment);

    const allGrowerProducts = await this.prisma.growerProduct.findMany({
      where: { productId: request.productId, variantId: null },
      select: { stock: true },
    });

    const newGlobalStock = allGrowerProducts.reduce((total, gp) => total + Number(gp.stock), 0);

    await this.stockUseCases.adjustGlobalStock({
      productId: request.productId,
      newGlobalStock,
      reason: `Recalcul après validation admin (${request.growerId})`,
      adjustedBy: 'admin',
    });

    return result;
  }

  async rejectStockUpdateRequest(requestId: string, adminComment?: string) {
    return this.growerUseCases.rejectStockUpdateRequest(requestId, adminComment);
  }
}


Modifier ApiUseCases.ts :

Importer la nouvelle classe :

import { AdminStockValidationUseCases } from '@/server/admin/usecases/AdminStockValidationUseCases';


Ajouter une propriété privée :

private adminStockValidationUseCases: AdminStockValidationUseCases;


L’initialiser dans le constructeur :

this.adminStockValidationUseCases = new AdminStockValidationUseCases(
  this.growerUseCases,
  this.stockUseCases,
  this.prisma,
);


Remplacer les anciennes méthodes supprimées par des redirections :

public approveStockUpdateRequest = (requestId: string, adminComment?: string) => {
  return this.adminStockValidationUseCases.approveStockUpdateRequest(requestId, adminComment);
};

public rejectStockUpdateRequest = (requestId: string, adminComment?: string) => {
  return this.adminStockValidationUseCases.rejectStockUpdateRequest(requestId, adminComment);
};


Supprimer les définitions originales de ces deux méthodes dans ApiUseCases.ts.

Vérifier les imports et nettoyages :

S’assurer que GrowerUseCases, StockUseCases, PrismaClient sont importés correctement dans le nouveau fichier.

Supprimer toute dépendance inutile dans ApiUseCases.ts si elle n’est plus utilisée directement.

✅ Objectif final :

Le comportement des validations de stock reste identique.

ApiUseCases ne gère plus la logique métier du recalcul du stock.

La logique est maintenant dans AdminStockValidationUseCases.

Code plus clair, mieux segmenté, plus testable.

🧾 À la fin, fournis :

Le code complet de AdminStockValidationUseCases.ts.

Un résumé clair des changements dans ApiUseCases.ts (imports ajoutés, méthodes supprimées, initialisation du use case, etc.).