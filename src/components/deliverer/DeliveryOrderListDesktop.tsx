import React from 'react';
import { BasketWithCustomerToShow } from '../../server/checkout/IBasket';
import { convertUTCToLocaleString } from '../../utils/dateUtils';

interface DeliveryOrderListDesktopProps {
    orders: BasketWithCustomerToShow[];
    selectedOrder: BasketWithCustomerToShow | null;
    onSelectOrder: (order: BasketWithCustomerToShow) => void;
}

export const DeliveryOrderListDesktop: React.FC<DeliveryOrderListDesktopProps> = ({
    orders,
    selectedOrder,
    onSelectOrder,
}) => {
    return (
        <div className="hidden lg:block w-1/3 bg-white border-r border-gray-200 overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">Commandes à livrer</h2>
                <p className="text-sm text-gray-600">{orders.length} commande(s)</p>
            </div>
            
            <div className="divide-y divide-gray-100">
                {orders.map((orderItem) => {
                    const { basket, customer } = orderItem;
                    const isSelected = selectedOrder?.basket.id === basket.id;
                    
                    return (
                        <div
                            key={basket.id}
                            onClick={() => onSelectOrder(orderItem)}
                            className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                                isSelected ? 'bg-orange-50 border-l-4 border-orange-500' : ''
                            }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-sm font-medium text-gray-900">
                                            #{basket.orderIndex}
                                        </span>
                                        <StatusBadge status={basket.paymentStatus} />
                                        {basket.delivered && (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                Livré
                                            </span>
                                        )}
                                    </div>
                                    
                                    <h3 className="font-medium text-gray-900 mb-1">{customer.name}</h3>
                                    
                                    <div className="space-y-1 text-sm text-gray-600">
                                        <div className="flex items-center gap-1">
                                            <span>📅</span>
                                            <span>{basket.deliveryDay || 'Date non définie'}</span>
                                        </div>
                                        {basket.address && (
                                            <div className="flex items-center gap-1">
                                                <span>📍</span>
                                                <span>{basket.address.city}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1">
                                            <span>📞</span>
                                            <span>{customer.phone}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="text-right">
                                    <div className="text-lg font-semibold text-orange-600">
                                        {basket.total}€
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {convertUTCToLocaleString(basket.createdAt)}
                                    </div>
                                </div>
                            </div>
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