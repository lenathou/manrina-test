/* eslint-disable react/no-unescaped-entities */
import React, { useState } from 'react';
import { Card, CardContent} from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { Badge } from '@/components/ui/badge';
import { MarketSession, MarketParticipation, Grower, MarketProduct, Partner } from '@prisma/client';
import { ParticipantSelector } from './ParticipantSelector';
import { PartnerSelector } from './PartnerSelector';
import { useToast } from '@/components/ui/Toast';

type MarketSessionWithDetails = MarketSession & {
  participations: (MarketParticipation & {
    grower: Grower;
  })[];
  marketProducts: MarketProduct[];
  partners?: {
    partner: Partner;
  }[];
  _count: {
    participations: number;
    marketProducts: number;
  };
};

interface MarketProducer {
  id: string;
  name: string;
  profilePhoto: string;
  email?: string;
  phone?: string;
  totalProducts: number;
  totalStock: number;
  isActive: boolean;
}

interface ParticipantsTabProps {
  session: MarketSessionWithDetails;
  onUpdate?: () => void;
}


export function ParticipantsTab({ session, onUpdate }: ParticipantsTabProps) {
  const [selectedParticipants, setSelectedParticipants] = useState<MarketProducer[]>([]);
  const [selectedPartners, setSelectedPartners] = useState<Partner[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const { success, error } = useToast();
  
  const confirmedParticipants = session.participations.filter(p => p.status === 'CONFIRMED');
  const declinedParticipants = session.participations.filter(p => p.status === 'DECLINED');

  const handleSaveParticipants = async () => {
    setIsUpdating(true);
    try {
      // Sauvegarder les participants (producteurs)
      const participationPromises = selectedParticipants.map(participant => 
        fetch('/api/market/participations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId: session.id,
            growerId: participant.id,
            status: 'CONFIRMED'
          })
        })
      );

      // Sauvegarder les partenaires
      const partnerIds = selectedPartners.map(partner => partner.id);
      const sessionUpdatePromise = fetch('/api/market/sessions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: session.id,
          partnerIds
        })
      });

      // Attendre que toutes les requêtes se terminent
      const responses = await Promise.all([...participationPromises, sessionUpdatePromise]);
      
      // Vérifier que toutes les requêtes ont réussi
      const allSuccessful = responses.every(response => response.ok);
      
      if (allSuccessful) {
        // Réinitialiser les sélections
        setSelectedParticipants([]);
        setSelectedPartners([]);
        
        success('Participants et partenaires sauvegardés avec succès');
         
         // Rafraîchir les données si une fonction de callback est fournie
         if (onUpdate) {
           onUpdate();
         }
        } else {
          throw new Error('Certaines requêtes ont échoué');
        }
       
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
      error('Erreur lors de la sauvegarde. Veuillez réessayer.')
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReset = () => {
    setSelectedParticipants([]);
    setSelectedPartners([]);
  };

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div>
        <Text variant="h3" className="text-gray-900">
          Participants et Partenaires
        </Text>
        <Text variant="body" className="text-gray-600">
          Gérez les participants (producteurs) et partenaires de cette session de marché
        </Text>
      </div>

      {/* Section Participants (Producteurs) */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="mb-4">
          <Text variant="h4" className="text-gray-900 mb-2">
            Participants (Producteurs)
          </Text>
          <Text variant="small" className="text-gray-600">
            Sélectionnez les producteurs qui participeront à cette session de marché
          </Text>
        </div>
        <ParticipantSelector
          selectedParticipants={selectedParticipants}
          onParticipantsChange={setSelectedParticipants}
          disabled={isUpdating}
        />
        
        {/* Liste des participants confirmés */}
        {confirmedParticipants.length > 0 && (
          <div className="mt-6">
            <Text variant="body" className="text-gray-900 mb-3 font-medium">
              Participants confirmés ({confirmedParticipants.length})
            </Text>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {confirmedParticipants.map((participation) => (
                <Card key={participation.id} className="border-green-200">
                  <CardContent className="p-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Text variant="small" className="text-green-600 font-semibold">
                          {participation.grower.name.charAt(0).toUpperCase()}
                        </Text>
                      </div>
                      <div className="flex-1">
                        <Text variant="small" className="font-medium text-gray-900">
                          {participation.grower.name}
                        </Text>
                        <Text variant="small" className="text-gray-500 text-xs">
                          {participation.grower.email}
                        </Text>
                      </div>
                      <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                        Confirmé
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
        </div>

      {/* Section Partenaires */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="mb-4">
          <Text variant="h4" className="text-gray-900 mb-2">
            Partenaires de l'événement
          </Text>
          <Text variant="small" className="text-gray-600">
            Sélectionnez les partenaires qui seront associés à cette session de marché
          </Text>
        </div>
        <PartnerSelector
          selectedPartners={selectedPartners}
          onPartnersChange={setSelectedPartners}
          disabled={isUpdating}
        />
        
        {/* Liste des partenaires existants */}
        {session.partners && session.partners.length > 0 && (
          <div className="mt-6">
            <Text variant="body" className="text-gray-900 mb-3 font-medium">
              Partenaires actuels ({session.partners.length})
            </Text>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {session.partners.map((sessionPartner) => (
                <Card key={sessionPartner.partner.id} className="border-blue-200">
                  <CardContent className="p-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Text variant="small" className="text-blue-600 font-semibold">
                          {sessionPartner.partner.name.charAt(0).toUpperCase()}
                        </Text>
                      </div>
                      <div className="flex-1">
                        <Text variant="small" className="font-medium text-gray-900">
                          {sessionPartner.partner.name}
                        </Text>
                        {sessionPartner.partner.description && (
                          <Text variant="small" className="text-gray-500 text-xs">
                            {sessionPartner.partner.description}
                          </Text>
                        )}
                      </div>
                      <Badge variant="default" className="bg-blue-100 text-blue-800 text-xs">
                        Partenaire
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
        </div>

      {/* Boutons d'action */}
      <div className="flex justify-end space-x-3">
        <Button
          variant="outline"
          onClick={handleReset}
          disabled={isUpdating}
        >
          Réinitialiser
        </Button>
        <Button
          onClick={handleSaveParticipants}
          disabled={isUpdating}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          {isUpdating ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
        </Button>
      </div>
      {/* Statistiques des participations actuelles */}
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <Text variant="h4" className="text-gray-900 mb-4">
          Participations actuelles
        </Text>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <Text variant="small" className="text-green-600 font-medium">Confirmés</Text>
                <Text variant="h3" className="text-green-700 font-bold">{confirmedParticipants.length}</Text>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <Text variant="small" className="text-red-600 font-medium">Annulés</Text>
                <Text variant="h3" className="text-red-700 font-bold">{declinedParticipants.length}</Text>
              </div>
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>



    </div>
  );
}