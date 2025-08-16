/* eslint-disable react/no-unescaped-entities */
import { ClientLayout } from '@/components/layouts/ClientLayout';
import { Text } from '@/components/ui/Text';
import { useCustomerOrders } from '@/hooks/useCustomerOrders';
import { BasketWithCustomerToShow, IBasket } from '@/server/checkout/IBasket';
import { ICustomerTokenPayload } from '@/server/customer/ICustomer';
import { backendFetchService } from '@/service/BackendFetchService';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

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

type Order = BasketWithCustomerToShow;

interface CustomerOrdersPageProps {
    authenticatedCustomer: ICustomerTokenPayload;
}

function CustomerOrdersContent({}: CustomerOrdersPageProps) {
    const { orders, isLoading, isError, error, refetch } = useCustomerOrders();

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
                    {error?.message || 'Impossible de charger vos commandes'}
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
                    Chargement de vos commandes...
                </Text>
            </div>
        );
    }

    if (!orders || orders.length === 0) {
        return (
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
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                </svg>
                <Text
                    variant="h3"
                    className="mb-2"
                >
                    Aucune commande
                </Text>
                <Text
                    variant="body"
                    className="text-center"
                >
                    Vous n'avez pas encore passé de commande.
                </Text>
            </div>
        );
    }

    const formatDate = (date: Date | string | null) => {
        if (!date) return 'Date inconnue';
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return dateObj.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
        }).format(price);
    };

    // Fonction utilitaire pour calculer le montant réellement payé
    const calculateActualPaidAmount = (basket: IBasket): number => {
        const walletUsed = basket.walletAmountUsed || 0;
        return Math.max(0, basket.total - walletUsed);
    };

    // Fonction utilitaire pour calculer le montant après déduction des remboursements (supprimée côté client)

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid':
                return 'text-green-600 bg-green-50';
            case 'pending':
                return 'text-yellow-600 bg-yellow-50';
            case 'failed':
                return 'text-red-600 bg-red-50';
            default:
                return 'text-gray-600 bg-gray-50';
        }
    };

    const getStatusText = (status: string, delivered: string | null) => {
        if (delivered) {
            return 'Livrée';
        }
        switch (status) {
            case 'paid':
                return 'Payée';
            case 'pending':
                return 'En attente';
            case 'failed':
                return 'Échec';
            default:
                return status;
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="mb-8">
                <Text
                    variant="h1"
                    className="mb-2"
                >
                    Mes commandes
                </Text>
                <Text
                    variant="description"
                    className="text-muted-foreground"
                >
                    Historique de toutes vos commandes
                </Text>
            </div>

            <div className="space-y-6">
                {orders.map((order: Order) => (
                    <div
                        key={order.basket.id}
                        className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
                    >
                        {/* En-tête de la commande */}
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div>
                                    <Text
                                        variant="h4"
                                        className="mb-1"
                                    >
                                        Commande #{order.basket.orderIndex}
                                    </Text>
                                    <Text
                                        variant="small"
                                        className="text-muted-foreground"
                                    >
                                        {formatDate(order.basket.createdAt)}
                                    </Text>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span
                                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                                            order.basket.paymentStatus,
                                        )}`}
                                    >
                                        {getStatusText(order.basket.paymentStatus, order.basket.delivered)}
                                    </span>
                                    <div className="text-right">
                                        {order.basket.deliveryCost > 0 && (
                                            <div className="text-sm text-gray-600 mb-1">
                                                Frais de livraison: {formatPrice(order.basket.deliveryCost)}
                                            </div>
                                        )}
                                        <Text
                                            variant="h5"
                                            className="font-bold"
                                        >
                                            {formatPrice(calculateActualPaidAmount(order.basket))}
                                        </Text>
                                        {calculateActualPaidAmount(order.basket) === 0 && (
                                            <div className="text-xs text-gray-500 italic mt-1">
                                                Commande entièrement payée avec avoir
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Détails de la commande */}
                        <div className="px-6 py-4">
                            {/* Adresse de livraison */}
                            {order.basket.address && (
                                <div className="mb-4">
                                    <Text
                                        variant="h5"
                                        className="mb-2"
                                    >
                                        Adresse de livraison
                                    </Text>
                                    <div className="text-sm text-muted-foreground">
                                        <div>{order.basket.address.name}</div>
                                        <div>{order.basket.address.address}</div>
                                        <div>
                                            {order.basket.address.postalCode} {order.basket.address.city}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Articles commandés */}
                            <div className="mb-4">
                                <Text
                                    variant="h5"
                                    className="mb-3"
                                >
                                    Articles commandés
                                </Text>
                                <div className="space-y-2">
                                    {order.basket.items.map((item: BasketItem, index: number) => {
                                        const refundStatus = item.refundStatus || 'none';
                                        const isRefunded = refundStatus === 'refunded';

                                        return (
                                            <div
                                                key={index}
                                                className={`flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0 ${isRefunded ? 'bg-red-50' : ''}`}
                                            >
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <Text
                                                            variant="body"
                                                            className={`font-medium ${isRefunded ? 'line-through text-red-600' : ''}`}
                                                        >
                                                            {item.name}
                                                        </Text>
                                                        {isRefunded && (
                                                            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">
                                                                Remboursé
                                                            </span>
                                                        )}
                                                    </div>
                                                    {item.description && (
                                                        <Text
                                                            variant="small"
                                                            className={`text-muted-foreground ${isRefunded ? 'line-through' : ''}`}
                                                        >
                                                            {item.description}
                                                        </Text>
                                                    )}
                                                </div>
                                                <div className="text-right ml-4">
                                                    <Text
                                                        variant="body"
                                                        className={`font-medium ${isRefunded ? 'line-through text-red-600' : ''}`}
                                                    >
                                                        {item.quantity} × {formatPrice(item.price)}
                                                    </Text>
                                                    <Text
                                                        variant="small"
                                                        className={`text-muted-foreground ${isRefunded ? 'line-through' : ''}`}
                                                    >
                                                        {formatPrice(item.quantity * item.price)}
                                                    </Text>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Informations de livraison */}
                            {order.basket.deliveryDay && (
                                <div className="mb-4">
                                    <Text
                                        variant="h5"
                                        className="mb-2"
                                    >
                                        Jour de livraison
                                    </Text>
                                    <Text
                                        variant="body"
                                        className="text-muted-foreground"
                                    >
                                        {order.basket.deliveryDay}
                                    </Text>
                                </div>
                            )}

                            {order.basket.deliveryMessage && (
                                <div className="mb-4">
                                    <Text
                                        variant="h5"
                                        className="mb-2"
                                    >
                                        Message de livraison
                                    </Text>
                                    <Text
                                        variant="body"
                                        className="text-muted-foreground"
                                    >
                                        {order.basket.deliveryMessage}
                                    </Text>
                                </div>
                            )}

                            {/* Date de livraison */}
                            {order.basket.delivered && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <div className="flex items-center gap-2">
                                        <svg
                                            className="w-5 h-5 text-green-600"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                        <Text
                                            variant="body"
                                            className="font-medium text-green-800"
                                        >
                                            Commande livrée le {formatDate(order.basket.delivered)}
                                        </Text>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function CustomerOrdersPage() {
    const router = useRouter();
    const [authenticatedCustomer, setAuthenticatedCustomer] = useState<ICustomerTokenPayload | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const isValid = await backendFetchService.verifyCustomerToken();
                if (!isValid) {
                    router.replace('/client/login');
                    return;
                }
                setAuthenticatedCustomer(isValid);
            } catch (error) {
                console.error('Auth check failed:', error);
                router.replace('/client/login');
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
        <ClientLayout>
            <CustomerOrdersContent authenticatedCustomer={authenticatedCustomer} />
        </ClientLayout>
    );
}
