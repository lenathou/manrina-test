/* eslint-disable react/no-unescaped-entities */
import React, { useState, useMemo } from 'react';
import { useMarketSessions } from '@/hooks/useMarketSessionsQuery';
import { MarketSessionWithProducts, CreateMarketSessionRequest } from '@/types/market';
import { Text } from '@/components/ui/Text';
import { useToast } from '@/components/ui/Toast';
import SessionForm from '@/components/admin/gestion-marche/SessionForm';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { formatDateLong } from '@/utils/dateUtils';
import GrowersModal from '@/components/admin/gestion-marche/GrowersModal';
import MarketCancellationModal from '@/components/modals/MarketCancellationModal';
import PartnersModal from '@/components/admin/gestion-marche/PartnersModal';
import EquipmentSummary from '@/components/admin/gestion-marche/EquipmentSummary';
import { ClientAttendanceModal } from '@/components/admin/ClientAttendanceModal';
import { SessionActionsMenu } from '@/components/admin/SessionActionsMenu';
import { MarketActionsButtons } from '@/components/admin/gestion-marche/MarketActionsButtons';
import SessionAlert from '@/components/admin/gestion-marche/SessionAlert';
import GlobalSessionAlert from '@/components/admin/gestion-marche/GlobalSessionAlert';
import { ModernTabs, ModernTabItem, useModernTabs } from '@/components/ui/ModernTabs';


// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface MarketAdminPageProps {
    // Props si nécessaire
}

