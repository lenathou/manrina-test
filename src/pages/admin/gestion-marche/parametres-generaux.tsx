import React, { useState } from 'react';
import { Text } from '@/components/ui/Text';
import { PartnersPageContent } from './partenaires';
import { AssignmentsTab } from '@/components/admin/marche/AssignmentsTab';
import { MarketSession, Prisma } from '@prisma/client';

function ParametresGenerauxPage() {
  const [activeTab, setActiveTab] = useState('partenaires');

  const tabs = [
    { id: 'partenaires', label: 'Gestion des Partenaires', icon: '🤝' },
    { id: 'affectations', label: 'Gestion des Affectations', icon: '📍' },
    { id: 'general', label: 'Paramètres Généraux', icon: '⚙️' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'partenaires':
        return <PartnersPageContent />;
      case 'affectations':
        // Créer une session mock pour le composant AssignmentsTab
        const mockSession: MarketSession = {
          id: 'mock-session',
          name: 'Session de test',
          date: new Date(),
          status: 'UPCOMING',
          description: 'Session pour la gestion des affectations',
          location: 'Marché Central',
          startTime: new Date(),
          endTime: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          isAutomatic: false,
          recurringDay: null,
          timezone: 'America/Martinique',
          autoCreateTime: '20:00',
          commissionRate: new Prisma.Decimal(7.0),
          tentsStatus: 'none',
          tablesStatus: 'none',
          chairsStatus: 'none',
        };
        return <AssignmentsTab session={mockSession} />;
      case 'general':
        return (
          <div >
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Paramètres Généraux</h3>
              <p className="mt-1 text-sm text-gray-600">
                Configuration générale de la gestion de marché
              </p>
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
      <div className="bg-white rounded-lg shadow p-6">
        <Text variant="h1" className="font-secondary font-bold text-2xl sm:text-3xl text-[var(--color-secondary)] mb-4">
          Paramètres Généraux - Gestion Marché
        </Text>
        <p className="text-base sm:text-lg text-[var(--muted-foreground)]">
          Configurez les paramètres de la gestion de marché, gérez les partenaires et les affectations.
        </p>
      </div>

      {/* Onglets */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-all duration-200`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Contenu de l'onglet */}
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}

export default ParametresGenerauxPage;