/* eslint-disable react/no-unescaped-entities */
import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { AllocateCreditModal } from './AllocateCreditModal';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { ActionDropdown } from '@/components/ui/ActionDropdown';

export interface Client {
    id: string;
    name: string;
    email: string;
    phone?: string;
    registrationDate: string;
    totalOrders: number;
    totalSpent: string;
}

interface ClientTableProps {
    clients: Client[];
    currentPage: number;
    totalPages: number;
    onPageChange?: (page: number) => void;
    isLoading?: boolean;
    onEdit?: (client: Client) => void;
    onDelete?: (clientId: string) => void;
    onView?: (client: Client) => void;
    isDeleting?: boolean;
}

export const ClientTable: React.FC<ClientTableProps> = ({
    clients,
    currentPage,
    totalPages,
    onPageChange,
    isLoading = false,
    onEdit,
    onDelete,
    onView,
    isDeleting = false,
}) => {
    console.log('ClientTable props:', { onView: !!onView, onEdit: !!onEdit, onDelete: !!onDelete });
    const router = useRouter();
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [confirmationModal, setConfirmationModal] = useState<{
        isOpen: boolean;
        clientToDelete: Client | null;
    }>({ isOpen: false, clientToDelete: null });

    const handlePageChange = useCallback(
        (page: number) => {
            if (onPageChange) {
                onPageChange(page);
            } else {
                router.push({ pathname: router.pathname, query: { ...router.query, page } }, undefined, {
                    shallow: true,
                });
            }
        },
        [router, onPageChange],
    );

    const toggleIdExpansion = (clientId: string) => {
        setExpandedIds((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(clientId)) {
                newSet.delete(clientId);
            } else {
                newSet.add(clientId);
            }
            return newSet;
        });
    };

    const handleAllocateCredit = (client: Client) => {
        setSelectedClient(client);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedClient(null);
    };

    const handleCreditAllocated = () => {
        // Optionnel: rafraîchir les données ou afficher une notification
        console.log('Crédit alloué avec succès');
    };

    const handleDeleteClick = (client: Client) => {
        setConfirmationModal({
            isOpen: true,
            clientToDelete: client,
        });
    };

    const handleConfirmDelete = () => {
        if (confirmationModal.clientToDelete && onDelete) {
            onDelete(confirmationModal.clientToDelete.id);
        }
        setConfirmationModal({ isOpen: false, clientToDelete: null });
    };

    const handleCancelDelete = () => {
        setConfirmationModal({ isOpen: false, clientToDelete: null });
    };

    return (
        <div className="bg-[var(--background)] p-6 rounded-xl">
            {/* Vue desktop - tableau */}
            <div className="hidden lg:block">
                <table className="w-full text-left text-[var(--foreground)] border-separate border-spacing-y-2 rounded-xl">
                    <thead className="text-sm text-[var(--muted-foreground)]">
                        <tr>
                            <th className="py-2 w-20">ID</th>
                            <th>Nom</th>
                            <th>Email</th>
                            <th>Téléphone</th>
                            <th>Date d'inscription</th>
                            <th>Commandes</th>
                            <th>Total dépensé</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {isLoading ? (
                            // État de chargement
                            Array.from({ length: 5 }).map((_, index) => (
                                <tr
                                    key={`loading-${index}`}
                                    className="bg-white rounded-xl shadow-sm overflow-hidden"
                                >
                                    <td className="py-4 px-4 rounded-l-xl">
                                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                    </td>
                                    <td className="py-4 px-2">
                                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                    </td>
                                    <td className="py-4 px-2">
                                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                    </td>
                                    <td className="py-4 px-2">
                                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                    </td>
                                    <td className="py-4 px-2">
                                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                    </td>
                                    <td className="py-4 px-2">
                                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                    </td>
                                    <td className="py-4 px-4 rounded-r-xl">
                                        <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                                    </td>
                                </tr>
                            ))
                        ) : clients.length === 0 ? (
                            // État vide
                            <tr>
                                <td
                                    colSpan={8}
                                    className="py-8 text-center text-gray-500"
                                >
                                    Aucun client trouvé
                                </td>
                            </tr>
                        ) : (
                            // Données des clients
                            clients.map((client) => (
                                <tr
                                    key={client.id + client.email}
                                    className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200"
                                >
                                    <td className="py-4 px-2 rounded-l-xl font-medium w-20">
                                        <button
                                            onClick={() => toggleIdExpansion(client.id)}
                                            className="text-left hover:text-[var(--color-primary)] transition-colors duration-200 cursor-pointer"
                                            title="Cliquer pour voir l'ID complet"
                                        >
                                            {expandedIds.has(client.id) ? `#${client.id}` : `#${client.id.slice(0, 6)}...`}
                                        </button>
                                    </td>
                                    <td className="py-4 px-2 font-semibold">{client.name}</td>
                                    <td className="py-4 px-2">{client.email}</td>
                                    <td className="py-4 px-2">{client.phone || 'N/A'}</td>
                                    <td className="py-4 px-2">{client.registrationDate}</td>
                                    <td className="py-4 px-2 font-medium">{client.totalOrders}</td>
                                    <td className="py-4 px-2 font-semibold text-[var(--color-primary)]">
                                        {client.totalSpent}
                                    </td>
                                    <td className="py-4 px-4 rounded-r-xl">
                                        <ActionDropdown
                                            placeholder="Actions"
                                            actions={[
                                                {
                                                    id: 'allocate-credit',
                                                    label: 'Allouer un crédit',
                                                    onClick: () => handleAllocateCredit(client),
                                                },
                                                ...(onView ? [{
                                                    id: 'view',
                                                    label: 'Voir les détails',
                                                    onClick: () => onView(client),
                                                }] : []),
                                                ...(onEdit ? [{
                                                    id: 'edit',
                                                    label: 'Modifier',
                                                    onClick: () => onEdit(client),
                                                }] : []),
                                                ...(onDelete ? [{
                                                    id: 'delete',
                                                    label: 'Supprimer',
                                                    onClick: () => handleDeleteClick(client),
                                                    disabled: isDeleting,
                                                    className: 'text-red-600 hover:text-red-800 hover:bg-red-50',
                                                }] : []),
                                            ]}
                                        />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Vue mobile - cartes */}
            <div className="lg:hidden space-y-4">
                {isLoading ? (
                    // État de chargement mobile
                    Array.from({ length: 5 }).map((_, index) => (
                        <div key={`loading-mobile-${index}`} className="bg-white rounded-xl shadow-sm p-4">
                            <div className="space-y-3">
                                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                                <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                            </div>
                        </div>
                    ))
                ) : clients.length === 0 ? (
                    // État vide mobile
                    <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
                        Aucun client trouvé
                    </div>
                ) : (
                    // Données des clients mobile
                    clients.map((client) => (
                        <div
                            key={client.id + client.email}
                            className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow duration-200"
                        >
                            <div className="flex items-start space-x-3 mb-4">
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center">
                                        <span className="text-[var(--color-primary)] font-semibold text-lg">👤</span>
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-[var(--foreground)] truncate">{client.name}</h3>
                                    <p className="text-sm text-[var(--muted-foreground)] truncate">{client.email}</p>
                                    <button
                                        onClick={() => toggleIdExpansion(client.id)}
                                        className="text-xs text-[var(--color-primary)] hover:text-[var(--color-primary)]/80 transition-colors duration-200"
                                        title="Cliquer pour voir l'ID complet"
                                    >
                                        {expandedIds.has(client.id) ? `ID: ${client.id}` : `ID: ${client.id.slice(0, 8)}...`}
                                    </button>
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-[var(--muted-foreground)]">Téléphone:</span>
                                    <span className="text-sm text-[var(--foreground)]">{client.phone || 'N/A'}</span>
                                </div>
                                
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-[var(--muted-foreground)]">Date d'inscription:</span>
                                    <span className="text-sm text-[var(--foreground)]">{client.registrationDate}</span>
                                </div>
                                
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-[var(--muted-foreground)]">Commandes:</span>
                                    <span className="text-sm font-medium text-[var(--foreground)]">{client.totalOrders}</span>
                                </div>
                                
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-[var(--muted-foreground)]">Total dépensé:</span>
                                    <span className="text-sm font-semibold text-[var(--color-primary)]">{client.totalSpent}</span>
                                </div>
                                
                                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                    <span className="text-sm font-medium text-[var(--muted-foreground)]">Actions:</span>
                                    <ActionDropdown
                                        placeholder="Actions"
                                        className="w-32"
                                        actions={[
                                            {
                                                id: 'allocate-credit',
                                                label: 'Allouer un crédit',
                                                onClick: () => handleAllocateCredit(client),
                                            },
                                            ...(onView ? [{
                                                id: 'view',
                                                label: 'Voir les détails',
                                                onClick: () => onView(client),
                                            }] : []),
                                            ...(onEdit ? [{
                                                id: 'edit',
                                                label: 'Modifier',
                                                onClick: () => onEdit(client),
                                            }] : []),
                                            ...(onDelete ? [{
                                                id: 'delete',
                                                label: 'Supprimer',
                                                onClick: () => handleDeleteClick(client),
                                                disabled: isDeleting,
                                                className: 'text-red-600 hover:text-red-800 hover:bg-red-50',
                                            }] : []),
                                        ]}
                                    />
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-end mt-4 text-sm text-[var(--muted-foreground)]">
                <span className="mr-4">
                    {7 * (currentPage - 1) + 1}-{Math.min(7 * currentPage, clients.length * totalPages)} de{' '}
                    {clients.length * totalPages}
                </span>
                <button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className="px-2 disabled:opacity-30 hover:text-[var(--foreground)] transition-colors duration-200"
                >
                    «
                </button>
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-2 disabled:opacity-30 hover:text-[var(--foreground)] transition-colors duration-200"
                >
                    ‹
                </button>
                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-2 disabled:opacity-30 hover:text-[var(--foreground)] transition-colors duration-200"
                >
                    ›
                </button>
                <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="px-2 disabled:opacity-30 hover:text-[var(--foreground)] transition-colors duration-200"
                >
                    »
                </button>
            </div>

            {/* Modal d'allocation de crédit */}
            <AllocateCreditModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                client={selectedClient}
                onSuccess={handleCreditAllocated}
            />

            {/* Modal de confirmation de suppression */}
            <ConfirmationModal
                isOpen={confirmationModal.isOpen}
                onClose={handleCancelDelete}
                onConfirm={handleConfirmDelete}
                title="Supprimer le client"
                message={`Êtes-vous sûr de vouloir supprimer le client ${confirmationModal.clientToDelete?.name || ''} ? Cette action est irréversible.`}
                confirmText="Supprimer"
                cancelText="Annuler"
                variant="danger"
                isLoading={isDeleting}
            />
        </div>
    );
};
