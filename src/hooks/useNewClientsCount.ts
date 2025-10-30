import { useQuery } from '@tanstack/react-query';
import { useViewedClients } from './useViewedClients';

interface NewClient {
    id: string;
    name: string;
    email: string;
    registrationDate: string;
}

interface NewClientsResponse {
    newClients: NewClient[];
    count: number;
    unviewedCount: number;
}

// Interface pour les données brutes retournées par l'API
interface ApiCustomer {
    id: string;
    name: string;
    email: string;
    phone?: string;
    registrationDate: string;
    totalOrders: number;
    totalSpent: string;
}

interface ApiResponse {
    customers: ApiCustomer[];
    total: number;
    totalPages: number;
    currentPage: number;
}

/**
 * Hook pour récupérer le nombre de nouveaux clients
 * Considère comme "nouveaux" les clients inscrits dans les dernières 24 heures
 * et non encore consultés par l'admin
 */
export function useNewClientsCount() {
    const { isClientViewed } = useViewedClients();
    const {
        data,
        isLoading,
        error,
        refetch,
    } = useQuery<NewClientsResponse>({
        queryKey: ['admin', 'new-clients-count'],
        queryFn: async (): Promise<NewClientsResponse> => {
            // Calculer la date d'il y a 24 heures
            const twentyFourHoursAgo = new Date();
            twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

            // Récupérer tous les clients récents (on prend une limite élevée pour être sûr)
            const response = await fetch('/api/admin/listCustomersWithPagination?limit=100&page=1');
            
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            const data: ApiResponse = await response.json();
            
            // Filtrer les clients inscrits dans les dernières 24 heures
            const newClients = data.customers.filter((client: ApiCustomer) => {
                const registrationDate = new Date(client.registrationDate);
                return registrationDate > twentyFourHoursAgo;
            });

            const mappedNewClients: NewClient[] = newClients.map((client: ApiCustomer) => ({
                id: client.id,
                name: client.name,
                email: client.email,
                registrationDate: client.registrationDate,
            }));

            // Compter les clients non consultés
            const unviewedClients = mappedNewClients.filter(client => !isClientViewed(client.id));

            return {
                newClients: mappedNewClients,
                count: newClients.length,
                unviewedCount: unviewedClients.length,
            };
        },
        staleTime: 2 * 60 * 1000, // 2 minutes
        gcTime: 5 * 60 * 1000, // 5 minutes
        refetchInterval: 5 * 60 * 1000, // Rafraîchir toutes les 5 minutes
    });

    return {
        newClientsCount: data?.count || 0,
        unviewedClientsCount: data?.unviewedCount || 0,
        newClients: data?.newClients || [],
        isLoading,
        error: error?.message || null,
        refetch,
    };
}