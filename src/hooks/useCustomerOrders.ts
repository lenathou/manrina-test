import { useQuery } from '@tanstack/react-query';
import { backendFetchService } from '../service/BackendFetchService';

export const useCustomerOrders = () => {
    const ordersQuery = useQuery({
        queryKey: ['customer-orders'],
        queryFn: () => backendFetchService.getCustomerOrders(),
        refetchInterval: 30000, // Actualisation automatique toutes les 30 secondes
    });

    return {
        orders: ordersQuery.data || [],
        isLoading: ordersQuery.isLoading,
        isError: ordersQuery.isError,
        error: ordersQuery.error,
        refetch: ordersQuery.refetch,
    };
};