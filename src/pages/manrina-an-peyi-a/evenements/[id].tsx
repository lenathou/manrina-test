/* eslint-disable react/no-unescaped-entities */
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/Button';
import { Card, CardContent} from '@/components/ui/Card';
import { ExhibitorCard } from '@/components/public/ExhibitorCard';
import { ProductCard } from '@/components/public/ProductCard';
import { formatDateLong } from '@/utils/dateUtils';
// Removed import of toggleAttendance - will be defined locally
import type { MarketProducer, PublicExhibitor, PublicMarketProduct } from '@/types/market';
import { useAuth } from '@/hooks/useAuth';

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

interface MarketSession {
  id: string;
  date: Date;
  title?: string;
  description?: string;
}

export default function EventDetailPage() {
  const [session, setSession] = useState<MarketSession | null>(null);
  const [exhibitors, setExhibitors] = useState<PublicExhibitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [attendanceStatus, setAttendanceStatus] = useState<'none' | 'planned' | 'cancelled'>('none');
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'exhibitors' | 'products'>('exhibitors');
  const router = useRouter();
  const { id } = router.query;
  const { role } = useAuth();

  // Extraire tous les produits des exposants
  const allProducts: (PublicMarketProduct & { producerName: string })[] = exhibitors.flatMap(exhibitor => 
    exhibitor.products.map(product => ({
      ...product,
      producerName: exhibitor.name
    }))
  );

  // Fonctions pour récupérer les données
  const getMarketSessionById = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/market/sessions/${sessionId}`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération de la session');
      }
      return await response.json();
    } catch (error) {
      console.error('Erreur:', error);
      return null;
    }
  };

  const getSessionExhibitors = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/market/sessions/${sessionId}/exhibitors`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des exposants');
      }
      return await response.json();
    } catch (error) {
      console.error('Erreur:', error);
      return [];
    }
  };

  useEffect(() => {
    if (!id || typeof id !== 'string') return;

    const loadSessionData = async () => {
      try {
        const [sessionData, exhibitorsData] = await Promise.all([
          getMarketSessionById(id),
          getSessionExhibitors(id)
        ]);

        setSession(sessionData);
        setExhibitors(exhibitorsData.map(transformToPublicExhibitor));

        // Si l'utilisateur est un client, vérifier son statut de présence
        if (role === 'client') {
          const status = await checkAttendanceStatus(id);
          setAttendanceStatus(status);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSessionData();
  }, [id, role]);

  const handleClientAttendanceToggle = async () => {
    if (!session) return;
    
    setAttendanceLoading(true);
    
    try {
      const success = await toggleAttendance(session.id, attendanceStatus);
      
      if (success) {
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



  const isEventPast = (date: Date) => {
    return date < new Date();
  };

  if (loading) {
    return (
      <div className="min-h-screen ">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            <span className="ml-4 text-lg text-gray-600">Chargement de l'événement...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <Card className="text-center py-12">
            <CardContent>
              <h1 className="text-2xl font-bold mb-4">Événement introuvable</h1>
              <p className="text-gray-600 mb-6">L'événement que vous recherchez n'existe pas ou a été supprimé.</p>
              <Button onClick={() => router.push('/manrina-an-peyi-a/evenements')}>
                Retour aux événements
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const eventPast = isEventPast(session.date);

  return (
    <div className="min-h-screen ">
      {/* Header */}
      <section >
        <div className="max-w-4xl mx-auto">
          <Button 
            variant="ghost" 
            className=" hover:bg-white/20 mb-4"
            onClick={() => router.push('/manrina-an-peyi-a/evenements')}
          >
            ← Retour aux événements
          </Button>
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {session.title || 'Marché des producteurs'}
            </h1>
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-6 inline-block">
              <p className="text-lg mb-2">{eventPast ? 'Événement passé :' : 'Date de l\'événement :'}</p>
              <p className="text-2xl md:text-3xl font-bold">
                {formatDateLong(session.date)}
              </p>
              <p className="text-lg mt-2">7h - 14h • Place du marché</p>
              {eventPast && (
                <div className="mt-3 px-3 py-1 bg-gray-500 bg-opacity-50 rounded-full text-sm">
                  Événement terminé
                </div>
              )}
            </div>
            {session.description && (
              <p className="text-xl mt-6 opacity-90 max-w-2xl mx-auto">
                {session.description}
              </p>
            )}
          </div>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 py-12 space-y-16">
        {/* Section Exposants et Produits avec onglets */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {eventPast ? 'Participants et produits' : 'Exposants et produits'}
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              {exhibitors.length} exposant{exhibitors.length > 1 ? 's' : ''} {eventPast ? 'ont participé' : 'participent'} à cet événement
              {allProducts.length > 0 && (
                <span> • {allProducts.length} produit{allProducts.length > 1 ? 's' : ''} {eventPast ? 'étaient' : 'sont'} disponible{allProducts.length > 1 ? 's' : ''}</span>
              )}
            </p>

            {/* Onglets */}
            <div className="flex justify-center mb-8">
              <div className="bg-gray-100 rounded-lg p-1 flex">
                <button
                  onClick={() => setActiveTab('exhibitors')}
                  className={`px-6 py-2 rounded-md font-medium transition-all duration-200 ${
                    activeTab === 'exhibitors'
                      ? 'bg-white text-green-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                    <span>Exposants ({exhibitors.length})</span>
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('products')}
                  className={`px-6 py-2 rounded-md font-medium transition-all duration-200 ${
                    activeTab === 'products'
                      ? 'bg-white text-green-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 2L3 7v11a2 2 0 002 2h10a2 2 0 002-2V7l-7-5zM8 15a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>Produits ({allProducts.length})</span>
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Contenu des onglets */}
          {activeTab === 'exhibitors' && (
            <div>
              {exhibitors.length > 0 ? (
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
              ) : (
                <Card className="text-center py-12">
                  <CardContent>
                    <h3 className="text-xl font-semibold mb-2">
                      {eventPast ? 'Aucun exposant n\'a participé' : 'Aucun exposant inscrit'}
                    </h3>
                    <p className="text-gray-600">
                      {eventPast 
                        ? 'Cet événement s\'est déroulé sans exposants inscrits.' 
                        : 'Les exposants peuvent encore s\'inscrire pour cet événement.'
                      }
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'products' && (
            <div>
              {allProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {allProducts.map((product) => (
                    <ProductCard
                      key={`${product.id}-${product.producerName}`}
                      product={product}
                      producerName={product.producerName}
                    />
                  ))}
                </div>
              ) : (
                <Card className="text-center py-12">
                  <CardContent>
                    <h3 className="text-xl font-semibold mb-2">
                      {eventPast ? 'Aucun produit n\'était disponible' : 'Aucun produit disponible'}
                    </h3>
                    <p className="text-gray-600">
                      {eventPast 
                        ? 'Aucun produit n\'était proposé lors de cet événement.' 
                        : 'Les exposants n\'ont pas encore ajouté de produits pour cet événement.'
                      }
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </section>

        {/* Section CTA pour les clients */}
        {role === 'client' && !eventPast && (
          <section className="bg-gray-50 rounded-2xl p-8 md:p-12 text-center">
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
                  variant="outline"
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
          </section>
        )}

        {/* Message pour événement passé */}
        {eventPast && (
          <section className="bg-gray-100 rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Événement terminé</h2>
            <p className="text-lg text-gray-600 mb-6">
              Cet événement s'est déroulé le {formatDateLong(session.date)}. Consultez nos prochains événements !
            </p>
            <Button onClick={() => router.push('/manrina-an-peyi-a/evenements')}>
              Voir les prochains événements
            </Button>
          </section>
        )}
      </main>
    </div>
  );
}