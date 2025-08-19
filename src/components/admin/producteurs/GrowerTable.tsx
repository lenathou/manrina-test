/* eslint-disable react/no-unescaped-entities */
import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import type { IGrower } from '@/server/grower/IGrower';

interface GrowerTableProps {
  growers: IGrower[];
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
  onEdit: (grower: IGrower) => void;
  onDelete: (growerId: string) => void;
  isDeleting?: boolean;
}

export const GrowerTable: React.FC<GrowerTableProps> = ({ 
  growers, 
  currentPage, 
  totalPages, 
  onPageChange, 
  isLoading = false,
  onEdit,
  onDelete,
  isDeleting = false
}) => {
  const router = useRouter();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const handlePageChange = useCallback((page: number) => {
    if (onPageChange) {
      onPageChange(page);
    } else {
      router.push({ pathname: router.pathname, query: { ...router.query, page } }, undefined, {
        shallow: true,
      });
    }
  }, [router, onPageChange]);

  const toggleIdExpansion = (growerId: string) => {
    setExpandedIds(prev => {
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
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce producteur ?')) return;
    onDelete(growerId);
  };

  return (
    <div className="bg-[var(--background)] p-6 rounded-xl">
      <table className="w-full text-left text-[var(--foreground)] border-separate border-spacing-y-2 rounded-xl">
        <thead className="text-sm text-[var(--muted-foreground)]">
          <tr>
            <th className="py-2 w-20">ID</th>
            <th>Nom</th>
            <th>Email</th>
            <th>Photo de profil</th>
            <th>Date de création</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {isLoading ? (
            // État de chargement
            Array.from({ length: 5 }).map((_, index) => (
              <tr key={`loading-${index}`} className="bg-white rounded-xl shadow-sm overflow-hidden">
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
                <td className="py-4 px-4 rounded-r-xl">
                  <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                </td>
              </tr>
            ))
          ) : growers.length === 0 ? (
            // État vide
            <tr>
              <td colSpan={6} className="py-8 text-center text-gray-500">
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
                  {grower.createdAt ? new Date(grower.createdAt).toLocaleDateString('fr-FR') : 'N/A'}
                </td>
                <td className="py-4 px-4 rounded-r-xl">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onEdit(grower)}
                      className="text-[var(--color-primary)] hover:text-[var(--color-primary)]/80 font-medium transition-colors duration-200 hover:bg-[var(--color-primary)]/10 p-2 rounded-md"
                      title="Modifier ce producteur"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(grower.id)}
                      disabled={isDeleting}
                      className="text-red-600 hover:text-red-800 font-medium transition-colors duration-200 hover:bg-red-100 p-2 rounded-md disabled:opacity-50"
                      title="Supprimer ce producteur"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex items-center justify-end mt-4 text-sm text-[var(--muted-foreground)]">
        <span className="mr-4">
          {7 * (currentPage - 1) + 1}-{Math.min(7 * currentPage, growers.length * totalPages)} de {growers.length * totalPages}
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