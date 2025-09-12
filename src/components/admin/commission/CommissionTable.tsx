/* eslint-disable react/no-unescaped-entities */
import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { Prisma } from '@prisma/client';
import { Input } from '@/components/ui/Input';

interface GrowerCommissionData {
  id: string;
  name: string;
  email: string;
  profilePhoto: string | null;
  commissionRate: Prisma.Decimal | null;
  turnover: number;
  commissionAmount: number;
}

interface CommissionTableProps {
  growerData: GrowerCommissionData[];
  session: {
    commissionRate: Prisma.Decimal;
  };
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
  onTurnoverChange: (growerId: string, turnover: number) => void;
  onCommissionRateChange: (growerId: string, commissionRate: number | null) => void;
}

export const CommissionTable: React.FC<CommissionTableProps> = ({ 
  growerData, 
  session,
  currentPage, 
  totalPages, 
  onPageChange, 
  isLoading = false,
  onTurnoverChange,
  onCommissionRateChange
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

  const handleTurnoverInputChange = (growerId: string, value: string) => {
    const turnover = parseFloat(value) || 0;
    onTurnoverChange(growerId, turnover);
  };

  const handleCommissionRateInputChange = (growerId: string, value: string) => {
    const rate = value === '' ? null : parseFloat(value);
    onCommissionRateChange(growerId, rate);
  };

  return (
    <div className="bg-[var(--background)] p-6 rounded-xl">
      {/* Vue desktop - tableau */}
      <div className="hidden lg:block">
        <table className="w-full text-left text-[var(--foreground)] border-separate border-spacing-y-2 rounded-xl">
          <thead className="text-sm text-[var(--muted-foreground)]">
            <tr>
              <th className="py-2 w-20">ID</th>
              <th>Producteur</th>
              <th>Email</th>
              <th>Photo</th>
              <th>Chiffre d'affaires (€)</th>
              <th>Taux commission (%)</th>
              <th>Commission (€)</th>
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
                  <td className="py-4 px-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </td>
                  <td className="py-4 px-4 rounded-r-xl">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </td>
                </tr>
              ))
            ) : growerData.length === 0 ? (
              // État vide
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-500">
                  Aucun producteur trouvé
                </td>
              </tr>
            ) : (
              // Données des producteurs
              growerData.map((grower) => (
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
                    <Input
                      type="number"
                      value={grower.turnover.toString()}
                      onChange={(e) => handleTurnoverInputChange(grower.id, e.target.value)}
                      className="w-24 text-sm"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </td>
                  <td className="py-4 px-2">
                    <Input
                      type="number"
                      value={grower.commissionRate ? grower.commissionRate.toString() : ''}
                      onChange={(e) => handleCommissionRateInputChange(grower.id, e.target.value)}
                      className="w-20 text-sm"
                      placeholder={session.commissionRate.toString()}
                      step="0.01"
                      min="0"
                      max="100"
                    />
                  </td>
                  <td className="py-4 px-4 rounded-r-xl font-semibold text-green-600">
                    {grower.commissionAmount.toFixed(2)} €
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
        ) : growerData.length === 0 ? (
          // État vide mobile
          <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
            Aucun producteur trouvé
          </div>
        ) : (
          // Données des producteurs mobile
          growerData.map((grower) => (
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
                    {expandedIds.has(grower.id) ? `ID: ${grower.id}` : `ID: ${grower.id.slice(0, 8)}...`}
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-1">
                    Chiffre d'affaires (€)
                  </label>
                  <Input
                    type="number"
                    value={grower.turnover.toString()}
                    onChange={(e) => handleTurnoverInputChange(grower.id, e.target.value)}
                    className="w-full text-sm"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-1">
                    Taux commission (%) - Défaut: {session.commissionRate.toString()}%
                  </label>
                  <Input
                    type="number"
                    value={grower.commissionRate ? grower.commissionRate.toString() : ''}
                    onChange={(e) => handleCommissionRateInputChange(grower.id, e.target.value)}
                    className="w-full text-sm"
                    placeholder={session.commissionRate.toString()}
                    step="0.01"
                    min="0"
                    max="100"
                  />
                </div>
                
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-[var(--muted-foreground)]">Commission totale:</span>
                    <span className="text-lg font-bold text-green-600">{grower.commissionAmount.toFixed(2)} €</span>
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
          {7 * (currentPage - 1) + 1}-{Math.min(7 * currentPage, growerData.length * totalPages)} de {growerData.length * totalPages}
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