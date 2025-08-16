/* eslint-disable react/no-unescaped-entities */
import React, { useState, useMemo } from 'react';
import { useMarketSessions } from '@/hooks/useMarket';
import { MarketSessionWithProducts, CreateMarketSessionRequest } from '@/types/market';
import { withAdminLayout } from '@/components/layouts/AdminLayout';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import SessionForm from '@/components/admin/marche/SessionForm';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import GrowersModal from '@/components/admin/marche/GrowersModal';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface MarketAdminPageProps {
    // Props si nécessaire
}

function MarketAdminPageContent({}: MarketAdminPageProps) {
    const [selectedSession, setSelectedSession] = useState<MarketSessionWithProducts | null>(null);

    const [showCreateSession, setShowCreateSession] = useState(false);
    const [showEditSession, setShowEditSession] = useState(false);
    const [sessionToEdit, setSessionToEdit] = useState<MarketSessionWithProducts | null>(null);
    const [showGrowersModal, setShowGrowersModal] = useState(false);
    const [selectedSessionForGrowers, setSelectedSessionForGrowers] = useState<MarketSessionWithProducts | null>(null);

    // États pour les dialogues de confirmation
    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        id: string;
        name: string;
        isAutomatic?: boolean;
    }>({ isOpen: false, id: '', name: '' });

    // Stabiliser l'objet filters pour éviter les re-rendus inutiles
    const sessionFilters = useMemo(
        () => ({
            upcoming: true,
            limit: 10,
        }),
        [],
    );

    const {
        sessions,
        loading,
        createSession,
        updateSession,
        refetch: refetchSessions,
    } = useMarketSessions(sessionFilters);

    const upcomingSessions = sessions.filter((session) => session.status === 'UPCOMING' || session.status === 'ACTIVE');

    // Calculer le nombre total de producteurs participants
    const totalParticipatingGrowers = sessions.reduce(
        (total, session) => total + (session._count?.participations || 0),
        0,
    );

    const upcomingParticipatingGrowers = upcomingSessions.reduce(
        (total, session) => total + (session._count?.participations || 0),
        0,
    );

    const handleCreateAutoMarket = async () => {
        try {
            const response = await fetch('/api/market/auto-sessions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                await refetchSessions();
            } else {
                const error = await response.json();
                alert(`Erreur: ${error.error}`);
            }
        } catch (error) {
            console.error('Error creating auto market:', error);
            alert('Erreur lors de la création du marché automatique');
        }
    };

    const handleDeleteSession = async (sessionId: string, isAutomatic: boolean) => {
        const session = sessions.find((s) => s.id === sessionId);
        if (!session) return;

        setConfirmDialog({
            isOpen: true,
            id: sessionId,
            name: session.name,
            isAutomatic,
        });
    };

    const confirmDeleteSession = async () => {
        try {
            const { id, isAutomatic } = confirmDialog;
            const createNext = isAutomatic;

            const response = await fetch(`/api/market/sessions?id=${id}&createNext=${createNext}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                if (createNext) {
                    alert('Session supprimée et marché suivant créé automatiquement!');
                }
                await refetchSessions();
            } else {
                const error = await response.json();
                alert(`Erreur: ${error.error}`);
            }
        } catch (error) {
            console.error('Error deleting session:', error);
            alert('Erreur lors de la suppression');
        } finally {
            setConfirmDialog({ isOpen: false, id: '', name: '' });
        }
    };

    const formatDate = (date: string | Date) => {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return dateObj.toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <div className="space-y-6">
            {/* En-tête de la page */}
            <div className="rounded-lg shadow p-6 bg-white">
                <Text
                    variant="h2"
                    className="font-secondary font-bold text-2xl sm:text-3xl text-[var(--color-secondary)] mb-4"
                >
                    Administration du Marché
                </Text>
                <p className="text-base sm:text-lg text-[var(--muted-foreground)]">
                    Gérez les sessions de marché et les producteurs participants
                </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
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
                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Sessions Totales</p>
                            <p className="text-2xl font-semibold text-gray-900">{loading ? '...' : sessions.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
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
                            <p className="text-sm font-medium text-gray-500">À venir</p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {loading ? '...' : `${upcomingParticipatingGrowers} producteurs`}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
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
                                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                    />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Producteurs Totaux</p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {loading ? '...' : totalParticipatingGrowers}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Upcoming Sessions Quick View */}
            {upcomingSessions.length > 0 && (
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-medium text-gray-900">Prochaines Sessions</h2>
                    </div>
                    <div className="p-6">
                        <div className="grid gap-4">
                            {upcomingSessions.slice(0, 3).map((session) => (
                                <div
                                    key={session.id}
                                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                                >
                                    <div>
                                        <h3 className="font-medium text-gray-900">{session.name}</h3>
                                        <p className="text-sm text-gray-600">{formatDate(session.date)}</p>
                                        {session.location && (
                                            <p className="text-sm text-gray-500 mt-1">📍 {session.location}</p>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <span
                                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                session.status === 'UPCOMING'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-green-100 text-accent'
                                            }`}
                                        >
                                            {session.status}
                                        </span>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {session._count?.participations || 0} producteurs
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Sessions de Marché - Section principale */}
            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Sessions de Marché</h2>
                            <p className="text-gray-600 mt-2">
                                Gérez les sessions de marché et les producteurs participants
                            </p>
                        </div>
                        <div className="flex space-x-3">
                            <Button
                                onClick={() => handleCreateAutoMarket()}
                                className="bg-secondary text-white px-4 py-2 rounded-md hover:bg-secondary/80 transition-colors"
                            >
                                 Créer Marché Auto
                            </Button>
                            <Button
                                onClick={() => setShowCreateSession(true)}
                                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-secondary transition-colors"
                            >
                                ➕ Nouvelle Session
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    {/* Sessions Header */}
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-medium text-gray-900">Sessions de Marché ({sessions.length})</h3>
                    </div>

                    {/* Sessions List */}
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="text-gray-500 mt-2">Chargement des sessions...</p>
                        </div>
                    ) : sessions.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">Aucune session de marché trouvée</div>
                    ) : (
                        <div className="grid gap-4">
                            {sessions.map((session) => (
                                <div
                                    key={session.id}
                                    className={`border rounded-lg p-4 transition-colors ${
                                        selectedSession?.id === session.id
                                            ? 'border-primary bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div
                                            className="flex-1 cursor-pointer"
                                            onClick={() => setSelectedSession(session)}
                                        >
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-medium text-gray-900">{session.name}</h4>
                                                {session.isAutomatic && (
                                                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                                                        🤖 Auto
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">{formatDate(session.date)}</p>
                                            {session.location && (
                                                <p className="text-sm text-gray-500 mt-1">📍 {session.location}</p>
                                            )}
                                            {session.description && (
                                                <p className="text-sm text-gray-600 mt-2">{session.description}</p>
                                            )}
                                        </div>
                                        <div className="text-right flex flex-col items-end gap-2">
                                            <div>
                                                <span
                                                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                        session.status === 'UPCOMING'
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : session.status === 'ACTIVE'
                                                              ? 'bg-green-100 text-accent'
                                                              : session.status === 'COMPLETED'
                                                                ? 'bg-muted text-muted-foreground'
                                                                : 'bg-red-100 text-[var(--color-danger)]'
                                                    }`}
                                                >
                                                    {session.status}
                                                </span>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {session._count?.participations || 0} producteurs participants
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        // Utiliser directement les données de session existantes
                                                        // car elles incluent déjà marketProducts avec grower
                                                        setSelectedSessionForGrowers(session);
                                                        setShowGrowersModal(true);
                                                    }}
                                                    className="bg-secondary text-white px-3 py-1 rounded text-sm hover:bg-secondary/80 transition-colors font-medium"

                                                >
                                                    Producteurs
                                                </Button>
                                                <Button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSessionToEdit(session);
                                                        setShowEditSession(true);
                                                    }}
                                                    className="bg-primary text-white px-3 py-1 rounded text-sm hover:bg-secondary transition-colors font-medium"
                                                >
                                                     Modifier
                                                </Button>
                                                <Button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteSession(session.id, session.isAutomatic || false);
                                                    }}
                                                    className="bg-[var(--color-danger)] text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors font-medium"
                                                >
                                                    🗑️ Supprimer
                                                </Button>
                                            </div>
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
                <h3 className="text-lg font-medium text-blue-900 mb-3">Guide d'utilisation</h3>
                <div className="space-y-2 text-sm text-blue-800">
                    <p>
                        <strong>Sessions de Marché :</strong> Créez et gérez les sessions de marché avec leurs dates,
                        lieux et statuts.
                    </p>
                    <p>
                        <strong>Producteurs Participants :</strong> Visualisez et gérez les producteurs qui participent
                        à chaque session de marché.
                    </p>
                    <p>
                        <strong>Gestion Automatique :</strong> Utilisez la création automatique de marchés pour
                        simplifier la planification récurrente.
                    </p>
                </div>
            </div>

            {/* Modals */}
            {showCreateSession && (
                <SessionForm
                    isOpen={showCreateSession}
                    onClose={() => setShowCreateSession(false)}
                    onSubmit={async (data) => {
                        // Ensure data is properly typed for creation
                        const createData: CreateMarketSessionRequest = {
                            name: data.name || '',
                            date: data.date || '',
                            description: data.description,
                            location: data.location,
                            startTime: data.startTime,
                            endTime: data.endTime,
                            status: data.status,
                        };
                        await createSession(createData);
                        setShowCreateSession(false);
                    }}
                    title={'Nouvelle Session'}
                />
            )}

            {showEditSession && sessionToEdit && (
                <SessionForm
                    isOpen={showEditSession}
                    onClose={() => {
                        setShowEditSession(false);
                        setSessionToEdit(null);
                    }}
                    onSubmit={async (data) => {
                        await updateSession({ ...data, id: sessionToEdit.id });
                        setShowEditSession(false);
                        setSessionToEdit(null);
                    }}
                    session={sessionToEdit}
                    title="Modifier Session"
                />
            )}

            {/* Modal Producteurs */}
            <GrowersModal
                isOpen={showGrowersModal}
                onClose={() => {
                    setShowGrowersModal(false);
                    setSelectedSessionForGrowers(null);
                }}
                session={selectedSessionForGrowers}
            />

            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                title="Confirmer la suppression"
                message={`Êtes-vous sûr de vouloir supprimer la session "${confirmDialog.name}" ?`}
                onConfirm={confirmDeleteSession}
                onCancel={() => setConfirmDialog({ isOpen: false, id: '', name: '' })}
            />
        </div>
    );
}

function MarketAdminPage() {
    return <MarketAdminPageContent />;
}

export default withAdminLayout(MarketAdminPage);
