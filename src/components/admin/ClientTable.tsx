/* eslint-disable react/no-unescaped-entities */
import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { AllocateCreditModal } from './AllocateCreditModal';

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
}



export const ClientTable: React.FC<ClientTableProps> = ({ clients, currentPage, totalPages, onPageChange, isLoading = false }) => {
  const router = useRouter();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handlePageChange = useCallback((page: number) => {
    if (onPageChange) {
      onPageChange(page);
    } else {
      router.push({ pathname: router.pathname, query: { ...router.query, page } }, undefined, {
        shallow: true,
      });
    }
  }, [router, onPageChange]);

  const toggleIdExpansion = (clientId: string) => {
    setExpandedIds(prev => {
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

  return (
    <div className="bg-[var(--background)] p-6 rounded-xl">
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
            <th></th>
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
                  <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                </td>
              </tr>
            ))
          ) : clients.length === 0 ? (
            // État vide
            <tr>
              <td colSpan={8} className="py-8 text-center text-gray-500">
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
                <td className="py-4 px-2 font-semibold text-[var(--color-primary)]">{client.totalSpent}</td>
                <td className="py-4 px-4 rounded-r-xl">
                  <button
                    onClick={() => handleAllocateCredit(client)}
                    className="text-[var(--color-primary)] hover:text-[var(--color-primary)]/80 font-medium transition-colors duration-200 hover:bg-[var(--color-primary)]/10 p-2 rounded-md"
                    title="Allouer un crédit à ce client"
                  >
                    ➔
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex items-center justify-end mt-4 text-sm text-[var(--muted-foreground)]">
        <span className="mr-4">
          {7 * (currentPage - 1) + 1}-{Math.min(7 * currentPage, clients.length * totalPages)} de {clients.length * totalPages}
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
    </div>
  );
};