/* eslint-disable react/no-unescaped-entities */
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExhibitorCard } from '@/components/public/ExhibitorCard';
// Removed obsolete imports - now using /api/market/sessions directly
import type { MarketProducer, PublicExhibitor } from '@/types/market';
import { formatDateLong } from '@/utils/dateUtils';

// Fonction pour transformer MarketProducer en PublicExhibitor
const transformToPublicExhibitor = (producer: MarketProducer): PublicExhibitor => ({
  id: producer.id,
  name: producer.name,
  profilePhoto: producer.profilePhoto || '',
  description: producer.description,
  specialties: producer.specialties || [],
  email: producer.email,
  phone: producer.phone,
  products: producer.products || [],
  nextMarketDate: null
});

interface MarketSession {
  id: string;
  date: Date;
  title?: string;
  description?: string;
}

interface SessionWithExhibitors extends MarketSession {
  exhibitors: PublicExhibitor[];
  exhibitorCount: number;
}

export default function EvenementsPage() {
  const [upcomingSessions, setUpcomingSessions] = useState<SessionWithExhibitors[]>([]);
  const [pastSessions, setPastSessions] = useState<SessionWithExhibitors[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab] = useState('upcoming');
  const router = useRouter();

  useEffect(() => {
    const loadSessions = async () => {
      try {
        // Charger les sessions à venir
        const upcomingResponse = await fetch('/api/market/sessions?upcoming=true');
        const pastResponse = await fetch('/api/market/sessions?upcoming=false');
        
        const [upcomingData, pastData] = await Promise.all([
          upcomingResponse.ok ? upcomingResponse.json() : { sessions: [] },
          pastResponse.ok ? pastResponse.json() : { sessions: [] }
        ]);

        // Charger les exposants pour chaque session
        const upcomingWithExhibitors = await Promise.all(
          (upcomingData.sessions || []).map(async (session: MarketSession) => {
            const exhibitorsResponse = await fetch(`/api/market/sessions/${session.id}/exhibitors`);
            if (exhibitorsResponse.ok) {
              const exhibitorsData = await exhibitorsResponse.json();
              const transformedExhibitors = exhibitorsData.map(transformToPublicExhibitor);
              return {
                ...session,
                exhibitors: transformedExhibitors,
                exhibitorCount: transformedExhibitors.length
              };
            }
            return {
              ...session,
              exhibitors: [],
              exhibitorCount: 0
            };
          })
        );

        const pastWithExhibitors = await Promise.all(
          (pastData.sessions || []).map(async (session: MarketSession) => {
            const exhibitorsResponse = await fetch(`/api/market/sessions/${session.id}/exhibitors`);
            if (exhibitorsResponse.ok) {
              const exhibitorsData = await exhibitorsResponse.json();
              const transformedExhibitors = exhibitorsData.map(transformToPublicExhibitor);
              return {
                ...session,
                exhibitors: transformedExhibitors,
                exhibitorCount: transformedExhibitors.length
              };
            }
            return {
              ...session,
              exhibitors: [],
              exhibitorCount: 0
            };
          })
        );

        setUpcomingSessions(upcomingWithExhibitors);
        setPastSessions(pastWithExhibitors);
      } catch (error) {
        console.error('Erreur lors du chargement des sessions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSessions();
  }, []);



  const SessionCard = ({ session }: { session: SessionWithExhibitors }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="text-xl">
          {session.title || 'Marché des producteurs'}
        </CardTitle>
        <CardDescription className="text-lg font-medium text-green-600">
          {formatDateLong(session.date)}
        </CardDescription>
        {session.description && (
          <CardDescription>{session.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {session.exhibitorCount} exposant{session.exhibitorCount > 1 ? 's' : ''} participant{session.exhibitorCount > 1 ? 's' : ''}
            </span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push(`/manrina-an-peyi-a/evenements/${session.id}`)}
            >
              Voir les détails
            </Button>
          </div>
          
          {session.exhibitors.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Aperçu des exposants :</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {session.exhibitors.slice(0, 4).map((exhibitor) => (
                  <ExhibitorCard
                    key={exhibitor.id}
                    exhibitor={exhibitor}
                    showProducts={false}
                    variant="compact"
                  />
                ))}
              </div>
              {session.exhibitors.length > 4 && (
                <p className="text-sm text-gray-500 mt-2">
                  Et {session.exhibitors.length - 4} autre{session.exhibitors.length - 4 > 1 ? 's' : ''} exposant{session.exhibitors.length - 4 > 1 ? 's' : ''}...
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            <span className="ml-4 text-lg text-gray-600">Chargement des événements...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-green-600 to-green-800 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Button 
            variant="ghost" 
            className="text-white hover:bg-white/20 mb-4"
            onClick={() => router.push('/manrina-an-peyi-a')}
          >
            ← Retour au marché
          </Button>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Tous nos événements</h1>
          <p className="text-xl md:text-2xl opacity-90">
            Découvrez tous les marchés des producteurs locaux
          </p>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <Tabs defaultValue={activeTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="upcoming" className="text-lg py-3">
              Événements à venir ({upcomingSessions.length})
            </TabsTrigger>
            <TabsTrigger value="past" className="text-lg py-3">
              Historique ({pastSessions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-6">
            {upcomingSessions.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {upcomingSessions.map((session) => (
                  <SessionCard key={session.id} session={session} />
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <h3 className="text-xl font-semibold mb-2">Aucun événement programmé</h3>
                  <p className="text-gray-600">Revenez bientôt pour découvrir les prochaines dates !</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-6">
            {pastSessions.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {pastSessions.map((session) => (
                  <SessionCard key={session.id} session={session} />
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <h3 className="text-xl font-semibold mb-2">Aucun événement passé</h3>
                  <p className="text-gray-600">L'historique des événements apparaîtra ici après les premiers marchés.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}