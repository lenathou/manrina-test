/* eslint-disable react/no-unescaped-entities */
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import React from 'react';
import { useState, useEffect } from 'react';
import { ExhibitorCard } from '@/components/public/ExhibitorCard';

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
const getNextSaturday = (): Date => {
    const today = new Date();
    const daysUntilSaturday = (6 - today.getDay()) % 7;
    const nextSaturday = new Date(today);
    nextSaturday.setDate(today.getDate() + (daysUntilSaturday === 0 ? 7 : daysUntilSaturday));
    return nextSaturday;
};

// Fonctions pour récupérer les données via API
const getUpcomingGrowers = async (limit?: number): Promise<MarketProducer[]> => {
    try {
        const response = await fetch('/api/market/exhibitors');
        if (!response.ok) {
            throw new Error('Erreur lors de la récupération des exposants');
        }
        const exhibitors = await response.json();
        
        // Limiter le nombre d'exposants si spécifié
        return limit ? exhibitors.slice(0, limit) : exhibitors;
    } catch (error) {
        console.error('Erreur API exposants:', error);
        // Fallback avec des données mockées en cas d'erreur
        const mockData = [
            {
                id: '1',
                name: 'Ferme Bio Martinique',
                profilePhoto: '/api/placeholder/300/200',
                description: 'Producteur de légumes biologiques locaux depuis 15 ans',
                specialties: ['Légumes bio', 'Fruits tropicaux', 'Herbes aromatiques'],
                email: 'contact@ferme-bio-martinique.com',
                phone: '0596 XX XX XX',
                products: [],
                nextMarketDate: new Date().toISOString()
            },
            {
                id: '2',
                name: 'Jardin Créole',
                profilePhoto: '/api/placeholder/300/200',
                description: 'Spécialiste des variétés créoles traditionnelles',
                specialties: ['Légumes créoles', 'Épices', 'Plantes médicinales'],
                email: 'info@jardin-creole.com',
                phone: '0596 XX XX XX',
                products: [],
                nextMarketDate: new Date().toISOString()
            },
            {
                id: '3',
                name: 'Élevage Péyi',
                profilePhoto: '/api/placeholder/300/200',
                description: 'Élevage responsable et produits laitiers artisanaux',
                specialties: ['Viandes locales', 'Fromages', 'Œufs fermiers'],
                email: 'contact@elevage-peyi.com',
                phone: '0596 XX XX XX',
                products: [],
                nextMarketDate: new Date().toISOString()
            },
        ];
        
        return limit ? mockData.slice(0, limit) : mockData;
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
        // Fallback avec des données mockées en cas d'erreur
        return [
            {
                id: '1',
                title: 'Nouveau producteur ce samedi !',
                content:
                    'Nous accueillons un nouveau producteur de miel local. Venez découvrir ses produits artisanaux.',
                publishedAt: new Date('2024-01-15'),
                priority: 'medium' as const,
            },
            {
                id: '2',
                title: 'Animation spéciale enfants',
                content: 'Atelier de découverte des légumes créoles pour les enfants de 10h à 12h.',
                publishedAt: new Date('2024-01-10'),
                priority: 'low' as const,
            },
        ];
    }
};

export default function MarchePage() {
    const [nextSaturday, setNextSaturday] = useState<Date | null>(null);
    const [growers, setGrowers] = useState<MarketProducer[]>([]);
    const [announcements, setAnnouncements] = useState<MarketAnnouncement[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [loading, setLoading] = useState(true);
    const [hasMoreExhibitors, setHasMoreExhibitors] = useState(false);
    const [showAttendanceForm, setShowAttendanceForm] = useState(false);
    const [attendanceEmail, setAttendanceEmail] = useState('');

    useEffect(() => {
        setNextSaturday(getNextSaturday());

        // Charger les données
        const loadData = async () => {
            try {
                const [limitedGrowersData, allGrowersData, announcementsData] = await Promise.all([
                    getUpcomingGrowers(6), // Limiter à 6 exposants
                    getUpcomingGrowers(), // Récupérer tous les exposants pour vérifier s'il y en a plus
                    getMarketAnnouncements(),
                ]);
                setGrowers(limitedGrowersData);
                setHasMoreExhibitors(allGrowersData.length > 6);
                setAnnouncements(announcementsData);
            } catch (error) {
                console.error('Erreur lors du chargement des données:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const handleAttendanceSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch('/api/market/attendance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: attendanceEmail,
                    marketDate: nextSaturday?.toISOString(),
                }),
            });

            const data = await response.json();

            if (data.success) {
                alert(data.message);
                setShowAttendanceForm(false);
                setAttendanceEmail('');
            } else {
                alert(`Erreur: ${data.message}`);
            }
        } catch (error) {
            console.error("Erreur lors de l'envoi:", error);
            alert('Une erreur est survenue. Veuillez réessayer plus tard.');
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
                            {nextSaturday?.toLocaleDateString('fr-FR', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </p>
                        <p className="text-lg mt-2">7h - 14h • Place du marché</p>
                    </div>
                </div>
            </section>

            <main className="max-w-6xl mx-auto px-4 py-12 space-y-16">
                {/* Section Exposants */}
                <section>
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Nos Exposants</h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Découvrez les producteurs locaux qui participeront au prochain marché.
                            Chacun apporte sa passion et son savoir-faire pour vous offrir le meilleur de notre terroir.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                         {growers.map((grower) => (
                             <ExhibitorCard
                                 key={grower.id}
                                 exhibitor={grower}
                                 showProducts={true}
                                 variant="detailed"
                             />
                         ))}
                     </div>
                    
                    {/* Bouton Voir tous les exposants */}
                    {hasMoreExhibitors && (
                        <div className="text-center">
                            <Button variant="outline" className="px-8">
                                Voir tous les exposants
                            </Button>
                        </div>
                    )}
                </section>

                {/* Section CTA */}
                <section className="bg-gray-50 rounded-2xl p-8 md:p-12 text-center">
                    <h2 className="text-2xl md:text-3xl font-bold mb-4">Vous prévoyez de venir ?</h2>
                    <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                        Prévenez-nous de votre venue pour nous aider à mieux organiser le marché
                    </p>

                    {!showAttendanceForm ? (
                        <Button
                            onClick={() => setShowAttendanceForm(true)}
                            className="text-lg px-8 py-3"
                        >
                            Je prévois de venir
                        </Button>
                    ) : (
                        <form
                            onSubmit={handleAttendanceSubmit}
                            className="max-w-md mx-auto"
                        >
                            <div className="mb-4">
                                <input
                                    type="email"
                                    value={attendanceEmail}
                                    onChange={(e) => setAttendanceEmail(e.target.value)}
                                    placeholder="Votre adresse email"
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>
                            <div className="flex gap-3 justify-center">
                                <Button
                                    type="submit"
                                    className="px-6 py-2"
                                >
                                    Confirmer
                                </Button>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setShowAttendanceForm(false)}
                                    className="px-6 py-2"
                                >
                                    Annuler
                                </Button>
                            </div>
                        </form>
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
            </main>
        </>
    );
}
