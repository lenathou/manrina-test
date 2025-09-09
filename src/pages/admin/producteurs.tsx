import { Form } from '@/components/Form/Form';
import { TextFormField } from '@/components/Form/Input';
import { Text } from '@/components/ui/Text';
import type { IGrower } from '@/server/grower/IGrower';
import { backendFetchService } from '@/service/BackendFetchService';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
// Removed Decimal import to avoid client-side Prisma issues

import { GrowerTable } from '@/components/admin/producteurs/GrowerTable';
import { useGrowers } from '@/hooks/useGrowers';
import { IAdminTokenPayload } from '@/server/admin/IAdmin';
import { SearchBarNext } from '@/components/ui/SearchBarNext';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { useToast } from '@/components/ui/Toast';

// Définition d'un type spécifique pour les données du formulaire
type GrowerFormData = {
    name: string;
    email: string;
    password?: string;
    profilePhoto?: string;
    siret?: string | null;
};

function AdminGrowersPage({ }: { authenticatedAdmin: IAdminTokenPayload }) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { success, error: showError } = useToast();
    const [modalVisible, setModalVisible] = useState(false);
    const [editGrower, setEditGrower] = useState<IGrower | null>(null);
    const [formError, setFormError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [showProfilePhoto, setShowProfilePhoto] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [confirmationModal, setConfirmationModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 7;

    // Synchroniser currentPage avec le paramètre 'page' de l'URL
    useEffect(() => {
        const pageFromUrl = parseInt(router.query.page as string) || 1;
        setCurrentPage(pageFromUrl);
    }, [router.query.page]);

    // Fonction pour gérer le changement de page
    const handlePageChange = useCallback((page: number) => {
        router.push({
            pathname: router.pathname,
            query: { ...router.query, page: page.toString() }
        }, undefined, { shallow: true });
    }, [router]);

    // Fonction pour gérer le changement de recherche
    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        if (currentPage > 1) {
            handlePageChange(1);
        }
    };

    // Utiliser le hook pour récupérer les producteurs depuis l'API
    const { 
        growers, 
        totalPages, 
        isLoading, 
        error 
    } = useGrowers({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm
    });

    // Réinitialiser la page à 1 quand les filtres changent
    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            handlePageChange(1);
        }
    }, [searchTerm, totalPages, currentPage, handlePageChange]);

    // Mutations
    const createGrowerMutation = useMutation({
        mutationFn: (payload: { name: string; email: string; password: string; profilePhoto: string; siret: string | null; approved: boolean; commissionRate: number }) =>
            backendFetchService.createGrower(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['growers'] });
            success('Producteur créé avec succès');
        },
        onError: (error: unknown) => {
            let errorMessage = 'Échec de la création du producteur';
            if (error instanceof Error && error.message) {
                const message = error.message.toLowerCase();
                if (message.includes('unique constraint') && message.includes('email')) {
                    errorMessage = 'Cette adresse email est déjà utilisée par un autre producteur.';
                } else if (message.includes('unique constraint') && message.includes('siret')) {
                    errorMessage = 'Ce numéro SIRET est déjà utilisé par un autre producteur.';
                } else {
                    errorMessage = `Erreur: ${error.message}`;
                }
            }
            showError(errorMessage);
        },
    });

    const updateGrowerMutation = useMutation({
        mutationFn: (payload: { id: string; name: string; email: string; profilePhoto: string; updatedAt: Date; siret: string | null; approved: boolean; approvedAt: Date | null; phone: string | null; commissionRate: number; bio: string | null; assignmentId: string | null }) =>
            backendFetchService.updateGrower(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['growers'] });
            success('Producteur modifié avec succès');
        },
        onError: (error: unknown) => {
            let errorMessage = 'Échec de la modification du producteur';
            if (error instanceof Error && error.message) {
                const message = error.message.toLowerCase();
                if (message.includes('unique constraint') && message.includes('email')) {
                    errorMessage = 'Cette adresse email est déjà utilisée par un autre producteur.';
                } else if (message.includes('unique constraint') && message.includes('siret')) {
                    errorMessage = 'Ce numéro SIRET est déjà utilisé par un autre producteur.';
                } else {
                    errorMessage = `Erreur: ${error.message}`;
                }
            }
            showError(errorMessage);
        },
    });

    const deleteGrowerMutation = useMutation({
        mutationFn: (growerId: string) => backendFetchService.deleteGrower(growerId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['growers'] });
            success('Producteur supprimé avec succès');
        },
        onError: (error: unknown) => {
            let errorMessage = 'Erreur lors de la suppression du producteur';
            if (error instanceof Error && error.message) {
                if (error.message.includes('constraint') || error.message.includes('foreign key')) {
                    errorMessage = 'Impossible de supprimer ce producteur car il est lié à des commandes ou des produits existants.';
                } else if (error.message.includes('not found')) {
                    errorMessage = 'Ce producteur n\'existe plus ou a déjà été supprimé.';
                } else if (error.message.includes('unauthorized') || error.message.includes('permission')) {
                    errorMessage = 'Vous n\'avez pas les permissions nécessaires pour supprimer ce producteur.';
                } else {
                    errorMessage = `Erreur: ${error.message}`;
                }
            }
            showError(errorMessage);
        },
    });

    const approveGrowerMutation = useMutation({
        mutationFn: async ({ growerId, approved }: { growerId: string; approved: boolean }) => {
            const response = await fetch(`/api/admin/growers/${growerId}/approve`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ approved }),
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erreur lors de la mise à jour');
            }
            
            return response.json();
        },
        onSuccess: (_, { approved }) => {
            queryClient.invalidateQueries({ queryKey: ['growers'] });
            success(approved ? 'Producteur approuvé avec succès' : 'Producteur désapprouvé avec succès');
        },
        onError: (error: unknown) => {
            const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la mise à jour du statut du producteur';
            showError(errorMessage);
        },
    });

    const formFields: TextFormField[] = [
        { type: 'text', name: 'name', placeholder: 'Nom', required: true },
        { type: 'text', name: 'email', placeholder: 'Email', required: true, inputMode: 'email' },
        { type: 'text', name: 'siret', placeholder: 'SIRET (optionnel)', required: false },
        { type: 'password', name: 'password', placeholder: 'Mot de passe', required: !editGrower },
        ...(showProfilePhoto
            ? [{ type: 'text' as const, name: 'profilePhoto', placeholder: 'URL de la photo de profil (optionnel)' }]
            : []),
    ];

    const openCreateModal = () => {
        setEditGrower(null);
        setFormError('');
        setSuccessMessage('');
        setShowProfilePhoto(false);
        setModalVisible(true);
    };

    const openEditModal = (grower: IGrower) => {
        setEditGrower(grower);
        setFormError('');
        setSuccessMessage('');
        setShowProfilePhoto(!!grower.profilePhoto);
        setModalVisible(true);
    };

    const handleDelete = (growerId: string) => {
        setConfirmationModal({
            isOpen: true,
            title: 'Confirmer la suppression',
            message: 'Êtes-vous sûr de vouloir supprimer ce producteur ? Cette action est irréversible.',
            onConfirm: () => {
                deleteGrowerMutation.mutate(growerId);
                setConfirmationModal(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    const handleEdit = (grower: IGrower) => {
        openEditModal(grower);
    };

    const handleApprove = (growerId: string, approved: boolean) => {
        approveGrowerMutation.mutate({ growerId, approved });
    };

    const handleFormSubmit = async (data: GrowerFormData) => {
        setFormError('');
        setSuccessMessage('');
        try {
            if (editGrower) {
                const growerUpdateData: {
                    id: string;
                    name: string;
                    email: string;
                    profilePhoto: string;
                    updatedAt: Date;
                    siret: string | null;
                    approved: boolean;
                    approvedAt: Date | null;
                    phone: string | null;
                    commissionRate: number;
                    bio: string | null;
                    assignmentId: string | null;
                } = {
                    id: editGrower.id,
                    name: data.name,
                    email: data.email,
                    profilePhoto: showProfilePhoto ? (data.profilePhoto || '') : '',
                    updatedAt: new Date(),
                    approved: editGrower.approved,
                    approvedAt: editGrower.approvedAt ?? null,
                    phone: editGrower.phone ?? null,
                    commissionRate: editGrower.commissionRate ?? 0.1,
                    bio: editGrower.bio ?? null,
                    assignmentId: editGrower.assignmentId ?? null,
                    siret: (data.siret && data.siret.trim() !== '') ? data.siret : null,
                };
                
                await updateGrowerMutation.mutateAsync(growerUpdateData);
            } else {
                if (!data.password) {
                    setFormError("Le mot de passe est requis pour la création.");
                    return;
                }
                const growerData: {
                    name: string;
                    email: string;
                    password: string;
                    profilePhoto: string;
                    siret: string | null;
                    approved: boolean;
                    commissionRate: number;
                } = {
                    name: data.name,
                    email: data.email,
                    password: data.password,
                    profilePhoto: showProfilePhoto ? (data.profilePhoto || '') : '',
                    approved: true, // Les producteurs créés par l'admin sont approuvés par défaut
                    commissionRate: 0.1, // 10% par défaut
                    siret: (data.siret && data.siret.trim() !== '') ? data.siret : null,
                };
                
                await createGrowerMutation.mutateAsync(growerData);
            }
            setSuccessMessage(editGrower ? 'Producteur modifié avec succès !' : 'Producteur créé avec succès !');
            setTimeout(() => {
                setModalVisible(false);
                setSuccessMessage('');
            }, 1500);
        } catch (error: unknown) {
            // Gestion d'erreur améliorée avec des messages spécifiques
            let errorMessage = 'Échec de la sauvegarde du producteur';
            
            if (error instanceof Error && error.message) {
                const message = error.message.toLowerCase();
                
                if (message.includes('unique constraint') && message.includes('email')) {
                    errorMessage = 'Cette adresse email est déjà utilisée par un autre producteur.';
                } else if (message.includes('unique constraint') && message.includes('siret')) {
                    errorMessage = 'Ce numéro SIRET est déjà utilisé par un autre producteur.';
                } else if (message.includes('validation')) {
                    errorMessage = 'Les données saisies ne sont pas valides. Veuillez vérifier les champs.';
                } else if (message.includes('network') || message.includes('fetch')) {
                    errorMessage = 'Erreur de connexion. Veuillez vérifier votre connexion internet et réessayer.';
                } else if (message.includes('unauthorized') || message.includes('forbidden')) {
                    errorMessage = 'Vous n\'avez pas les permissions nécessaires pour effectuer cette action.';
                } else {
                    errorMessage = `Erreur: ${error.message}`;
                }
            }
            
            setFormError(errorMessage);
        }
    };

    return (
        <div className="space-y-6">
            {/* En-tête de la page */}
            <div className=" p-6">
                <h2 className="font-secondary font-bold text-2xl sm:text-3xl text-[var(--color-secondary)] mb-4">
                    Gestion des producteurs
                </h2>
                <p className="text-base sm:text-lg text-[var(--muted-foreground)]">
                    Administrez les comptes producteurs, gérez leurs informations et leur statut.
                </p>
            </div>

            {/* Filtres et recherche */}
            <div className=" p-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        <SearchBarNext
                            placeholder="Rechercher un producteur..."
                            value={searchTerm}
                            onSearch={handleSearchChange}
                        />
                    </div>
                    
                    <button 
                        className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg hover:bg-[var(--color-primary)]/90 transition-colors duration-200 flex items-center gap-2"
                        onClick={openCreateModal}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Ajouter un producteur
                    </button>
                </div>
            </div>

            {/* Tableau des producteurs */}
            {error ? (
                <div className="bg-white rounded-lg shadow p-6 text-center text-red-600">
                    <p>Erreur lors du chargement des producteurs: {error}</p>
                </div>
            ) : (
                <GrowerTable 
                    growers={growers}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    isLoading={isLoading}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    isDeleting={deleteGrowerMutation.isPending}
                    onApprove={handleApprove}
                    isApproving={approveGrowerMutation.isPending}
                />
            )}
            {modalVisible && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
                        <div className="flex justify-between items-center mb-6">
                            <Text
                                variant="h2"
                                className="font-secondary font-bold text-xl text-[var(--color-secondary)]"
                            >
                                {editGrower ? 'Modifier le producteur' : 'Ajouter un producteur'}
                            </Text>
                            <button
                                onClick={() => setModalVisible(false)}
                                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                            >
                                ✕
                            </button>
                        </div>
                        <Form<GrowerFormData>
                            formFields={formFields}
                            submitLabel={editGrower ? 'Modifier' : 'Créer'}
                            onSubmit={handleFormSubmit}
                            isDisabled={createGrowerMutation.isPending || updateGrowerMutation.isPending}
                            initialValues={editGrower || undefined}
                        />
                        {!showProfilePhoto && (
                            <button
                                className="text-[var(--color-primary)] mb-3 hover:underline w-full text-left"
                                onClick={() => setShowProfilePhoto(true)}
                            >
                                + Ajouter une photo de profil (optionnel)
                            </button>
                        )}
                        {successMessage && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 flex items-start gap-3">
                                <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <div className="text-green-800 text-sm leading-relaxed">
                                    {successMessage}
                                </div>
                            </div>
                        )}
                        {formError && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-start gap-3">
                                <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <div className="text-red-800 text-sm leading-relaxed">
                                    {formError}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
            
            <ConfirmationModal
                isOpen={confirmationModal.isOpen}
                title={confirmationModal.title}
                message={confirmationModal.message}
                onConfirm={confirmationModal.onConfirm}
                onClose={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
}

export default AdminGrowersPage;
