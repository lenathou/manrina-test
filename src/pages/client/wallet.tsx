/* eslint-disable react/no-unescaped-entities */

import { Text } from '@/components/ui/Text';
import { useCustomerOrders } from '@/hooks/useCustomerOrders';
import { BasketWithCustomerToShow } from '@/server/checkout/IBasket';
import { ICustomerTokenPayload } from '@/server/customer/ICustomer';
import { backendFetchService } from '@/service/BackendFetchService';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { formatDateTimeShort } from '@/utils/dateUtils';

interface BasketItem {
    id?: string;
    productId: string;
    productVariantId: string;
    name: string;
    description?: string | null;
    quantity: number;
    price: number;
    vatRateId?: string;
    refundStatus?: 'refunded' | 'none';
}

interface RefundedItem extends BasketItem {
    orderIndex: string;
    orderDate: Date | string | null;
    refundAmount: number;
}

type Order = BasketWithCustomerToShow;

interface CustomerWalletPageProps {
    authenticatedCustomer: ICustomerTokenPayload;
}

function CustomerWalletContent({}: CustomerWalletPageProps) {
    const { orders, isLoading, isError, error, refetch } = useCustomerOrders();
    const [refundedItems, setRefundedItems] = useState<RefundedItem[]>([]);
    const [totalRefundBalance, setTotalRefundBalance] = useState(0);

    useEffect(() => {
        if (orders && orders.length > 0) {
            const allRefundedItems: RefundedItem[] = [];
            let totalBalance = 0;

            orders.forEach((order: Order) => {
                // Ajouter les remboursements
                order.basket.items.forEach((item: BasketItem) => {
                    if (item.refundStatus === 'refunded') {
                        const refundAmount = item.quantity * item.price;
                        allRefundedItems.push({
                            ...item,
                            orderIndex: order.basket.orderIndex.toString(),
                            orderDate: order.basket.createdAt,
                            refundAmount,
                        });
                        totalBalance += refundAmount;
                    }
                });

                // Déduire les montants d'avoir utilisés
                const walletAmountUsed = order.basket.walletAmountUsed || 0;
                totalBalance -= walletAmountUsed;
            });

            setRefundedItems(allRefundedItems);
            setTotalRefundBalance(totalBalance);
        }
    }, [orders]);

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-red-600">
                <svg
                    className="w-16 h-16 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>
                <Text
                    variant="h3"
                    className="text-red-900 mb-2"
                >
                    Erreur de chargement
                </Text>
                <Text
                    variant="body"
                    className="text-red-700 text-center mb-4"
                >
                    {error?.message || 'Impossible de charger vos avoirs'}
                </Text>
                <button
                    onClick={() => refetch()}
                    className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
                >
                    Réessayer
                </button>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                <Text
                    variant="body"
                    className="text-muted-foreground"
                >
                    Chargement de vos avoirs...
                </Text>
            </div>
        );
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
        }).format(price);
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="mb-8">
                <Text
                    variant="h1"
                    className="mb-2"
                >
                    Mon portefeuille
                </Text>
                <Text
                    variant="description"
                    className="text-muted-foreground"
                >
                    Consultez vos avoirs et produits remboursés
                </Text>
            </div>

            {/* Solde total */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6 mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <Text
                            variant="h3"
                            className="text-green-800 mb-1"
                        >
                            Solde disponible
                        </Text>
                        <Text
                            variant="small"
                            className="text-green-600"
                        >
                            Montant total de vos remboursements
                        </Text>
                    </div>
                    <div className="text-right">
                        <Text
                            variant="h2"
                            className="text-green-800 font-bold"
                        >
                            {formatPrice(totalRefundBalance)}
                        </Text>
                        <Text
                            variant="small"
                            className="text-green-600"
                        >
                            {refundedItems.length} article{refundedItems.length > 1 ? 's' : ''} remboursé
                            {refundedItems.length > 1 ? 's' : ''}
                        </Text>
                    </div>
                </div>

                {totalRefundBalance > 0 && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-2">
                            <svg
                                className="w-5 h-5 text-blue-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            <Text
                                variant="small"
                                className="text-blue-800"
                            >
                                Ce solde pourra bientôt être utilisé lors de vos prochaines commandes
                            </Text>
                        </div>
                    </div>
                )}
            </div>

            {/* Liste des produits remboursés */}
            {refundedItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                    <svg
                        className="w-16 h-16 mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                    </svg>
                    <Text
                        variant="h3"
                        className="mb-2"
                    >
                        Aucun avoir disponible
                    </Text>
                    <Text
                        variant="body"
                        className="text-center"
                    >
                        Vous n'avez pas encore de produits remboursés.
                    </Text>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="mb-6">
                        <Text
                            variant="h3"
                            className="mb-2"
                        >
                            Historique des remboursements
                        </Text>
                        <Text
                            variant="description"
                            className="text-muted-foreground"
                        >
                            Détail de tous vos produits remboursés
                        </Text>
                    </div>

                    {refundedItems.map((item, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-lg border border-gray-200 shadow-sm p-6"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Text
                                            variant="h5"
                                            className="font-medium"
                                        >
                                            {item.name}
                                        </Text>
                                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                                            Remboursé
                                        </span>
                                    </div>
                                    {item.description && (
                                        <Text
                                            variant="small"
                                            className="text-muted-foreground mb-2"
                                        >
                                            {item.description}
                                        </Text>
                                    )}
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <span>Commande #{item.orderIndex}</span>
                                        <span>•</span>
                                        <span>{formatDateTimeShort(item.orderDate)}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <Text
                                        variant="body"
                                        className="font-medium text-green-600 mb-1"
                                    >
                                        + {formatPrice(item.refundAmount)}
                                    </Text>
                                    <Text
                                        variant="small"
                                        className="text-muted-foreground"
                                    >
                                        {item.quantity} × {formatPrice(item.price)}
                                    </Text>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function CustomerWalletPage() {
    const router = useRouter();
    const [authenticatedCustomer, setAuthenticatedCustomer] = useState<ICustomerTokenPayload | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const isValid = await backendFetchService.verifyCustomerToken();
                if (!isValid) {
                    router.replace('/login');
                    return;
                }
                setAuthenticatedCustomer(isValid);
            } catch (error) {
                console.error('Auth check failed:', error);
                router.replace('/login');
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, [router]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!authenticatedCustomer) {
        return null;
    }

    return (
        <CustomerWalletContent authenticatedCustomer={authenticatedCustomer} />
    );
}
