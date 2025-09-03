import { useQuery } from '@tanstack/react-query';

export interface ApprovedSuggestionProduct {
    id: string;
    name: string;
    description?: string;
    imageUrl?: string;
    price: number;
    stock: number;
    unit?: string;
    category?: string;
    isActive: boolean;
    sourceType: 'SUGGESTION';
    suggestionId: string;
    marketSessionId: string;
    growerId: string;
    createdAt: Date;
    updatedAt: Date;
    grower: {
        id: string;
        name: string;
        email: string;
    };
    marketSession: {
        id: string;
        name: string;
        date: Date;
        status: string;
        location?: string;
    };
    suggestion: {
        id: string;
        name: string;
        description?: string;
        pricing: string;
        unit?: string;
        category?: string;
        status: string;
        processedAt?: Date;
        adminComment?: string;
    };
}

const APPROVED_SUGGESTION_PRODUCTS_QUERY_KEY = 'approvedSuggestionProducts';

export const useApprovedSuggestionProducts = (growerId: string) => {
    return useQuery<ApprovedSuggestionProduct[]>({
        queryKey: [APPROVED_SUGGESTION_PRODUCTS_QUERY_KEY, growerId],
        queryFn: async (): Promise<ApprovedSuggestionProduct[]> => {
            const response = await fetch(`/api/grower/approved-suggestions?growerId=${growerId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch approved suggestion products');
            }
            return response.json();
        },
        enabled: !!growerId,
    });
};