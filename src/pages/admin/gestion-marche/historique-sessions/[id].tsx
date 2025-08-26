/* eslint-disable react/no-unescaped-entities */
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { MarketSessionWithProducts } from '@/types/market';
import { Text } from '@/components/ui/Text';
import { useToast } from '@/components/ui/Toast';

import { IAdminTokenPayload } from '@/server/admin/IAdmin';
import { prisma } from '@/server/prisma';

interface SessionHistoryDetailPageProps {
    authenticatedAdmin: IAdminTokenPayload;
    session: MarketSessionWithProducts;
}

interface ValidatedProducer {
    id: string;
    status: string;
    grower: {
        id: string;
        name: string;
        email: string;
        phone: string | null;
    };
}

interface ClientAttendance {
    id: string;
    customer: {
        id: string;
        name: string;
        email: string;
        phone: string | null;
        createdAt: Date;
    };
}

function SessionHistoryDetailPage({ session }: SessionHistoryDetailPageProps) {
    const router = useRouter();
    const { error: showError } = useToast();
    
    const [validatedProducers, setValidatedProducers] = useState<ValidatedProducer[]>([]);
    const [clients, setClients] = useState<ClientAttendance[]>([]);
    const [loadingProducers, setLoadingProducers] = useState(false);
    const [loadingClients, setLoadingClients] = useState(false);
    const [showProducers, setShowProducers] = useState(false);
    const [showClients, setShowClients] = useState(false);

    const formatDate = (date: string | Date) => {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return dateObj.toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatTime = (time: string | null) => {
        if (!time) return null;
        return time.slice(0, 5); // Format HH:MM
    };

    // Charger les producteurs validés
    const fetchValidatedProducers = async () => {
        try {
            setLoadingProducers(true);
            const response = await fetch(`/api/market/sessions/${session.id}/validated-producers`);
            
            if (!response.ok) {
                throw new Error('Erreur lors du chargement des producteurs validés');
            }
            
            const data = await response.json();
            setValidatedProducers(data);
        } catch (error) {
            console.error('Error fetching validated producers:', error);
            showError('Erreur lors du chargement des producteurs validés');
        } finally {
            setLoadingProducers(false);
        }
    };

    // Charger les clients participants
    const fetchClients = async () => {
        try {
            setLoadingClients(true);
            const response = await fetch(`/api/market/sessions/${session.id}/clients`);
            
            if (!response.ok) {
                throw new Error('Erreur lors du chargement des clients');
            }
            
            const data = await response.json();
            setClients(data);
        } catch (error) {
            console.error('Error fetching clients:', error);
            showError('Erreur lors du chargement des clients');
        } finally {
            setLoadingClients(false);
        }
    };

    const handleShowProducers = () => {
        setShowProducers(true);
        if (validatedProducers.length === 0) {
            fetchValidatedProducers();
        }
    };

    const handleShowClients = () => {
        setShowClients(true);
        if (clients.length === 0) {
            fetchClients();
        }
    };

    const validatedParticipationsCount = session.participations?.filter(p => p.status === 'VALIDATED').length || 0;

    return (
        <div className="space-y-6">
            {/* En-tête avec navigation */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={() => router.push('/admin/gestion-marche/historique-sessions')}
                        className="flex items-center text-[var(--color-primary)] hover:text-[var(--color-primary)]/80 transition-colors"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Retour à l'historique
                    </button>
                    
                    <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-gray-100 text-gray-800">
                        SESSION TERMINÉE
                    </span>
                </div>
                
                <Text
                    variant="h1"
                    className="font-secondary font-bold text-3xl text-[var(--color-secondary)] mb-2"
                >
                    {session.name}
                    {session.isAutomatic && (
                        <span className="ml-3 inline-flex px-2 py-1 text-sm font-semibold rounded-full bg-purple-100 text-purple-800">
                            🤖 Auto
                        </span>
                    )}
                </Text>
                
                <p className="text-lg text-[var(--muted-foreground)]">
                    Historique détaillé de la session de marché
                </p>
            </div>

            {/* Informations principales */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Informations de base */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Informations de la session</h3>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Date</label>
                            <p className="text-lg text-gray-900">{formatDate(session.date)}</p>
                        </div>
                        
                        {(session.startTime || session.endTime) && (
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Horaires</label>
                                <p className="text-lg text-gray-900">
                                    {session.startTime && formatTime(session.startTime.toString())}
                                    {session.startTime && session.endTime && ' - '}
                                    {session.endTime && formatTime(session.endTime.toString())}
                                </p>
                            </div>
                        )}
                        
                        {session.location && (
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Lieu</label>
                                <p className="text-lg text-gray-900">📍 {session.location}</p>
                            </div>
                        )}
                        
                        {session.description && (
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Description</label>
                                <p className="text-gray-900">{session.description}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Statistiques finales */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Résultats de la session</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 rounded-lg p-4">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-blue-600">Producteurs inscrits</p>
                                    <p className="text-2xl font-semibold text-blue-900">{session._count?.participations || 0}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-green-50 rounded-lg p-4">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-green-600">Producteurs validés</p>
                                    <p className="text-2xl font-semibold text-green-900">{validatedParticipationsCount}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-purple-50 rounded-lg p-4">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2m-2 0H5m14 0v-2a2 2 0 00-2-2H9a2 2 0 00-2 2v2m2-4h6m-6 0V9a2 2 0 012-2h2a2 2 0 012 2v6m-6 0V9a2 2 0 012-2h2a2 2 0 012 2v6" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-purple-600">Produits proposés</p>
                                    <p className="text-2xl font-semibold text-purple-900">{session._count?.marketProducts || 0}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-orange-50 rounded-lg p-4">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-orange-600">Partenaires</p>
                                    <p className="text-2xl font-semibold text-orange-900">{session.partners?.length || 0}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Partenaires */}
            {session.partners && session.partners.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Partenaires de la session</h3>
                    <div className="flex flex-wrap gap-2">
                        {session.partners.map((sessionPartner) => (
                            <span
                                key={sessionPartner.id}
                                className="inline-flex px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800"
                            >
                                {sessionPartner.partner.name}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Commission et matériel */}
            {session.commissionRate && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Configuration de la session</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <label className="block text-sm font-medium text-gray-500 mb-1">Taux de commission</label>
                            <p className="text-lg font-semibold text-gray-900">{session.commissionRate?.toString()}%</p>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-4">
                            <label className="block text-sm font-medium text-gray-500 mb-1">Tentes</label>
                            <p className="text-lg font-semibold text-gray-900">
                                {session.tentsStatus === 'provided' ? '✅ Fournies' : 
                                 session.tentsStatus === 'required' ? '⚠️ Requises' : '❌ Non requises'}
                            </p>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-4">
                            <label className="block text-sm font-medium text-gray-500 mb-1">Tables</label>
                            <p className="text-lg font-semibold text-gray-900">
                                {session.tablesStatus === 'provided' ? '✅ Fournies' : 
                                 session.tablesStatus === 'required' ? '⚠️ Requises' : '❌ Non requises'}
                            </p>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-4">
                            <label className="block text-sm font-medium text-gray-500 mb-1">Chaises</label>
                            <p className="text-lg font-semibold text-gray-900">
                                {session.chairsStatus === 'provided' ? '✅ Fournies' : 
                                 session.chairsStatus === 'required' ? '⚠️ Requises' : '❌ Non requises'}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Boutons pour voir les détails */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                    onClick={handleShowProducers}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Voir les producteurs validés ({validatedParticipationsCount})
                </button>
                
                <button
                    onClick={handleShowClients}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                    Voir les clients participants
                </button>
            </div>

            {/* Liste des producteurs validés */}
            {showProducers && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Producteurs validés</h3>
                    
                    {loadingProducers ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                        </div>
                    ) : validatedProducers.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Producteur
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Téléphone
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Statut
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {validatedProducers.map((producer) => (
                                        <tr key={producer.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {producer.grower.name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">
                                                    {producer.grower.email}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">
                                                    {producer.grower.phone || 'Non renseigné'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                                    Validé
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-8">Aucun producteur validé pour cette session.</p>
                    )}
                </div>
            )}

            {/* Liste des clients participants */}
            {showClients && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Clients participants</h3>
                    
                    {loadingClients ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : clients.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Client
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Téléphone
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Inscrit le
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {clients.map((client) => (
                                        <tr key={client.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {client.customer.name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">
                                                    {client.customer.email}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">
                                                    {client.customer.phone || 'Non renseigné'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">
                                                    {new Date(client.customer.createdAt).toLocaleDateString('fr-FR')}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-8">Aucun client participant pour cette session.</p>
                    )}
                </div>
            )}
        </div>
    );
}

export default SessionHistoryDetailPage;

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { id } = context.params!;

    try {
        const session = await prisma.marketSession.findUnique({
            where: { 
                id: id as string,
                status: 'COMPLETED' // S'assurer que c'est bien une session terminée
            },
            include: {
                participations: {
                    include: {
                        grower: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                phone: true
                            }
                        }
                    }
                },
                marketProducts: {
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
                partners: {
                    include: {
                        partner: true
                    }
                },
                _count: {
                    select: {
                        participations: true,
                        marketProducts: true
                    }
                }
            }
        });

        if (!session) {
            return {
                notFound: true
            };
        }

        return {
            props: {
                session: JSON.parse(JSON.stringify(session))
            }
        };
    } catch (error) {
        console.error('Erreur lors du chargement de la session:', error);
        return {
            notFound: true
        };
    }
};