/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import { ClientTable } from '@/components/admin/clients/ClientTable';
import { IAdminTokenPayload } from '@/server/admin/IAdmin';
import { useClients } from '@/hooks/useClients';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui';
import { Form } from '@/components/Form/Form';
import { TextFormField } from '@/components/Form/Input';
import { Text } from '@/components/ui/Text';
import { backendFetchService } from '@/service/BackendFetchService';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Client } from '@/components/admin/clients/ClientTable';
import { SearchBarNext } from '@/components/ui/SearchBarNext';
import { useToast } from '@/components/ui/Toast';

function AdminClients({}: { authenticatedAdmin: IAdminTokenPayload }) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { success, error: showError } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [editClient, setEditClient] = useState<Client | null>(null);
    const [formError, setFormError] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 7;

    // Synchroniser currentPage avec le paramètre 'page' de l'URL
    useEffect(() => {
        const pageFromUrl = parseInt(router.query.page as string) || 1;
        setCurrentPage(pageFromUrl);
    }, [router.query.page]);

    // Fonction pour gérer le changement de page
    const handlePageChange = useCallback(
        (page: number) => {
            router.push(
                {
                    pathname: router.pathname,
                    query: { ...router.query, page: page.toString() },
                },
                undefined,
                { shallow: true },
            );
        },
        [router],
    );

    // Fonction pour gérer le changement de recherche
    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        if (currentPage > 1) {
            handlePageChange(1);
        }
    };

    // Utiliser le hook pour récupérer les clients depuis l'API
    const { clients, totalPages, isLoading, error } = useClients({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
    });

    // Réinitialiser la page à 1 quand les filtres changent
    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            handlePageChange(1);
        }
    }, [searchTerm, totalPages, currentPage, handlePageChange]);

    // Mutations
    const createClientMutation = useMutation({
        mutationFn: (payload: { name: string; email: string; password: string; phone: string }) =>
            backendFetchService.createCustomer(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clients'] });
            setModalVisible(false);
            setFormError('');
            success('Client créé avec succès');
        },
        onError: (error: Error) => {
            const errorMessage = error.message || 'Erreur lors de la création du client';
            setFormError(errorMessage);
            showError(errorMessage);
        },
    });

    const updateClientMutation = useMutation({
        mutationFn: (payload: { id: string; name: string; email: string; phone: string }) =>
            backendFetchService.updateCustomer(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clients'] });
            setModalVisible(false);
            setFormError('');
            success('Client modifié avec succès');
        },
        onError: (error: Error) => {
            const errorMessage = error.message || 'Erreur lors de la modification du client';
            setFormError(errorMessage);
            showError(errorMessage);
        },
    });

    const deleteClientMutation = useMutation({
        mutationFn: (clientId: string) => backendFetchService.deleteCustomer(clientId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clients'] });
            success('Client supprimé avec succès');
        },
        onError: (error: Error) => {
            const errorMessage = error.message || 'Erreur lors de la suppression du client';
            showError(errorMessage);
        },
    });

    // Champs du formulaire
    const formFields: TextFormField[] = [
        { type: 'text', name: 'name', placeholder: 'Nom', required: true },
        { type: 'text', name: 'email', placeholder: 'Email', required: true, inputMode: 'email' },
        { type: 'text', name: 'phone', placeholder: 'Téléphone', required: true, inputMode: 'tel' },
        { type: 'password', name: 'password', placeholder: 'Mot de passe', required: !editClient },
    ];

    const openCreateModal = () => {
        setEditClient(null);
        setFormError('');
        setModalVisible(true);
    };

    const openEditModal = (client: Client) => {
        setEditClient(client);
        setFormError('');
        setModalVisible(true);
    };

    const handleDelete = async (clientId: string) => {
        deleteClientMutation.mutate(clientId);
    };

    const handleEdit = (client: Client) => {
        openEditModal(client);
    };

    const handleView = (client: Client) => {
        router.push(`/admin/clients/${client.id}`);
    };

    const handleFormSubmit = async (data: { name: string; email: string; phone: string; password?: string }) => {
        setFormError('');
        try {
            if (editClient) {
                await updateClientMutation.mutateAsync({
                    id: editClient.id,
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                });
            } else {
                await createClientMutation.mutateAsync({
                    name: data.name,
                    email: data.email,
                    password: data.password!,
                    phone: data.phone,
                });
            }
        } catch {
            // L'erreur est gérée par onError des mutations
        }
    };

    return (
        <div className="space-y-6">
            {/* En-tête de la page */}
            <div className="p-6">
                <h2 className="font-secondary font-bold text-2xl sm:text-3xl text-[var(--color-secondary)] mb-4">
                    Gestion des clients
                </h2>
                <p className="text-base sm:text-lg text-[var(--muted-foreground)]">
                    Administrez les comptes clients, consultez leurs commandes et gérez leur statut.
                </p>
            </div>

            {/* Filtres et recherche */}
            <div className=" p-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        <SearchBarNext
                            placeholder="Rechercher un client..."
                            value={searchTerm}
                            onSearch={handleSearchChange}
                        />
                    </div>

                    <Button
                    variant='secondary'
                        onClick={openCreateModal}
                         className="flex items-center gap-2 rounded-full py-4"
                    >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4v16m8-8H4"
                            />
                        </svg>
                        Ajouter un client
                    </Button>
                </div>
            </div>

            {/* Tableau des clients */}
            {error ? (
                <div className="bg-white rounded-lg shadow p-6 text-center text-red-600">
                    <p>Erreur lors du chargement des clients: {error}</p>
                </div>
            ) : (
                <ClientTable
                    clients={clients}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    isLoading={isLoading}
                    onEdit={handleEdit}
                    onView={handleView}
                    onDelete={handleDelete}
                    isDeleting={deleteClientMutation.isPending}
                />
            )}

            {/* Modal d'ajout/modification de client */}
            {modalVisible && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
                        <div className="flex justify-between items-center mb-6">
                            <Text
                                variant="h2"
                                className="font-secondary font-bold text-xl text-[var(--color-secondary)]"
                            >
                                {editClient ? 'Modifier le client' : 'Ajouter un client'}
                            </Text>
                            <button
                                onClick={() => setModalVisible(false)}
                                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                            >
                                ✕
                            </button>
                        </div>
                        <Form
                            formFields={formFields}
                            submitLabel={editClient ? 'Modifier' : 'Créer'}
                            onSubmit={handleFormSubmit}
                            isDisabled={createClientMutation.isPending || updateClientMutation.isPending}
                            initialValues={
                                editClient
                                    ? {
                                          name: editClient.name,
                                          email: editClient.email,
                                          phone: editClient.phone,
                                      }
                                    : undefined
                            }
                        />
                        {formError && (
                            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                                {formError}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminClients;
