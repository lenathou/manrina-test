/* eslint-disable react/no-unescaped-entities */
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import React from 'react';
import { useMemo, useCallback } from 'react';
import { ExhibitorCard } from '@/components/public/ExhibitorCard';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { formatDateLong, formatTimeOnly } from '@/utils/dateUtils';
import { useMarketSessionsQuery } from '@/hooks/useMarketSessionsQuery';
import { useMarketPageData } from '@/hooks/useMarketPageData';
import { useMutation, useQueryClient } from '@tanstack/react-query';

// Types pour les données du marché

// Alias pour compatibilité

interface MarketAnnouncement {
    id: string;
    title: string;
    content: string;
    publishedAt: Date;
    priority: 'low' | 'medium' | 'high';
}

// Interface pour les données d'annonce de l'API (avant transformation)


// Interface ProducerCardProps supprimée car non utilisée

// Composant ProducerCard supprimé car non utilisé - remplacé par ExhibitorCard

// Composant pour afficher une annonce
interface AnnouncementCardProps {
    announcement: MarketAnnouncement;
}

const AnnouncementCard: React.FC<AnnouncementCardProps> = ({ announcement }) => {
    const priorityColors = {
        low: 'border-l-blue-500 bg-blue-50',
        medium: 'border-l-yellow-500 bg-yellow-50',
        high: 'border-l-red-500 bg-red-50',
    };

    return (
        <Card className={`border-l-4 ${priorityColors[announcement.priority]}`}>
            <CardContent className="p-4">
                <CardTitle className="text-lg mb-2">{announcement.title}</CardTitle>
                <CardDescription className="text-sm text-gray-700 mb-2">{announcement.content}</CardDescription>
                <p className="text-xs text-gray-500">
                    Publié le {announcement.publishedAt.toLocaleDateString('fr-FR')}
                </p>
            </CardContent>
        </Card>
    );
};

// Fonction pour calculer le prochain samedi

// Les fonctions API directes sont remplacées par les hooks optimisés useMarketPageData

// Fonction pour formater les heures de session
const formatSessionTime = (startTime?: Date | string | null, endTime?: Date | string | null): string => {
    if (!startTime && !endTime) {
        return '7h - 14h'; // Valeur par défaut
    }

    if (startTime && endTime) {
        const startStr = startTime instanceof Date ? startTime.toISOString() : startTime;
        const endStr = endTime instanceof Date ? endTime.toISOString() : endTime;
        const start = formatTimeOnly(startStr).replace(':', 'h');
        const end = formatTimeOnly(endStr).replace(':', 'h');
        return `${start} - ${end}`;
    }

    if (startTime) {
        const startStr = startTime instanceof Date ? startTime.toISOString() : startTime;
        const start = formatTimeOnly(startStr).replace(':', 'h');
        return `À partir de ${start}`;
    }

    return '7h - 14h'; // Valeur par défaut
};

// Les fonctions de gestion de présence sont remplacées par le hook useAttendanceMutation

// Hook optimisé pour la mutation de présence
function useAttendanceMutation(sessionId: string | null) {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async (currentStatus: 'none' | 'planned' | 'cancelled') => {
            if (!sessionId) {
                throw new Error('Aucune session disponible');
            }
            
            const method = currentStatus === 'planned' ? 'DELETE' : 'POST';
            const response = await fetch('/api/client/market-attendance', {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ marketSessionId: sessionId }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erreur lors de la mise à jour');
            }

            return response.json();
        },
        onSuccess: () => {
            // Invalider et refetch les données de présence
            queryClient.invalidateQueries({ 
                queryKey: ['attendance-status', sessionId],
                refetchType: 'active'
            });
        },
        onError: (error) => {
            console.error('Erreur lors de la mutation de présence:', error);
        },
        meta: {
            description: 'Mutation de présence au marché',
        },
    });
}

