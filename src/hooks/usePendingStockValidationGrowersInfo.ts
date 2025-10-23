import { useQuery } from '@tanstack/react-query';
import { backendFetchService } from '@/service/BackendFetchService';

/**
 * Interface pour les informations sur les producteurs ayant des demandes en attente
 */
export interface GrowerWithPendingRequests {
    growerId: string;
    growerName: string;
    growerEmail: string;
    pendingRequestsCount: number;
    productsCount: number; // Nombre de produits différents concernés
}

/**
 * Hook pour récupérer des informations détaillées sur les producteurs ayant des demandes de validation en attente
 * Utile pour afficher des détails dans les tooltips ou modals
 */
export const usePendingStockValidationGrowersInfo = ({ enabled = true }: { enabled?: boolean } = {}) => {
    return useQuery({
        queryKey: ['pendingStockValidationGrowersInfo'],
        queryFn: () => backendFetchService.getAllPendingStockRequests(),
        select: (data): GrowerWithPendingRequests[] => {
            // Grouper les demandes par producteur
            const growersMap = new Map<string, GrowerWithPendingRequests>();

            data.forEach(request => {
                const growerId = request.growerId;
                
                if (!growersMap.has(growerId)) {
                    growersMap.set(growerId, {
                        growerId,
                        growerName: request.grower.name,
                        growerEmail: request.grower.email,
                        pendingRequestsCount: 0,
                        productsCount: 0,
                    });
                }

                const growerInfo = growersMap.get(growerId)!;
                growerInfo.pendingRequestsCount++;
            });

            // Calculer le nombre de produits uniques par producteur
            growersMap.forEach((growerInfo, growerId) => {
                const growerRequests = data.filter(request => request.growerId === growerId);
                const uniqueProducts = new Set(growerRequests.map(request => request.productId));
                growerInfo.productsCount = uniqueProducts.size;
            });

            return Array.from(growersMap.values())
                .sort((a, b) => b.pendingRequestsCount - a.pendingRequestsCount); // Trier par nombre de demandes décroissant
        },
        refetchInterval: 120000, // 2 minutes
        staleTime: 90000, // 90 secondes
        refetchOnWindowFocus: false,
        enabled,
        networkMode: 'online', // Seulement quand en ligne
        meta: {
            priority: 'low', // Priorité basse pour ne pas interférer
        },
    });
};