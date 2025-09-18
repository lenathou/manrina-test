import { useQuery } from '@tanstack/react-query';
import { Client } from '@/components/admin/clients/ClientTable';

// Interface pour les données brutes du customer depuis l'API
interface RawCustomer {
    id: string;
    email: string;
    name: string;
    phone?: string;
    totalOrders: number;
    totalSpent: string; // Déjà formaté par l'API
    registrationDate: string;
}

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
        queryFn: async (): Promise<ClientsApiResponse> => {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                search: search,
            });

            const response = await fetch(`/api/admin/listCustomersWithPagination?${params}`);

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            const data = await response.json();
            
            // Transformer les données pour correspondre à l'interface Client attendue
            const transformedData = {
                clients: data.customers.map((customer: RawCustomer) => ({
                    id: customer.id,
                    email: customer.email,
                    name: customer.name,
                    phone: customer.phone,
                    totalOrders: customer.totalOrders,
                    totalSpent: customer.totalSpent, // Déjà formaté par l'API
                    registrationDate: customer.registrationDate,
                })),
                total: data.total,
                totalPages: data.totalPages,
                currentPage: data.currentPage,
            };
            
            return transformedData;
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
