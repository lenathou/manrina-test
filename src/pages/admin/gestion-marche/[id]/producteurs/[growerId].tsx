import React, { useState, useEffect, useMemo } from 'react';
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
import { useQuery } from '@tanstack/react-query';
import { backendFetchService } from '@/service/BackendFetchService';
import { IUnit } from '@/server/product/IProduct';
import { SearchBarNext } from '@/components/ui/SearchBarNext';
import { AdminMarketProductCard } from '@/components/admin/market/AdminMarketProductCard';

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
  // Récupérer les unités pour l'affichage
  const { data: units = [] } = useQuery({
    queryKey: ['units'],
    queryFn: () => backendFetchService.getAllUnits(),
  });

  // Fonction pour obtenir le symbole de l'unité
  const getUnitSymbol = (unitId: string | null) => {
    if (!unitId) return 'unité';
    const unit = units.find((u: IUnit) => u.id === unitId);
    return unit?.symbol || unitId; // Fallback sur l'ID si l'unité n'est pas trouvée
  };
  const router = useRouter();
  const { success, error } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditingCommission, setIsEditingCommission] = useState(false);
  const [commissionValue, setCommissionValue] = useState(grower.commissionRate?.toString() || '7.0');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Calculer les informations de commission
  const commissionInfo = calculateCommissionInfo({
    grower,
    marketSession: session
  });

  // Filtrer les produits selon le terme de recherche
  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) {
      return growerProducts;
    }
    
    return growerProducts.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [growerProducts, searchTerm]);

  // Marquer la participation comme vue lors de l'accès à la page
  useEffect(() => {
    const markAsViewed = async () => {
      try {
        await backendFetchService.markMarketParticipationAsViewed(session.id, grower.id);
      } catch (error) {
        console.error('Erreur lors du marquage de la participation comme vue:', error);
      }
    };

    markAsViewed();
  }, [session.id, grower.id]);

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
          
          <div className="p-6">
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
          <div className=" p-12 text-center">
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
                          step="0.001"
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
            <div className="">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Text variant="h2" className="text-xl font-semibold text-gray-900">
                      Produits proposés
                    </Text>
                    <Text variant="body" className="text-gray-600 mt-1">
                      Liste des produits proposés par ce producteur pour cette session
                    </Text>
                  </div>
                  <Text variant="body" className="text-gray-500">
                    {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''}
                  </Text>
                </div>
                
                {/* Filtre de recherche */}
                 <div className="mb-4">
                   <SearchBarNext
                     value={searchTerm}
                     onSearch={setSearchTerm}
                     placeholder="Rechercher un produit..."
                     className="w-full max-w-md"
                   />
                 </div>
              </div>
              
              {filteredProducts.length === 0 ? (
                <div className="p-6 text-center">
                  <Text variant="body" className="text-gray-500">
                    {searchTerm ? 'Aucun produit trouvé pour cette recherche.' : 'Aucun produit proposé pour cette session.'}
                  </Text>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                  {filteredProducts.map((marketProduct) => (
                    <AdminMarketProductCard
                      key={marketProduct.id}
                      product={marketProduct}
                      unitSymbol={getUnitSymbol(marketProduct.unit)}
                    />
                  ))}
                </div>
              )}
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