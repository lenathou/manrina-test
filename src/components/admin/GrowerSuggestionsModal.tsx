import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { IMarketProductSuggestion } from '@/server/grower/IGrower';
import { useUpdateMarketProductSuggestionStatus } from '@/hooks/useMarketProductSuggestion';

interface GrowerSuggestionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    growerName: string;
    growerId: string;
    suggestions: IMarketProductSuggestion[];
    onSuggestionUpdated: () => void;
}

export const GrowerSuggestionsModal: React.FC<GrowerSuggestionsModalProps> = ({
    isOpen,
    onClose,
    growerName,
    suggestions,
    onSuggestionUpdated
}) => {
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [adminComments, setAdminComments] = useState<Record<string, string>>({});
    const updateStatusMutation = useUpdateMarketProductSuggestionStatus();

    if (!isOpen) return null;

    const getStatusBadgeColor = (status: string): string => {
        switch (status) {
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800';
            case 'APPROVED':
                return 'bg-green-100 text-green-800';
            case 'REJECTED':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status: string): string => {
        switch (status) {
            case 'PENDING':
                return 'En attente';
            case 'APPROVED':
                return 'Approuvée';
            case 'REJECTED':
                return 'Rejetée';
            default:
                return status;
        }
    };

    const handleStatusUpdate = async (suggestionId: string, newStatus: 'APPROVED' | 'REJECTED') => {
        if (
            !window.confirm(
                `Êtes-vous sûr de vouloir ${newStatus === 'APPROVED' ? 'approuver' : 'rejeter'} cette suggestion ?`,
            )
        ) {
            return;
        }

        setProcessingId(suggestionId);

        try {
            await updateStatusMutation.mutateAsync({
                id: suggestionId,
                status: newStatus,
                adminComment: adminComments[suggestionId] || undefined,
            });

            console.log(`Suggestion ${newStatus === 'APPROVED' ? 'approuvée' : 'rejetée'} avec succès`);

            // Nettoyer le commentaire après traitement
            setAdminComments((prev) => {
                const newComments = { ...prev };
                delete newComments[suggestionId];
                return newComments;
            });

            // Notifier le parent pour rafraîchir les données
            onSuggestionUpdated();
        } catch (err) {
            console.error('Erreur lors de la mise à jour du statut:', err);
            console.error('Erreur lors de la mise à jour du statut');
        } finally {
            setProcessingId(null);
        }
    };

    const handleCommentChange = (suggestionId: string, comment: string): void => {
        setAdminComments((prev) => ({
            ...prev,
            [suggestionId]: comment,
        }));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                {/* En-tête du modal */}
                <div className="bg-tertiary/60 px-6 py-4 border-b flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">
                            Suggestions de {growerName}
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            {suggestions.length} suggestion{suggestions.length > 1 ? 's' : ''} de produit{suggestions.length > 1 ? 's' : ''}
                        </p>
                    </div>
                    <Button
                        onClick={onClose}
                        variant="outline"
                        className="text-gray-500 hover:text-gray-700"
                    >
                        ✕
                    </Button>
                </div>

                {/* Contenu du modal */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                    {suggestions.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500">Aucune suggestion de produit pour ce producteur.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {suggestions.map((suggestion) => (
                                <Card key={suggestion.id} className="p-6">
                                    <div className="flex flex-col lg:flex-row gap-6">
                                        {/* Informations de la suggestion */}
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-4">
                                                <div>
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="text-lg font-semibold text-gray-800">
                                                            {suggestion.name}
                                                        </h3>
                                                        <span
                                                            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(suggestion.status)}`}
                                                        >
                                                            {getStatusText(suggestion.status)}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-600 mb-3">{suggestion.description}</p>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                                        <div>
                                                            <span className="font-medium text-gray-700">Prix:</span>
                                                            <span className="ml-2">
                                                                {suggestion.pricing}€/{suggestion.unit}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="font-medium text-gray-700">Catégorie:</span>
                                                            <span className="ml-2">{suggestion.category}</span>
                                                        </div>
                                                        <div>
                                                            <span className="font-medium text-gray-700">Créé le:</span>
                                                            <span className="ml-2">
                                                                {new Date(suggestion.createdAt).toLocaleDateString('fr-FR')}
                                                            </span>
                                                        </div>
                                                        {suggestion.processedAt && (
                                                            <div>
                                                                <span className="font-medium text-gray-700">Traité le:</span>
                                                                <span className="ml-2">
                                                                    {new Date(suggestion.processedAt).toLocaleDateString('fr-FR')}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {suggestion.adminComment && (
                                                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                                            <span className="font-medium text-blue-800">
                                                                Commentaire admin:
                                                            </span>
                                                            <p className="text-blue-700 mt-1">{suggestion.adminComment}</p>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Image */}
                                                {suggestion.imageUrl && (
                                                    <div className="flex-shrink-0">
                                                        <Image
                                                            src={suggestion.imageUrl}
                                                            alt={suggestion.name}
                                                            width={120}
                                                            height={120}
                                                            className="rounded-lg object-cover"
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Actions pour les suggestions en attente */}
                                            {suggestion.status === 'PENDING' && (
                                                <div className="border-t pt-4">
                                                    <div className="mb-4">
                                                        <Label
                                                            htmlFor={`comment-${suggestion.id}`}
                                                            className="text-sm font-medium mb-2 block"
                                                        >
                                                            Commentaire administrateur (optionnel)
                                                        </Label>
                                                        <Textarea
                                                            id={`comment-${suggestion.id}`}
                                                            value={adminComments[suggestion.id] || ''}
                                                            onChange={(e) => handleCommentChange(suggestion.id, e.target.value)}
                                                            placeholder="Ajoutez un commentaire pour expliquer votre décision..."
                                                            className="w-full"
                                                            rows={3}
                                                        />
                                                    </div>

                                                    <div className="flex gap-3">
                                                        <Button
                                                            onClick={() => handleStatusUpdate(suggestion.id, 'APPROVED')}
                                                            disabled={processingId === suggestion.id}
                                                            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                                                        >
                                                            <span>✅</span>
                                                            {processingId === suggestion.id ? 'Traitement...' : 'Approuver'}
                                                        </Button>
                                                        <Button
                                                            onClick={() => handleStatusUpdate(suggestion.id, 'REJECTED')}
                                                            disabled={processingId === suggestion.id}
                                                            variant="outline"
                                                            className="border-red-300 text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                        >
                                                            <span>❌</span>
                                                            {processingId === suggestion.id ? 'Traitement...' : 'Rejeter'}
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};