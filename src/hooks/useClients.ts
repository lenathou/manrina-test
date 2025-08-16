import { useState, useEffect, useCallback } from 'react';
import { Client } from '@/components/admin/clients/ClientTable';

interface UseClientsParams {
    page?: number;
    limit?: number;
    search?: string;
}

interface UseClientsReturn {
    clients: Client[];
    total: number;
    totalPages: number;
    currentPage: number;
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
}

export function useClients({ page = 1, limit = 7, search = '' }: UseClientsParams = {}): UseClientsReturn {
    const [clients, setClients] = useState<Client[]>([]);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(page);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchClients = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                search: search,
            });

            const response = await fetch(`/api/admin/clients?${params}`);

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            const data = await response.json();

            setClients(data.clients);
            setTotal(data.total);
            setTotalPages(data.totalPages);
            setCurrentPage(data.currentPage);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
            console.error('Erreur lors de la récupération des clients:', err);
        } finally {
            setIsLoading(false);
        }
    }, [page, limit, search]);

    useEffect(() => {
        fetchClients();
    }, [page, limit, search, fetchClients]);

    return {
        clients,
        total,
        totalPages,
        currentPage,
        isLoading,
        error,
        refetch: fetchClients,
    };
}
