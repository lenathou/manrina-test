/* eslint-disable react/no-unescaped-entities */
import React, { useMemo } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { prisma } from '@/server/prisma';
import { Text } from '@/components/ui/Text';
import { MarketSessionWithProducts } from '@/types/market';
import { formatDateLong } from '@/utils/dateUtils';

interface HistoriqueSessionsPageProps {
  sessions: MarketSessionWithProducts[];
}



function HistoriqueSessionsPage({ sessions }: HistoriqueSessionsPageProps) {
  const router = useRouter();
  // Afficher uniquement les sessions validées

  // Debug: afficher les sessions récupérées
  console.log('Sessions récupérées:', sessions.length);
  console.log('Sessions détail:', sessions.map(s => ({
    id: s.id,
    name: s.name,
    status: s.status,
    participations: s.participations?.length || 0,
    validatedParticipations: s.participations?.filter(p => p.status === 'VALIDATED').length || 0
  })));

  // Filtrer et trier les sessions validées uniquement
  const filteredSessions = useMemo(() => {
    const sortedSessions = [...sessions].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    // Afficher seulement les sessions avec des producteurs validés
    return sortedSessions.filter(session => 
      session.participations && session.participations.some(p => p.status === 'VALIDATED')
    );
  }, [sessions]);



  const totalValidatedProducers = sessions.reduce(
    (total, session) => total + (session.participations?.filter(p => p.status === 'VALIDATED').length || 0),
    0,
  );

  return (
    <div className="space-y-6">
      {/* En-tête de la page */}
      <div className="rounded-lg shadow p-6 bg-white">
        <Text
          variant="h2"
          className="font-secondary font-bold text-2xl sm:text-3xl text-[var(--color-secondary)] mb-4"
        >
          Historique des Sessions
        </Text>
        <p className="text-base sm:text-lg text-[var(--muted-foreground)]">
          Consultez l'historique des sessions de marché validées et les producteurs participants
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Sessions Validées</p>
              <p className="text-2xl font-bold text-gray-900">{sessions.filter(s => s.participations && s.participations.some(p => p.status === 'VALIDATED')).length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Producteurs Validés</p>
              <p className="text-2xl font-bold text-gray-900">{totalValidatedProducers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Moyenne par Session</p>
              <p className="text-2xl font-bold text-gray-900">
                {sessions.length > 0 ? Math.round(totalValidatedProducers / sessions.length) : 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* En-tête des sessions validées */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Sessions Validées
            </h3>
            <p className="text-sm text-gray-500">
              {filteredSessions.length} session(s) avec des producteurs validés
            </p>
          </div>
        </div>
      </div>

      {/* Liste des sessions */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          {filteredSessions.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Aucune session validée
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Les sessions avec des producteurs validés apparaîtront ici.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredSessions.map((session) => (
                <div key={session.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">{session.name}</h3>
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          VALIDÉE
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">
                            <span className="font-medium">Date:</span> {formatDateLong(session.date)}
                          </p>
                          {session.location && (
                            <p className="text-sm text-gray-600 mb-1">
                              <span className="font-medium">Lieu:</span> {session.location}
                            </p>
                          )}
                          {session.startTime && session.endTime && (
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Horaires:</span> {String(session.startTime)} - {String(session.endTime)}
                            </p>
                          )}
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600 mb-2">
                            <span className="font-medium">Producteurs validés:</span> {session.participations?.filter(p => p.status === 'VALIDATED').length || 0}
                          </p>
                          {session.description && (
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Description:</span> {session.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Liste des producteurs validés */}
                      {session.participations && session.participations.filter(p => p.status === 'VALIDATED').length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Producteurs validés:</h4>
                          <div className="flex flex-wrap gap-2">
                            {session.participations.filter(p => p.status === 'VALIDATED').slice(0, 5).map((participation) => (
                              <span
                                key={participation.id}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                              >
                                {participation.grower.name}
                              </span>
                            ))}
                            {session.participations.filter(p => p.status === 'VALIDATED').length > 5 && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                +{session.participations.filter(p => p.status === 'VALIDATED').length - 5} autres
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Bouton Détail */}
                    <div className="flex-shrink-0">
                      <button
                        onClick={() => router.push(`/admin/gestion-marche/historique-sessions/${session.id}`)}
                        className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg hover:bg-[var(--color-primary)]/90 transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Détail
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Guide d'utilisation */}
      <div className="bg-blue-50 border border-primary rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-3">À propos de l'historique</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p>
            <strong>Sessions Validées :</strong> Seules les sessions qui ont été validées et clôturées apparaissent dans cet historique.
          </p>
          <p>
            <strong>Producteurs Validés :</strong> Les producteurs affichés sont ceux qui ont été confirmés comme présents lors de la validation de la session.
          </p>
          <p>
            <strong>Données Historiques :</strong> Ces informations permettent de suivre la participation des producteurs au fil du temps.
          </p>
        </div>
      </div>
    </div>
  );
}

export default HistoriqueSessionsPage;

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    // Récupérer toutes les sessions terminées (COMPLETED) avec toutes les participations
    const sessions = await prisma.marketSession.findMany({
      where: {
        status: 'COMPLETED'
      },
      include: {
        participations: {
          include: {
            grower: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        _count: {
          select: {
            participations: {
              where: {
                status: 'VALIDATED'
              }
            }
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    return {
      props: {
        sessions: JSON.parse(JSON.stringify(sessions))
      }
    };
  } catch (error) {
    console.error('Erreur lors du chargement des sessions:', error);
    return {
      props: {
        sessions: []
      }
    };
  }
};