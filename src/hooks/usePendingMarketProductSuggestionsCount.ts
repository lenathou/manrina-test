import { useQuery } from '@tanstack/react-query';
import { backendFetchService } from '@/service/BackendFetchService';
import { IMarketProductSuggestion } from '@/server/grower/IGrower';

/**
 * Hook pour récupérer le nombre de suggestions de produits de marché en attente
 * Utilisé pour afficher des badges de notification dans la sidebar admin
 */
export const usePendingMarketProductSuggestionsCount = () => {
    return useQuery<number>({
        queryKey: ['admin', 'pending-market-product-suggestions-count'],
        queryFn: async () => {
            const suggestions: IMarketProductSuggestion[] = await backendFetchService.getAllMarketProductSuggestions();
            
            // Compter uniquement les suggestions avec le statut PENDING
            const pendingCount = suggestions.filter(suggestion => suggestion.status === 'PENDING').length;
            
            return pendingCount;
        },
        refetchInterval: 120000, // Rafraîchir toutes les 2 minutes au lieu de 30 secondes
        staleTime: 90000, // 90 secondes - cohérent avec les autres hooks
        gcTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false, // Désactiver le refetch au focus
    });
};