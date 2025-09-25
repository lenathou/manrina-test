import React from 'react';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { MarketSession, MarketParticipation, Grower, MarketProduct } from '@prisma/client';
import { prisma } from '@/server/prisma';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { useNewMarketParticipations } from '@/hooks/useNewMarketParticipations';
// Icône flèche retour simple
const ArrowLeftIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M19 12H5"></path>
        <path d="M12 19l-7-7 7-7"></path>
    </svg>
);

type MarketSessionWithDetails = MarketSession & {
  participations: (MarketParticipation & {
    grower: Grower;
  })[];
  marketProducts: (MarketProduct & {
    grower: Grower;
  })[];
  _count: {
    participations: number;
    marketProducts: number;
  };
};

interface Props {
  session: MarketSessionWithDetails;
}

function MarketProducersPage({ session }: Props) {
  // Hook pour détecter les nouvelles participations au marché
  const { growersWithNewMarketParticipations } = useNewMarketParticipations(session.id);

  // Extraire les producteurs des participations avec leurs statistiques
  const uniqueGrowers = session.participations?.map((participation) => {
    const growerProducts = session.marketProducts?.filter(
      (p) => p.grower.id === participation.grower.id
    ) || [];
    
    const hasNewParticipation = growersWithNewMarketParticipations?.includes(participation.grower.id) || false;
    
    return {
      id: participation.grower.id,
      name: participation.grower.name,
      email: participation.grower.email,
      profilePhoto: participation.grower.profilePhoto,
      status: participation.status,
      productCount: growerProducts.length,
      participation: participation,
      hasNewParticipation,
    };
  }) || [];

  // Trier les producteurs pour afficher en priorité ceux avec nouvelles participations
  const sortGrowersByNewParticipation = (growers: typeof uniqueGrowers) => {
    return growers.sort((a, b) => {
      // Les producteurs avec nouvelles participations en premier
      if (a.hasNewParticipation && !b.hasNewParticipation) return -1;
      if (!a.hasNewParticipation && b.hasNewParticipation) return 1;
      // Sinon, tri alphabétique par nom
      return a.name.localeCompare(b.name);
    });
  };

  const confirmedGrowers = sortGrowersByNewParticipation(uniqueGrowers.filter(g => g.status === 'CONFIRMED'));
  const pendingGrowers = sortGrowersByNewParticipation(uniqueGrowers.filter(g => g.status === 'PENDING'));
  const declinedGrowers = sortGrowersByNewParticipation(uniqueGrowers.filter(g => g.status === 'DECLINED'));

  return (
    <div className="min-h-screen ">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* En-tête avec navigation */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href={`/admin/gestion-marche/${session.id}`}>
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeftIcon className="w-4 h-4" />
                Retour à la session
              </Button>
            </Link>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <Text variant="h1" className="text-2xl font-bold text-gray-900 mb-2">
                  Producteurs Participants
                </Text>
                <Text variant="body" className="text-gray-600">
                  Session: {session.name}
                </Text>
              </div>
              
              {/* Bouton Gérer les commissions pour les sessions actives et à venir */}
              {(session.status === 'ACTIVE' || session.status === 'UPCOMING') && confirmedGrowers.length > 0 && (
                <Link href={`/admin/gestion-marche/${session.id}/commissions`}>
                  <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                    💰 Gérer les commissions
                  </Button>
                </Link>
              )}
            </div>
            
            <div className="flex gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>{confirmedGrowers.length} confirmé{confirmedGrowers.length > 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>{pendingGrowers.length} en attente</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>{declinedGrowers.length} refusé{declinedGrowers.length > 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des producteurs */}
        {uniqueGrowers.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Text variant="body" className="text-gray-500">
              Aucun producteur participant pour cette session
            </Text>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Producteurs confirmés */}
            {confirmedGrowers.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <Text variant="h3" className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  Producteurs confirmés ({confirmedGrowers.length})
                </Text>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {confirmedGrowers.map((grower) => (
                    <Link
                      key={grower.id}
                      href={`/admin/gestion-marche/${session.id}/producteurs/${grower.id}`}
                      className="block"
                    >
                      <div className={`p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer relative ${
                        grower.hasNewParticipation 
                          ? 'border-orange-400 bg-orange-50 hover:border-orange-500' 
                          : 'border-gray-200 hover:border-orange-300'
                      }`}>
                        {grower.hasNewParticipation && (
                          <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-md">
                            Nouvelle participation
                          </div>
                        )}
                        <div className="flex items-start gap-3">
                          {grower.profilePhoto ? (
                            <Image
                              src={grower.profilePhoto}
                              alt={grower.name}
                              width={48}
                              height={48}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-gray-500 font-medium">
                                {grower.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <Text variant="h5" className="font-medium text-gray-900 truncate">
                              {grower.name}
                            </Text>
                            <Text variant="small" className="text-gray-500 truncate">
                              {grower.email}
                            </Text>
                            <div className="mt-2 flex items-center gap-4 text-sm">
                              <span className="text-orange-600 font-medium">
                                {grower.productCount} produit{grower.productCount > 1 ? 's' : ''}
                              </span>
                              {grower.hasNewParticipation && (
                                <span className="text-orange-700 font-medium bg-orange-200 px-2 py-1 rounded text-xs">
                                  🆕 Non consultée
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Producteurs en attente */}
            {pendingGrowers.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <Text variant="h3" className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  Producteurs en attente ({pendingGrowers.length})
                </Text>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {pendingGrowers.map((grower) => (
                    <Link
                      key={grower.id}
                      href={`/admin/gestion-marche/${session.id}/producteurs/${grower.id}`}
                      className="block"
                    >
                      <div className={`p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer opacity-75 relative ${
                        grower.hasNewParticipation 
                          ? 'border-orange-400 bg-orange-50 hover:border-orange-500' 
                          : 'border-gray-200 hover:border-yellow-300'
                      }`}>
                        {grower.hasNewParticipation && (
                          <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-md">
                            Nouvelle participation
                          </div>
                        )}
                        <div className="flex items-start gap-3">
                          {grower.profilePhoto ? (
                            <Image
                              src={grower.profilePhoto}
                              alt={grower.name}
                              width={48}
                              height={48}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-gray-500 font-medium">
                                {grower.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <Text variant="h5" className="font-medium text-gray-900 truncate">
                              {grower.name}
                            </Text>
                            <Text variant="small" className="text-gray-500 truncate">
                              {grower.email}
                            </Text>
                            <div className="mt-2 flex items-center gap-4 text-sm">
                              <span className="text-yellow-600 font-medium">
                                {grower.productCount} produit{grower.productCount > 1 ? 's' : ''}
                              </span>
                              {grower.hasNewParticipation && (
                                <span className="text-orange-700 font-medium bg-orange-200 px-2 py-1 rounded text-xs">
                                  🆕 Non consultée
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Producteurs refusés */}
            {declinedGrowers.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <Text variant="h3" className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  Producteurs refusés ({declinedGrowers.length})
                </Text>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {declinedGrowers.map((grower) => (
                    <div key={grower.id} className="p-4 border border-gray-200 rounded-lg opacity-50">
                      <div className="flex items-start gap-3">
                        {grower.profilePhoto ? (
                          <Image
                            src={grower.profilePhoto}
                            alt={grower.name}
                            width={48}
                            height={48}
                            className="w-12 h-12 rounded-full object-cover grayscale"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-gray-500 font-medium">
                              {grower.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <Text variant="h5" className="font-medium text-gray-900 truncate">
                            {grower.name}
                          </Text>
                          <Text variant="small" className="text-gray-500 truncate">
                            {grower.email}
                          </Text>
                          <div className="mt-2 flex items-center gap-4 text-sm">
                            <span className="text-red-600 font-medium">
                              Participation refusée
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MarketProducersPage;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params!;

  try {
    const session = await prisma.marketSession.findUnique({
      where: { id: id as string },
      include: {
        participations: {
          include: {
            grower: true,
          },
        },
        marketProducts: {
          include: {
            grower: true,
          },
        },
        _count: {
          select: {
            participations: true,
            marketProducts: true,
          },
        },
      },
    });

    if (!session) {
      return {
        notFound: true,
      };
    }

    return {
      props: {
        session: JSON.parse(JSON.stringify(session)),
      },
    };
  } catch (error) {
    console.error('Erreur lors du chargement de la session:', error);
    return {
      notFound: true,
    };
  }
};