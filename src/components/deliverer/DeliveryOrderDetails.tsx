import React, { useState } from 'react';
import { BasketWithCustomerToShow, getDeliveryTypeFromBasket } from '../../server/checkout/IBasket';
import { convertUTCToLocaleString } from '../../utils/dateUtils';

interface DeliveryOrderDetailsProps {
    basketWithCustomer: BasketWithCustomerToShow;
    onMarkAsDelivered?: (basketId: string) => void;
    isMarkingAsDelivered?: boolean;
    showBackButton?: boolean;
    onBack?: () => void;
}

export const DeliveryOrderDetails: React.FC<DeliveryOrderDetailsProps> = ({
    basketWithCustomer,
    onMarkAsDelivered,
    isMarkingAsDelivered = false,
    showBackButton = false,
    onBack,
}) => {
    const { basket, customer } = basketWithCustomer;
    const [showItems, setShowItems] = useState(false);

    const canMarkAsDelivered = basket.paymentStatus === 'paid' && !basket.delivered;

    const handleCall = () => {
        if (customer.phone) {
            window.open(`tel:${customer.phone}`, '_self');
        }
    };

    const handleNavigate = () => {
        if (basket.address) {
            const address = `${basket.address.address}, ${basket.address.city}, ${basket.address.postalCode}`;
            const encodedAddress = encodeURIComponent(address);
            window.open(`https://maps.google.com/?q=${encodedAddress}`, '_blank');
        }
    };

    return (
        <div className=" h-full overflow-y-auto">
            {/* Header avec bouton retour pour mobile */}
            {showBackButton && (
                <div className="lg:hidden flex items-center p-4 border-b border-gray-200 bg-gray-50">
                    <button
                        onClick={onBack}
                        className="flex items-center text-gray-600 hover:text-gray-800"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Retour
                    </button>
                </div>
            )}

            <div className="p-6">
                {/* En-tête de la commande */}
                <div className="mb-6">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Commande #{basket.orderIndex}</h1>
                            <p className="text-sm text-gray-600 mt-1">
                                Créée le {convertUTCToLocaleString(basket.createdAt)}
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-orange-600">{basket.total}€</div>
                            <StatusBadge status={basket.paymentStatus} />
                        </div>
                    </div>

                    {basket.delivered && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span className="text-green-800 font-medium">Commande livrée le {basket.delivered}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Informations client */}
                <div className=" rounded-lg p-4 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">👤 Informations client</h2>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-900">{customer.name}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">📧 {customer.email}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">📞 {customer.phone}</span>
                            <button
                                onClick={handleCall}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                            >
                                Appeler
                            </button>
                        </div>
                    </div>
                </div>

                {/* Informations de livraison */}
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">🚚 Livraison</h2>
                    <div className="space-y-3">
                        <div>
                            <span className="text-sm text-gray-600">Type de livraison</span>
                            <p className="font-medium text-gray-900">{getDeliveryTypeFromBasket(basket)}</p>
                        </div>
                        
                        <div>
                            <span className="text-sm text-gray-600">Date prévue</span>
                            <p className="font-medium text-gray-900">{basket.deliveryDay || 'Non définie'}</p>
                        </div>

                        {basket.address && (
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-600">Adresse</span>
                                    <button
                                        onClick={handleNavigate}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        📍 Naviguer
                                    </button>
                                </div>
                                <div className="bg-white rounded p-3 border">
                                    <p className="font-medium text-gray-900">{basket.address.address}</p>
                                    <p className="text-gray-600">{basket.address.city}, {basket.address.postalCode}</p>
                                </div>
                            </div>
                        )}

                        {basket.deliveryMessage && (
                            <div>
                                <span className="text-sm text-gray-600">Message de livraison</span>
                                <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mt-1">
                                    <p className="text-gray-900">{basket.deliveryMessage}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Articles commandés */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <button
                        onClick={() => setShowItems(!showItems)}
                        className="flex items-center justify-between w-full text-left"
                    >
                        <h2 className="text-lg font-semibold text-gray-900">📦 Articles ({basket.items.length})</h2>
                        <svg
                            className={`w-5 h-5 text-gray-600 transition-transform ${showItems ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    
                    {showItems && (
                        <div className="mt-4 space-y-3">
                            {basket.items.map((item, index) => (
                                <div key={index} className="bg-white rounded p-3 border">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h3 className="font-medium text-gray-900">{item.name}</h3>
                                            {item.description && (
                                                <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                                            )}
                                        </div>
                                        <div className="text-right ml-4">
                                            <p className="font-medium text-gray-900">{item.quantity}x</p>
                                            <p className="text-sm text-gray-600">{item.price}€/unité</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Actions */}
                {canMarkAsDelivered && onMarkAsDelivered && (
                    <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 -mx-6">
                        <button
                            onClick={() => onMarkAsDelivered(basket.id)}
                            disabled={isMarkingAsDelivered}
                            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                        >
                            {isMarkingAsDelivered ? 'Marquage en cours...' : '✓ Marquer comme livré'}
                        </button>
                    </div>
                )}
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