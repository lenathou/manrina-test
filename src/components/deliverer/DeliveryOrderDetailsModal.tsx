import React from 'react';
import { BasketWithCustomerToShow } from '../../server/checkout/IBasket';
import { DeliveryOrderDetails } from './DeliveryOrderDetails';

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
                <div className="bg-white w-full h-[90vh] rounded-t-2xl shadow-xl transform transition-transform duration-300 ease-out animate-slideUp flex flex-col">
                    {/* Header avec bouton fermer */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 rounded-t-2xl flex-shrink-0">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Détails de la commande
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                            aria-label="Fermer"
                        >
                            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    
                    {/* Contenu scrollable */}
                    <div className="flex-1 overflow-y-auto min-h-0">
                        <DeliveryOrderDetails
                            basketWithCustomer={basketWithCustomer}
                            onMarkAsDelivered={onMarkAsDelivered}
                            isMarkingAsDelivered={isMarkingAsDelivered}
                        />
                    </div>
                </div>
            </div>
        </>
    );
};