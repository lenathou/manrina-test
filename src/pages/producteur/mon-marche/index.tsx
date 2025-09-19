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
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';

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

    // Ouvrir le modal de validation sans confirmer la participation
    const handleParticipateOpenModal = useCallback(async (session: MarketSessionWithProducts) => {
        if (standProducts.length === 0) {
            alert('Vous devez d\'abord ajouter des produits �� votre stand dans la section "Mon Stand".');
            return;
        }
        openValidationModal({
            id: session.id,
            name: session.name,
            date: session.date,
            location: session.location,
            status: session.status
        });
    }, [standProducts.length, openValidationModal]);

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
                            <h1 className="text-2xl sm:text-3xl font-bold text-secondary">Mon Marché</h1>
                            <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
                                Gérez votre participation aux sessions de marché
                            </p>
                        </div>
                        <div className="mt-4 sm:mt-0">
                            <Link href="/producteur/mon-marche/historiques">
                                <Button variant="outline" size="md">
                                    📊 Voir l'historique
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Stats rapides */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8">
                    <Card variant="elevated" padding="md">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary rounded-lg flex items-center justify-center">
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
                                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Marchés à Venir</p>
                                <p className="text-xl sm:text-2xl font-semibold text-foreground">
                                    {sessionsLoading ? '...' : upcomingSessions.length}
                                </p>
                            </div>
                        </div>
                    </Card>

                    <Card variant="elevated" padding="md">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-tertiary rounded-lg flex items-center justify-center">
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
                                <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                                    Participations Confirmées
                                </p>
                                <p className="text-xl sm:text-2xl font-semibold text-foreground">
                                    {participations.filter((p) => p.status === 'CONFIRMED').length}
                                </p>
                            </div>
                        </div>
                    </Card>

                    <Card variant="elevated" padding="md">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary-dark rounded-lg flex items-center justify-center">
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
                                <p className="text-xs sm:text-sm font-medium text-muted-foreground">En Attente</p>
                                <p className="text-xl sm:text-2xl font-semibold text-foreground">
                                    {participations.filter((p) => p.status === 'PENDING').length}
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Liste des sessions de marché */}
                <div>
                    <div className="px-4 sm:px-6 py-3 sm:py-4 ">
                        <h2 className="text-base sm:text-lg font-medium text-secondary">
                            Sessions de Marché Disponibles
                        </h2>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                            Confirmez votre participation aux prochaines sessions
                        </p>
                    </div>

                    <div className="p-3 sm:p-6">
                        {sessionsLoading ? (
                            <div className="text-center py-6 sm:py-8">
                                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="text-sm sm:text-base text-muted-foreground mt-2">Chargement des sessions...</p>
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
                                <p className="text-sm sm:text-base text-muted-foreground">
                                    Aucune session de marché disponible pour le moment
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3 sm:space-y-4">
                                {upcomingSessions.map((session) => {
                                    const participationStatus = getParticipationStatus(session.id);

                                    return (
                                        <Card
                                            key={session.id}
                                            variant="default"
                                            padding="md"
                                            className="hover:shadow-md transition-shadow bg-muted/30 hover:bg-muted/50 bg-white"
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                                <div className="flex-1 mb-4 sm:mb-0">
                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                                                        <h3 className="text-base sm:text-lg font-medium text-secondary">
                                                            {session.name}
                                                        </h3>
                                                        <span
                                                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full self-start ${
                                                                session.status === 'UPCOMING'
                                                                    ? 'bg-primary/10 text-primary-dark'
                                                                    : 'bg-tertiary/10 text-tertiary'
                                                            }`}
                                                        >
                                                            {session.status}
                                                        </span>
                                                    </div>

                                                    <div className="space-y-1 text-xs sm:text-sm text-muted-foreground">
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
                                                        <span className="text-xs sm:text-sm text-muted-foreground">
                                                            Participation:
                                                        </span>
                                                        <span
                                                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full self-start sm:self-auto ${
                                                                participationStatus === 'CONFIRMED'
                                                                    ? 'bg-tertiary/10 text-tertiary'
                                                                    : participationStatus === 'DECLINED'
                                                                      ? 'bg-danger/10 text-danger'
                                                                      : 'bg-muted text-muted-foreground'
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
                                                        <Button
                                                            onClick={() => openValidationModal({ id: session.id, name: session.name, date: session.date, location: session.location, status: session.status })}
                                                            disabled={loading || isValidatingProducts || participationStatus === 'DECLINED'}
                                                            variant={participationStatus === 'DECLINED' ? 'ghost' : 'primary'}
                                                            size="sm"
                                                            title={'Participer � cette session et valider ma liste de produits'}
                                                        >
                                                            {isValidatingProducts ? '⏳ Validation...' : 'Participer'}
                                                        </Button>

                                                        <Button
                                                            onClick={() =>
                                                                handleParticipationChange(session.id, 'DECLINED')
                                                            }
                                                            disabled={loading || participationStatus === 'DECLINED'}
                                                            variant={participationStatus === 'DECLINED' ? 'ghost' : 'danger'}
                                                            size="sm"
                                                        >
                                                            {participationStatus === 'DECLINED'
                                                                ? '✗ Décliné'
                                                                : 'Décliner'}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Comment ça marche ? */}
                <Card variant="elevated" padding="lg" className="mt-6 sm:mt-8 bg-muted/20 bg-white">
                    <CardHeader>
                        <h3 className="text-base sm:text-lg font-medium text-secondary mb-3 sm:mb-4">Comment ça marche ?</h3>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0">
                                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary rounded-full flex items-center justify-center text-white font-semibold text-xs sm:text-sm">
                                        1
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-medium text-secondary mb-1 text-sm sm:text-base">
                                        Participez aux sessions
                                    </h4>
                                    <p className="text-xs sm:text-sm text-muted-foreground">
                                        Cliquez sur "Participer" pour ouvrir le modal et envoyer votre liste de produits. Votre participation est confirmée lors de l'envoi.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0">
                                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-tertiary rounded-full flex items-center justify-center text-white font-semibold text-xs sm:text-sm">
                                        2
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-medium text-secondary mb-1 text-sm sm:text-base">
                                        Gérez votre stand
                                    </h4>
                                    <p className="text-xs sm:text-sm text-muted-foreground">
                                        Ajoutez vos produits et définissez vos prix dans la section "Mon Stand".
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0">
                                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-secondary rounded-full flex items-center justify-center text-white font-semibold text-xs sm:text-sm">
                                        3
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-medium text-secondary mb-1 text-sm sm:text-base">
                                        Vendez au marché
                                    </h4>
                                    <p className="text-xs sm:text-sm text-muted-foreground">
                                        Présentez-vous au marché avec vos produits et commencez à vendre !
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
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
                onValidateList={async (sessionId, products) => {
                    const ok = await validateMarketProductList(sessionId, products);
                    if (!ok) return false;
                    try {
                        const response = await fetch('/api/market/participations', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ sessionId, growerId: authenticatedGrower?.id, status: 'CONFIRMED' }),
                        });
                        if (response.ok) {
                            await loadParticipations();
                            return true;
                        }
                        return false;
                    } catch (e) {
                        return false;
                    }
                }}
                isSubmitting={isValidatingProducts}
            />
        </div>
    );
}

export default GrowerMarketPage;
