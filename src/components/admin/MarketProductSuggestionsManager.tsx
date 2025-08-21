import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/Select';
// import { useToast } from '@/hooks/use-toast';
import {
    useAllMarketProductSuggestions,
    useUpdateMarketProductSuggestionStatus,
} from '@/hooks/useMarketProductSuggestion';
import { IMarketProductSuggestion } from '@/server/grower/IGrower';

interface MarketProductSuggestionsManagerProps {
    className?: string;
}

export const MarketProductSuggestionsManager: React.FC<MarketProductSuggestionsManagerProps> = ({ className }) => {
    const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [adminComments, setAdminComments] = useState<Record<string, string>>({});

    const { data: suggestions = [], isLoading, refetch } = useAllMarketProductSuggestions();
    const updateStatusMutation = useUpdateMarketProductSuggestionStatus();

    const filteredSuggestions = suggestions.filter((suggestion: IMarketProductSuggestion) => {
        if (selectedStatus === 'ALL') return true;
        return suggestion.status === selectedStatus;
    });

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

    const pendingCount = suggestions.filter((s: IMarketProductSuggestion) => s.status === 'PENDING').length;
    const approvedCount = suggestions.filter((s: IMarketProductSuggestion) => s.status === 'APPROVED').length;
    const rejectedCount = suggestions.filter((s: IMarketProductSuggestion) => s.status === 'REJECTED').length;

    if (isLoading) {
        return (
            <div className={`p-6 ${className}`}>
                <div className="text-center">
                    <p className="text-gray-500">Chargement des suggestions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`space-y-6 ${className}`}>
            {/* En-tête avec statistiques */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">Gestion des suggestions de produits</h2>
                        <p className="text-gray-600 text-sm mt-1">
                            Gérez les suggestions de nouveaux produits soumises par les producteurs
                        </p>
                    </div>
                    <Button
                        onClick={() => refetch()}
                        variant="outline"
                        className="flex items-center gap-2"
                    >
                        <span>🔄</span>
                        Actualiser
                    </Button>
                </div>

                {/* Statistiques */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{suggestions.length}</div>
                        <div className="text-sm text-blue-600">Total</div>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
                        <div className="text-sm text-yellow-600">En attente</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
                        <div className="text-sm text-green-600">Approuvées</div>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">{rejectedCount}</div>
                        <div className="text-sm text-red-600">Rejetées</div>
                    </div>
                </div>

                {/* Filtre par statut */}
                <div className="flex items-center gap-4">
                    <Label
                        htmlFor="status-filter"
                        className="text-sm font-medium"
                    >
                        Filtrer par statut:
                    </Label>
                    <Select
                        value={selectedStatus}
                        onValueChange={setSelectedStatus}
                    >
                        <SelectTrigger className="w-48">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Toutes les suggestions</SelectItem>
                            <SelectItem value="PENDING">En attente</SelectItem>
                            <SelectItem value="APPROVED">Approuvées</SelectItem>
                            <SelectItem value="REJECTED">Rejetées</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Liste des suggestions */}
            <div className="space-y-4">
                {filteredSuggestions.length === 0 ? (
                    <Card className="p-6 text-center">
                        <p className="text-gray-500">
                            {selectedStatus === 'ALL'
                                ? 'Aucune suggestion de produit pour le moment.'
                                : `Aucune suggestion ${getStatusText(selectedStatus).toLowerCase()} pour le moment.`}
                        </p>
                    </Card>
                ) : (
                    filteredSuggestions.map((suggestion: IMarketProductSuggestion) => (
                        <Card
                            key={suggestion.id}
                            className="p-6"
                        >
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
                                                    <span className="font-medium text-gray-700">Producteur ID:</span>
                                                    <span className="ml-2">{suggestion.growerId}</span>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-700">Créé le:</span>
                                                    <span className="ml-2">
                                                        {new Date(suggestion.createdAt).toLocaleDateString('fr-FR')}
                                                    </span>
                                                </div>
                                            </div>

                                            {suggestion.processedAt && (
                                                <div className="mt-2 text-sm">
                                                    <span className="font-medium text-gray-700">Traité le:</span>
                                                    <span className="ml-2">
                                                        {new Date(suggestion.processedAt).toLocaleDateString('fr-FR')}
                                                    </span>
                                                </div>
                                            )}

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
                    ))
                )}
            </div>
        </div>
    );
};
