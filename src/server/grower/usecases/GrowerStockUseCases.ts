import { GrowerUseCases } from '@/server/grower/GrowerUseCases';
import { AdminStockValidationUseCases } from '@/server/admin/usecases/AdminStockValidationUseCases';
import { ProductUseCases } from '@/server/product/ProductUseCases';
import { PrismaClient } from '@prisma/client';

export class GrowerStockUseCases {
    constructor(
        private growerUseCases: GrowerUseCases,
        private adminStockValidationUseCases: AdminStockValidationUseCases,
        private productUseCases: ProductUseCases,
        private prisma: PrismaClient
    ) {}

    public createGrowerStockUpdateRequest = async (params: {
        growerId: string;
        productId: string;
        newStock: number;
        variantPrices?: Array<{ variantId: string; newPrice: number }>;
        reason: string;
        status: 'PENDING' | 'APPROVED' | 'REJECTED';
        requestDate: string;
    }) => {
        return this.growerUseCases.createStockUpdateRequest(params);
    };

    public cancelGrowerStockUpdateRequest = async (requestId: string) => {
        return this.growerUseCases.cancelStockUpdateRequest(requestId);
    };

    public getGrowerPendingStockRequests = async (growerId: string) => {
        return this.growerUseCases.getPendingStockRequests(growerId);
    };

    public getAllPendingStockRequests = async (): Promise<
        import('@/hooks/useGrowerStockValidation').IGrowerStockUpdateWithRelations[]
    > => {
        return this.growerUseCases.getAllPendingStockRequests();
    };

    public approveStockUpdateRequest = (requestId: string, adminComment?: string) => {
        return this.adminStockValidationUseCases.approveStockUpdateRequest(requestId, adminComment);
    };

    public rejectStockUpdateRequest = (requestId: string, adminComment?: string) => {
        return this.adminStockValidationUseCases.rejectStockUpdateRequest(requestId, adminComment);
    };

    public updateGrowerProductStock = async (params: { growerId: string; productId: string; stock: number }) => {
        return this.growerUseCases.updateGrowerProductStock(params);
    };

    public getGrowerStockPageData = async (growerId: string) => {
        // Exécuter toutes les requêtes en parallèle pour optimiser les performances
        const [growerProducts, allProducts, units, allPendingStockRequests] = await Promise.all([
            // Récupérer les produits du producteur avec leurs variants
            this.growerUseCases.listGrowerProducts(growerId),
            // Récupérer tous les produits disponibles
            this.productUseCases.getAllProducts(),
            // Récupérer les unités
            this.productUseCases.getAllUnits(),
            // Récupérer toutes les demandes de validation de stock en attente avec relations
            this.growerUseCases.getAllPendingStockRequests(),
        ]);

        // Filtrer les demandes pour ce producteur spécifique
        const pendingStockRequests = allPendingStockRequests.filter((request) => request.growerId === growerId);

        return {
            growerProducts,
            allProducts,
            units,
            pendingStockRequests,
        };
    };

    // Méthode optimisée pour mettre à jour les prix de plusieurs variants en une fois
    public updateMultipleVariantPrices = async (params: {
        growerId: string;
        variantPrices: Array<{ variantId: string; price: number | null }>;
    }) => {
        const { growerId, variantPrices } = params;

        // Utiliser une transaction pour s'assurer que toutes les mises à jour sont atomiques
        const results = await this.prisma.$transaction(
            variantPrices.map(({ variantId, price }) => {
                if (price === null) {
                    // Variant désactivé : supprimer l'entrée de prix
                    return this.prisma.growerVariantPrice.deleteMany({
                        where: {
                            growerId,
                            variantId,
                        },
                    });
                } else {
                    // Variant actif : créer ou mettre à jour le prix
                    return this.prisma.growerVariantPrice.upsert({
                        where: {
                            growerId_variantId: {
                                growerId,
                                variantId,
                            },
                        },
                        update: { price },
                        create: { growerId, variantId, price },
                    });
                }
            }),
        );

        return results;
    };
}