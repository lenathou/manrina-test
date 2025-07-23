/* eslint-disable react/no-unescaped-entities */
import { withAdminLayout } from '@/components/layouts/AdminLayout';
import { ClientTable } from '@/components/admin/ClientTable';
import { IAdminTokenPayload } from '@/server/admin/IAdmin';
import { useClients } from '@/hooks/useClients';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';

function AdminClients({ }: { authenticatedAdmin: IAdminTokenPayload }) {
  const router = useRouter();
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



  // Utiliser le hook pour récupérer les clients depuis l'API
  const { 
    clients, 
    totalPages, 
    isLoading, 
    error 
  } = useClients({
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

  // Statistiques

  return (
    <div className="space-y-6">
      {/* En-tête de la page */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="font-secondary font-bold text-2xl sm:text-3xl text-[var(--color-secondary)] mb-4">
          Gestion des clients
        </h2>
        <p className="text-base sm:text-lg text-[var(--muted-foreground)]">
          Administrez les comptes clients, consultez leurs commandes et gérez leur statut.
        </p>
      </div>


      {/* Filtres et recherche */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher un client..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
              />
              <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            

          </div>
          
          <button className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg hover:bg-[var(--color-primary)]/90 transition-colors duration-200 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Ajouter un client
          </button>
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
        />
      )}
    </div>
  );
}

export default withAdminLayout(AdminClients);