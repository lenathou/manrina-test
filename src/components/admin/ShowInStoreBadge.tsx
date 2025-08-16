import { useMutation, useQueryClient } from '@tanstack/react-query';
import { IProduct } from '../../server/product/IProduct';
import { backendFetchService } from '../../service/BackendFetchService';
import { STOCK_GET_ALL_PRODUCTS_QUERY_KEY } from './stock.config';

interface ShowInStoreBadgeProps {
    product: IProduct;
}

export function ShowInStoreBadge({ product }: ShowInStoreBadgeProps) {
    const queryClient = useQueryClient();
    const showInStore = product.showInStore;

    const { mutate: updateShowInStore, isPending: updating } = useMutation({
        mutationFn: async (newShowInStore: boolean) => {
            await backendFetchService.updateProduct(product.id, {
                showInStore: newShowInStore,
            });
            return newShowInStore;
        },
        onSuccess: (newShowInStore) => {
            queryClient.setQueryData<IProduct[]>(STOCK_GET_ALL_PRODUCTS_QUERY_KEY, (oldProducts) => {
                if (!oldProducts) return oldProducts;
                return oldProducts.map((p) => (p.id === product.id ? { ...p, showInStore: newShowInStore } : p));
            });
        },
        onError: () => {
            alert('Failed to update visibility status');
        },
    });

    return (
        <div className="flex items-center justify-center">
            <button
                onClick={() => updateShowInStore(!showInStore)}
                disabled={updating}
                className={`
                    relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50
                    ${showInStore ? 'bg-emerald-500' : 'bg-gray-300'}
                `}
            >
                <span
                    className={`
                        inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out
                        ${showInStore ? 'translate-x-6' : 'translate-x-1'}
                    `}
                />
            </button>
            <span className={`ml-2 text-xs font-medium ${showInStore ? 'text-emerald-600' : 'text-gray-500'}`}>
                {showInStore ? 'Visible' : 'Hidden'}
            </span>
        </div>
    );
}
