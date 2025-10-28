import React from 'react';
import { BasketWithCustomerToShow } from '../../server/checkout/IBasket';
import { convertUTCToLocaleString } from '../../utils/dateUtils';

interface DeliveryOrderListMobileProps {
    orders: BasketWithCustomerToShow[];
    selectedOrder: BasketWithCustomerToShow | null;
    onSelectOrder: (order: BasketWithCustomerToShow) => void;
    showDetails: boolean;
    onToggleDetails: () => void;
}

export const DeliveryOrderListMobile: React.FC<DeliveryOrderListMobileProps> = ({
    orders,
    onSelectOrder,
}) => {

    return (
        <div className="lg:hidden ">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-800">Livraisons du jour</h2>
                <p className="text-sm text-gray-600">{orders.length} commande(s) à livrer</p>
            </div>
            
            <div className="divide-y divide-gray-100 max-h-screen overflow-y-auto">
                {orders.map((orderItem) => {
                    const { basket, customer } = orderItem;
                    
                    return (
                        <div
                            key={basket.id}
                            onClick={() => onSelectOrder(orderItem)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    onSelectOrder(orderItem);
                                }
                            }}
                            role="button"
                            tabIndex={0}
                            aria-label={`Voir les détails de la commande #${basket.orderIndex} de ${customer.name}`}
                            className="p-4 active:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-sm font-bold text-gray-900">
                                            #{basket.orderIndex}
                                        </span>
                                        <StatusBadge status={basket.paymentStatus} />
                                        {basket.delivered && (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                ✓ Livré
                                            </span>
                                        )}
                                    </div>
                                    
                                    <h3 className="font-semibold text-gray-900 mb-2 truncate">{customer.name}</h3>
                                    
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <span className="text-base">📅</span>
                                            <span className="truncate">{basket.deliveryDay || 'Date non définie'}</span>
                                        </div>
                                        {basket.address && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <span className="text-base">📍</span>
                                                <span className="truncate">{basket.address.address}, {basket.address.city}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <span className="text-base">📞</span>
                                            <span>{customer.phone}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex flex-col items-end ml-4">
                                    <div className="text-lg font-bold text-orange-600 mb-1">
                                        {basket.total}€
                                    </div>
                                    <div className="text-xs text-gray-500 text-right">
                                        {convertUTCToLocaleString(basket.createdAt)}
                                    </div>
                                    <div className="mt-2">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            
                            {basket.deliveryMessage && (
                                <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                                    <p className="text-sm text-blue-800">
                                        <span className="font-medium">Message:</span> {basket.deliveryMessage}
                                    </p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const getStatusConfig = () => {
        switch (status) {
            case 'paid':
                return { label: 'Payé', className: 'bg-green-100 text-green-800' };
            case 'pending':
                return { label: 'En attente', className: 'bg-yellow-100 text-yellow-800' };
            case 'cancelled':
                return { label: 'Annulé', className: 'bg-red-100 text-red-800' };
            default:
                return { label: status, className: 'bg-gray-100 text-gray-800' };
        }
    };

    const config = getStatusConfig();
    
    return (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
            {config.label}
        </span>
    );
};