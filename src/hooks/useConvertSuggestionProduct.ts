import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApprovedSuggestionProduct } from './useApprovedSuggestionProducts';

interface ConvertSuggestionProductParams {
    productId: string;
    growerId: string;
}

export const useConvertSuggestionProduct = () => {
    const queryClient = useQueryClient();

    return useMutation<ApprovedSuggestionProduct, Error, ConvertSuggestionProductParams>({
        mutationFn: async ({ productId, growerId }: ConvertSuggestionProductParams) => {
            const response = await fetch('/api/grower/convert-suggestion-product', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ productId, growerId }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to convert suggestion product');
            }

            return response.json();
        },
        onSuccess: () => {
            // Invalider les requêtes pour forcer le rechargement des données
            queryClient.invalidateQueries({ queryKey: ['approvedSuggestionProducts'] });
            queryClient.invalidateQueries({ queryKey: ['standProducts'] });
        },
    });
};