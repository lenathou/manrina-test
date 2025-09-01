/* eslint-disable react/no-unescaped-entities */
import React, { useState, useMemo } from 'react';
import { useMarketSessions } from '@/hooks/useMarket';
import { MarketSessionWithProducts, CreateMarketSessionRequest } from '@/types/market';
import { Text } from '@/components/ui/Text';
import { useToast } from '@/components/ui/Toast';
import SessionForm from '@/components/admin/marche/SessionForm';
import ConfirmDialog from '@/components/common/ConfirmDialog';

import GrowersModal from '@/components/admin/marche/GrowersModal';
import MarketCancellationModal from '@/components/modals/MarketCancellationModal';
import PartnersModal from '@/components/admin/marche/PartnersModal';
import EquipmentSummary from '@/components/admin/marche/EquipmentSummary';
import { ClientAttendanceModal } from '@/components/admin/ClientAttendanceModal';
import { SessionActionsMenu } from '@/components/admin/SessionActionsMenu';
import { MarketActionsButtons } from '@/components/admin/marche/MarketActionsButtons';

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
    const [selectedSessionForPartners, setSelectedSessionForPartners] = useState<MarketSessionWithProducts | null>(null);
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

    // État pour le filtre des sessions
    const [sessionFilter, setSessionFilter] = useState<'all' | 'upcoming' | 'active'>('all');



    // État pour le modal d'annulation de marché
    const [cancellationModal, setCancellationModal] = useState<{
        isOpen: boolean;
        session: MarketSessionWithProducts | null;
        confirmedProducersCount: number;
    }>({ isOpen: false, session: null, confirmedProducersCount: 0 });

    // Stabiliser l'objet filters pour éviter les re-rendus inutiles
    const sessionFilters = useMemo(
        () => ({
            limit: 20,
        }),
        [],
    );

    const {
        sessions,
        loading,
        createSession,
        updateSession,
        deleteSession,
    } = useMarketSessions(sessionFilters);

    // Fonction pour calculer le statut réel basé sur la date
    const getActualStatus = (session: MarketSessionWithProducts) => {
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

    const upcomingSessions = sessions.filter((session) => {
        const actualStatus = getActualStatus(session);
        return actualStatus === 'UPCOMING' || actualStatus === 'ACTIVE';
    });

    // Filtrer les sessions selon le filtre sélectionné basé sur la date réelle
    const filteredSessions = useMemo(() => {
        switch (sessionFilter) {
            case 'upcoming':
                return sessions.filter((session) => getActualStatus(session) === 'UPCOMING');
            case 'active':
                return sessions.filter((session) => getActualStatus(session) === 'ACTIVE');
            case 'all':
            default:
                return sessions;
        }
    }, [sessions, sessionFilter]);

    // Calculer le nombre total de producteurs participants
    const totalParticipatingGrowers = sessions.reduce(
        (total, session) => total + (session._count?.participations || 0),
        0,
    );

    const upcomingParticipatingGrowers = upcomingSessions.reduce(
        (total, session) => total + (session._count?.participations || 0),
        0,
    );



    const handleDeleteSession = async (sessionId: string) => {
        const session = sessions.find((s) => s.id === sessionId);
        if (!session) return;

        // Définir l'état de chargement pour ce bouton spécifique
        setDeletingSessionId(sessionId);

        // Vérifier s'il y a des producteurs confirmés
        const confirmedProducersCount = session.participations?.filter(
            (p) => p.status === 'CONFIRMED'
        ).length || 0;

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
                    console.error('Erreur lors de l\'envoi de notification:', await notificationResponse.text());
                }
            } catch (notificationError) {
                console.error('Erreur lors de l\'envoi de notification:', notificationError);
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
                error('Erreur lors de l\'annulation du marché');
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


            {/* Sessions de Marché - Section principale */}
            <div className=" rounded-lg ">
                <div className="px-6 py-4 ">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Sessions de Marché</h2>
                            <p className="text-gray-600 mt-2">
                                Gérez les sessions de marché et les producteurs participants
                            </p>
                        </div>
                        <MarketActionsButtons
                            onCreateNewSession={() => setShowCreateSession(true)}
                        />
                    </div>
                </div>

                <div className="p-6 ">
                    {/* Sessions Header */}
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-medium text-gray-900">Sessions de Marché ({filteredSessions.length})</h3>
                        
                        {/* Filtres */}
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setSessionFilter('all')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                    sessionFilter === 'all'
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Toutes ({sessions.length})
                            </button>
                            <button
                                onClick={() => setSessionFilter('upcoming')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                    sessionFilter === 'upcoming'
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                À venir ({sessions.filter(s => getActualStatus(s) === 'UPCOMING').length})
                            </button>
                            <button
                                onClick={() => setSessionFilter('active')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                    sessionFilter === 'active'
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Actives ({sessions.filter(s => getActualStatus(s) === 'ACTIVE').length})
                            </button>
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
                                : `Aucune session ${sessionFilter === 'upcoming' ? 'à venir' : 'active'} trouvée`
                            }
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {filteredSessions.map((session) => (
                                <div
                                    key={session.id}
                                    className={`border rounded-lg p-4 transition-colors ${
                                        selectedSession?.id === session.id
                                            ? 'border-primary bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                                    }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div
                                            className="flex-1 cursor-pointer"
                                            onClick={() => setSelectedSession(session)}
                                        >
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-medium text-gray-900">{session.name}</h4>

                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">{formatDate(session.date)}</p>
                                            {session.location && (
                                                <p className="text-sm text-gray-500 mt-1">📍 {session.location}</p>
                                            )}
                                            {session.description && (
                                                <p className="text-sm text-gray-600 mt-2">{session.description}</p>
                                            )}

                                            {session.partners && session.partners.length > 0 && (
                                                <div className="mt-2">
                                                    <p className="text-xs text-gray-500 mb-1">Partenaires ({session.partners.length}):</p>
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
                                                        tentsStatus={(session.tentsStatus as 'none' | 'provided' | 'required') || 'none'}
                                                        tablesStatus={(session.tablesStatus as 'none' | 'provided' | 'required') || 'none'}
                                                        chairsStatus={(session.chairsStatus as 'none' | 'provided' | 'required') || 'none'}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-right flex flex-col items-end gap-2">
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
                                                            {actualStatus === 'UPCOMING' ? 'À VENIR' : 
                                                             actualStatus === 'ACTIVE' ? 'ACTIF' :
                                                             actualStatus === 'COMPLETED' ? 'TERMINÉ' : 'ANNULÉ'}
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
                marketSessionDate={selectedSessionForClients?.date ? (selectedSessionForClients.date as unknown as string) : new Date().toISOString()}
            />
        </div>
    );
}

function MarketAdminPage() {
    return <MarketAdminPageContent />;
}

export default MarketAdminPage;
