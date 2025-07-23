import { useMutation, useQueryClient } from '@tanstack/react-query';
import { IPanyenProduct } from '../../server/panyen/IPanyen';
import { backendFetchService } from '../../service/BackendFetchService';

interface PanyenShowInStoreBadgeProps {
    panyen: IPanyenProduct;
}

export function PanyenShowInStoreBadge({ panyen }: PanyenShowInStoreBadgeProps) {
    const queryClient = useQueryClient();
    const showInStore = panyen.showInStore;

    const { mutate: updateShowInStore, isPending: updating } = useMutation({
        mutationFn: async (newShowInStore: boolean) => {
            await backendFetchService.updatePanyen(panyen.id, {
                showInStore: newShowInStore,
            });
            return newShowInStore;
        },
        onSuccess: (newShowInStore) => {
            // Mettre à jour le cache de l'administration
            queryClient.setQueryData<IPanyenProduct[]>(['panyen-products'], (oldPanyens) => {
                if (!oldPanyens) return oldPanyens;
                return oldPanyens.map((p) => (p.id === panyen.id ? { ...p, showInStore: newShowInStore } : p));
            });
            // Invalider le cache du magasin pour refléter les changements de visibilité
            queryClient.invalidateQueries({ queryKey: ['panyen-store-products'] });
            queryClient.invalidateQueries({ queryKey: ['panyen'] });
        },
        onError: () => {
            alert('Échec de la mise à jour du statut de visibilité');
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
                {showInStore ? 'Visible' : 'Masqué'}
            </span>
        </div>
    );
}