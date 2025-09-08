import React from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Label } from '@/components/ui/Label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/Select';
import { formatDateLong } from '@/utils/dateUtils';
import { Prisma } from '@prisma/client';

type MarketProduct = Prisma.MarketProductGetPayload<{
  include: {
    grower: true;
    marketSession: true;
  };
}>;

type MarketSession = {
  id: string;
  name: string;
  date: Date | string;
  location: string | null;
  status: string;
};

const InfoIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

interface SendProductsSectionProps {
  standProducts: MarketProduct[];
  setShowExplanationModal: (show: boolean) => void;
  selectedSessionId: string;
  setSelectedSessionId: (id: string) => void;
  upcomingSessionsLoading: boolean;
  upcomingSessions: MarketSession[];
  activeSession: MarketSession | null;
  isValidatingProducts: boolean;
  handleSendProductsToSession: () => void;
}

export function SendProductsSection({
  standProducts,
  setShowExplanationModal,
  selectedSessionId,
  setSelectedSessionId,
  upcomingSessionsLoading,
  upcomingSessions,
  activeSession,
  isValidatingProducts,
  handleSendProductsToSession
}: SendProductsSectionProps) {
  if (standProducts.length === 0) {
    return null;
  }

  return (
    <Card className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">📤 Envoyer ma liste de produits</h3>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowExplanationModal(true)}
          className="flex items-center gap-2 text-sm"
        >
          <InfoIcon className="w-4 h-4" />
          Aide
        </Button>
      </div>
      
      <p className="text-sm text-gray-600 mb-4">
        Sélectionnez une session de marché à venir pour y envoyer votre liste de produits actuelle.
        Cela permettra aux administrateurs de voir vos produits pour cette session.
      </p>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="sessionSelect" className="text-sm font-medium">
            Choisir une session de marché
          </Label>
          <Select 
            value={selectedSessionId} 
            onValueChange={setSelectedSessionId}
            disabled={upcomingSessionsLoading}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Sélectionner une session..." />
            </SelectTrigger>
            <SelectContent>
              {upcomingSessions
                .filter(session => session.id !== activeSession?.id)
                .map((session) => (
                  <SelectItem key={session.id} value={session.id}>
                    {formatDateLong(session.date)} - {session.location}
                  </SelectItem>
                ))
              }
            </SelectContent>
          </Select>
        </div>
        
        {selectedSessionId && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>{standProducts.length} produit{standProducts.length > 1 ? 's' : ''}</strong> sera{standProducts.length > 1 ? 'ont' : ''} envoyé{standProducts.length > 1 ? 's' : ''} pour cette session.
            </p>
          </div>
        )}
        
        <Button
          onClick={handleSendProductsToSession}
          disabled={!selectedSessionId || isValidatingProducts || standProducts.length === 0}
          className="w-full sm:w-auto"
        >
          {isValidatingProducts ? 'Envoi en cours...' : 'Envoyer ma liste de produits'}
        </Button>
      </div>
    </Card>
  );
}