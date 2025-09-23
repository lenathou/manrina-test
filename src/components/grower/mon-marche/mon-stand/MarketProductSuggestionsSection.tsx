import React from 'react';
import { Button } from '@/components/ui/Button';
import { MarketProductSuggestionForm } from '@/components/grower/mon-marche/mon-stand/MarketProductSuggestionForm';

interface ProductSuggestionsSectionProps {
    showSuggestionForm: boolean;
    setShowSuggestionForm: (show: boolean) => void;
    growerId: string;
    handleSuggestionSuccess: () => void;
}

export function ProductSuggestionsSection({
    showSuggestionForm,
    setShowSuggestionForm,
    growerId,
    handleSuggestionSuccess,
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

            {/* Liste des suggestions supprimée */}

        </div>
    );
}
