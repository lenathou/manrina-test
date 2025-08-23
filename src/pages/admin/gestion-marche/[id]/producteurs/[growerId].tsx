import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { MarketSession, MarketParticipation, Grower, MarketProduct } from '@prisma/client';
import { prisma } from '@/server/prisma';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { CommissionDisplay, CommissionDetails } from '@/components/admin/commission/CommissionDisplay';
import { calculateCommissionInfo } from '@/utils/commissionUtils';

// SVG Icons
const ArrowLeftIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M19 12H5"></path>
        <path d="M12 19l-7-7 7-7"></path>
    </svg>
);

const SaveIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"></path>
        <polyline points="17,21 17,13 7,13 7,21"></polyline>
        <polyline points="7,3 7,8 15,8"></polyline>
    </svg>
);

const EditIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"></path>
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
);

const XIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M18 6L6 18"></path>
        <path d="M6 6l12 12"></path>
    </svg>
);

type MarketProductWithDetails = MarketProduct & {
  grower: Grower;
  marketSession: MarketSession;
};

type MarketSessionWithDetails = MarketSession & {
  participations: (MarketParticipation & {
    grower: Grower;
  })[];
  marketProducts: MarketProductWithDetails[];
};

interface Props {
  session: MarketSessionWithDetails;
  grower: Grower;
  growerProducts: MarketProductWithDetails[];
  participation: MarketParticipation;
}

function GrowerProductsPage({ session, grower, growerProducts, participation }: Props) {
  const router = useRouter();
  const { success, error } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditingCommission, setIsEditingCommission] = useState(false);
  const [commissionValue, setCommissionValue] = useState(grower.commissionRate?.toString() || '7.0');
  
  // Calculer les informations de commission
  const commissionInfo = calculateCommissionInfo({
    grower,
    marketSession: session
  });

  const handleEditCommission = () => {
    setIsEditingCommission(true);
  };

  const handleCancelEdit = () => {
    setIsEditingCommission(false);
    setCommissionValue(grower.commissionRate?.toString() || '7.0');
  };

  const handleCommissionChange = (value: string) => {
    setCommissionValue(value);
  };

  const handleSaveCommission = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/growers/${grower.id}/commission`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          commissionRate: parseFloat(commissionValue),
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour');
      }

      success('Commission mise à jour avec succès');
      setIsEditingCommission(false);
      router.reload();
    } catch {
      error('Erreur lors de la mise à jour de la commission');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'En attente';
      case 'CONFIRMED':
        return 'Confirmé';
      case 'DECLINED':
        return 'Refusé';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* En-tête avec navigation */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href={`/admin/gestion-marche/${session.id}/producteurs`}>
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeftIcon className="w-4 h-4" />
                Retour aux producteurs
              </Button>
            </Link>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div>
                <Text variant="h1" className="text-2xl font-bold text-gray-900 mb-2">
                  {grower.name}
                </Text>
                <div className="space-y-1">
                  <Text variant="body" className="text-gray-600">
                    Email: {grower.email}
                  </Text>
                  {grower.phone && (
                    <Text variant="body" className="text-gray-600">
                      Téléphone: {grower.phone}
                    </Text>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                <Text variant="small" className="text-gray-500 mb-1">
                  Statut de participation
                </Text>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  participation.status === 'CONFIRMED' 
                    ? 'bg-green-100 text-green-800'
                    : participation.status === 'PENDING'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {getStatusLabel(participation.status)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des produits */}
        {growerProducts.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Text variant="body" className="text-gray-500">
              Aucun produit proposé par ce producteur pour cette session
            </Text>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Section Commission du Producteur */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <Text variant="h2" className="text-xl font-semibold text-gray-900">
                      Commission du producteur
                    </Text>
                    <Text variant="body" className="text-gray-600 mt-1">
                      Taux de commission appliqué à tous les produits de ce producteur
                    </Text>
                  </div>
                  <CommissionDisplay 
                    commissionInfo={commissionInfo.commissionInfo}
                    options={{ showSource: true }}
                  />
                </div>
                
                {/* Détails de la commission */}
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <CommissionDetails commissionInfo={commissionInfo.commissionInfo} />
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Text variant="h4" className="font-semibold text-gray-900 mb-1">
                      {grower.name}
                    </Text>
                    <Text variant="body" className="text-gray-600">
                      {grower.email}
                    </Text>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {isEditingCommission ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={commissionValue}
                          onChange={(e) => handleCommissionChange(e.target.value)}
                          className="w-20 text-center"
                          placeholder="%"
                        />
                        <span className="text-gray-500">%</span>
                        <Button
                          onClick={handleSaveCommission}
                          disabled={isLoading}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <SaveIcon className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={handleCancelEdit}
                          disabled={isLoading}
                          size="sm"
                          variant="outline"
                        >
                          <XIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Text variant="body" className="font-semibold text-lg">
                          {commissionValue}%
                        </Text>
                        <Button
                          onClick={handleEditCommission}
                          size="sm"
                          variant="outline"
                        >
                          <EditIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Section Produits */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <Text variant="h2" className="text-xl font-semibold text-gray-900">
                  Produits proposés
                </Text>
                <Text variant="body" className="text-gray-600 mt-1">
                  Liste des produits proposés par ce producteur pour cette session
                </Text>
              </div>
              
              <div className="divide-y divide-gray-200">
                {growerProducts.map((marketProduct) => (
                  <div key={marketProduct.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <Text variant="h3" className="text-lg font-semibold text-gray-900 mb-2">
                              {marketProduct.name}
                            </Text>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">Prix: </span>
                                <span className="font-medium text-gray-900">
                                  {Number(marketProduct.price).toFixed(2)} € / {marketProduct.unit || 'unité'}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500">Stock: </span>
                                <span className="font-medium text-gray-900">
                                  {marketProduct.stock} {marketProduct.unit || 'unité'}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500">Catégorie: </span>
                                <span className="font-medium text-gray-900">
                                  {marketProduct.category || 'Non spécifiée'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default GrowerProductsPage;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id, growerId } = context.params!;

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
            marketSession: true,
          },
        },
      },
    });

    if (!session) {
      return {
        notFound: true,
      };
    }

    const grower = await prisma.grower.findUnique({
      where: { id: growerId as string },
    });

    if (!grower) {
      return {
        notFound: true,
      };
    }

    const participation = session.participations.find(p => p.grower.id === growerId);
    if (!participation) {
      return {
        notFound: true,
      };
    }

    const growerProducts = session.marketProducts.filter(p => p.grower.id === growerId);

    return {
      props: {
        session: JSON.parse(JSON.stringify(session)),
        grower: JSON.parse(JSON.stringify(grower)),
        growerProducts: JSON.parse(JSON.stringify(growerProducts)),
        participation: JSON.parse(JSON.stringify(participation)),
      },
    };
  } catch (error) {
    console.error('Erreur lors du chargement des données:', error);
    return {
      notFound: true,
    };
  }
};