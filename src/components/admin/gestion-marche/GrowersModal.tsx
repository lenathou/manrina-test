import React from 'react';
import { MarketSessionWithProducts } from '@/types/market';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from '@/components/ui/Card';

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
            <Card className="max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto bg-background p-0">
                <CardHeader className="bg-secondary text-white p-6 m-0">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-xl font-bold text-white">
                            Producteurs Participants - {session.name}
                        </CardTitle>
                        <button
                            onClick={onClose}
                            className="text-white hover:text-gray-200 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </CardHeader>

                <CardContent className="bg-background p-6">
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
                </CardContent>

                <CardFooter className="flex justify-end p-6 border-t border-gray-200">
                    <Button
                        onClick={onClose}
                        className="px-4 py-2 bg-muted text-muted-foreground rounded-md hover:bg-secondary hover:text-white transition-colors"
                    >
                        Fermer
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
