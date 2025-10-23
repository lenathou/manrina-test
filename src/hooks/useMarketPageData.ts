import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { PublicExhibitor } from '@/types/market';

// Types pour les annonces
interface MarketAnnouncement {
    id: string;
    title: string;
    content: string;
    publishedAt: Date;
    priority: 'low' | 'medium' | 'high';
}

interface MarketAnnouncementFromAPI {
    id: string;
    title: string;
    content: string;
    publishedAt: string;
    priority: 'low' | 'medium' | 'high';
}

// Hook optimisé pour récupérer les exposants d'une session
export function useSessionExhibitors(sessionId: string | null, enabled = true) {
    return useQuery({
        queryKey: ['session-exhibitors', sessionId],
        queryFn: async (): Promise<PublicExhibitor[]> => {
            if (!sessionId) return [];
            
            const response = await fetch(`/api/market/sessions/${sessionId}/exhibitors`);
            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des exposants');
            }
            return response.json();
        },
        staleTime: 10 * 60 * 1000, // 10 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchInterval: false,
        enabled: enabled && !!sessionId,
        meta: {
            priority: 'medium',
            description: 'Exposants de session avec cache optimisé',
        },
    });
}

// Hook optimisé pour récupérer les annonces du marché
export function useMarketAnnouncements(enabled = true) {
    return useQuery({
        queryKey: ['market-announcements'],
        queryFn: async (): Promise<MarketAnnouncement[]> => {
            const response = await fetch('/api/market/announcements');
            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des annonces');
            }
            
            const data: MarketAnnouncementFromAPI[] = await response.json();
            // Convertir les dates string en objets Date
            return data.map((announcement: MarketAnnouncementFromAPI) => ({
                ...announcement,
                publishedAt: new Date(announcement.publishedAt),
            }));
        },
        staleTime: 15 * 60 * 1000, // 15 minutes (les annonces changent rarement)
        gcTime: 60 * 60 * 1000, // 1 heure
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchInterval: false,
        enabled,
        meta: {
            priority: 'low',
            description: 'Annonces de marché avec cache optimisé',
        },
    });
}

// Hook optimisé pour vérifier le statut de présence
export function useAttendanceStatus(sessionId: string | null, role: string | null, enabled = true) {
    return useQuery({
        queryKey: ['attendance-status', sessionId],
        queryFn: async (): Promise<'none' | 'planned' | 'cancelled'> => {
            if (!sessionId) return 'none';
            
            const response = await fetch(`/api/client/market-attendance?marketSessionId=${sessionId}`, {
                credentials: 'include',
            });
            
            if (!response.ok) {
                return 'none';
            }
            
            const data = await response.json();
            if (data.attendance) {
                return data.attendance.status === 'PLANNED' ? 'planned' : 'cancelled';
            }
            return 'none';
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 15 * 60 * 1000, // 15 minutes
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        enabled: enabled && !!sessionId && role === 'client',
        meta: {
            priority: 'medium',
            description: 'Statut de présence avec cache optimisé',
        },
    });
}

// Hook combiné pour toutes les données de la page marché
export function useMarketPageData(sessionId: string | null, role: string | null) {
    const exhibitorsQuery = useSessionExhibitors(sessionId);
    const announcementsQuery = useMarketAnnouncements();
    const attendanceQuery = useAttendanceStatus(sessionId, role);

    const isLoading = useMemo(() => {
        return exhibitorsQuery.isLoading || announcementsQuery.isLoading || 
               (role === 'client' && attendanceQuery.isLoading);
    }, [exhibitorsQuery.isLoading, announcementsQuery.isLoading, attendanceQuery.isLoading, role]);

    const hasError = useMemo(() => {
        return exhibitorsQuery.error || announcementsQuery.error || attendanceQuery.error;
    }, [exhibitorsQuery.error, announcementsQuery.error, attendanceQuery.error]);

    return {
        exhibitors: exhibitorsQuery.data || [],
        announcements: announcementsQuery.data || [],
        attendanceStatus: attendanceQuery.data || 'none',
        isLoading,
        hasError,
        refetch: () => {
            exhibitorsQuery.refetch();
            announcementsQuery.refetch();
            if (role === 'client') {
                attendanceQuery.refetch();
            }
        },
    };
}