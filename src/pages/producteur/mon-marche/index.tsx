/* eslint-disable react/no-unescaped-entities */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useMarketSessions } from '@/hooks/useMarket';
import { formatDateLong } from '@/utils/dateUtils';
import { MarketProductValidationModal } from '@/components/grower/MarketProductValidationModal';
import { useMarketProductValidation } from '@/hooks/useMarketProductValidation';
import { useGrowerStandProducts } from '@/hooks/useGrowerStandProducts';
import { useUnits } from '@/hooks/useUnits';
import { MarketSessionWithProducts } from '@/types/market';

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

    // Hooks pour la gestion des produits et du modal de validation
    const { standProducts } = useGrowerStandProducts(authenticatedGrower?.id || '');
    const { data: units = [] } = useUnits();
    const {
        isSubmitting: isValidatingProducts,
        isModalOpen,
        selectedSession,
        openValidationModal,
        closeValidationModal,
        toggleMarketProduct,
        validateMarketProductList
    } = useMarketProductValidation({ 
        growerId: authenticatedGrower?.id || '',
        onSuccess: () => {
            // Recharger les participations après validation
            loadParticipations();
        }
    });

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

    // Fonction pour gérer la participation (confirmer + ouvrir modal de validation)
    const handleParticipate = useCallback(async (session: MarketSessionWithProducts) => {
        const participationStatus = getParticipationStatus(session.id);
        
        // Si pas encore confirmé, confirmer d'abord
        if (participationStatus !== 'CONFIRMED') {
            await handleParticipationChange(session.id, 'CONFIRMED');
        }
        
        // Ensuite ouvrir le modal de validation
        if (standProducts.length === 0) {
            alert('Vous devez d\'abord ajouter des produits à votre stand dans la section "Mon Stand".');
            return;
        }
        openValidationModal({
            id: session.id,
            name: session.name,
            date: session.date,
            location: session.location,
            status: session.status
        });
    }, [standProducts.length, openValidationModal, getParticipationStatus, handleParticipationChange]);

    const formatTime = (date: Date | string) => {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return dateObj.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="min-h-screen">
            <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
                {/* Page Header */}
                <div className="mb-6 sm:mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Mon Marché</h1>
                            <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
                                Gérez votre participation aux sessions de marché
                            </p>
                        </div>
                        <div className="mt-4 sm:mt-0">
                            <Link href="/producteur/mon-marche/historiques">
                                <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                    📊 Voir l'historique
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Stats rapides */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8">
                    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                    <svg
                                        className="w-3 h-3 sm:w-5 sm:h-5 text-white"
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
                            <div className="ml-3 sm:ml-4">
                                <p className="text-xs sm:text-sm font-medium text-gray-500">Marchés à Venir</p>
                                <p className="text-xl sm:text-2xl font-semibold text-gray-900">
                                    {sessionsLoading ? '...' : upcomingSessions.length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-lg flex items-center justify-center">
                                    <svg
                                        className="w-3 h-3 sm:w-5 sm:h-5 text-white"
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
                            <div className="ml-3 sm:ml-4">
                                <p className="text-xs sm:text-sm font-medium text-gray-500">
                                    Participations Confirmées
                                </p>
                                <p className="text-xl sm:text-2xl font-semibold text-gray-900">
                                    {participations.filter((p) => p.status === 'CONFIRMED').length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                                    <svg
                                        className="w-3 h-3 sm:w-5 sm:h-5 text-white"
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
                            <div className="ml-3 sm:ml-4">
                                <p className="text-xs sm:text-sm font-medium text-gray-500">En Attente</p>
                                <p className="text-xl sm:text-2xl font-semibold text-gray-900">
                                    {participations.filter((p) => p.status === 'PENDING').length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Liste des sessions de marché */}
                <div>
                    <div className="px-4 sm:px-6 py-3 sm:py-4 ">
                        <h2 className="text-base sm:text-lg font-medium text-gray-900">
                            Sessions de Marché Disponibles
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                            Confirmez votre participation aux prochaines sessions
                        </p>
                    </div>

                    <div className="p-3 sm:p-6">
                        {sessionsLoading ? (
                            <div className="text-center py-6 sm:py-8">
                                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="text-sm sm:text-base text-gray-500 mt-2">Chargement des sessions...</p>
                            </div>
                        ) : upcomingSessions.length === 0 ? (
                            <div className="text-center py-6 sm:py-8 text-gray-500">
                                <svg
                                    className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-gray-400"
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
                                <p className="text-sm sm:text-base">
                                    Aucune session de marché disponible pour le moment
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3 sm:space-y-4">
                                {upcomingSessions.map((session) => {
                                    const participationStatus = getParticipationStatus(session.id);

                                    return (
                                        <div
                                            key={session.id}
                                            className="border border-gray-200 bg-gray-50 rounded-lg p-4 sm:p-6 hover:border-gray-300 transition-colors"
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                                <div className="flex-1 mb-4 sm:mb-0">
                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                                                        <h3 className="text-base sm:text-lg font-medium text-gray-900">
                                                            {session.name}
                                                        </h3>
                                                        <span
                                                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full self-start ${
                                                                session.status === 'UPCOMING'
                                                                    ? 'bg-yellow-100 text-yellow-800'
                                                                    : 'bg-green-100 text-green-800'
                                                            }`}
                                                        >
                                                            {session.status}
                                                        </span>
                                                    </div>

                                                    <div className="space-y-1 text-xs sm:text-sm text-gray-600">
                                                        <p>📅 {formatDateLong(session.date)}</p>
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

                                                <div className="flex flex-col sm:items-end gap-3">
                                                    {/* Statut de participation */}
                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                                        <span className="text-xs sm:text-sm text-gray-500">
                                                            Participation:
                                                        </span>
                                                        <span
                                                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full self-start sm:self-auto ${
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
                                                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                                        <button
                                                            onClick={() => handleParticipate(session)}
                                                            disabled={loading || isValidatingProducts || participationStatus === 'DECLINED'}
                                                            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                                                                participationStatus === 'DECLINED'
                                                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                                    : 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50'
                                                            }`}
                                                            title={standProducts.length === 0 ? 'Ajoutez des produits à votre stand d\'abord' : 'Participer à cette session et valider ma liste de produits'}
                                                        >
                                                            {isValidatingProducts ? '⏳ Validation...' : 'Participer'}
                                                        </button>

                                                        <button
                                                            onClick={() =>
                                                                handleParticipationChange(session.id, 'DECLINED')
                                                            }
                                                            disabled={loading || participationStatus === 'DECLINED'}
                                                            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors ${
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

                {/* Comment ça marche ? */}
                <div className="bg-blue-50 rounded-lg p-4 sm:p-6 mt-6 sm:mt-8">
                    <h3 className="text-base sm:text-lg font-medium text-blue-900 mb-3 sm:mb-4">Comment ça marche ?</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-xs sm:text-sm">
                                    1
                                </div>
                            </div>
                            <div>
                                <h4 className="font-medium text-blue-900 mb-1 text-sm sm:text-base">
                                    Participez aux sessions
                                </h4>
                                <p className="text-xs sm:text-sm text-blue-700">
                                    Cliquez sur "Participer" pour confirmer votre participation et valider votre liste de produits.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-xs sm:text-sm">
                                    2
                                </div>
                            </div>
                            <div>
                                <h4 className="font-medium text-blue-900 mb-1 text-sm sm:text-base">
                                    Gérez votre stand
                                </h4>
                                <p className="text-xs sm:text-sm text-blue-700">
                                    Ajoutez vos produits et définissez vos prix dans la section "Mon Stand".
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-xs sm:text-sm">
                                    3
                                </div>
                            </div>
                            <div>
                                <h4 className="font-medium text-blue-900 mb-1 text-sm sm:text-base">
                                    Vendez au marché
                                </h4>
                                <p className="text-xs sm:text-sm text-blue-700">
                                    Présentez-vous au marché avec vos produits et commencez à vendre !
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de validation des produits */}
            <MarketProductValidationModal
                isOpen={isModalOpen}
                onClose={closeValidationModal}
                standProducts={standProducts}
                selectedSession={selectedSession}
                units={units}
                growerId={authenticatedGrower?.id || ''}
                onProductToggle={toggleMarketProduct}
                onValidateList={validateMarketProductList}
                isSubmitting={isValidatingProducts}
            />
        </div>
    );
}

export default GrowerMarketPage;
