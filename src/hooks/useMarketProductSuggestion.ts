import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { backendFetchService } from '@/service/BackendFetchService';
import { IMarketProductSuggestionCreateParams, IMarketProductSuggestionUpdateParams } from '@/server/grower/IGrowerRepository';
import { IMarketProductSuggestion } from '@/server/grower/IGrower';

const MARKET_PRODUCT_SUGGESTIONS_QUERY_KEY = 'marketProductSuggestions';

export const useMarketProductSuggestions = (growerId: string) => {
    return useQuery({
        queryKey: [MARKET_PRODUCT_SUGGESTIONS_QUERY_KEY, growerId],
        queryFn: async (): Promise<IMarketProductSuggestion[]> => {
            return await backendFetchService.getAllMarketProductSuggestions();
        },
    });
};

export const useAllMarketProductSuggestions = () => {
    return useQuery<IMarketProductSuggestion[]>({
        queryKey: [MARKET_PRODUCT_SUGGESTIONS_QUERY_KEY, 'all'],
        queryFn: async (): Promise<IMarketProductSuggestion[]> => {
            return await backendFetchService.getAllMarketProductSuggestions();
        },
    });
};

export const useCreateMarketProductSuggestion = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (params: IMarketProductSuggestionCreateParams): Promise<IMarketProductSuggestion> => {
            return await backendFetchService.createGrowerProductSuggestion(params) as IMarketProductSuggestion;
        },
        onSuccess: (data) => {
            // Invalidate and refetch market product suggestions for this grower
            queryClient.invalidateQueries({ queryKey: [MARKET_PRODUCT_SUGGESTIONS_QUERY_KEY, data.growerId] });
            // Also invalidate all suggestions for admin
            queryClient.invalidateQueries({ queryKey: [MARKET_PRODUCT_SUGGESTIONS_QUERY_KEY, 'all'] });
        },
    });
};

export const useUpdateMarketProductSuggestionStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (params: IMarketProductSuggestionUpdateParams): Promise<IMarketProductSuggestion> => {
            return await backendFetchService.updateMarketProductSuggestionStatus(params.id, params.status, params.adminComment);
        },
        onSuccess: (data) => {
            // Invalidate and refetch market product suggestions for this grower
            queryClient.invalidateQueries({ queryKey: [MARKET_PRODUCT_SUGGESTIONS_QUERY_KEY, data.growerId] });
            // Also invalidate all suggestions for admin
            queryClient.invalidateQueries({ queryKey: [MARKET_PRODUCT_SUGGESTIONS_QUERY_KEY, 'all'] });
        },
    });
};

export const useDeleteMarketProductSuggestion = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string): Promise<void> => {
            await backendFetchService.deleteGrowerProductSuggestion(id);
        },
        onSuccess: () => {
            // Invalidate all market product suggestions queries
            queryClient.invalidateQueries({ queryKey: [MARKET_PRODUCT_SUGGESTIONS_QUERY_KEY] });
        },
    });
};