/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import { Button } from '@/components/ui/Button';
import { IPanyenProduct } from '@/server/panyen/IPanyen';

interface ForceAvailabilityModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    panyen: IPanyenProduct;
    blockingProducts: string[];
    isLoading?: boolean;
}

export function ForceAvailabilityModal({
    isOpen,
    onClose,
    onConfirm,
    panyen,
    blockingProducts,
    isLoading = false
}: ForceAvailabilityModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay */}
            <div 
                className="absolute inset-0 bg-black bg-opacity-50"
                onClick={onClose}
            />
            
            {/* Modal */}
            <div className="relative bg-background rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
                <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Forcer la disponibilité
                    </h3>
                    <p className="text-sm text-gray-600">
                        Vous tentez d'activer le panier "<strong>{panyen.name}</strong>" mais certains produits ne sont pas disponibles en stock.
                    </p>
                </div>

                {blockingProducts.length > 0 && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                        <h4 className="text-sm font-medium text-red-800 mb-2">
                            Produits en rupture de stock :
                        </h4>
                        <ul className="text-sm text-red-700 space-y-1">
                            {blockingProducts.map((product, index) => (
                                <li key={index} className="flex items-center">
                                    <span className="w-2 h-2 bg-red-400 rounded-full mr-2 flex-shrink-0" />
                                    {product}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-sm text-yellow-800">
                        <strong>Attention :</strong> En forçant la disponibilité, ce panier sera visible dans la boutique même si des produits sont en rupture. 
                        Les clients pourront commander ce panier mais vous devrez gérer manuellement les produits manquants.
                    </p>
                </div>

                <div className="flex gap-3 justify-end">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Annuler
                    </Button>
                    <Button
                        variant="danger"
                        onClick={onConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Activation...' : 'Forcer l\'activation'}
                    </Button>
                </div>
            </div>
        </div>
    );
}