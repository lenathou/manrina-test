/* eslint-disable react/no-unescaped-entities */
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { BasketWithCustomerToShow } from '../../server/checkout/IBasket';
import { backendFetchService } from '../../service/BackendFetchService';
import { DeliveryOrderListDesktop } from './DeliveryOrderListDesktop';
import { DeliveryOrderListMobile } from './DeliveryOrderListMobile';
import { DeliveryOrderDetails } from './DeliveryOrderDetails';
import { DeliveryOrderDetailsModal } from './DeliveryOrderDetailsModal';

interface DeliveryOrdersManagerProps {
    orders: BasketWithCustomerToShow[];
    isLoading?: boolean;
}

export const DeliveryOrdersManager: React.FC<DeliveryOrdersManagerProps> = ({ orders, isLoading }) => {
    const [selectedOrder, setSelectedOrder] = useState<BasketWithCustomerToShow | null>(null);
    const [showMobileModal, setShowMobileModal] = useState(false);
    const queryClient = useQueryClient();

    const markAsDeliveredMutation = useMutation({
        mutationFn: (basketId: string) => backendFetchService.markBasketAsDelivered(basketId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['deliverer-orders'] });
            // Optionnel: afficher une notification de succès
        },
        onError: (error) => {
            console.error('Failed to mark order as delivered:', error);
            // Optionnel: afficher une notification d'erreur
        },
    });

    const handleSelectOrder = (order: BasketWithCustomerToShow) => {
        setSelectedOrder(order);
    };

    const handleSelectOrderMobile = (order: BasketWithCustomerToShow) => {
        setSelectedOrder(order);
        setShowMobileModal(true);
    };

    const handleMarkAsDelivered = (basketId: string) => {
        markAsDeliveredMutation.mutate(basketId);
    };

    const handleCloseMobileModal = () => {
        setShowMobileModal(false);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8l-4 4-4-4m0 0L9 7v4" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune commande à livrer</h3>
                <p className="text-gray-600 text-center">Il n'y a actuellement aucune commande en attente de livraison.</p>
            </div>
        );
    }

    return (
        <div className="flex h-full bg-gray-50">
            {/* Version Desktop - Layout côte à côte */}
            <>
                <DeliveryOrderListDesktop
                    orders={orders}
                    selectedOrder={selectedOrder}
                    onSelectOrder={handleSelectOrder}
                />
                
                {/* Détails Desktop */}
                <div className="hidden lg:block flex-1 bg-white">
                    {selectedOrder ? (
                        <DeliveryOrderDetails
                            basketWithCustomer={selectedOrder}
                            onMarkAsDelivered={handleMarkAsDelivered}
                            isMarkingAsDelivered={markAsDeliveredMutation.isPending}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                            <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Sélectionnez une commande</h3>
                            <p className="text-gray-600 text-center">Choisissez une commande dans la liste pour voir les détails de livraison.</p>
                        </div>
                    )}
                </div>
            </>

            {/* Version Mobile - Liste avec modal */}
            <div className="lg:hidden w-full">
                <DeliveryOrderListMobile
                    orders={orders}
                    selectedOrder={selectedOrder}
                    onSelectOrder={handleSelectOrderMobile}
                    showDetails={false}
                    onToggleDetails={() => {}}
                />
                
                {/* Modal pour les détails sur mobile */}
                <DeliveryOrderDetailsModal
                    isOpen={showMobileModal}
                    onClose={handleCloseMobileModal}
                    basketWithCustomer={selectedOrder}
                    onMarkAsDelivered={handleMarkAsDelivered}
                    isMarkingAsDelivered={markAsDeliveredMutation.isPending}
                />
            </div>
        </div>
    );
};