function MarketAdminPageContent({}: MarketAdminPageProps) {
    const { success, error } = useToast();
    const [selectedSession, setSelectedSession] = useState<MarketSessionWithProducts | null>(null);

    const [showCreateSession, setShowCreateSession] = useState(false);
    const [showEditSession, setShowEditSession] = useState(false);
    const [sessionToEdit, setSessionToEdit] = useState<MarketSessionWithProducts | null>(null);
    const [showGrowersModal, setShowGrowersModal] = useState(false);
    const [selectedSessionForGrowers, setSelectedSessionForGrowers] = useState<MarketSessionWithProducts | null>(null);
    const [showPartnersModal, setShowPartnersModal] = useState(false);
    const [selectedSessionForPartners, setSelectedSessionForPartners] = useState<MarketSessionWithProducts | null>(
        null,
    );
    const [showClientsModal, setShowClientsModal] = useState(false);
    const [selectedSessionForClients, setSelectedSessionForClients] = useState<MarketSessionWithProducts | null>(null);

    // États pour les dialogues de confirmation
    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        id: string;
        name: string;
    }>({ isOpen: false, id: '', name: '' });

    // États de chargement pour les opérations de suppression
    const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);
    const [isConfirmingDeletion, setIsConfirmingDeletion] = useState(false);
    const [, setIsCancellingMarket] = useState(false);

    // Configuration des onglets ModernTabs
    const { activeTab: sessionFilter, handleTabChange: setSessionFilter } = useModernTabs('upcoming');

    // État pour le modal d'annulation de marché
    const [cancellationModal, setCancellationModal] = useState<{
        isOpen: boolean;
        session: MarketSessionWithProducts | null;
        confirmedProducersCount: number;
    }>({ isOpen: false, session: null, confirmedProducersCount: 0 });

    // Stabiliser l'objet filters pour éviter les re-rendus inutiles
    const sessionFilters = useMemo(
        () => ({
            limit: 50, // Augmenté pour réduire les appels API
        }),
        [],
    );

    const { sessions, loading, createSession, updateSession, deleteSession } = useMarketSessions(sessionFilters);

    // Fonction pour calculer le statut réel basé sur la date (mémorisée)
    const getActualStatus = useMemo(() => {
        return (session: MarketSessionWithProducts) => {
            const now = new Date();
            const sessionDate = new Date(session.date);
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const sessionDay = new Date(sessionDate.getFullYear(), sessionDate.getMonth(), sessionDate.getDate());

            if (sessionDay.getTime() === today.getTime()) {
                return 'ACTIVE';
            } else if (sessionDay > today) {
                return 'UPCOMING';
            } else {
                return 'COMPLETED';
            }
        };
    }, []); // Pas de dépendances car la logique est statique

    // Configuration des onglets ModernTabs avec les données disponibles
    const tabItems: ModernTabItem[] = [
        { 
            id: 'upcoming', 
            label: `À venir (${sessions.filter((s) => getActualStatus(s) === 'UPCOMING').length})` 
        },
        { 
            id: 'active', 
            label: `Actives (${sessions.filter((s) => getActualStatus(s) === 'ACTIVE').length})` 
        },
        { 
            id: 'all', 
            label: `Toutes (${sessions.length})` 
        }
    ];

    // Mémoriser les sessions avec leur statut calculé pour éviter les recalculs
    const sessionsWithStatus = useMemo(() => {
        return sessions.map((session) => ({
            ...session,
            actualStatus: getActualStatus(session),
        }));
    }, [sessions, getActualStatus]);

    // Filtrer les sessions selon le filtre sélectionné basé sur la date réelle
    const filteredSessions = useMemo(() => {
        switch (sessionFilter) {
            case 'upcoming':
                return sessionsWithStatus.filter((session) => session.actualStatus === 'UPCOMING');
            case 'active':
                return sessionsWithStatus.filter((session) => session.actualStatus === 'ACTIVE');
            case 'all':
            default:
                return sessionsWithStatus;
        }
    }, [sessionsWithStatus, sessionFilter]);

    // Calculer le nombre total de producteurs participants

    const handleDeleteSession = async (sessionId: string) => {
        const session = sessions.find((s) => s.id === sessionId);
        if (!session) return;

        // Définir l'état de chargement pour ce bouton spécifique
        setDeletingSessionId(sessionId);

        // Vérifier s'il y a des producteurs confirmés
        const confirmedProducersCount = session.participations?.filter((p) => p.status === 'CONFIRMED').length || 0;

        // Si il y a des producteurs confirmés, afficher le modal d'annulation
        if (confirmedProducersCount > 0) {
            setDeletingSessionId(null); // Réinitialiser l'état car on va vers un modal
            setCancellationModal({
                isOpen: true,
                session,
                confirmedProducersCount,
            });
            return;
        }

        // Sinon, procéder avec la suppression normale
        setDeletingSessionId(null); // Réinitialiser car on va vers un dialogue de confirmation
        setConfirmDialog({
            isOpen: true,
            id: sessionId,
            name: session.name,
        });
    };

    const confirmDeleteSession = async () => {
        setIsConfirmingDeletion(true);
        try {
            const { id, name } = confirmDialog;
            await deleteSession(id);
            success(`Session "${name}" supprimée avec succès !`);
        } catch (err) {
            console.error('Error deleting session:', err);
            error('Erreur lors de la suppression du marché');
        } finally {
            setIsConfirmingDeletion(false);
            setConfirmDialog({ isOpen: false, id: '', name: '' });
        }
    };

    // Fonction pour confirmer l'annulation avec notification
    const handleConfirmCancellation = async (message: string) => {
        setIsCancellingMarket(true);
        let notificationSuccess = false;
        let sessionDeleted = false;

        try {
            const { session } = cancellationModal;
            if (!session) return;

            // Tentative d'envoi de notification (non bloquante)
            try {
                const notificationResponse = await fetch('/api/notifications', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        type: 'MARKET_CANCELLATION',
                        title: `Annulation du marché "${session.name}"`,
                        message,
                        marketId: session.id,
                        targetUsers: ['ALL'], // Notifier tous les utilisateurs
                    }),
                });

                if (notificationResponse.ok) {
                    notificationSuccess = true;
                } else {
                    console.error("Erreur lors de l'envoi de notification:", await notificationResponse.text());
                }
            } catch (notificationError) {
                console.error("Erreur lors de l'envoi de notification:", notificationError);
            }

            // Supprimer la session (toujours effectuée)
            try {
                await deleteSession(session.id);
                sessionDeleted = true;
            } catch (deleteError) {
                console.error('Erreur lors de la suppression:', deleteError);
                throw deleteError; // Cette erreur doit être remontée car critique
            }

            // Messages de succès selon le résultat
            if (sessionDeleted && notificationSuccess) {
                success(`Marché "${session.name}" annulé et notifications envoyées avec succès !`);
            } else if (sessionDeleted && !notificationSuccess) {
                success(`Marché "${session.name}" annulé avec succès. Attention : l'envoi des notifications a échoué.`);
            }
        } catch (err) {
            console.error('Error cancelling market:', err);
            if (!sessionDeleted) {
                error("Erreur lors de l'annulation du marché");
            }
        } finally {
            setIsCancellingMarket(false);
            setCancellationModal({ isOpen: false, session: null, confirmedProducersCount: 0 });
        }
    };

    // Fonction pour fermer le modal d'annulation
    const handleCloseCancellationModal = () => {
        setCancellationModal({ isOpen: false, session: null, confirmedProducersCount: 0 });
    };

    return (
        <div className="space-y-6">
            {/* En-tête de la page */}
            <div className="md:p-6 ">
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

            {/* Sessions de Marché - Section principale */}
            <div className=" rounded-lg ">
                <div className="md:px-6 md:py-4 ">
                    <div className="md:flex justify-between items-center mb-10 md:mb-0">
                        <MarketActionsButtons onCreateNewSession={() => setShowCreateSession(true)} />
                    </div>
                </div>

                <div className="md:p-6 ">
                    {/* Sessions Header */}
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">
                                    Sessions de Marché ({filteredSessions.length})
                                </h3>
                                {/* Message d'information sur les nouvelles participations */}
                                <GlobalSessionAlert sessions={filteredSessions} />
                            </div>
                        </div>

                        {/* Filtres avec ModernTabs */}
                        <div className="flex justify-center w-full">
                            <ModernTabs
                                items={tabItems}
                                activeTab={sessionFilter}
                                onTabChange={setSessionFilter}
                                variant="elegant"
                                fullWidth={false}
                            />
                        </div>
                    </div>

                    {/* Sessions List */}
                    {loading ? (
                        <div className="text-center py-8 ">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="text-gray-500 mt-2">Chargement des sessions...</p>
                        </div>
                    ) : filteredSessions.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            {sessionFilter === 'all'
                                ? 'Aucune session de marché trouvée'
                                : `Aucune session ${sessionFilter === 'upcoming' ? 'à venir' : 'active'} trouvée`}
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {filteredSessions.map((session) => (
                                <div
                                    key={session.id}
                                    className={`border rounded-lg p-4 transition-colors ${
                                        selectedSession?.id === session.id
                                            ? 'border-primary bg-tertiary/30'
                                            : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                                    }`}
                                >
                                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                                        <div
                                            className="flex-1 cursor-pointer"
                                            onClick={() => setSelectedSession(session)}
                                        >
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-medium text-gray-900">{session.name}</h4>
                                                <SessionAlert sessionId={session.id} />
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">{formatDateLong(session.date)}</p>
                                            {session.location && (
                                                <p className="text-sm text-gray-500 mt-1">📍 {session.location}</p>
                                            )}
                                            {session.description && (
                                                <p className="text-sm text-gray-600 mt-2">{session.description}</p>
                                            )}

                                            {session.partners && session.partners.length > 0 && (
                                                <div className="mt-2">
                                                    <p className="text-xs text-gray-500 mb-1">
                                                        Partenaires ({session.partners.length}):
                                                    </p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {session.partners.slice(0, 3).map((sessionPartner) => (
                                                            <span
                                                                key={sessionPartner.id}
                                                                className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800"
                                                            >
                                                                {sessionPartner.partner.name}
                                                            </span>
                                                        ))}
                                                        {session.partners.length > 3 && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSelectedSessionForPartners(session);
                                                                    setShowPartnersModal(true);
                                                                }}
                                                                className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                                                            >
                                                                +{session.partners.length - 3} autres
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Informations de commission et matériel */}
                                            {session.commissionRate && (
                                                <div className="mt-3 pt-2 border-t border-gray-100">
                                                    <EquipmentSummary
                                                        commissionRate={session.commissionRate}
                                                        tentsStatus={
                                                            (session.tentsStatus as 'none' | 'provided' | 'required') ||
                                                            'none'
                                                        }
                                                        tablesStatus={
                                                            (session.tablesStatus as
                                                                | 'none'
                                                                | 'provided'
                                                                | 'required') || 'none'
                                                        }
                                                        chairsStatus={
                                                            (session.chairsStatus as
                                                                | 'none'
                                                                | 'provided'
                                                                | 'required') || 'none'
                                                        }
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col md:items-end gap-2 md:text-right">
                                            <div>
                                                {(() => {
                                                    const actualStatus = getActualStatus(session);
                                                    return (
                                                        <span
                                                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                                actualStatus === 'UPCOMING'
                                                                    ? 'bg-yellow-100 text-yellow-800'
                                                                    : actualStatus === 'ACTIVE'
                                                                      ? 'bg-green-100 text-accent'
                                                                      : actualStatus === 'COMPLETED'
                                                                        ? 'bg-muted text-muted-foreground'
                                                                        : 'bg-red-100 text-[var(--color-danger)]'
                                                            }`}
                                                        >
                                                            {actualStatus === 'UPCOMING'
                                                                ? 'À VENIR'
                                                                : actualStatus === 'ACTIVE'
                                                                  ? 'ACTIF'
                                                                  : actualStatus === 'COMPLETED'
                                                                    ? 'TERMINÉ'
                                                                    : 'ANNULÉ'}
                                                        </span>
                                                    );
                                                })()}
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {session._count?.participations || 0} producteurs participants
                                                </p>
                                            </div>
                                            <SessionActionsMenu
                                                session={session}
                                                onEdit={(session) => {
                                                    setSessionToEdit(session);
                                                    setShowEditSession(true);
                                                }}
                                                onDelete={handleDeleteSession}
                                                onShowClients={(session) => {
                                                    setSelectedSessionForClients(session);
                                                    setShowClientsModal(true);
                                                }}
                                                deletingSessionId={deletingSessionId}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
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

            {/* Dialogue de confirmation standard */}
            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                title="Confirmer la suppression"
                message={`Êtes-vous sûr de vouloir supprimer la session "${confirmDialog.name}" ?`}
                onConfirm={confirmDeleteSession}
                onCancel={() => setConfirmDialog({ isOpen: false, id: '', name: '' })}
                isLoading={isConfirmingDeletion}
            />

            {/* Modal d'annulation de marché */}
            {cancellationModal.session && (
                <MarketCancellationModal
                    isOpen={cancellationModal.isOpen}
                    onClose={handleCloseCancellationModal}
                    onConfirm={handleConfirmCancellation}
                    marketName={cancellationModal.session.name}
                    marketDate={cancellationModal.session.date}
                    confirmedProducersCount={cancellationModal.confirmedProducersCount}
                />
            )}

            {/* Modal des partenaires */}
            <PartnersModal
                isOpen={showPartnersModal}
                onClose={() => setShowPartnersModal(false)}
                session={selectedSessionForPartners}
                onEditPartners={() => {
                    // Logic for editing partners
                }}
            />

            {/* Modal des clients */}
            <ClientAttendanceModal
                isOpen={showClientsModal}
                onClose={() => {
                    setShowClientsModal(false);
                    setSelectedSessionForClients(null);
                }}
                marketSessionId={selectedSessionForClients?.id || ''}
                marketSessionDate={
                    selectedSessionForClients?.date
                        ? (selectedSessionForClients.date as unknown as string)
                        : new Date().toISOString()
                }
            />
        </div>
    );
}

function MarketAdminPage() {
    return <MarketAdminPageContent />;
}

export default MarketAdminPage;
