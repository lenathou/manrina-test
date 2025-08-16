import { Form } from '@/components/Form/Form';
import { TextFormField } from '@/components/Form/Input';
import { Text } from '@/components/ui/Text';
import type { IGrower } from '@/server/grower/IGrower';
import { backendFetchService } from '@/service/BackendFetchService';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { withAdminLayout } from '@/components/layouts/AdminLayout';
import { GrowerTable } from '@/components/admin/producteurs/GrowerTable';
import { useGrowers } from '@/hooks/useGrowers';
import { IAdminTokenPayload } from '@/server/admin/IAdmin';

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
    const [modalVisible, setModalVisible] = useState(false);
    const [editGrower, setEditGrower] = useState<IGrower | null>(null);
    const [formError, setFormError] = useState('');
    const [showProfilePhoto, setShowProfilePhoto] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

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
        mutationFn: (payload: { name: string; email: string; password: string; profilePhoto: string; siret: string | null }) =>
            backendFetchService.createGrower(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['growers'] });
        },
    });

    const updateGrowerMutation = useMutation({
        mutationFn: (payload: { id: string; name: string; profilePhoto: string; updatedAt: Date; siret: string | null }) =>
            backendFetchService.updateGrower(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['growers'] });
        },
    });

    const deleteGrowerMutation = useMutation({
        mutationFn: (growerId: string) => backendFetchService.deleteGrower(growerId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['growers'] });
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
        setShowProfilePhoto(false);
        setModalVisible(true);
    };

    const openEditModal = (grower: IGrower) => {
        setEditGrower(grower);
        setFormError('');
        setShowProfilePhoto(!!grower.profilePhoto);
        setModalVisible(true);
    };

    const handleDelete = async (growerId: string) => {
        deleteGrowerMutation.mutate(growerId);
    };

    const handleEdit = (grower: IGrower) => {
        openEditModal(grower);
    };

    const handleFormSubmit = async (data: GrowerFormData) => {
        setFormError('');
        try {
            if (editGrower) {
                await updateGrowerMutation.mutateAsync({
                    id: editGrower.id,
                    name: data.name,
                    profilePhoto: showProfilePhoto ? (data.profilePhoto || '') : '',
                    updatedAt: new Date(),
                    siret: data.siret ?? null,
                });
            } else {
                if (!data.password) {
                    setFormError("Le mot de passe est requis pour la création.");
                    return;
                }
                await createGrowerMutation.mutateAsync({
                    name: data.name,
                    email: data.email,
                    password: data.password,
                    profilePhoto: showProfilePhoto ? (data.profilePhoto || '') : '',
                    siret: data.siret ?? null,
                });
            }
            setModalVisible(false);
        } catch {
            setFormError('Échec de la sauvegarde du producteur');
        }
    };

    return (
        <div className="space-y-6">
            {/* En-tête de la page */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="font-secondary font-bold text-2xl sm:text-3xl text-[var(--color-secondary)] mb-4">
                    Gestion des producteurs
                </h2>
                <p className="text-base sm:text-lg text-[var(--muted-foreground)]">
                    Administrez les comptes producteurs, gérez leurs informations et leur statut.
                </p>
            </div>

            {/* Filtres et recherche */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Rechercher un producteur..."
                                value={searchTerm}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                            />
                            <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
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
                        {formError && <div className="text-red-600 mb-3">{formError}</div>}
                    </div>
                </div>
            )}
        </div>
    );
}

export default withAdminLayout(AdminGrowersPage);
