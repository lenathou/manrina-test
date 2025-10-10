/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from '@/components/ui/Card';

interface DeclineParticipationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    sessionName: string;
    sessionDate: string;
    isLoading?: boolean;
}

export function DeclineParticipationModal({
    isOpen,
    onClose,
    onConfirm,
    sessionName,
    sessionDate,
    isLoading = false
}: DeclineParticipationModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card 
                variant="elevated" 
                className="w-full max-w-md bg-background p-0"
            >
                {/* Header */}
                <CardHeader className="text-center bg-secondary text-white p-6 m-0">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                            className="w-6 h-6 text-red-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                            />
                        </svg>
                    </div>
                    <CardTitle className="text-lg font-semibold text-white mb-2">
                        Confirmer le refus de participation
                    </CardTitle>
                </CardHeader>

                {/* Content */}
                <CardContent className="bg-background text-center space-y-3 p-6">
                    <p className="text-gray-600">
                        Êtes-vous sûr de vouloir décliner votre participation à cette session ?
                    </p>
                    
                    <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="font-medium text-gray-900">{sessionName}</p>
                        <p className="text-sm text-gray-600">{sessionDate}</p>
                    </div>

                    <p className="text-sm text-red-600">
                        ⚠️ Cette action ne peut pas être annulée. Vous devrez contacter l'administration pour participer à nouveau.
                    </p>
                </CardContent>

                {/* Actions */}
                <CardFooter className="flex flex-col sm:flex-row gap-3 p-6 border-t border-gray-200">
                    <Button
                        onClick={onClose}
                        variant="outline"
                        size="md"
                        className="flex-1"
                        disabled={isLoading}
                    >
                        Annuler
                    </Button>
                    <Button
                        onClick={onConfirm}
                        variant="danger"
                        size="md"
                        className="flex-1"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Refus en cours...' : 'Confirmer le refus'}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}