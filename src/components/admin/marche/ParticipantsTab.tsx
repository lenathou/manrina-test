/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { MarketSession, MarketParticipation, Grower, MarketProduct } from '@prisma/client';

type MarketSessionWithDetails = MarketSession & {
  participations: (MarketParticipation & {
    grower: Grower;
  })[];
  marketProducts: MarketProduct[];
  _count: {
    participations: number;
    marketProducts: number;
  };
};

interface ParticipantsTabProps {
  session: MarketSessionWithDetails;
}

const getStatusBadge = (status: string) => {
  const statusConfig = {
    PENDING: { label: 'En attente', variant: 'secondary' as const, bgColor: 'bg-yellow-50', textColor: 'text-yellow-700', borderColor: 'border-yellow-200' },
    CONFIRMED: { label: 'Confirmé', variant: 'default' as const, bgColor: 'bg-green-50', textColor: 'text-green-700', borderColor: 'border-green-200' },
    DECLINED: { label: 'Refusé', variant: 'destructive' as const, bgColor: 'bg-red-50', textColor: 'text-red-700', borderColor: 'border-red-200' },
  };
  
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor} ${config.borderColor} border`}>
      {config.label}
    </span>
  );
};

export function ParticipantsTab({ session }: ParticipantsTabProps) {
  const confirmedParticipants = session.participations.filter(p => p.status === 'CONFIRMED');
  const pendingParticipants = session.participations.filter(p => p.status === 'PENDING');
  const cancelledParticipants = session.participations.filter(p => p.status === 'DECLINED');

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <Text variant="small" className="text-yellow-600 font-medium">En attente</Text>
                <Text variant="h3" className="text-yellow-700 font-bold">{pendingParticipants.length}</Text>
              </div>
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
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
                <Text variant="h3" className="text-red-700 font-bold">{cancelledParticipants.length}</Text>
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

      {/* Liste des participants */}
      <Card>
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900">Liste des participants</CardTitle>
            <Button 
              variant="outline" 
              className="border-orange-300 text-orange-700 hover:bg-orange-50"
            >
              Ajouter un participant
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {session.participations.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <Text variant="body" className="text-gray-500">Aucun participant pour cette session</Text>
              <Text variant="small" className="text-gray-400 mt-1">Les producteurs pourront s'inscrire une fois la session publiée</Text>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {session.participations.map((participation) => {
                const productCount = session.marketProducts.filter(
                  product => product.growerId === participation.grower.id
                ).length;

                return (
                  <div key={participation.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                          <Text variant="body" className="text-orange-700 font-semibold">
                            {participation.grower.name.charAt(0).toUpperCase()}
                          </Text>
                        </div>
                        <div>
                          <Text variant="body" className="font-medium text-gray-900">
                            {participation.grower.name}
                          </Text>
                          <Text variant="small" className="text-gray-500">
                            {participation.grower.email}
                          </Text>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <Text variant="small" className="text-gray-500">Produits</Text>
                          <Text variant="body" className="font-medium text-gray-900">
                            {productCount} produit{productCount > 1 ? 's' : ''}
                          </Text>
                        </div>
                        
                        <div className="text-right">
                          <Text variant="small" className="text-gray-500 mb-1">Statut</Text>
                          {getStatusBadge(participation.status)}
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="border-gray-300 text-gray-700 hover:bg-gray-50"
                          >
                            Voir détails
                          </Button>
                          {participation.status === 'PENDING' && (
                            <>
                              <Button 
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                Confirmer
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="border-red-300 text-red-700 hover:bg-red-50"
                              >
                                Refuser
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    

                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}