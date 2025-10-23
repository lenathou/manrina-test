import { useMutation, useQueryClient } from '@tanstack/react-query';

// Hook optimisé pour gérer la mutation de présence
export function useAttendanceMutation(sessionId: string | null) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (currentStatus: 'none' | 'planned' | 'cancelled') => {
            if (!sessionId) {
                throw new Error('Aucune session de marché disponible');
            }

            const method = currentStatus === 'planned' ? 'DELETE' : 'POST';
            const response = await fetch('/api/client/market-attendance', {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ marketSessionId: sessionId }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erreur lors de la mise à jour');
            }

            return response.json();
        },
        onSuccess: () => {
            // Invalider le cache du statut de présence pour cette session
            queryClient.invalidateQueries({ 
                queryKey: ['attendance-status', sessionId],
                refetchType: 'none'
            });
            
            // Refetch immédiatement pour mettre à jour l'UI
            queryClient.refetchQueries({ 
                queryKey: ['attendance-status', sessionId] 
            });
        },
        onError: (error) => {
            console.error('Erreur lors de la mise à jour de la présence:', error);
        },
        meta: {
            description: 'Mutation de présence optimisée',
        },
    });
}