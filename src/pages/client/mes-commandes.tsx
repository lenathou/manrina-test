/* eslint-disable react/no-unescaped-entities */

import { Text } from '@/components/ui/Text';
import { useCustomerOrders } from '@/hooks/useCustomerOrders';
import { BasketWithCustomerToShow, IBasket } from '@/server/checkout/IBasket';
import { ICustomerTokenPayload } from '@/server/customer/ICustomer';
import { backendFetchService } from '@/service/BackendFetchService';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { convertUTCToLocaleString } from '@/utils/dateUtils';

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
    const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

    const toggleOrderDetails = (orderId: string) => {
        setExpandedOrders(prev => {
            const newSet = new Set(prev);
            if (newSet.has(orderId)) {
                newSet.delete(orderId);
            } else {
                newSet.add(orderId);
            }
            return newSet;
        });
    };

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
                    className="mb-2 flex items-center gap-2"
                >
                    <Image src="/icons/basket-empty.svg" alt="Panier vide" width={24} height={24} className="w-6 h-6" />
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
        <div className="max-w-4xl mx-auto px-3 py-4 sm:px-6 sm:py-8">
            <div className="mb-6 sm:mb-8">
                <Text
                    variant="h1"
                    className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2"
                >
                    <Image src="/icons/basket-validated.svg" alt="Panier" width={24} height={24} className="w-6 h-6" />
                    Mes commandes
                </Text>
                <Text
                    variant="description"
                    className="text-sm text-gray-600"
                >
                    Consultez l'historique de vos commandes
                </Text>
            </div>

            <div className="space-y-3 sm:space-y-6">
                {orders.map((order: Order) => (
                    <div
                        key={order.basket.id}
                        className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mx-1 sm:mx-0"
                    >
                        {/* En-tête de la commande */}
                        <div 
                            className="bg-gray-50 px-4 sm:px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => toggleOrderDetails(order.basket.id)}
                        >
                            <div className="flex flex-col gap-3">
                                {/* Ligne 1: Numéro de commande et bouton dropdown */}
                                <div className="flex items-center justify-between">
                                    <Text
                                        variant="h4"
                                        className="text-base sm:text-lg font-semibold"
                                    >
                                        Commande #{order.basket.orderIndex}
                                    </Text>
                                    <button className="p-2 rounded-full hover:bg-gray-200 transition-colors flex-shrink-0">
                                        <svg
                                            className={`w-5 h-5 text-gray-600 transition-transform duration-200 ${
                                                expandedOrders.has(order.basket.id) ? 'rotate-180' : ''
                                            }`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M19 9l-7 7-7-7"
                                            />
                                        </svg>
                                    </button>
                                </div>
                                
                                {/* Ligne 2: Date et nombre d'articles */}
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                        <Text
                                            variant="small"
                                            className="text-muted-foreground text-sm"
                                        >
                                            {convertUTCToLocaleString(order.basket.createdAt)}
                                        </Text>
                                        <Text
                                            variant="small"
                                            className="text-gray-500 text-sm"
                                        >
                                            {order.basket.items.length} article{order.basket.items.length > 1 ? 's' : ''}
                                        </Text>
                                    </div>
                                    
                                    {/* Statut et prix */}
                                    <div className="flex items-center justify-between sm:justify-end gap-3">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                                order.basket.paymentStatus,
                                            )}`}
                                        >
                                            {getStatusText(order.basket.paymentStatus, order.basket.delivered)}
                                        </span>
                                        <div className="text-right">
                                            {order.basket.deliveryCost > 0 && (
                                                <div className="text-xs text-gray-600 mb-1">
                                                    Livraison: {formatPrice(order.basket.deliveryCost)}
                                                </div>
                                            )}
                                            <Text
                                                variant="h5"
                                                className="font-bold text-base"
                                            >
                                                {formatPrice(calculateActualPaidAmount(order.basket))}
                                            </Text>
                                            {calculateActualPaidAmount(order.basket) === 0 && (
                                                <div className="text-xs text-gray-500 italic mt-1">
                                                    Payée avec avoir
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Détails de la commande */}
                        {expandedOrders.has(order.basket.id) && (
                            <div className="px-4 sm:px-6 py-4 border-t border-gray-200 bg-white">
                            {/* Adresse de livraison */}
                            {order.basket.address && (
                                <div className="mb-6">
                                    <Text
                                        variant="h5"
                                        className="mb-3 text-sm font-semibold text-gray-800 flex items-center gap-2"
                                    >
                                        <Image src="/icons/local.svg" alt="Localisation" width={16} height={16} className="w-8 h-8" />
                                        Adresse de livraison
                                    </Text>
                                    <div className="text-sm text-muted-foreground bg-gray-50 p-3 rounded-lg">
                                        <div className="font-medium">{order.basket.address.name}</div>
                                        <div>{order.basket.address.address}</div>
                                        <div>
                                            {order.basket.address.postalCode} {order.basket.address.city}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Articles commandés */}
                            <div className="mb-6">
                                <Text
                                    variant="h5"
                                    className="mb-3 text-sm font-semibold text-gray-800 flex items-center gap-1"
                                >
                                    <Image src="/icons/basket-validated.svg" alt="Articles" width={16} height={16} className="w-12 h-12" />
                                    Articles commandés
                                </Text>
                                <div className="space-y-3">
                                    {order.basket.items.map((item: BasketItem, index: number) => {
                                        const refundStatus = item.refundStatus || 'none';
                                        const isRefunded = refundStatus === 'refunded';

                                        return (
                                            <div
                                                key={index}
                                                className={`flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 p-3 rounded-lg border ${isRefunded ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}
                                            >
                                                <div className="flex-1">
                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                                        <Text
                                                            variant="body"
                                                            className={`font-medium text-sm ${isRefunded ? 'line-through text-red-600' : ''}`}
                                                        >
                                                            {item.name}
                                                        </Text>
                                                        {isRefunded && (
                                                            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium self-start">
                                                                Remboursé
                                                            </span>
                                                        )}
                                                    </div>
                                                    {item.description && (
                                                        <Text
                                                            variant="small"
                                                            className={`text-muted-foreground text-xs mt-1 ${isRefunded ? 'line-through' : ''}`}
                                                        >
                                                            {item.description}
                                                        </Text>
                                                    )}
                                                </div>
                                                <div className="flex justify-between sm:flex-col sm:text-right gap-2">
                                                    <Text
                                                        variant="body"
                                                        className={`font-medium text-sm ${isRefunded ? 'line-through text-red-600' : ''}`}
                                                    >
                                                        {item.quantity} × {formatPrice(item.price)}
                                                    </Text>
                                                    <Text
                                                        variant="small"
                                                        className={`text-muted-foreground font-semibold text-sm ${isRefunded ? 'line-through' : ''}`}
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
                                        className="mb-2 text-sm font-semibold text-gray-800 flex items-center gap-1"
                                    >
                                        <Image src="/icons/delivery.svg" alt="Livraison" width={16} height={16} className="w-12 h-12" />
                                        Jour de livraison
                                    </Text>
                                    <div className="bg-blue-50 p-3 rounded-lg">
                                        <Text
                                            variant="body"
                                            className="text-blue-800 text-sm font-medium"
                                        >
                                            {order.basket.deliveryDay}
                                        </Text>
                                    </div>
                                </div>
                            )}

                            {order.basket.deliveryMessage && (
                                <div className="mb-4">
                                    <Text
                                        variant="h5"
                                        className="mb-2 text-sm font-semibold text-gray-800 flex items-center gap-1"
                                    >
                                        <Image src="/icons/dashboard/location.svg" alt="Localisation" width={16} height={16} className="w-4 h-4" />
                                        Message de livraison
                                    </Text>
                                    <div className="bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-400">
                                        <Text
                                            variant="body"
                                            className="text-yellow-800 text-sm"
                                        >
                                            {order.basket.deliveryMessage}
                                        </Text>
                                    </div>
                                </div>
                            )}

                            {/* Date de livraison */}
                            {order.basket.delivered && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
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
                                        </div>
                                        <div>
                                            <Text
                                                variant="body"
                                                className="font-semibold text-green-800 text-sm flex items-center gap-1"
                                            >
                                                <Image src="/icons/check.svg" alt="Validé" width={12} height={12} className="w-3 h-3" />
                                                Commande livrée
                                            </Text>
                                            <Text
                                                variant="small"
                                                className="text-green-700 text-xs mt-1"
                                            >
                                                Le {convertUTCToLocaleString(order.basket.delivered)}
                                            </Text>
                                        </div>
                                    </div>
                                </div>
                            )}
                            </div>
                        )}
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
        <CustomerOrdersContent authenticatedCustomer={authenticatedCustomer} />
    );
}
