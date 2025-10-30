import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { IPanyenProduct } from '../../server/panyen/IPanyen';
import { backendFetchService } from '../../service/BackendFetchService';
import { ForceAvailabilityModal } from './ForceAvailabilityModal';

interface PanyenShowInStoreBadgeProps {
    panyen: IPanyenProduct;
    forcedHidden?: boolean;
    hasStockIssues?: boolean;
    disabled?: boolean;
    reason?: string;
    blockingProducts?: string[];
}

export function PanyenShowInStoreBadge({ 
    panyen, 
    disabled = false, 
    hasStockIssues, 
    reason, 
    blockingProducts = []
}: PanyenShowInStoreBadgeProps) {
    const queryClient = useQueryClient();
    const [showForceModal, setShowForceModal] = useState(false);
    const showInStore = panyen.showInStore;
    // Le toggle doit refléter l'état réel de showInStore, pas être forcé à false
    const effectiveShowInStore = showInStore;

    const { mutate: updateShowInStore, isPending: updating } = useMutation({
        mutationFn: async (newShowInStore: boolean) => {
            await backendFetchService.updatePanyen(panyen.id, {
                showInStore: newShowInStore,
            });
            return newShowInStore;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['panyen-products'] });
            queryClient.invalidateQueries({ queryKey: ['panyen-store-products'] });
            queryClient.invalidateQueries({ queryKey: ['panyen'] });
        },
        onError: () => {
            alert('Echec de la mise a jour du statut de visibilite');
        },
    });

    const handleToggle = () => {
        if (disabled) {
            return;
        }
        
        // Si le panier est forcé comme caché et qu'on tente de l'activer
        // Si on tente d'activer un panier qui a des problèmes de stock, afficher le modal
        if (hasStockIssues && !effectiveShowInStore) {
            setShowForceModal(true);
            return;
        }
        
        updateShowInStore(!effectiveShowInStore);
    };

    const handleForceConfirm = () => {
        setShowForceModal(false);
        updateShowInStore(true);
    };

    // Déterminer si le panier est forcé disponible (visible malgré des problèmes de stock)
    const isForcedAvailable = effectiveShowInStore && hasStockIssues;
    
    const label = effectiveShowInStore
        ? isForcedAvailable 
            ? 'Visible (forcé)'
            : 'Visible'
        : hasStockIssues
            ? reason ?? 'Stock indisponible'
            : 'Masqué';

    return (
        <>
            <div className="flex items-center justify-center" title={isForcedAvailable || (!effectiveShowInStore && hasStockIssues) ? label : undefined}>
                <button
                    onClick={handleToggle}
                    disabled={disabled || updating}
                    className={`
                        relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50
                        ${effectiveShowInStore ? 'bg-emerald-500' : 'bg-gray-300'}
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
                        isForcedAvailable 
                            ? 'text-orange-600' 
                            : !effectiveShowInStore && hasStockIssues 
                                ? 'text-red-600' 
                                : effectiveShowInStore 
                                    ? 'text-emerald-600' 
                                    : 'text-gray-500'
                    }`}
                >
                    {label}
                </span>
            </div>

            <ForceAvailabilityModal
                isOpen={showForceModal}
                onClose={() => setShowForceModal(false)}
                onConfirm={handleForceConfirm}
                panyen={panyen}
                blockingProducts={blockingProducts}
                isLoading={updating}
            />
        </>
    );
}
