import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { MarketProductSuggestionForm } from '@/components/grower/mon-marche/mon-stand/MarketProductSuggestionForm';
import { formatDateLong } from '@/utils/dateUtils';
import { IMarketProductSuggestion } from '@/server/grower/IGrower';

interface ProductSuggestionsSectionProps {
    showSuggestionForm: boolean;
    setShowSuggestionForm: (show: boolean) => void;
    showSuggestions: boolean;
    setShowSuggestions: (show: boolean) => void;
    marketSuggestions: IMarketProductSuggestion[];
    suggestionsLoading: boolean;
    growerId: string;
    handleSuggestionSuccess: () => void;
    getStatusBadgeColor: (status: string) => string;
    getStatusText: (status: string) => string;
    handleConvertToNormalProduct: (id: string) => void;
    handleDeleteSuggestion: (id: string) => void;
}

export function ProductSuggestionsSection({
    showSuggestionForm,
    setShowSuggestionForm,
    showSuggestions,
    setShowSuggestions,
    marketSuggestions,
    suggestionsLoading,
    growerId,
    handleSuggestionSuccess,
    getStatusBadgeColor,
    getStatusText,
    handleConvertToNormalProduct,
    handleDeleteSuggestion,
}: ProductSuggestionsSectionProps) {
    return (
        <div className="mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800">Suggestions de produits de marché</h3>
                <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                        onClick={() => setShowSuggestionForm(!showSuggestionForm)}
                        variant="outline"
                        className="flex items-center gap-2 text-sm"
                    >
                        <span>💡</span>
                        {showSuggestionForm ? 'Masquer le formulaire' : 'Suggérer un produit'}
                    </Button>
                    <Button
                        onClick={() => setShowSuggestions(!showSuggestions)}
                        variant="outline"
                        className="flex items-center gap-2 text-sm"
                    >
                        <span>📋</span>
                        {showSuggestions
                            ? 'Masquer mes suggestions'
                            : `Voir mes suggestions (${marketSuggestions.length})`}
                    </Button>
                </div>
            </div>

            {showSuggestionForm && (
                <div className="mb-4">
                    <MarketProductSuggestionForm
                        growerId={growerId}
                        onSuccess={handleSuggestionSuccess}
                        onCancel={() => setShowSuggestionForm(false)}
                    />
                </div>
            )}

            {showSuggestions && (
                <div className="space-y-3">
                    {suggestionsLoading ? (
                        <p className="text-gray-500 text-sm">Chargement des suggestions...</p>
                    ) : marketSuggestions.length === 0 ? (
                        <p className="text-gray-500 text-sm">Aucune suggestion de produit pour le moment.</p>
                    ) : (
                        marketSuggestions.map((suggestion) => (
                            <div
                                key={suggestion.id}
                                className="border rounded-lg p-3 "
                            >
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h4 className="font-medium text-gray-800">{suggestion.name}</h4>
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(suggestion.status)}`}
                                            >
                                                {getStatusText(suggestion.status)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">{suggestion.description}</p>
                                        <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                                            <span>
                                                Prix: {suggestion.pricing}€/{suggestion.unit}
                                            </span>
                                            <span>Catégorie: {suggestion.category}</span>
                                            <span>Créé le: {formatDateLong(suggestion.createdAt)}</span>
                                        </div>
                                        {suggestion.adminComment && (
                                            <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                                                <strong>Commentaire admin:</strong> {suggestion.adminComment}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        {suggestion.imageUrl && (
                                            <Image
                                                src={suggestion.imageUrl}
                                                alt={suggestion.name}
                                                width={60}
                                                height={60}
                                                className="rounded object-cover"
                                            />
                                        )}
                                        {suggestion.status === 'APPROVED' && (
                                            <Button
                                                onClick={() => handleConvertToNormalProduct(suggestion.id)}
                                                variant="outline"
                                                size="sm"
                                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                            >
                                                Convertir en produit normal
                                            </Button>
                                        )}
                                        {suggestion.status === 'PENDING' && (
                                            <Button
                                                onClick={() => handleDeleteSuggestion(suggestion.id)}
                                                variant="outline"
                                                size="sm"
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            >
                                                🗑️
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
