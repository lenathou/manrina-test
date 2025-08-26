/* eslint-disable react/no-unescaped-entities */
import React, { useState, useEffect, useCallback } from 'react';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { MarketSession, MarketParticipation, Grower } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { prisma } from '@/server/prisma';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { useToast } from '@/components/ui/Toast';
import { getEffectiveCommissionRate } from '@/utils/commissionUtils';
import { CommissionTable } from '@/components/admin/commission/CommissionTable';

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
};

interface GrowerCommissionData {
  id: string;
  name: string;
  email: string;
  profilePhoto: string | null;
  commissionRate: Prisma.Decimal | null;
  turnover: number;
  commissionAmount: number;
}

interface ExistingCommission {
  growerId: string;
  turnover: Prisma.Decimal;
  commissionAmount: Prisma.Decimal;
  customCommissionRate: Prisma.Decimal | null;
}

interface Props {
  session: MarketSessionWithDetails;
}

function CommissionManagementPage({ session }: Props) {
  const router = useRouter();
  const { success, error } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationData, setValidationData] = useState<{
    type: 'incomplete' | 'complete';
    growersWithoutTurnover?: Array<{id: string; name: string; email: string}>;
    growersWithTurnover?: Array<{id: string; name: string; email: string}>;
  } | null>(null);
  const itemsPerPage = 7;
  
  const [growerData, setGrowerData] = useState<GrowerCommissionData[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Charger les données des commissions au montage du composant
  useEffect(() => {
    const loadCommissionData = async () => {
      try {
        setIsLoadingData(true);
        const response = await fetch(`/api/admin/market-sessions/${session.id}/commissions`);
        
        if (response.ok) {
          const data = await response.json();
          const existingCommissions = new Map(data.commissions.map((c: ExistingCommission) => [c.growerId, c]));
          
          // Initialiser avec les producteurs confirmés et leurs commissions existantes
          const initialData = session.participations
            .filter(p => p.status === 'CONFIRMED')
            .map(p => {
              const existingCommission = existingCommissions.get(p.grower.id) as ExistingCommission | undefined;
              return {
                id: p.grower.id,
                name: p.grower.name,
                email: p.grower.email,
                profilePhoto: p.grower.profilePhoto,
                commissionRate: existingCommission?.customCommissionRate 
                  ? new Prisma.Decimal(existingCommission.customCommissionRate.toString())
                  : p.grower.commissionRate,
                turnover: existingCommission ? parseFloat(existingCommission.turnover.toString()) : 0,
                commissionAmount: existingCommission ? parseFloat(existingCommission.commissionAmount.toString()) : 0
              };
            });
          
          setGrowerData(initialData);
        } else {
          // En cas d'erreur, initialiser avec des valeurs par défaut
          const defaultData = session.participations
            .filter(p => p.status === 'CONFIRMED')
            .map(p => ({
              id: p.grower.id,
              name: p.grower.name,
              email: p.grower.email,
              profilePhoto: p.grower.profilePhoto,
              commissionRate: p.grower.commissionRate,
              turnover: 0,
              commissionAmount: 0
            }));
          
          setGrowerData(defaultData);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des commissions:', error);
        // En cas d'erreur, initialiser avec des valeurs par défaut
        const defaultData = session.participations
          .filter(p => p.status === 'CONFIRMED')
          .map(p => ({
            id: p.grower.id,
            name: p.grower.name,
            email: p.grower.email,
            profilePhoto: p.grower.profilePhoto,
            commissionRate: p.grower.commissionRate,
            turnover: 0,
            commissionAmount: 0
          }));
        
        setGrowerData(defaultData);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadCommissionData();
  }, [session.id, session.participations]);

  // Synchroniser currentPage avec le paramètre 'page' de l'URL
  useEffect(() => {
    const pageFromUrl = parseInt(router.query.page as string) || 1;
    setCurrentPage(pageFromUrl);
  }, [router.query.page]);

  // Fonction pour gérer le changement de page
  const handlePageChange = useCallback((page: number) => {
    router.push({
      pathname: router.pathname,
      query: { ...router.query, page: page.toString() }
    }, undefined, { shallow: true });
  }, [router]);

  // Fonction pour gérer le changement de recherche
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (currentPage > 1) {
      handlePageChange(1);
    }
  };

  // Filtrer les données selon le terme de recherche
  const filteredGrowerData = growerData.filter(grower => 
    grower.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    grower.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculer la pagination
  const totalPages = Math.ceil(filteredGrowerData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedGrowerData = filteredGrowerData.slice(startIndex, startIndex + itemsPerPage);

  // Réinitialiser la page à 1 quand les filtres changent
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      handlePageChange(1);
    }
  }, [searchTerm, totalPages, currentPage, handlePageChange]);

  const handleTurnoverChange = (growerId: string, turnover: number) => {
    setGrowerData(prev => prev.map(grower => {
      if (grower.id === growerId) {
        const growerRate = grower.commissionRate ? new Prisma.Decimal(grower.commissionRate.toString()) : null;
        const sessionRate = new Prisma.Decimal(session.commissionRate.toString());
        
        const effectiveRate = getEffectiveCommissionRate(
          { commissionRate: growerRate || new Prisma.Decimal(0) },
          { commissionRate: sessionRate }
        );
        
        const commissionAmount = turnover * (effectiveRate / 100);
        
        return {
          ...grower,
          turnover,
          commissionAmount
        };
      }
      return grower;
    }));
  };

  const handleCommissionRateChange = (growerId: string, commissionRate: number | null) => {
    setGrowerData(prev => prev.map(grower => {
      if (grower.id === growerId) {
        const newCommissionRate = commissionRate ? new Prisma.Decimal(commissionRate) : null;
        const sessionRate = new Prisma.Decimal(session.commissionRate.toString());
        
        const effectiveRate = getEffectiveCommissionRate(
          { commissionRate: newCommissionRate || new Prisma.Decimal(0) },
          { commissionRate: sessionRate }
        );
        
        const commissionAmount = grower.turnover * (effectiveRate / 100);
        
        return {
          ...grower,
          commissionRate: newCommissionRate,
          commissionAmount
        };
      }
      return grower;
    }));
  };

  const handleSaveCommissions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/market-sessions/${session.id}/commissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          commissions: growerData.map(grower => ({
            growerId: grower.id,
            turnover: grower.turnover,
            commissionAmount: grower.commissionAmount,
            customCommissionRate: grower.commissionRate ? parseFloat(grower.commissionRate.toString()) : null
          }))
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde');
      }

      success('Commissions sauvegardées avec succès');
    } catch (err) {
      error('Erreur lors de la sauvegarde des commissions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidateSession = async () => {
    setIsValidating(true);
    try {
      const response = await fetch(`/api/admin/market-sessions/${session.id}/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ forceValidation: false }),
      });

      const data = await response.json();

      // Gérer les cas nécessitant une confirmation (status 400 ou 200 avec requiresConfirmation)
      if (data.requiresConfirmation) {
        if (data.growersWithoutTurnover) {
          // Cas où certains producteurs n'ont pas de chiffre d'affaires (status 400)
          setValidationData({
            type: 'incomplete',
            growersWithoutTurnover: data.growersWithoutTurnover
          });
        } else if (data.allGrowersHaveTurnover || data.growersWithTurnover) {
          // Cas où tous les producteurs ont un chiffre d'affaires (status 200)
          setValidationData({
            type: 'complete',
            growersWithTurnover: data.growersWithTurnover
          });
        }
        setShowValidationModal(true);
        return;
      }

      // Si pas de confirmation requise et réponse OK, c'est que la validation est terminée
      if (response.ok) {
        success('Session validée et clôturée avec succès');
        // Rediriger vers la page des producteurs
        router.push(`/admin/gestion-marche/${session.id}/producteurs`);
        return;
      }

      // Si erreur sans requiresConfirmation
      throw new Error(data.message || 'Erreur lors de la validation');
    } catch (err) {
      error(err instanceof Error ? err.message : 'Erreur lors de la validation de la session');
    } finally {
      setIsValidating(false);
    }
  };

  const handleConfirmValidation = async () => {
    setIsValidating(true);
    try {
      const response = await fetch(`/api/admin/market-sessions/${session.id}/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ forceValidation: true }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la validation');
      }

      success('Session validée et clôturée avec succès');
      setShowValidationModal(false);
      setValidationData(null);
      // Rediriger vers la page des producteurs
      router.push(`/admin/gestion-marche/${session.id}/producteurs`);
    } catch (err) {
      error(err instanceof Error ? err.message : 'Erreur lors de la validation de la session');
    } finally {
      setIsValidating(false);
    }
  };

  const totalTurnover = filteredGrowerData.reduce((sum, grower) => sum + grower.turnover, 0);
  const totalCommissions = filteredGrowerData.reduce((sum, grower) => sum + grower.commissionAmount, 0);

  return (
    <div className="space-y-6">
      {/* En-tête de la page */}
      <div className=" p-6">
        <div className="flex items-center gap-4 mb-4">
          <Link href={`/admin/gestion-marche/${session.id}/producteurs`}>
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeftIcon className="w-4 h-4" />
              Retour aux producteurs
            </Button>
          </Link>
        </div>
        
        <h2 className="font-secondary font-bold text-2xl sm:text-3xl text-[var(--color-secondary)] mb-4">
          💰 Gestion des Commissions
        </h2>
        <p className="text-base sm:text-lg text-[var(--muted-foreground)]">
          Session: {session.name} • {new Date(session.date).toLocaleDateString('fr-FR')}
        </p>
      </div>

      {/* Résumé des commissions */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <Text variant="small" className="text-gray-600">Chiffre d'affaires total</Text>
            <Text variant="h3" className="text-xl font-bold text-gray-900">
              {totalTurnover.toFixed(2)} €
            </Text>
          </div>
          <div className="text-center">
            <Text variant="small" className="text-gray-600">Commissions totales</Text>
            <Text variant="h3" className="text-xl font-bold text-orange-600">
              {totalCommissions.toFixed(2)} €
            </Text>
          </div>
          <div className="text-center">
            <Text variant="small" className="text-gray-600">Producteurs participants</Text>
            <Text variant="h3" className="text-xl font-bold text-gray-900">
              {filteredGrowerData.length}
            </Text>
          </div>
          <div className="text-center">
            <Button 
              onClick={handleSaveCommissions}
              disabled={isLoading || isLoadingData || totalTurnover === 0}
              className="bg-green-600 hover:bg-green-700 text-white w-full mb-2"
            >
              {isLoading ? 'Sauvegarde...' : isLoadingData ? 'Chargement...' : 'Sauvegarder'}
            </Button>
            {(session.status === 'ACTIVE' || session.status === 'UPCOMING') && (
              <Button 
                onClick={handleValidateSession}
                disabled={isValidating || isLoading || isLoadingData}
                className="bg-blue-600 hover:bg-blue-700 text-white w-full"
              >
                {isValidating ? 'Validation...' : isLoadingData ? 'Chargement...' : 'Valider la session'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher un producteur..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
              />
              <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          <div className="text-sm text-gray-600">
            {filteredGrowerData.length} producteur{filteredGrowerData.length > 1 ? 's' : ''} trouvé{filteredGrowerData.length > 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Table des commissions */}
      {isLoadingData ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--color-primary)]"></div>
            <span>Chargement des données de commission...</span>
          </div>
        </div>
      ) : (
        <CommissionTable
          growerData={paginatedGrowerData}
          session={session}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          isLoading={isLoading}
          onTurnoverChange={handleTurnoverChange}
          onCommissionRateChange={handleCommissionRateChange}
        />
      )}

      {/* Modale de confirmation de validation */}
      {showValidationModal && validationData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">
              {validationData.type === 'incomplete' ? 'Validation incomplète' : 'Confirmer la validation'}
            </h3>
            
            {validationData.type === 'incomplete' ? (
              <div>
                <p className="text-gray-700 mb-4">
                  Vous n'avez pas rentré les chiffres pour {validationData.growersWithoutTurnover?.length} producteur(s) ayant annoncé leur participation. 
                  Ces producteurs seront considérés comme absents. Voulez-vous malgré tout valider la session ?
                </p>
                <div className="mb-4">
                  <Text variant="small" className="font-semibold mb-2">Producteurs sans chiffre d'affaires :</Text>
                  <ul className="text-sm text-gray-600">
                    {validationData.growersWithoutTurnover?.map(grower => (
                      <li key={grower.id}>• {grower.name} ({grower.email})</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-gray-700 mb-4">
                  Le chiffre d'affaires a été saisi pour tous les producteurs annoncés. Voulez-vous clôturer la session ?
                </p>
                <div className="mb-4">
                  <Text variant="small" className="font-semibold mb-2">Producteurs avec chiffre d'affaires :</Text>
                  <ul className="text-sm text-gray-600">
                    {validationData.growersWithTurnover?.map(grower => (
                      <li key={grower.id}>• {grower.name} ({grower.email})</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            
            <div className="flex gap-3 justify-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowValidationModal(false);
                  setValidationData(null);
                }}
                disabled={isValidating}
              >
                Annuler
              </Button>
              <Button 
                onClick={handleConfirmValidation}
                disabled={isValidating}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isValidating ? 'Validation...' : 'Confirmer'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CommissionManagementPage;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params!;

  try {
    const session = await prisma.marketSession.findUnique({
      where: { id: id as string },
      include: {
        participations: {
          where: {
            status: 'CONFIRMED'
          },
          include: {
            grower: true,
          },
        },
      },
    });

    if (!session) {
      return {
        notFound: true,
      };
    }

    // Vérifier que la session est active ou à venir
    if (session.status !== 'ACTIVE' && session.status !== 'UPCOMING') {
      return {
        redirect: {
          destination: `/admin/gestion-marche/${id}/producteurs`,
          permanent: false,
        },
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