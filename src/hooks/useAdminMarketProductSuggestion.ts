import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { backendFetchService } from '@/service/BackendFetchService';
import { IMarketProductSuggestion } from '@/server/grower/IGrower';

// Hook pour récupérer toutes les suggestions de produits de marché (admin)
export const useAllMarketProductSuggestions = () => {
    return useQuery<IMarketProductSuggestion[]>({
        queryKey: ['admin', 'market-product-suggestions'],
        queryFn: async () => {
            return await backendFetchService.getAllMarketProductSuggestions();
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    });
};

// Hook pour mettre à jour le statut d'une suggestion (admin)
export const useUpdateMarketProductSuggestionStatus = () => {
    const queryClient = useQueryClient();
    
    return useMutation<
        IMarketProductSuggestion,
        Error,
        { id: string; status: 'APPROVED' | 'REJECTED'; adminComment?: string }
    >({
        mutationFn: async ({ id, status, adminComment }) => {
            return await backendFetchService.updateMarketProductSuggestionStatus(id, status, adminComment);
        },
        onSuccess: () => {
            // Invalider le cache pour rafraîchir la liste
            queryClient.invalidateQueries({ queryKey: ['admin', 'market-product-suggestions'] });
        },
    });
};