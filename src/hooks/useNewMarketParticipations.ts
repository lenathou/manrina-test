import { useState, useEffect } from 'react';
import { backendFetchService } from '@/service/BackendFetchService';

export interface UseNewMarketParticipationsResult {
    growersWithNewMarketParticipations: string[];
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
}

export function useNewMarketParticipations(sessionId: string | null): UseNewMarketParticipationsResult {
    const [growersWithNewMarketParticipations, setGrowersWithNewMarketParticipations] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchNewMarketParticipations = async () => {
        if (!sessionId) {
            setGrowersWithNewMarketParticipations([]);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const growerIds = await backendFetchService.getGrowersWithNewMarketParticipations(sessionId);
            setGrowersWithNewMarketParticipations(growerIds);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur lors de la récupération des nouvelles participations au marché');
            setGrowersWithNewMarketParticipations([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNewMarketParticipations();
    }, [sessionId]);

    const refetch = () => {
        fetchNewMarketParticipations();
    };

    return {
        growersWithNewMarketParticipations,
        isLoading,
        error,
        refetch
    };
}