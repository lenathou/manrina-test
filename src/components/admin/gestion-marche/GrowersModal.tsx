import React from 'react';
import { MarketSessionWithProducts } from '@/types/market';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';

interface GrowersModalProps {
    isOpen: boolean;
    onClose: () => void;
    session: MarketSessionWithProducts | null;
}

export default function GrowersModal({ isOpen, onClose, session }: GrowersModalProps) {
    if (!isOpen || !session) return null;

    // Extraire les producteurs des participations
    const uniqueGrowers =
        session.participations?.map((participation) => ({
            id: participation.grower.id,
            name: participation.grower.name,
            email: participation.grower.email,
            status: participation.status,
            productCount: session.marketProducts?.filter((p) => p.grower.id === participation.grower.id).length || 0,
        })) || [];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <Text
                        variant="h3"
                        className="text-secondary"
                    >
                        Producteurs Participants - {session.name}
                    </Text>
                    <Button
                        onClick={onClose}
                        className="text-muted-foreground hover:text-secondary p-1 cursor-pointer"
                    >
                        ✕
                    </Button>
                </div>

                <div className="mb-4">
                    <Text
                        variant="small"
                        className="text-muted-foreground"
                    >
                        {uniqueGrowers.length} producteur{uniqueGrowers.length > 1 ? 's' : ''} participant
                        {uniqueGrowers.length > 1 ? 's' : ''}
                    </Text>
                </div>

                {uniqueGrowers.length === 0 ? (
                    <div className="text-center py-8">
                        <Text
                            variant="body"
                            className="text-muted-foreground"
                        >
                            Aucun producteur participant pour cette session
                        </Text>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {uniqueGrowers.map((producer) => {
                            return (
                                <div
                                    key={producer.id}
                                    className="flex items-center justify-between p-4 bg-background rounded-lg border border-muted"
                                >
                                    <div className="flex-1">
                                        <Text
                                            variant="h5"
                                            className="text-secondary"
                                        >
                                            {producer.name}
                                        </Text>
                                        <Text
                                            variant="small"
                                            className="text-muted-foreground"
                                        >
                                            {producer.email}
                                        </Text>
                                    </div>
                                    <div className="text-right">
                                        <Text
                                            variant="small"
                                            className="font-medium text-accent"
                                        >
                                            {producer.productCount} produit{producer.productCount > 1 ? 's' : ''}
                                        </Text>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="mt-6 flex justify-end">
                    <Button
                        onClick={onClose}
                        className="px-4 py-2 bg-muted text-muted-foreground rounded-md hover:bg-secondary hover:text-white transition-colors"
                    >
                        Fermer
                    </Button>
                </div>
            </div>
        </div>
    );
}
