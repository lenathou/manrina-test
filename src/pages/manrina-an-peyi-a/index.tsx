/* eslint-disable react/no-unescaped-entities */
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import React from 'react';
import { useState, useEffect } from 'react';
import { ExhibitorCard } from '@/components/public/ExhibitorCard';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { formatDateLong } from '@/utils/dateUtils';

// Types pour les données du marché
import { PublicExhibitor } from '@/types/market';

// Alias pour compatibilité
type MarketProducer = PublicExhibitor;

interface MarketAnnouncement {
    id: string;
    title: string;
    content: string;
    publishedAt: Date;
    priority: 'low' | 'medium' | 'high';
}

// Interface pour les données d'annonce de l'API (avant transformation)
interface MarketAnnouncementFromAPI {
    id: string;
    title: string;
    content: string;
    publishedAt: string;
    priority: 'low' | 'medium' | 'high';
}

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

// Fonction pour récupérer les exposants d'une session spécifique
const getSessionExhibitors = async (sessionId: string): Promise<MarketProducer[]> => {
    try {
        const response = await fetch(`/api/market/sessions/${sessionId}/exhibitors`);
        if (!response.ok) {
            throw new Error('Erreur lors de la récupération des exposants');
        }
        const exhibitors = await response.json();
        return exhibitors;
    } catch (error) {
        console.error('Erreur API exposants:', error);
        return [];
    }
};

const getMarketAnnouncements = async (): Promise<MarketAnnouncement[]> => {
    try {
        const response = await fetch('/api/market/announcements');
        if (!response.ok) {
            throw new Error('Erreur lors de la récupération des annonces');
        }
        const data: MarketAnnouncementFromAPI[] = await response.json();
        // Convertir les dates string en objets Date
        return data.map((announcement: MarketAnnouncementFromAPI) => ({
            ...announcement,
            publishedAt: new Date(announcement.publishedAt),
        }));
    } catch (error) {
        console.error('Erreur API annonces:', error);
        return [];
    }
};

// Récupérer les sessions de marché à venir
const getUpcomingMarketSessions = async (): Promise<{ id: string; date: Date; title?: string; description?: string }[]> => {
    try {
        const response = await fetch('/api/market/sessions?upcoming=true');
        if (!response.ok) {
            return [];
        }
        const data = await response.json();
        if (data.sessions && data.sessions.length > 0) {
            return data.sessions.map((session: { id: string; date: string; name?: string; description?: string }) => ({
                id: session.id,
                date: new Date(session.date),
                title: session.name || '',
                description: session.description
            }));
        }
        return [];
    } catch (error) {
        console.error('Erreur lors de la récupération des sessions:', error);
        return [];
    }
};

// Vérifier le statut de présence du client
const checkAttendanceStatus = async (marketSessionId: string): Promise<'none' | 'planned' | 'cancelled'> => {
    try {
        const response = await fetch(`/api/client/market-attendance?marketSessionId=${marketSessionId}`, {
            credentials: 'include'
        });
        if (!response.ok) {
            return 'none';
        }
        const data = await response.json();
        if (data.attendance) {
            return data.attendance.status === 'PLANNED' ? 'planned' : 'cancelled';
        }
        return 'none';
    } catch (error) {
        console.error('Erreur lors de la vérification du statut:', error);
        return 'none';
    }
};

// Signaler ou annuler la présence
const toggleAttendance = async (marketSessionId: string, currentStatus: 'none' | 'planned' | 'cancelled'): Promise<boolean> => {
    try {
        const method = currentStatus === 'planned' ? 'DELETE' : 'POST';
        const response = await fetch('/api/client/market-attendance', {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ marketSessionId })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erreur lors de la mise à jour');
        }
        
        return true;
    } catch (error) {
        console.error('Erreur lors de la mise à jour:', error);
        return false;
    }
};

