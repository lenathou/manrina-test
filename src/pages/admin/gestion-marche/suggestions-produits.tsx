/* eslint-disable react/no-unescaped-entities */
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { GrowerWithSuggestions } from '@/components/admin/MarketProductSuggestionsManager';
import { GrowerSuggestionsTable } from '@/components/admin/GrowerSuggestionsTable';
import { GrowerSuggestionsModal } from '@/components/admin/GrowerSuggestionsModal';
import { useAllMarketProductSuggestions } from '@/hooks/useAdminMarketProductSuggestion';
import { useAllGrowers } from '@/hooks/useGrowers';
import { useRouter } from 'next/router';
import { IAdminTokenPayload } from '@/server/admin/IAdmin';
import { SearchBarNext } from '@/components/ui/SearchBarNext';

interface AdminSuggestionsProduitsPageProps {
    authenticatedAdmin: IAdminTokenPayload;
}

function AdminSuggestionsProduitsPage({ }: AdminSuggestionsProduitsPageProps) {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
    const [selectedGrower, setSelectedGrower] = useState<GrowerWithSuggestions | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 7;

    const { data: suggestions = [], isLoading } = useAllMarketProductSuggestions();
    const { data: growers = [], isLoading: isLoadingGrowers } = useAllGrowers();

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

    // Grouper les suggestions par producteur
    const growersWithSuggestions = useMemo(() => {
        if (!suggestions || !growers) return [];

        return growers.map(grower => {
            const growerSuggestions = suggestions.filter(s => s.growerId === grower.id);
            const pendingCount = growerSuggestions.filter(s => s.status === 'PENDING').length;
            const approvedCount = growerSuggestions.filter(s => s.status === 'APPROVED').length;
            const rejectedCount = growerSuggestions.filter(s => s.status === 'REJECTED').length;
            const totalSuggestions = growerSuggestions.length;

            return {
                ...grower,
                suggestions: growerSuggestions,
                pendingCount,
                approvedCount,
                rejectedCount,
                totalSuggestions,
            };
        }).filter(grower => grower.totalSuggestions > 0);
    }, [suggestions, growers]);

    // Calculer les statistiques globales
    const globalStats = useMemo(() => {
        if (!suggestions) return { total: 0, pending: 0, approved: 0, rejected: 0 };

        return {
            total: suggestions.length,
            pending: suggestions.filter(s => s.status === 'PENDING').length,
            approved: suggestions.filter(s => s.status === 'APPROVED').length,
            rejected: suggestions.filter(s => s.status === 'REJECTED').length,
        };
    }, [suggestions]);

    // Filtrer les producteurs
    const filteredGrowers = useMemo(() => {
        let filtered = growersWithSuggestions;

        // Filtrer par terme de recherche
        if (searchTerm) {
            filtered = filtered.filter(grower =>
                grower.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                grower.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filtrer par statut
        if (selectedStatus !== 'ALL') {
            filtered = filtered.filter(grower => {
                switch (selectedStatus) {
                    case 'PENDING':
                        return grower.pendingCount > 0;
                    case 'APPROVED':
                        return grower.approvedCount > 0;
                    case 'REJECTED':
                        return grower.rejectedCount > 0;
                    default:
                        return true;
                }
            });
        }

        return filtered;
    }, [growersWithSuggestions, searchTerm, selectedStatus]);

    // Pagination
    const totalPages = Math.ceil(filteredGrowers.length / itemsPerPage);
    const paginatedGrowers = filteredGrowers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Réinitialiser la page à 1 quand les filtres changent
    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            handlePageChange(1);
        }
    }, [searchTerm, selectedStatus, totalPages, currentPage, handlePageChange]);

    const isLoadingData = isLoading || isLoadingGrowers;

    const handleSelectGrower = (grower: GrowerWithSuggestions) => {
        setSelectedGrower(grower);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedGrower(null);
    };

    return (
        <div className="space-y-6">
            {/* En-tête de la page */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="font-secondary font-bold text-2xl sm:text-3xl text-[var(--color-secondary)] mb-4">
                    Suggestions de produits
                </h2>
                <p className="text-base sm:text-lg text-[var(--muted-foreground)]">
                    Gérez les suggestions de produits soumises par les producteurs pour le marché.
                </p>
            </div>

            {/* Statistiques globales */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="text-2xl font-bold text-[var(--color-primary)]">{globalStats.total}</div>
                    <div className="text-sm text-[var(--muted-foreground)]">Total</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="text-2xl font-bold text-yellow-600">{globalStats.pending}</div>
                    <div className="text-sm text-[var(--muted-foreground)]">En attente</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="text-2xl font-bold text-green-600">{globalStats.approved}</div>
                    <div className="text-sm text-[var(--muted-foreground)]">Approuvées</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="text-2xl font-bold text-red-600">{globalStats.rejected}</div>
                    <div className="text-sm text-[var(--muted-foreground)]">Rejetées</div>
                </div>
            </div>

            {/* Filtres et recherche */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        <SearchBarNext
                            placeholder="Rechercher un producteur..."
                            value={searchTerm}
                            onSearch={handleSearchChange}
                        />
                        
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value as 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED')}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                        >
                            <option value="ALL">Tous les statuts</option>
                            <option value="PENDING">En attente</option>
                            <option value="APPROVED">Approuvées</option>
                            <option value="REJECTED">Rejetées</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Tableau des producteurs */}
            <GrowerSuggestionsTable
                growers={paginatedGrowers}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                isLoading={isLoadingData}
                onSelectGrower={handleSelectGrower}
            />

            {/* Modal des suggestions */}
            {selectedGrower && (
                <GrowerSuggestionsModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    growerName={selectedGrower.name}
                    growerId={selectedGrower.id}
                    suggestions={selectedGrower.suggestions}
                    onSuggestionUpdated={() => {
                        // Optionnel: rafraîchir les données si nécessaire
                    }}
                />
            )}
        </div>
    );
}

export default AdminSuggestionsProduitsPage;
