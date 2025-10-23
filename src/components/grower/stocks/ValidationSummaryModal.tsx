/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { usePendingVariantChanges } from '@/hooks/usePendingVariantChanges';

interface ValidationSummaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onValidate: () => void | Promise<void>;
    isValidating: boolean;
    growerId: string;
}

export function ValidationSummaryModal({ isOpen, onClose, onValidate, isValidating, growerId }: ValidationSummaryModalProps) {
    const { pendingChanges } = usePendingVariantChanges(growerId);
    const pendingChangesArray = Object.values(pendingChanges);
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-xl shadow-xl max-w-md w-full max-h-[80vh] flex flex-col">
                {/* ScrollArea contenant header et contenu */}
                <ScrollArea className="flex-1 rounded-t-xl">
                    <div>
                        {/* Header */}
                        <div className="p-6 bg-secondary rounded-t-xl">
                            <div className="flex items-center justify-between">
                                <Text variant="h3" className="text-white font-semibold">
                                    Récapitulatif des modifications
                                </Text>
                                <button
                                    onClick={onClose}
                                    disabled={isValidating}
                                    className="text-white hover:text-gray-200 transition-colors disabled:opacity-50"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 bg-background">
                            <div className="mb-4">
                                <Text variant="body" className="text-tertiary text-sm mb-3">
                                    Vous êtes sur le point d'envoyer les modifications relatives aux produits suivants à l'administrateur pour validation :
                                </Text>
                                
                                <Text variant="body" className="text-secondary text-sm font-medium mb-3">
                                    Produits à valider ({pendingChangesArray.length}) :
                                </Text>

                                {/* Liste des produits */}
                                <div>
                                    <ul className="space-y-1">
                                        {pendingChangesArray.map((product, index) => (
                                            <li key={index} className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0"></div>
                                                <Text variant="body" className="text-secondary text-sm">
                                                    {product.productName}
                                                </Text>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </ScrollArea>

                {/* Footer - en dehors du scroll */}
                <div className="p-6 flex-shrink-0 rounded-b-xl">
                    <div className="flex justify-end space-x-3">
                        <Button
                            variant="danger"
                            onClick={onClose}
                            disabled={isValidating}
                            className="px-4 py-2"
                        >
                            Annuler
                        </Button>
                        <Button
                            variant="primary"
                            onClick={onValidate}
                            disabled={isValidating}
                            className="px-4 py-2"
                        >
                            {isValidating ? 'Validation en cours...' : 'Valider'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}