export default function MarchePage() {
    const [exhibitors, setExhibitors] = useState<MarketProducer[]>([]);
    const [announcements, setAnnouncements] = useState<MarketAnnouncement[]>([]);
    const [upcomingSessions, setUpcomingSessions] = useState<{ id: string; date: Date; title?: string; description?: string }[]>([]);
    const [currentSession, setCurrentSession] = useState<{ id: string; date: Date; title?: string; description?: string } | null>(null);
    const [attendanceStatus, setAttendanceStatus] = useState<'none' | 'planned' | 'cancelled'>('none');
    const [attendanceLoading, setAttendanceLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    
    const { role, isLoading: authLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // Charger les données
        const loadData = async () => {
            try {
                const [sessionsData, announcementsData] = await Promise.all([
                    getUpcomingMarketSessions(),
                    getMarketAnnouncements()
                ]);
                
                setUpcomingSessions(sessionsData);
                setAnnouncements(announcementsData);
                
                // Définir la session courante (la première à venir)
                if (sessionsData.length > 0) {
                    const nextSession = sessionsData[0];
                    setCurrentSession(nextSession);
                    
                    // Charger les exposants pour cette session
                    const sessionExhibitors = await getSessionExhibitors(nextSession.id);
                    setExhibitors(sessionExhibitors);
                    
                    // Si l'utilisateur est un client, vérifier son statut de présence
                    if (role === 'client') {
                        const status = await checkAttendanceStatus(nextSession.id);
                        setAttendanceStatus(status);
                    }
                }
            } catch (error) {
                console.error('Erreur lors du chargement des données:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [role]);


    // Fonction pour gérer le signalement de présence des clients connectés
    const handleClientAttendanceToggle = async () => {
        if (!currentSession) {
            alert('Aucune session de marché disponible');
            return;
        }
        
        setAttendanceLoading(true);
        
        try {
            const success = await toggleAttendance(currentSession.id, attendanceStatus);
            
            if (success) {
                // Mettre à jour le statut local
                if (attendanceStatus === 'planned') {
                    setAttendanceStatus('cancelled');
                } else {
                    setAttendanceStatus('planned');
                }
            } else {
                alert('Une erreur est survenue lors de la mise à jour');
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert('Une erreur est survenue');
        } finally {
            setAttendanceLoading(false);
        }
    };



    return (
        <>

            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-green-600 to-green-800 text-white py-16 px-4">
                <div className="absolute inset-0 bg-black opacity-20"></div>
                <div className="relative max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">Manrina an péyi-a</h1>
                    <p className="text-xl md:text-2xl mb-8 opacity-90">
                        Le marché des producteurs locaux, chaque samedi
                    </p>
                    <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-6 inline-block">
                        <p className="text-lg mb-2">Prochain marché :</p>
                        <p className="text-2xl md:text-3xl font-bold">
                            {currentSession ? formatDateLong(currentSession.date) : 'Aucun marché programmé'}
                        </p>
                        <p className="text-lg mt-2">7h - 14h • Place du marché</p>
                    </div>
                </div>
            </section>

            <main className="max-w-6xl mx-auto px-4 py-12 space-y-16">
                {loading ? (
                    <div className="flex justify-center items-center py-16">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                        <span className="ml-4 text-lg text-gray-600">Chargement des données...</span>
                    </div>
                ) : (
                    <>
                        {/* Section Session courante */}
                        {currentSession && (
                    <section className="bg-gray-50 rounded-2xl p-8 md:p-12 mb-16">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">
                                {currentSession.title || 'Prochain Marché'}
                            </h2>
                            <p className="text-xl text-gray-600 mb-2">
                                {formatDateLong(currentSession.date)}
                            </p>
                            {currentSession.description && (
                                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                                    {currentSession.description}
                                </p>
                            )}
                            
                            {/* Lien vers tous les événements si plusieurs sessions */}
                            {upcomingSessions.length > 1 && (
                                <div className="mt-4">
                                    <Link href="/manrina-an-peyi-a/evenements">
                                        <Button variant="outline" className="px-6">
                                            Voir tous nos événements ({upcomingSessions.length})
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                        
                        {/* Exposants pour cette session */}
                        {exhibitors.length > 0 && (
                            <div>
                                <h3 className="text-2xl font-bold mb-6 text-center">Exposants participants</h3>
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
                            </div>
                        )}
                        
                        {exhibitors.length === 0 && (
                            <div className="text-center py-8">
                                <p className="text-gray-600">Aucun exposant inscrit pour le moment</p>
                            </div>
                        )}
                    </section>
                )}
                
                {!currentSession && (
                    <section className="bg-gray-50 rounded-2xl p-8 md:p-12 mb-16 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Aucun marché programmé</h2>
                        <p className="text-lg text-gray-600">Revenez bientôt pour découvrir les prochaines dates !</p>
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
                                    <h2 className="text-2xl md:text-3xl font-bold mb-4">Rejoignez-nous au marché !</h2>
                                    <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                                        Inscrivez-vous pour nous signaler votre présence et découvrir toutes les fonctionnalités du site
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
                                    <h2 className="text-2xl md:text-3xl font-bold mb-4">Participez au prochain marché</h2>
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
                                    <h2 className="text-2xl md:text-3xl font-bold mb-4">Équipe organisatrice</h2>
                                    <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                                        Nous comptons vivement sur votre participation pour le bon déroulement du marché
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
                                    <h2 className="text-2xl md:text-3xl font-bold mb-4">Vous prévoyez de venir ?</h2>
                                    <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                                        Prévenez-nous de votre venue pour nous aider à mieux organiser le marché
                                    </p>

                                    {attendanceStatus === 'none' && (
                                        <Button
                                            onClick={handleClientAttendanceToggle}
                                            disabled={attendanceLoading}
                                            className="text-lg px-8 py-3"
                                        >
                                            {attendanceLoading ? 'Chargement...' : 'Je prévois de venir'}
                                        </Button>
                                    )}
                                    
                                    {attendanceStatus === 'planned' && (
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-center space-x-2 text-green-700">
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                <span className="font-medium">Présence confirmée</span>
                                            </div>
                                            <Button
                                                onClick={handleClientAttendanceToggle}
                                                disabled={attendanceLoading}
                                                variant="danger"
                                                className="px-6 py-2"
                                            >
                                                {attendanceLoading ? 'Chargement...' : 'Annuler ma présence'}
                                            </Button>
                                        </div>
                                    )}
                                    
                                    {attendanceStatus === 'cancelled' && (
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-center space-x-2 text-gray-600">
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                </svg>
                                                <span className="font-medium">Présence annulée</span>
                                            </div>
                                            <Button
                                                onClick={handleClientAttendanceToggle}
                                                disabled={attendanceLoading}
                                                className="px-6 py-2"
                                            >
                                                {attendanceLoading ? 'Chargement...' : 'Je prévois de venir'}
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
                                Soutenez l'économie locale et consommez des produits respectueux de l'environnement
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
                            <p className="text-lg text-gray-600">Les dernières informations de nos organisateurs</p>
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
