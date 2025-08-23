import React from 'react';
import { MarketProductSuggestionsManager } from '@/components/admin/MarketProductSuggestionsManager';
import { Text } from '@/components/ui/Text';
import { IAdminTokenPayload } from '@/server/admin/IAdmin';

interface AdminSuggestionsProduitsPageProps {
    authenticatedAdmin: IAdminTokenPayload;
}

function AdminSuggestionsProduitsPage({ }: AdminSuggestionsProduitsPageProps) {
    return (
        <div className="space-y-6">
            {/* En-tête de la page */}
            <div className="rounded-lg shadow p-6 bg-white">
                <Text
                    variant="h2"
                    className="font-secondary font-bold text-2xl sm:text-3xl text-[var(--color-secondary)] mb-4"
                >
                    Suggestions de Produits
                </Text>
                <p className="text-base sm:text-lg text-[var(--muted-foreground)]">
                    Gérez les suggestions de nouveaux produits soumises par les producteurs
                </p>
            </div>

            {/* Composant de gestion des suggestions */}
            <MarketProductSuggestionsManager />
        </div>
    );
}

export default AdminSuggestionsProduitsPage;