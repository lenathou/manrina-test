/* eslint-disable react/no-unescaped-entities */
import React, { useState } from 'react';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { MarketSession, MarketParticipation, Grower } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { prisma } from '@/server/prisma';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { useToast } from '@/components/ui/Toast';
import { getEffectiveCommissionRate } from '@/utils/commissionUtils';
import { CommissionManagementTable } from '@/components/admin/commission/CommissionManagementTable';

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

interface Props {
  session: MarketSessionWithDetails;
}

function CommissionManagementPage({ session }: Props) {
  const { success, error } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [growerData, setGrowerData] = useState<GrowerCommissionData[]>(() => {
    // Initialiser avec les producteurs confirmés
    return session.participations
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
  });

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

  const totalTurnover = growerData.reduce((sum, grower) => sum + grower.turnover, 0);
  const totalCommissions = growerData.reduce((sum, grower) => sum + grower.commissionAmount, 0);

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
            <div className="flex items-center justify-between mb-4">
              <div>
                <Text variant="h1" className="text-2xl font-bold text-gray-900 mb-2">
                  💰 Gestion des Commissions
                </Text>
                <Text variant="body" className="text-gray-600">
                  Session: {session.name} • {new Date(session.date).toLocaleDateString('fr-FR')}
                </Text>
              </div>
              
              <Button 
                onClick={handleSaveCommissions}
                disabled={isLoading || totalTurnover === 0}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isLoading ? 'Sauvegarde...' : 'Sauvegarder les commissions'}
              </Button>
            </div>
            
            {/* Résumé */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
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
                  {growerData.length}
                </Text>
              </div>
            </div>
          </div>
        </div>

        {/* Table des commissions */}
        <CommissionManagementTable
          growerData={growerData}
          session={session}
          onTurnoverChange={handleTurnoverChange}
          onCommissionRateChange={handleCommissionRateChange}
          isLoading={isLoading}
        />
      </div>
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