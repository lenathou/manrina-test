import { useQuery } from '@tanstack/react-query';
import { backendFetchService } from '@/service/BackendFetchService';
import { IProduct } from '@/server/product/IProduct';

export const useProductQuery = () => {
    return useQuery<IProduct[]>({
        queryKey: ['products'],
        queryFn: () => backendFetchService.getAllProductsWithStock(),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    });
};