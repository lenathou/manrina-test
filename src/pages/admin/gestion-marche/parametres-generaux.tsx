import React from 'react';
import { Text } from '@/components/ui/Text';
import { PartnersPageContent } from './partenaires';
import { AssignmentsTab } from '@/components/admin/gestion-marche/AssignmentsTab';
import { MarketSession, MarketStatus, Prisma } from '@prisma/client';
import { ModernTabs, ModernTabItem, useModernTabs } from '@/components/ui/ModernTabs';

function ParametresGenerauxPage() {
    const { activeTab, handleTabChange } = useModernTabs('partenaires');

    const tabs: ModernTabItem[] = [
        { id: 'partenaires', label: 'Gestion des Partenaires' },
        { id: 'affectations', label: 'Gestion des Affectations' },
        { id: 'general', label: 'Paramètres Généraux' },
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'partenaires':
                return <PartnersPageContent />;
            case 'affectations':
                // Créer une session mock pour le composant AssignmentsTab
                const mockSession: MarketSession = {
                    id: 'mock-session-id',
                    name: 'Session de test',
                    date: new Date(),
                    status: MarketStatus.UPCOMING,
                    description: 'Session pour la gestion des affectations',
                    location: 'Marché Central',
                    startTime: new Date(),
                    endTime: new Date(),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    commissionRate: new Prisma.Decimal(7.0),
                    tentsStatus: 'none',
                    tablesStatus: 'none',
                    chairsStatus: 'none',
                };
                return <AssignmentsTab session={mockSession} />;
            case 'general':
                return (
                    <div>
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Paramètres Généraux</h3>
                            <p className="mt-1 text-sm text-gray-600">Configuration générale de la gestion de marché</p>
                        </div>
                        <div className="px-6 py-6">
                            <p className="text-gray-500">Fonctionnalité à venir...</p>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            {/* En-tête */}
            <div className="p-6">
                <Text
                    variant="h1"
                    className="font-secondary font-bold text-2xl sm:text-3xl text-[var(--color-secondary)] mb-4"
                >
                    Paramètres Généraux - Gestion Marché
                </Text>
                <p className="text-base sm:text-lg text-[var(--muted-foreground)]">
                    Configurez les paramètres de la gestion de marché, gérez les partenaires et les affectations.
                </p>
            </div>

            {/* Onglets */}
            <div className="px-6">
                <ModernTabs
                    items={tabs}
                    activeTab={activeTab}
                    onTabChange={handleTabChange}
                    variant="elegant"
                    fullWidth={true}
                />
                
                {/* Contenu de l'onglet */}
                <div className="mt-6">{renderTabContent()}</div>
            </div>
        </div>
    );
}

export default ParametresGenerauxPage;
