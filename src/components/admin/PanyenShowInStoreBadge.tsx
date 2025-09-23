import { useMutation, useQueryClient } from '@tanstack/react-query';
import { IPanyenProduct } from '../../server/panyen/IPanyen';
import { backendFetchService } from '../../service/BackendFetchService';

interface PanyenShowInStoreBadgeProps {
    panyen: IPanyenProduct;
    disabled?: boolean;
    forcedHidden?: boolean;
    reason?: string;
}

export function PanyenShowInStoreBadge({ panyen, disabled = false, forcedHidden = false, reason }: PanyenShowInStoreBadgeProps) {
    const queryClient = useQueryClient();
    const showInStore = panyen.showInStore;
    const effectiveShowInStore = forcedHidden ? false : showInStore;

    const { mutate: updateShowInStore, isPending: updating } = useMutation({
        mutationFn: async (newShowInStore: boolean) => {
            await backendFetchService.updatePanyen(panyen.id, {
                showInStore: newShowInStore,
            });
            return newShowInStore;
        },
        onSuccess: (newShowInStore) => {
            queryClient.setQueryData<IPanyenProduct[]>(['panyen-products'], (oldPanyens) => {
                if (!oldPanyens) return oldPanyens;
                return oldPanyens.map((p) => (p.id === panyen.id ? { ...p, showInStore: newShowInStore } : p));
            });
            queryClient.invalidateQueries({ queryKey: ['panyen-store-products'] });
            queryClient.invalidateQueries({ queryKey: ['panyen'] });
        },
        onError: () => {
            alert('Echec de la mise a jour du statut de visibilite');
        },
    });

    const handleToggle = () => {
        if (disabled || forcedHidden) {
            return;
        }
        updateShowInStore(!effectiveShowInStore);
    };

    const label = forcedHidden
        ? reason ?? 'Stock indisponible'
        : effectiveShowInStore
            ? 'Visible'
            : 'Masque';

    return (
        <div className="flex items-center justify-center" title={forcedHidden ? label : undefined}>
            <button
                onClick={handleToggle}
                disabled={disabled || forcedHidden || updating}
                className={`
                    relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50
                    ${effectiveShowInStore ? 'bg-emerald-500' : 'bg-gray-300'}
                    ${forcedHidden ? 'opacity-70' : ''}
                `}
            >
                <span
                    className={`
                        inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out
                        ${effectiveShowInStore ? 'translate-x-6' : 'translate-x-1'}
                    `}
                />
            </button>
            <span
                className={`ml-2 text-xs font-medium ${
                    forcedHidden ? 'text-red-600' : effectiveShowInStore ? 'text-emerald-600' : 'text-gray-500'
                }`}
            >
                {label}
            </span>
        </div>
    );
}
