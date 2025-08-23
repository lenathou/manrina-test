import React, { useState } from 'react';

import { DeliveryOrdersManager } from '@/components/deliverer/DeliveryOrdersManager';
import { useDelivererOrders } from '@/hooks/useDelivererOrders';
import { IDelivererTokenPayload } from '@/server/deliverer/IDeliverer';

interface DelivererCommandesPageProps {
    authenticatedDeliverer: IDelivererTokenPayload;
}

function DelivererCommandesContent({ authenticatedDeliverer }: DelivererCommandesPageProps) {
    const { orders, isLoading, isError, error, refetch, filters } = useDelivererOrders();
    const [isFiltersVisible, setIsFiltersVisible] = useState(false);

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-red-600">
                <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-medium text-red-900 mb-2">Erreur de chargement</h3>
                <p className="text-red-700 text-center mb-4">
                    {error instanceof Error ? error.message : 'Une erreur est survenue lors du chargement des commandes.'}
                </p>
                <button
                    onClick={() => refetch()}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    Réessayer
                </button>
            </div>
        );
    }

    return (
        <div className="h-full bg-background rounded-xl flex flex-col">
            {/* Header avec statistiques et filtres */}
            <div className=" border-b border-gray-200 p-4 lg:p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Mes livraisons</h1>
                            <p className="text-gray-600 mt-1">
                                Zone: <span className="font-medium">{authenticatedDeliverer.zone}</span>
                            </p>
                        </div>
                        
                        {/* Bouton toggle pour mobile */}
                        <button
                            onClick={() => setIsFiltersVisible(!isFiltersVisible)}
                            className="lg:hidden p-2 rounded-lg bg-gray-100 hover:bg-gray-200 active:bg-gray-300 transition-all duration-200 transform active:scale-95"
                            aria-label="Afficher/masquer les filtres"
                        >
                            <svg 
                                className={`w-5 h-5 transition-all duration-300 ease-in-out ${isFiltersVisible ? 'rotate-180' : ''}`} 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    </div>
                    
                    {/* Statistiques rapides */}
                    <div className={`flex gap-4 transition-all duration-300 ease-in-out ${isFiltersVisible ? 'block animate-fadeIn' : 'hidden lg:flex'}`}>
                        <div className="bg-orange-50 px-4 py-2 rounded-lg">
                            <div className="text-sm text-orange-600 font-medium">Total</div>
                            <div className="text-xl font-bold text-orange-800">{orders.length}</div>
                        </div>
                        <div className="bg-green-50 px-4 py-2 rounded-lg">
                            <div className="text-sm text-green-600 font-medium">Livrées</div>
                            <div className="text-xl font-bold text-green-800">
                                {orders.filter(order => order.basket.delivered).length}
                            </div>
                        </div>
                        <div className="bg-blue-50 px-4 py-2 rounded-lg">
                            <div className="text-sm text-blue-600 font-medium">En attente</div>
                            <div className="text-xl font-bold text-blue-800">
                                {orders.filter(order => !order.basket.delivered && order.basket.paymentStatus === 'paid').length}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filtres */}
                <div className={`mt-4 flex flex-wrap items-center gap-4 transition-all duration-300 ease-in-out ${isFiltersVisible ? 'block animate-fadeIn' : 'hidden lg:flex'}`}>
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700">Depuis le:</label>
                        <input
                            type="date"
                            value={filters.afterDate?.toISOString().split('T')[0]}
                            onChange={(e) => {
                                const dateToSet = new Date(e.target.value);
                                if (!isNaN(dateToSet.getTime()) && dateToSet <= new Date()) {
                                    filters.setAfterDate(dateToSet);
                                }
                            }}
                            className="border border-gray-300 rounded px-3 py-1 text-sm"
                        />
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="onlyPaid"
                            checked={filters.onlyPaid}
                            onChange={(e) => filters.setOnlyPaid(e.target.checked)}
                            className="rounded border-gray-300"
                        />
                        <label htmlFor="onlyPaid" className="text-sm text-gray-700">Payées uniquement</label>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="onlyNotDelivered"
                            checked={filters.onlyNotDelivered}
                            onChange={(e) => filters.setOnlyNotDelivered(e.target.checked)}
                            className="rounded border-gray-300"
                        />
                        <label htmlFor="onlyNotDelivered" className="text-sm text-gray-700">Non livrées uniquement</label>
                    </div>
                    
                    <button
                        onClick={() => refetch()}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm transition-colors"
                    >
                        🔄 Actualiser
                    </button>
                </div>
            </div>

            {/* Contenu principal */}
            <div className="flex-1 overflow-hidden">
                <DeliveryOrdersManager orders={orders} isLoading={isLoading} />
            </div>
        </div>
    );
}

const DelivererCommandesPage = DelivererCommandesContent;

export default DelivererCommandesPage;