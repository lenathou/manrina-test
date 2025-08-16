/* eslint-disable react/no-unescaped-entities */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useMarketSessions } from '@/hooks/useMarket';
import { withProducteurLayout } from '@/components/layouts/ProducteurLayout';
import { IGrowerTokenPayload } from '@/server/grower/IGrower';

interface MarketParticipation {
    sessionId: string;
    growerId: string;
    status: 'PENDING' | 'CONFIRMED' | 'DECLINED';
    confirmedAt?: Date;
}

interface GrowerMarketPageProps {
    authenticatedGrower: IGrowerTokenPayload;
}

function GrowerMarketPage({ authenticatedGrower }: GrowerMarketPageProps) {
    const [participations, setParticipations] = useState<MarketParticipation[]>([]);
    const [loading, setLoading] = useState(false);

    // Stabiliser les filtres pour éviter les re-renders
    const sessionFilters = useMemo(
        () => ({
            upcoming: true,
            limit: 20,
        }),
        [],
    );

    // Récupérer les sessions de marché à venir
    const { sessions, loading: sessionsLoading } = useMarketSessions(sessionFilters);

    const upcomingSessions = sessions.filter((session) => session.status === 'UPCOMING' || session.status === 'ACTIVE');



    const loadParticipations = useCallback(async () => {
        if (!authenticatedGrower?.id) return;

        try {
            const response = await fetch(`/api/market/participations?growerId=${authenticatedGrower.id}`);
            if (response.ok) {
                const data = await response.json();
                setParticipations(data);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des participations:', error);
        }
    }, [authenticatedGrower?.id]);

    // Charger les participations existantes
    useEffect(() => {
        if (authenticatedGrower?.id) {
            loadParticipations();
        }
    }, [authenticatedGrower?.id, loadParticipations]);

    const handleParticipationChange = async (sessionId: string, status: 'CONFIRMED' | 'DECLINED') => {
        if (!authenticatedGrower?.id) return;

        setLoading(true);
        try {
            const response = await fetch('/api/market/participations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sessionId,
                    growerId: authenticatedGrower.id,
                    status,
                }),
            });

            if (response.ok) {
                // Mettre à jour l'état local
                setParticipations((prev) => {
                    const existing = prev.find((p) => p.sessionId === sessionId);
                    if (existing) {
                        return prev.map((p) =>
                            p.sessionId === sessionId
                                ? { ...p, status, confirmedAt: status === 'CONFIRMED' ? new Date() : undefined }
                                : p,
                        );
                    } else {
                        return [
                            ...prev,
                            {
                                sessionId,
                                growerId: authenticatedGrower.id,
                                status,
                                confirmedAt: status === 'CONFIRMED' ? new Date() : undefined,
                            },
                        ];
                    }
                });
            } else {
                const error = await response.json();
                alert(`Erreur: ${error.message}`);
            }
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la participation:', error);
            alert('Erreur lors de la mise à jour de la participation');
        } finally {
            setLoading(false);
        }
    };

    const getParticipationStatus = (sessionId: string) => {
        return participations.find((p) => p.sessionId === sessionId)?.status || 'PENDING';
    };

    const formatDate = (date: Date | string) => {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return dateObj.toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatTime = (date: Date | string) => {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return dateObj.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="min-h-screen">

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Mon Marché</h1>
                    <p className="text-gray-600 mt-2">Gérez votre participation aux sessions de marché</p>
                </div>

                {/* Stats rapides */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                    <svg
                                        className="w-5 h-5 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z"
                                        />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Marchés à Venir</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {sessionsLoading ? '...' : upcomingSessions.length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                                    <svg
                                        className="w-5 h-5 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Participations Confirmées</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {participations.filter((p) => p.status === 'CONFIRMED').length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                                    <svg
                                        className="w-5 h-5 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">En Attente</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {participations.filter((p) => p.status === 'PENDING').length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Liste des sessions de marché */}
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-medium text-gray-900">Sessions de Marché Disponibles</h2>
                    </div>

                    <div className="p-6">
                        {sessionsLoading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="text-gray-500 mt-2">Chargement des sessions...</p>
                            </div>
                        ) : upcomingSessions.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <svg
                                    className="w-12 h-12 mx-auto mb-4 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z"
                                    />
                                </svg>
                                <p>Aucune session de marché disponible pour le moment</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {upcomingSessions.map((session) => {
                                    const participationStatus = getParticipationStatus(session.id);

                                    return (
                                        <div
                                            key={session.id}
                                            className="border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="text-lg font-medium text-gray-900">
                                                            {session.name}
                                                        </h3>
                                                        <span
                                                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                                session.status === 'UPCOMING'
                                                                    ? 'bg-yellow-100 text-yellow-800'
                                                                    : 'bg-green-100 text-green-800'
                                                            }`}
                                                        >
                                                            {session.status}
                                                        </span>
                                                    </div>

                                                    <div className="space-y-1 text-sm text-gray-600">
                                                        <p>📅 {formatDate(session.date)}</p>
                                                        {session.startTime && (
                                                            <p>
                                                                🕐 {formatTime(session.startTime)}
                                                                {session.endTime && ` - ${formatTime(session.endTime)}`}
                                                            </p>
                                                        )}
                                                        {session.location && <p>📍 {session.location}</p>}
                                                        {session.description && (
                                                            <p className="mt-2">{session.description}</p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex flex-col items-end gap-3">
                                                    {/* Statut de participation */}
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm text-gray-500">Participation:</span>
                                                        <span
                                                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                                participationStatus === 'CONFIRMED'
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : participationStatus === 'DECLINED'
                                                                      ? 'bg-red-100 text-red-800'
                                                                      : 'bg-gray-100 text-gray-800'
                                                            }`}
                                                        >
                                                            {participationStatus === 'CONFIRMED'
                                                                ? '✓ Confirmée'
                                                                : participationStatus === 'DECLINED'
                                                                  ? '✗ Déclinée'
                                                                  : '⏳ En attente'}
                                                        </span>
                                                    </div>

                                                    {/* Boutons d'action */}
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() =>
                                                                handleParticipationChange(session.id, 'CONFIRMED')
                                                            }
                                                            disabled={loading || participationStatus === 'CONFIRMED'}
                                                            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                                                                participationStatus === 'CONFIRMED'
                                                                    ? 'bg-green-100 text-green-800 cursor-not-allowed'
                                                                    : 'bg-green-600 text-white hover:bg-green-700 disabled:opacity-50'
                                                            }`}
                                                        >
                                                            {participationStatus === 'CONFIRMED'
                                                                ? '✓ Confirmé'
                                                                : 'Confirmer'}
                                                        </button>

                                                        <button
                                                            onClick={() =>
                                                                handleParticipationChange(session.id, 'DECLINED')
                                                            }
                                                            disabled={loading || participationStatus === 'DECLINED'}
                                                            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                                                                participationStatus === 'DECLINED'
                                                                    ? 'bg-red-100 text-red-800 cursor-not-allowed'
                                                                    : 'bg-red-600 text-white hover:bg-red-700 disabled:opacity-50'
                                                            }`}
                                                        >
                                                            {participationStatus === 'DECLINED'
                                                                ? '✗ Décliné'
                                                                : 'Décliner'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Instructions */}
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-blue-900 mb-3">Comment ça marche ?</h3>
                    <div className="space-y-2 text-sm text-blue-800">
                        <p>
                            <strong>Confirmation :</strong> Cliquez sur "Confirmer" pour valider votre participation à
                            une session de marché.
                        </p>
                        <p>
                            <strong>Déclinaison :</strong> Cliquez sur "Décliner" si vous ne pouvez pas participer à une
                            session.
                        </p>
                        <p>
                            <strong>Modification :</strong> Vous pouvez changer votre décision à tout moment avant la
                            date du marché.
                        </p>
                        <p>
                            <strong>Produits :</strong> Une fois votre participation confirmée, vous pourrez ajouter vos
                            produits pour cette session.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default withProducteurLayout(GrowerMarketPage);