export default function MarchePage() {

    const { role, isLoading: authLoading } = useAuth();
    const router = useRouter();

    // Utilisation du hook optimisé pour les sessions de marché
    const sessionFilters = useMemo(
        () => ({
            upcoming: true,
            limit: 10, // Limiter le nombre de sessions pour de meilleures performances
            summary: true, // Utiliser le mode résumé pour réduire la taille des données
        }),
        [],
    );

    const { sessions: marketSessions, loading: sessionsLoading } = useMarketSessionsQuery(sessionFilters);

    // Filtrer les sessions à venir et actives (optimisé)
    const upcomingSessions = useMemo(() => {
        if (!marketSessions || marketSessions.length === 0) return [];
        
        return marketSessions
            .filter((session) => session.status === 'UPCOMING' || session.status === 'ACTIVE')
            .map((session) => ({
                id: session.id,
                date: new Date(session.date),
                title: session.name || '',
                description: session.description,
                location: session.location,
            }));
    }, [marketSessions]);

    // Session courante (la première à venir) - optimisé
    const currentSession = useMemo(() => {
        if (!marketSessions || marketSessions.length === 0) return null;
        
        const upcomingSession = marketSessions
            .filter((session) => session.status === 'UPCOMING' || session.status === 'ACTIVE')
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

        return upcomingSession
            ? {
                  id: upcomingSession.id,
                  date: new Date(upcomingSession.date),
                  title: upcomingSession.name || '',
                  description: upcomingSession.description,
                  startTime: upcomingSession.startTime,
                  endTime: upcomingSession.endTime,
                  location: upcomingSession.location,
              }
            : null;
    }, [marketSessions]);

    // Utilisation des hooks optimisés pour les données de la page
    const { 
        exhibitors, 
        announcements, 
        attendanceStatus, 
        isLoading: pageDataLoading 
    } = useMarketPageData(currentSession?.id || null, role);

    // Hook pour la mutation de présence
    const attendanceMutation = useAttendanceMutation(currentSession?.id || null);

    // Fonction optimisée pour gérer le signalement de présence
    const handleClientAttendanceToggle = useCallback(async () => {
        if (!currentSession) {
            alert('Aucune session de marché disponible');
            return;
        }

        try {
            await attendanceMutation.mutateAsync(attendanceStatus);
        } catch (error) {
            console.error('Erreur:', error);
            alert('Une erreur est survenue lors de la mise à jour');
        }
    }, [currentSession, attendanceStatus, attendanceMutation]);

    // État de chargement global optimisé
    const loading = sessionsLoading || pageDataLoading;

    return (
        <>
            {/* Hero Section */}
            <section className="relative py-16 px-4">
                <div className="relative max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">Manrina an péyi-a</h1>
                    <p className="text-xl md:text-2xl mb-8 opacity-90">
                        Le marché des producteurs locaux, chaque samedi
                    </p>
                    {currentSession ? (
                        <div className="bg-secondary text-white bg-opacity-20 backdrop-blur-sm rounded-lg p-6 inline-block">
                            <p className="text-lg mb-2">Prochain marché :</p>
                            <p className="text-2xl md:text-3xl font-bold mb-2">
                                {currentSession.title || 'Marché de producteurs'}
                            </p>
                            <p className="text-xl mb-2">{formatDateLong(currentSession.date)}</p>
                            <p className="text-lg mb-2">
                                {formatSessionTime(currentSession.startTime, currentSession.endTime)} •{' '}
                                {currentSession.location || 'Place du marché'}
                            </p>
                            {currentSession.description && (
                                <p className="text-base opacity-90 max-w-md mx-auto">{currentSession.description}</p>
                            )}

                            {/* Lien vers tous les événements si plusieurs sessions */}
                            {upcomingSessions.length > 1 && (
                                <div className="mt-4">
                                    <Link href="/manrina-an-peyi-a/evenements">
                                        <Button
                                            variant="outline"
                                            className="px-6 bg-white bg-opacity-20 border-white border-opacity-30 text-white hover:bg-white hover:bg-opacity-30"
                                        >
                                            Voir tous nos événements ({upcomingSessions.length})
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-secondary text-white bg-opacity-20 backdrop-blur-sm rounded-lg p-6 inline-block">
                            <p className="text-lg mb-2">Prochain marché :</p>
                            <p className="text-2xl md:text-3xl font-bold">Aucun marché programmé</p>
                            <p className="text-lg mt-2">Revenez bientôt pour découvrir les prochaines dates !</p>
                        </div>
                    )}
                </div>
            </section>

            <main className="max-w-6xl mx-auto px-4 py-12 space-y-16">
                {loading || sessionsLoading ? (
                    <div className="flex justify-center items-center py-16">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                        <span className="ml-4 text-lg text-gray-600">Chargement des données...</span>
                    </div>
                ) : (
                    <>
                        {/* Exposants pour la session courante */}
                        {currentSession && exhibitors.length > 0 && (
                            <section className="mb-16">
                                <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
                                    Exposants participants
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {exhibitors.map((exhibitor) => (
                                        <ExhibitorCard
                                            key={exhibitor.id}
                                            exhibitor={exhibitor}
                                            showProducts={true}
                                            variant="detailed"
                                        />
                                    ))}
                                </div>
                            </section>
                        )}

                        {currentSession && exhibitors.length === 0 && (
                            <section className="mb-16 text-center py-8">
                                <h2 className="text-3xl md:text-4xl font-bold mb-4">Exposants participants</h2>
                                <p className="text-gray-600">Aucun exposant inscrit pour le moment</p>
                            </section>
                        )}

                        {/* Section CTA */}
                        <section className="bg-gray-50 rounded-2xl p-8 md:p-12 text-center">
                            {authLoading ? (
                                <div className="flex justify-center items-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                                </div>
                            ) : (
                                <>
                                    {/* Contenu pour utilisateurs non connectés */}
                                    {role === 'public' && (
                                        <>
                                            <h2 className="text-2xl md:text-3xl font-bold mb-4">
                                                Rejoignez-nous au marché !
                                            </h2>
                                            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                                                Inscrivez-vous pour nous signaler votre présence et découvrir toutes les
                                                fonctionnalités du site
                                            </p>
                                            <Button
                                                onClick={() => router.push('/register')}
                                                className="text-lg px-8 py-3"
                                            >
                                                S'inscrire
                                            </Button>
                                        </>
                                    )}

                                    {/* Contenu pour les producteurs */}
                                    {role === 'producteur' && (
                                        <>
                                            <h2 className="text-2xl md:text-3xl font-bold mb-4">
                                                Participez au prochain marché
                                            </h2>
                                            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                                                Gérez votre participation et vos produits pour le prochain marché
                                            </p>
                                            <Button
                                                onClick={() => router.push('/producteur/mon-marche')}
                                                className="text-lg px-8 py-3"
                                            >
                                                Je signale ma participation
                                            </Button>
                                        </>
                                    )}

                                    {/* Contenu pour les admins et livreurs */}
                                    {(role === 'admin' || role === 'livreur') && (
                                        <>
                                            <h2 className="text-2xl md:text-3xl font-bold mb-4">
                                                Équipe organisatrice
                                            </h2>
                                            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                                                Nous comptons vivement sur votre participation pour le bon déroulement
                                                du marché
                                            </p>
                                            <div className="inline-flex items-center px-6 py-3 bg-green-100 text-green-800 rounded-lg font-medium">
                                                <span className="mr-2">✓</span>
                                                Votre présence est confirmée
                                            </div>
                                        </>
                                    )}

                                    {/* Contenu pour les clients */}
                                    {role === 'client' && (
                                        <>
                                            <h2 className="text-2xl md:text-3xl font-bold mb-4">
                                                Vous prévoyez de venir ?
                                            </h2>
                                            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                                                Prévenez-nous de votre venue pour nous aider à mieux organiser le marché
                                            </p>

                                            {attendanceStatus === 'none' && (
                                                <Button
                                                    onClick={handleClientAttendanceToggle}
                                                    disabled={attendanceMutation.isPending}
                                                    className="text-lg px-8 py-3"
                                                >
                                                    {attendanceMutation.isPending ? 'Mise à jour...' : 'Signaler ma présence'}
                                                </Button>
                                            )}

                                            {attendanceStatus === 'planned' && (
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-center space-x-2 text-green-700">
                                                        <svg
                                                            className="w-5 h-5"
                                                            fill="currentColor"
                                                            viewBox="0 0 20 20"
                                                        >
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                        <span className="font-medium">Présence confirmée</span>
                                                    </div>
                                                    <Button
                                                        onClick={handleClientAttendanceToggle}
                                                        disabled={attendanceMutation.isPending}
                                                        variant="danger"
                                                        className="px-6 py-2"
                                                    >
                                                        {attendanceMutation.isPending ? 'Chargement...' : 'Annuler ma présence'}
                                                    </Button>
                                                </div>
                                            )}

                                            {attendanceStatus === 'cancelled' && (
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-center space-x-2 text-gray-600">
                                                        <svg
                                                            className="w-5 h-5"
                                                            fill="currentColor"
                                                            viewBox="0 0 20 20"
                                                        >
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                        <span className="font-medium">Présence annulée</span>
                                                    </div>
                                                    <Button
                                                        onClick={handleClientAttendanceToggle}
                                                        disabled={attendanceMutation.isPending}
                                                        className="px-6 py-2"
                                                    >
                                                        {attendanceMutation.isPending ? 'Chargement...' : 'Je prévois de venir'}
                                                    </Button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </>
                            )}
                        </section>

                        {/* Section Pourquoi venir */}
                        <section>
                            <div className="text-center mb-12">
                                <h2 className="text-3xl md:text-4xl font-bold mb-4">Pourquoi venir au marché ?</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                                    <div className="text-4xl mb-4">🌱</div>
                                    <CardTitle className="text-xl mb-3">Produits Frais</CardTitle>
                                    <CardDescription>
                                        Des produits récoltés le matin même, directement du producteur au consommateur
                                    </CardDescription>
                                </Card>

                                <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                                    <div className="text-4xl mb-4">🤝</div>
                                    <CardTitle className="text-xl mb-3">Rencontres</CardTitle>
                                    <CardDescription>
                                        Échangez directement avec les producteurs et découvrez leurs savoir-faire
                                    </CardDescription>
                                </Card>

                                <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                                    <div className="text-4xl mb-4">🌍</div>
                                    <CardTitle className="text-xl mb-3">Local & Bio</CardTitle>
                                    <CardDescription>
                                        Soutenez l'économie locale et consommez des produits respectueux de
                                        l'environnement
                                    </CardDescription>
                                </Card>

                                <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                                    <div className="text-4xl mb-4">💰</div>
                                    <CardTitle className="text-xl mb-3">Prix Justes</CardTitle>
                                    <CardDescription>
                                        Des prix équitables qui rémunèrent justement les producteurs
                                    </CardDescription>
                                </Card>
                            </div>
                        </section>

                        {/* Section Annonces */}
                        {announcements.length > 0 && (
                            <section>
                                <div className="text-center mb-12">
                                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Annonces du marché</h2>
                                    <p className="text-lg text-gray-600">
                                        Les dernières informations de nos organisateurs
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {announcements.map((announcement) => (
                                        <AnnouncementCard
                                            key={announcement.id}
                                            announcement={announcement}
                                        />
                                    ))}
                                </div>
                            </section>
                        )}
                    </>
                )}
            </main>
        </>
    );
}
