import { useQuery } from '@tanstack/react-query';
import { Client } from '@/components/admin/clients/ClientTable';

interface UseClientsParams {
    page?: number;
    limit?: number;
    search?: string;
}

interface UseClientsReturn {
    clients: Client[];
    total: number;
    totalPages: number;
    currentPage: number;
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
}

interface ClientsApiResponse {
    clients: Client[];
    total: number;
    totalPages: number;
    currentPage: number;
}

export function useClients({ page = 1, limit = 7, search = '' }: UseClientsParams = {}): UseClientsReturn {
    const {
        data,
        isLoading,
        error,
        refetch,
    } = useQuery<ClientsApiResponse>({
        queryKey: ['clients', page, limit, search],
        queryFn: async () => {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                search: search,
            });

            const response = await fetch(`/api/admin/clients?${params}`);

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            return response.json();
        },
        staleTime: 30 * 1000, // 30 secondes
        gcTime: 5 * 60 * 1000, // 5 minutes
    });

    return {
        clients: data?.clients || [],
        total: data?.total || 0,
        totalPages: data?.totalPages || 0,
        currentPage: data?.currentPage || page,
        isLoading,
        error: error?.message || null,
        refetch: () => {
            refetch();
        },
    };
}
