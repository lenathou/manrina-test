import { IGrowerProductSuggestionCreateParams } from '@/server/grower/IGrowerRepository';
import { backendFetchService } from '@/service/BackendFetchService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const GROWER_PRODUCT_SUGGESTIONS_QUERY_KEY = 'grower-product-suggestions';

export function useGrowerProductSuggestion(growerId?: string) {
    const queryClient = useQueryClient();

    // List suggestions
    const {
        data: suggestions = [],
        isLoading: isLoadingSuggestions,
        refetch: refetchSuggestions,
    } = useQuery({
        queryKey: [GROWER_PRODUCT_SUGGESTIONS_QUERY_KEY, growerId],
        queryFn: async () => {
            if (!growerId) return [];
            return backendFetchService.listGrowerProductSuggestions(growerId);
        },
        enabled: !!growerId,
    });

    // Create suggestion
    const createSuggestion = useMutation({
        mutationFn: async (params: IGrowerProductSuggestionCreateParams) => {
            return backendFetchService.createGrowerProductSuggestion(params);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [GROWER_PRODUCT_SUGGESTIONS_QUERY_KEY, growerId] });
        },
    });

    // Delete suggestion
    const deleteSuggestion = useMutation({
        mutationFn: async (id: string) => {
            return backendFetchService.deleteGrowerProductSuggestion(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [GROWER_PRODUCT_SUGGESTIONS_QUERY_KEY, growerId] });
        },
    });

    return {
        suggestions,
        isLoadingSuggestions,
        refetchSuggestions,
        createSuggestion,
        deleteSuggestion,
    };
}
