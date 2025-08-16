import { STOCK_GET_ALL_PRODUCTS_QUERY_KEY } from '@/components/admin/stock.config';
import { IProduct } from '@/server/product/IProduct';
import { backendFetchService } from '@/service/BackendFetchService';
import { QueryKey, useQuery, UseQueryResult } from '@tanstack/react-query';

type ProductQueryOptionsType = {
    queryKey?: QueryKey;
};

type ProductQueryHookType = (options?: ProductQueryOptionsType) => UseQueryResult<Array<IProduct>>;

export const useProductQuery: ProductQueryHookType = (options) => {
    const queryKeyFromOptions = options?.queryKey ?? [];
    return useQuery({
        initialData: [],
        queryKey: [...queryKeyFromOptions, ...STOCK_GET_ALL_PRODUCTS_QUERY_KEY],
        queryFn: async () => {
            const products = await backendFetchService.getAllProducts();
            return products.sort((a, b) => a.name.localeCompare(b.name));
        },
    });
};
