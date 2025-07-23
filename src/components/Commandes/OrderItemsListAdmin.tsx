import { useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { IBasket } from '../../server/checkout/IBasket';
import { numberFormat } from '../../service/NumberFormat';
import { backendFetchService } from '../../service/BackendFetchService';

// Fonction utilitaire pour calculer le montant réellement payé
const calculateActualPaidAmount = (order: IBasket): number => {
    const walletUsed = order.walletAmountUsed || 0;
    return Math.max(0, order.total - walletUsed);
};

// Fonction utilitaire pour calculer le montant après déduction des remboursements
const calculateAmountAfterRefunds = (order: IBasket): number => {
    const refundedAmount = order.items
        .filter((item) => item.refundStatus === 'refunded')
        .reduce((total, item) => total + item.price * item.quantity, 0);

    const actualPaidAmount = calculateActualPaidAmount(order);
    return Math.max(0, actualPaidAmount - refundedAmount);
};

interface OrderItemsListAdminProps {
    order: IBasket;
    isAuthenticatedCustomer: boolean;
}

type RefundChanges = {
    [itemId: string]: 'refunded' | 'none';
};

export const OrderItemsListAdmin = ({ order, isAuthenticatedCustomer }: OrderItemsListAdminProps) => {
    const { products } = useAppContext();
    const queryClient = useQueryClient();
    const [pendingChanges, setPendingChanges] = useState<RefundChanges>({});
    const [hasChanges, setHasChanges] = useState(false);

    // Réinitialiser les changements en attente quand la commande change
    useEffect(() => {
        setPendingChanges({});
        setHasChanges(false);
    }, [order.id]);

    const refundMutation = useMutation({
        mutationFn: (changes: RefundChanges) => {
            const promises = Object.entries(changes).map(([itemId, refundStatus]) =>
                backendFetchService.updateBasketItemRefundStatus(itemId, refundStatus),
            );
            return Promise.all(promises);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['commands'] });
            setPendingChanges({});
            setHasChanges(false);
        },
        onError: (error) => {
            console.error('Failed to update refund status:', error);
        },
    });

    const getProductInfo = (productId: string) => {
        return products.find((p) => p.id === productId);
    };

    const handleRefundStatusToggle = (itemId: string) => {
        const currentStatus =
            pendingChanges[itemId] ||
            order.items.find((item) => (item.id || `${item.productId}-${item.productVariantId}`) === itemId)
                ?.refundStatus ||
            'none';
        const newStatus = currentStatus === 'refunded' ? 'none' : 'refunded';

        const originalStatus =
            order.items.find((item) => (item.id || `${item.productId}-${item.productVariantId}`) === itemId)
                ?.refundStatus || 'none';

        if (newStatus === originalStatus) {
            // Retour à l'état original, supprimer du pending
            const newPendingChanges = { ...pendingChanges };
            delete newPendingChanges[itemId];
            setPendingChanges(newPendingChanges);
            setHasChanges(Object.keys(newPendingChanges).length > 0);
        } else {
            // Nouveau changement
            const newPendingChanges: RefundChanges = { ...pendingChanges, [itemId]: newStatus };
            setPendingChanges(newPendingChanges);
            setHasChanges(true);
        }
    };

    const handleValidateChanges = () => {
        if (Object.keys(pendingChanges).length > 0) {
            refundMutation.mutate(pendingChanges);
        }
    };

    const handleCancelChanges = () => {
        setPendingChanges({});
        setHasChanges(false);
    };

    const getCurrentRefundStatus = (itemId: string) => {
        if (pendingChanges[itemId]) {
            return pendingChanges[itemId];
        }
        return (
            order.items.find((item) => (item.id || `${item.productId}-${item.productVariantId}`) === itemId)
                ?.refundStatus || 'none'
        );
    };

    const isPending = (itemId: string) => {
        return pendingChanges.hasOwnProperty(itemId);
    };

    const getRefundStatusText = (status: string) => {
        switch (status) {
            case 'refunded':
                return 'Remboursé';
            case 'none':
            default:
                return 'Aucun';
        }
    };

    return (
        <div className="flex flex-col gap-3">
            {/* Boutons de validation/annulation */}
            {isAuthenticatedCustomer && (
                <div className="flex justify-end gap-2 mb-3">
                    <button
                        className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                            hasChanges
                                ? 'bg-gray-500 hover:bg-gray-600 text-white'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                        onClick={handleCancelChanges}
                        disabled={!hasChanges || refundMutation.isPending}
                    >
                        Annuler les modifications
                    </button>
                    <button
                        className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                            hasChanges
                                ? 'bg-green-600 hover:bg-green-700 text-white'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                        onClick={handleValidateChanges}
                        disabled={!hasChanges || refundMutation.isPending}
                    >
                        {refundMutation.isPending ? 'Validation...' : 'Valider les modifications'}
                    </button>
                </div>
            )}

            {order.items.map((item, index) => {
                const product = getProductInfo(item.productId);
                const itemId = item.id || `${item.productId}-${item.productVariantId}-${index}`;
                const currentRefundStatus = getCurrentRefundStatus(itemId);
                const isItemPending = isPending(itemId);

                return (
                    <div
                        key={itemId}
                        className={`flex flex-row items-start gap-3 p-3 bg-white rounded-lg border ${
                            isItemPending ? 'border-blue-300 bg-blue-50' : 'border-gray-300'
                        }`}
                    >
                        {product && (
                            <Image
                                src={product.imageUrl}
                                alt={item.name}
                                width={50}
                                height={50}
                                className="rounded object-cover"
                            />
                        )}
                        <div className="flex-1 flex flex-col gap-1">
                            <span className="text-sm font-medium text-gray-900">{item.name}</span>
                            <span className="text-xs text-gray-500">
                                {product?.variants.find((v) => v.id === item.productVariantId)?.optionValue}
                            </span>
                            {item.description && (
                                <span className="text-xs text-gray-500 italic">{item.description}</span>
                            )}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <span className="text-xs text-gray-500">x{item.quantity}</span>
                            <span className="text-sm font-semibold">
                                {numberFormat.toPrice(item.price * item.quantity)}
                            </span>
                        </div>

                        {/* Section de gestion du remboursement pour les clients authentifiés */}
                        {isAuthenticatedCustomer && (
                            <div className="flex flex-col items-center gap-2 min-w-[120px]">
                                <div
                                    className={`px-2 py-1 rounded ${
                                        currentRefundStatus === 'refunded' ? 'bg-red-50' : 'bg-orange-50'
                                    }`}
                                >
                                    <span
                                        className={`text-xs font-medium ${
                                            currentRefundStatus === 'refunded' ? 'text-red-600' : 'text-orange-600'
                                        }`}
                                    >
                                        {getRefundStatusText(currentRefundStatus)}
                                        {isItemPending && ' (en attente)'}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <button
                                        className={`px-3 py-1.5 rounded text-xs font-medium transition-colors min-w-[100px] ${
                                            currentRefundStatus === 'refunded'
                                                ? 'text-white bg-green-600 hover:bg-green-700'
                                                : 'text-white bg-red-600 hover:bg-red-700'
                                        } ${isItemPending ? 'ring-2 ring-blue-400' : ''}`}
                                        onClick={() => handleRefundStatusToggle(itemId)}
                                        disabled={refundMutation.isPending}
                                    >
                                        {currentRefundStatus === 'refunded' ? 'Remboursé!' : 'Rembourser'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
            <div className="flex flex-row justify-between items-center border-t border-gray-300 pt-3 mt-2">
                <span className="text-base font-bold">Total</span>
                <div className="flex flex-col items-end">
                    <span className="text-lg font-bold text-orange-600">
                        {numberFormat.toPrice(calculateAmountAfterRefunds(order))}
                    </span>
                    {calculateActualPaidAmount(order) === 0 && (
                        <span className="text-xs text-gray-500 italic mt-1">Commande entièrement payée avec avoir</span>
                    )}
                    {calculateAmountAfterRefunds(order) === 0 && calculateActualPaidAmount(order) > 0 && (
                        <span className="text-xs text-gray-500 italic mt-1">Commande entièrement remboursée</span>
                    )}
                </div>
            </div>
        </div>
    );
};
