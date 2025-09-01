/* eslint-disable react/no-unescaped-entities */
import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { GrowerWithSuggestions } from './MarketProductSuggestionsManager';

interface GrowerSuggestionsTableProps {
    growers: GrowerWithSuggestions[];
    currentPage: number;
    totalPages: number;
    onPageChange?: (page: number) => void;
    isLoading?: boolean;
    onSelectGrower?: (grower: GrowerWithSuggestions) => void;
}

export const GrowerSuggestionsTable: React.FC<GrowerSuggestionsTableProps> = ({
    growers,
    currentPage,
    totalPages,
    onPageChange,
    isLoading = false,
    onSelectGrower,
}) => {
    const router = useRouter();
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

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

    const toggleIdExpansion = (growerId: string) => {
        setExpandedIds((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(growerId)) {
                newSet.delete(growerId);
            } else {
                newSet.add(growerId);
            }
            return newSet;
        });
    };

    const getStatusBadge = (status: string, count: number) => {
        if (count === 0) return null;
        
        const colors = {
            PENDING: 'bg-yellow-100 text-yellow-800',
            APPROVED: 'bg-green-100 text-green-800',
            REJECTED: 'bg-red-100 text-red-800',
        };
        
        return (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
                {count}
            </span>
        );
    };

    return (
        <div className="bg-[var(--background)] p-6 rounded-xl">
            {/* Vue desktop - tableau */}
            <div className="hidden lg:block">
                <table className="w-full text-left text-[var(--foreground)] border-separate border-spacing-y-2 rounded-xl">
                    <thead className="text-sm text-[var(--muted-foreground)]">
                        <tr>
                            <th className="py-2 w-20">ID</th>
                            <th>Nom du producteur</th>
                            <th>Email</th>
                            <th>Téléphone</th>
                            <th>En attente</th>
                            <th>Approuvées</th>
                            <th>Rejetées</th>
                            <th>Total</th>
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
                        ) : growers.length === 0 ? (
                            // État vide
                            <tr>
                                <td
                                    colSpan={9}
                                    className="py-8 text-center text-gray-500"
                                >
                                    Aucun producteur trouvé
                                </td>
                            </tr>
                        ) : (
                            // Données des producteurs
                            growers.map((grower) => (
                                <tr
                                    key={grower.id + grower.email}
                                    className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200"
                                >
                                    <td className="py-4 px-2 rounded-l-xl font-medium w-20">
                                        <button
                                            onClick={() => toggleIdExpansion(grower.id)}
                                            className="text-left hover:text-[var(--color-primary)] transition-colors duration-200 cursor-pointer"
                                            title="Cliquer pour voir l'ID complet"
                                        >
                                            {expandedIds.has(grower.id) ? `#${grower.id}` : `#${grower.id.slice(0, 6)}...`}
                                        </button>
                                    </td>
                                    <td className="py-4 px-2 font-semibold">{grower.name}</td>
                                    <td className="py-4 px-2">{grower.email}</td>
                                    <td className="py-4 px-2">{grower.phone || 'N/A'}</td>
                                    <td className="py-4 px-2">
                                        {getStatusBadge('PENDING', grower.pendingCount)}
                                    </td>
                                    <td className="py-4 px-2">
                                        {getStatusBadge('APPROVED', grower.approvedCount)}
                                    </td>
                                    <td className="py-4 px-2">
                                        {getStatusBadge('REJECTED', grower.rejectedCount)}
                                    </td>
                                    <td className="py-4 px-2 font-semibold text-[var(--color-primary)]">
                                        {grower.totalSuggestions}
                                    </td>
                                    <td className="py-4 px-4 rounded-r-xl">
                                        <div className="flex items-center gap-2">
                                            {onSelectGrower && (
                                                <button
                                                    onClick={() => onSelectGrower(grower)}
                                                    className="text-[var(--color-primary)] hover:text-[var(--color-primary)]/80 font-medium transition-colors duration-200 hover:bg-[var(--color-primary)]/10 p-2 rounded-md"
                                                    title="Gérer les suggestions de ce producteur"
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
                                                            d="M9 5l7 7-7 7"
                                                        />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
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
                ) : growers.length === 0 ? (
                    // État vide mobile
                    <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
                        Aucun producteur trouvé
                    </div>
                ) : (
                    // Données des producteurs mobile
                    growers.map((grower) => (
                        <div
                            key={grower.id + grower.email}
                            className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow duration-200"
                        >
                            <div className="flex items-start space-x-3 mb-4">
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center">
                                        <span className="text-[var(--color-primary)] font-semibold text-lg">🌱</span>
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-[var(--foreground)] truncate">{grower.name}</h3>
                                    <p className="text-sm text-[var(--muted-foreground)] truncate">{grower.email}</p>
                                    <button
                                        onClick={() => toggleIdExpansion(grower.id)}
                                        className="text-xs text-[var(--color-primary)] hover:text-[var(--color-primary)]/80 transition-colors duration-200"
                                        title="Cliquer pour voir l'ID complet"
                                    >
                                        {expandedIds.has(grower.id) ? `ID: ${grower.id}` : `ID: ${grower.id.slice(0, 8)}...`}
                                    </button>
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-[var(--muted-foreground)]">Téléphone:</span>
                                    <span className="text-sm text-[var(--foreground)]">{grower.phone || 'N/A'}</span>
                                </div>
                                
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-[var(--muted-foreground)]">En attente:</span>
                                    <div>{getStatusBadge('PENDING', grower.pendingCount) || <span className="text-sm text-gray-400">0</span>}</div>
                                </div>
                                
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-[var(--muted-foreground)]">Approuvées:</span>
                                    <div>{getStatusBadge('APPROVED', grower.approvedCount) || <span className="text-sm text-gray-400">0</span>}</div>
                                </div>
                                
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-[var(--muted-foreground)]">Rejetées:</span>
                                    <div>{getStatusBadge('REJECTED', grower.rejectedCount) || <span className="text-sm text-gray-400">0</span>}</div>
                                </div>
                                
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-[var(--muted-foreground)]">Total suggestions:</span>
                                    <span className="text-sm font-semibold text-[var(--color-primary)]">{grower.totalSuggestions}</span>
                                </div>
                                
                                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                    <span className="text-sm font-medium text-[var(--muted-foreground)]">Actions:</span>
                                    <div className="flex items-center gap-2">
                                        {onSelectGrower && (
                                            <button
                                                onClick={() => onSelectGrower(grower)}
                                                className="text-[var(--color-primary)] hover:text-[var(--color-primary)]/80 font-medium transition-colors duration-200 hover:bg-[var(--color-primary)]/10 p-2 rounded-md flex items-center gap-1"
                                                title="Gérer les suggestions de ce producteur"
                                            >
                                                <span className="text-sm">Gérer</span>
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
                                                        d="M9 5l7 7-7 7"
                                                    />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-end mt-4 text-sm text-[var(--muted-foreground)]">
                <span className="mr-4">
                    {7 * (currentPage - 1) + 1}-{Math.min(7 * currentPage, growers.length * totalPages)} de{' '}
                    {growers.length * totalPages}
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
        </div>
    );
};