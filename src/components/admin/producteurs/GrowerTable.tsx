/* eslint-disable react/no-unescaped-entities */
import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import type { IGrower } from '@/server/grower/IGrower';
import { formatDateLong } from '@/utils/dateUtils';
import { ActionDropdown } from '@/components/ui/ActionDropdown';

interface GrowerTableProps {
    growers: IGrower[];
    currentPage: number;
    totalPages: number;
    onPageChange?: (page: number) => void;
    isLoading?: boolean;
    onEdit: (grower: IGrower) => void;
    onDelete: (growerId: string) => void;
    isDeleting?: boolean;
    onApprove?: (growerId: string, approved: boolean) => void;
    isApproving?: boolean;
}

export const GrowerTable: React.FC<GrowerTableProps> = ({
    growers,
    currentPage,
    totalPages,
    onPageChange,
    isLoading = false,
    onEdit,
    onDelete,
    isDeleting = false,
    onApprove,
    isApproving = false,
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

    const handleDelete = (growerId: string) => {
        onDelete(growerId);
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
                            <th>Photo de profil</th>
                            <th>Statut</th>
                            <th>Date de création</th>
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
                        ) : growers.length === 0 ? (
                            // État vide
                            <tr>
                                <td
                                    colSpan={7}
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
                                            {expandedIds.has(grower.id)
                                                ? `#${grower.id}`
                                                : `#${grower.id.slice(0, 6)}...`}
                                        </button>
                                    </td>
                                    <td className="py-4 px-2 font-semibold">
                                        <div className="flex items-center gap-2">
                                            <span>{grower.name}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-2">{grower.email}</td>
                                    <td className="py-4 px-2">
                                        {grower.profilePhoto ? (
                                            <Image
                                                src={grower.profilePhoto}
                                                alt={grower.name}
                                                width={32}
                                                height={32}
                                                className="w-8 h-8 rounded-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-gray-400">Aucune</span>
                                        )}
                                    </td>
                                    <td className="py-4 px-2">
                                        <div className="flex items-center space-x-2">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    grower.approved
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-yellow-100 text-yellow-800 badge-pending-shimmer'
                                                }`}
                                            >
                                                {grower.approved ? 'Approuvé' : 'En attente'}
                                            </span>
                                            {onApprove && (
                                                <button
                                                    onClick={() => onApprove(grower.id, !grower.approved)}
                                                    disabled={isApproving}
                                                    className={`px-2 py-1 rounded text-xs font-medium transition-colors duration-200 disabled:opacity-50 ${
                                                        grower.approved
                                                            ? 'bg-red-100 text-red-800 hover:bg-red-200'
                                                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                                                    }`}
                                                    title={grower.approved ? 'Désapprouver' : 'Approuver'}
                                                >
                                                    {grower.approved ? 'Désapprouver' : 'Approuver'}
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-4 px-2">
                                        {grower.createdAt ? formatDateLong(grower.createdAt) : 'N/A'}
                                    </td>
                                    <td className="py-4 px-4 rounded-r-xl">
                                        <ActionDropdown
                                            placeholder="Actions"
                                            actions={[
                                                {
                                                    id: 'view',
                                                    label: 'Voir les détails',
                                                    onClick: () => router.push(`/admin/producteurs/${grower.id}`),
                                                },
                                                {
                                                    id: 'edit',
                                                    label: 'Modifier',
                                                    onClick: () => onEdit(grower),
                                                },
                                                {
                                                    id: 'delete',
                                                    label: 'Supprimer',
                                                    onClick: () => handleDelete(grower.id),
                                                    disabled: isDeleting,
                                                    className: 'text-red-600 hover:text-red-800 hover:bg-red-50',
                                                },
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
                        <div
                            key={`loading-mobile-${index}`}
                            className="bg-white rounded-xl shadow-sm p-4"
                        >
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
                                    {grower.profilePhoto ? (
                                        <Image
                                            src={grower.profilePhoto}
                                            alt={grower.name}
                                            width={48}
                                            height={48}
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                                            <span className="text-gray-400 text-xs">👤</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-[var(--foreground)] truncate">{grower.name}</h3>
                                    <p className="text-sm text-[var(--muted-foreground)] truncate">{grower.email}</p>
                                    <button
                                        onClick={() => toggleIdExpansion(grower.id)}
                                        className="text-xs text-[var(--color-primary)] hover:text-[var(--color-primary)]/80 transition-colors duration-200"
                                        title="Cliquer pour voir l'ID complet"
                                    >
                                        {expandedIds.has(grower.id)
                                            ? `ID: ${grower.id}`
                                            : `ID: ${grower.id.slice(0, 8)}...`}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-[var(--muted-foreground)]">Statut:</span>
                                    <div className="flex items-center space-x-2">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                grower.approved
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-yellow-100 text-yellow-800 badge-pending-shimmer'
                                            }`}
                                        >
                                            {grower.approved ? 'Approuvé' : 'En attente'}
                                        </span>
                                        {onApprove && (
                                            <button
                                                onClick={() => onApprove(grower.id, !grower.approved)}
                                                disabled={isApproving}
                                                className={`px-2 py-1 rounded text-xs font-medium transition-colors duration-200 disabled:opacity-50 ${
                                                    grower.approved
                                                        ? 'bg-red-100 text-red-800 hover:bg-red-200'
                                                        : 'bg-green-100 text-green-800 hover:bg-green-200'
                                                }`}
                                                title={grower.approved ? 'Désapprouver' : 'Approuver'}
                                            >
                                                {grower.approved ? 'Désapprouver' : 'Approuver'}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-[var(--muted-foreground)]">
                                        Date de création:
                                    </span>
                                    <span className="text-sm text-[var(--foreground)]">
                                        {grower.createdAt ? formatDateLong(grower.createdAt) : 'N/A'}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                    <span className="text-sm font-medium text-[var(--muted-foreground)]">Actions:</span>
                                    <ActionDropdown
                                        placeholder="Actions"
                                        actions={[
                                            {
                                                id: 'view',
                                                label: 'Voir les détails',
                                                onClick: () => router.push(`/admin/producteurs/${grower.id}`),
                                            },
                                            {
                                                id: 'edit',
                                                label: 'Modifier',
                                                onClick: () => onEdit(grower),
                                            },
                                            {
                                                id: 'delete',
                                                label: 'Supprimer',
                                                onClick: () => handleDelete(grower.id),
                                                disabled: isDeleting,
                                                className: 'text-red-600 hover:text-red-800 hover:bg-red-50',
                                            },
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
