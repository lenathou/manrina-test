/* eslint-disable react/no-unescaped-entities */
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { IGrowerTokenPayload } from '@/server/grower/IGrower';
import { MarketSession, MarketParticipation, GrowerCommission, Grower } from '@prisma/client';
import { formatDateLong } from '@/utils/dateUtils';

interface MarketSessionWithDetails extends MarketSession {
  participations: (MarketParticipation & {
    grower: Grower;
  })[];
  growerCommissions: GrowerCommission[];
  _count: {
    participations: number;
    marketProducts: number;
  };
}

interface HistoriqueProducteurPageProps {
  authenticatedGrower: IGrowerTokenPayload;
}

function HistoriqueProducteurPage({ authenticatedGrower }: HistoriqueProducteurPageProps) {
  const [sessions, setSessions] = useState<MarketSessionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterValidated, setFilterValidated] = useState<boolean | null>(null); // null = tous, true = validés, false = non validés
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Charger les sessions historiques
  useEffect(() => {
    const loadSessions = async () => {
      if (!authenticatedGrower?.id) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/market/sessions/history?growerId=${authenticatedGrower.id}`);
        if (response.ok) {
          const data = await response.json();
          setSessions(data);
        } else {
          setError('Erreur lors du chargement de l\'historique');
        }
      } catch (err) {
        setError('Erreur lors du chargement de l\'historique');
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSessions();
  }, [authenticatedGrower?.id]);

  // Filtrer et trier les sessions
  const filteredSessions = useMemo(() => {
    let filtered = sessions;

    // Filtrer par statut de validation
    if (filterValidated !== null) {
      filtered = sessions.filter(session => {
        const participation = session.participations.find(p => p.growerId === authenticatedGrower.id);
        const isValidated = participation?.status === 'VALIDATED';
        return filterValidated ? isValidated : !isValidated;
      });
    }

    // Trier par date
    return filtered.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }, [sessions, filterValidated, sortOrder, authenticatedGrower.id]);

  // Statistiques
  const stats = useMemo(() => {
    const totalSessions = sessions.length;
    const validatedSessions = sessions.filter(session => {
      const participation = session.participations.find(p => p.growerId === authenticatedGrower.id);
      return participation?.status === 'VALIDATED';
    }).length;
    
    const totalTurnover = sessions.reduce((sum, session) => {
      const commission = session.growerCommissions.find(c => c.growerId === authenticatedGrower.id);
      return sum + (commission ? parseFloat(commission.turnover.toString()) : 0);
    }, 0);

    const totalCommissions = sessions.reduce((sum, session) => {
      const commission = session.growerCommissions.find(c => c.growerId === authenticatedGrower.id);
      return sum + (commission ? parseFloat(commission.commissionAmount.toString()) : 0);
    }, 0);

    return {
      totalSessions,
      validatedSessions,
      totalTurnover,
      totalCommissions
    };
  }, [sessions, authenticatedGrower.id]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VALIDATED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            ✓ Validé
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Confirmé
          </span>
        );
      case 'DECLINED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Refusé
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            En attente
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de l'historique...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête avec navigation */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/producteur/mon-marche">
              <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                ← Retour à Mon Marché
              </button>
            </Link>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Historique des Marchés
                </h1>
                <p className="text-gray-600">
                  Consultez l'historique de vos participations aux marchés passés
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">📅</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Marchés</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalSessions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">✓</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Marchés Validés</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.validatedSessions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">💰</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">CA Total</p>
                <p className="text-2xl font-semibold text-gray-900">{formatCurrency(stats.totalTurnover)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">%</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Commissions</p>
                <p className="text-2xl font-semibold text-gray-900">{formatCurrency(stats.totalCommissions)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtres et tri */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Filtrer par statut:</label>
                <select
                  value={filterValidated === null ? 'all' : filterValidated ? 'validated' : 'not-validated'}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFilterValidated(value === 'all' ? null : value === 'validated');
                  }}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                >
                  <option value="all">Tous les marchés</option>
                  <option value="validated">Marchés validés uniquement</option>
                  <option value="not-validated">Marchés non validés</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Trier par date:</label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                >
                  <option value="desc">Plus récent d'abord</option>
                  <option value="asc">Plus ancien d'abord</option>
                </select>
              </div>
            </div>

            <div className="text-sm text-gray-500">
              {filteredSessions.length} marché{filteredSessions.length > 1 ? 's' : ''} affiché{filteredSessions.length > 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Liste des sessions */}
        {filteredSessions.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">📅</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun marché trouvé</h3>
            <p className="text-gray-500">
              {filterValidated === null 
                ? "Vous n'avez participé à aucun marché pour le moment."
                : filterValidated 
                  ? "Aucun marché validé trouvé avec les filtres actuels."
                  : "Aucun marché non validé trouvé avec les filtres actuels."
              }
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredSessions.map((session) => {
              const participation = session.participations.find(p => p.growerId === authenticatedGrower.id);
              const commission = session.growerCommissions.find(c => c.growerId === authenticatedGrower.id);
              const isValidated = participation?.status === 'VALIDATED';
              
              return (
                <div key={session.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{session.name}</h3>
                        {participation && getStatusBadge(participation.status)}
                        {isValidated && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            💰 CA saisi
                          </span>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <span>📅</span>
                          <span>{formatDateLong(session.date)}</span>
                        </div>
                        {session.location && (
                          <div className="flex items-center gap-1">
                            <span>📍</span>
                            <span>{session.location}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <span>👥</span>
                          <span>{session._count.participations} participant{session._count.participations > 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>📦</span>
                          <span>{session._count.marketProducts} produit{session._count.marketProducts > 1 ? 's' : ''}</span>
                        </div>
                      </div>

                      {session.description && (
                        <p className="text-gray-600 text-sm mb-3">{session.description}</p>
                      )}
                    </div>

                    {/* Informations financières pour les marchés validés */}
                    {isValidated && commission && (
                      <div className="lg:ml-6 mt-4 lg:mt-0">
                        <div className="bg-green-50 rounded-lg p-4 min-w-[200px]">
                          <h4 className="text-sm font-medium text-green-900 mb-2">Détails financiers</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-green-700">Chiffre d'affaires:</span>
                              <span className="font-medium text-green-900">
                                {formatCurrency(parseFloat(commission.turnover.toString()))}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-green-700">Commission:</span>
                              <span className="font-medium text-green-900">
                                {formatCurrency(parseFloat(commission.commissionAmount.toString()))}
                              </span>
                            </div>
                            <div className="flex justify-between text-xs pt-1 border-t border-green-200">
                              <span className="text-green-600">Taux:</span>
                              <span className="text-green-800">
                                {commission.customCommissionRate 
                                  ? parseFloat(commission.customCommissionRate.toString()).toFixed(1)
                                  : parseFloat(session.commissionRate.toString()).toFixed(1)
                                }%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default HistoriqueProducteurPage;