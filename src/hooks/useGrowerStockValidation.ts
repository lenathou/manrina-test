import { IGrowerStockUpdate, IGrowerStockUpdateCreateParams, GrowerStockValidationStatus } from '@/server/grower/IGrowerStockValidation';

// Interface étendue pour les données avec relations
export interface IGrowerStockUpdateWithRelations extends IGrowerStockUpdate {
    grower: {
        name: string;
        email: string;
    };
    product: {
        baseUnitId: string | null;
        name: string;
    };
}
import { backendFetchService } from '@/service/BackendFetchService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const GROWER_STOCK_VALIDATION_QUERY_KEY = 'grower-stock-validation';

export function useGrowerStockValidation(growerId: string | undefined) {
    const queryClient = useQueryClient();

    // Récupérer les demandes de validation en attente pour un producteur
    const {
        data: pendingStockUpdates = [],
        isLoading,
        refetch,
    } = useQuery<IGrowerStockUpdate[]>({
        queryKey: [GROWER_STOCK_VALIDATION_QUERY_KEY, growerId],
        queryFn: async () => {
            if (!growerId) return [];
            return backendFetchService.getGrowerPendingStockRequests(growerId);
        },
        enabled: !!growerId,
    });

    // Créer une demande de mise à jour de stock
    const createStockUpdateRequest = useMutation({
        mutationFn: async (params: IGrowerStockUpdateCreateParams) => {
            return backendFetchService.createGrowerStockUpdateRequest(params);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [GROWER_STOCK_VALIDATION_QUERY_KEY, growerId] });
        },
    });

    // Annuler une demande en attente
    const cancelStockUpdateRequest = useMutation({
        mutationFn: async (requestId: string) => {
            return backendFetchService.cancelGrowerStockUpdateRequest(requestId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [GROWER_STOCK_VALIDATION_QUERY_KEY, growerId] });
        },
    });

    // Fonction utilitaire pour obtenir la demande en attente pour un produit
    const getPendingUpdateForProduct = (productId: string): IGrowerStockUpdate | undefined => {
        return pendingStockUpdates.find(
            update => update.productId === productId && update.status === GrowerStockValidationStatus.PENDING
        );
    };

    // Fonction utilitaire pour vérifier si un produit a une demande en attente
    const hasPendingUpdate = (productId: string): boolean => {
        return !!getPendingUpdateForProduct(productId);
    };

    return {
        pendingStockUpdates,
        isLoading,
        refetch,
        createStockUpdateRequest,
        cancelStockUpdateRequest,
        getPendingUpdateForProduct,
        hasPendingUpdate,
    };
}

// Hook pour les administrateurs pour gérer les validations
export function useAdminStockValidation() {
    const queryClient = useQueryClient();

    // Récupérer toutes les demandes en attente
    const {
        data: allPendingUpdates = [],
        isLoading,
        refetch,
    } = useQuery<IGrowerStockUpdateWithRelations[]>({
        queryKey: ['admin-stock-validation'],
        queryFn: async () => {
            return backendFetchService.getAllPendingStockRequests();
        },
    });

    // Approuver ou rejeter une demande
    const processStockUpdateRequest = useMutation({
        mutationFn: async (params: {
            requestId: string;
            status: GrowerStockValidationStatus.APPROVED | GrowerStockValidationStatus.REJECTED;
            adminComment?: string;
            approvedBy: string;
        }) => {
            if (params.status === GrowerStockValidationStatus.APPROVED) {
                return backendFetchService.approveStockUpdateRequest(params.requestId, params.adminComment);
            } else {
                return backendFetchService.rejectStockUpdateRequest(params.requestId, params.adminComment);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-stock-validation'] });
            // Invalider aussi les données des producteurs
            queryClient.invalidateQueries({ queryKey: [GROWER_STOCK_VALIDATION_QUERY_KEY] });
            // Invalider les caches du stock global pour mettre à jour l'affichage
            queryClient.invalidateQueries({ queryKey: ['grower-stocks-for-product'] });
            queryClient.invalidateQueries({ queryKey: ['global-stock'] });
            queryClient.invalidateQueries({ queryKey: ['product-global-stock'] });
            queryClient.invalidateQueries({ queryKey: ['stock-products-all'] });
            queryClient.invalidateQueries({ queryKey: ['grower-product-stocks'] });
        },
    });

    return {
        allPendingUpdates,
        pendingRequests: allPendingUpdates,
        isLoading,
        refetch,
        processStockUpdateRequest,
    };
}