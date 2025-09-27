import React from 'react';
import { BasketWithCustomerToShow } from '../../server/checkout/IBasket';
import { DeliveryOrderDetails } from './DeliveryOrderDetails';
import { Card, CardHeader, CardContent, CardTitle } from '../ui/Card';

interface DeliveryOrderDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    basketWithCustomer: BasketWithCustomerToShow | null;
    onMarkAsDelivered?: (basketId: string) => void;
    isMarkingAsDelivered?: boolean;
}

export const DeliveryOrderDetailsModal: React.FC<DeliveryOrderDetailsModalProps> = ({
    isOpen,
    onClose,
    basketWithCustomer,
    onMarkAsDelivered,
    isMarkingAsDelivered = false,
}) => {
    if (!isOpen || !basketWithCustomer) {
        return null;
    }

    return (
        <>
            {/* Overlay */}
            <div 
                className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                onClick={onClose}
            />
            
            {/* Modal */}
            <div className="fixed inset-0 z-50 lg:hidden flex items-end">
                <Card className="w-full h-[90vh] rounded-t-2xl shadow-xl transform transition-transform duration-300 ease-out animate-slideUp flex flex-col">
                    {/* Header avec bouton fermer */}
                    <CardHeader className="bg-secondary rounded-t-2xl flex-shrink-0">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg font-semibold text-white">
                                Détails de la commande
                            </CardTitle>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-200 hover:bg-opacity-20 rounded-full transition-colors"
                                aria-label="Fermer"
                            >
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </CardHeader>
                    
                    {/* Contenu scrollable */}
                    <CardContent className="flex-1 overflow-y-auto min-h-0 p-0">
                        <DeliveryOrderDetails
                            basketWithCustomer={basketWithCustomer}
                            onMarkAsDelivered={onMarkAsDelivered}
                            isMarkingAsDelivered={isMarkingAsDelivered}
                        />
                    </CardContent>
                </Card>
            </div>
        </>
    );
};