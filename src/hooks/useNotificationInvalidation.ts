import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

/**
 * Hook utilitaire pour invalider automatiquement les queries de notification
 * Permet aux notifications de disparaître immédiatement après les actions
 */
export function useNotificationInvalidation() {
    const queryClient = useQueryClient();

    // Invalider les notifications de stock
    const invalidateStockNotifications = useCallback(() => {
        queryClient.invalidateQueries({
            queryKey: ['pending-stock-validation-count'],
        });
    }, [queryClient]);

    // Invalider les notifications de marché
    const invalidateMarketNotifications = useCallback(() => {
        queryClient.invalidateQueries({
            queryKey: ['pending-market-sessions-count'],
        });
    }, [queryClient]);

    // Invalider toutes les notifications
    const invalidateAllNotifications = useCallback(() => {
        invalidateStockNotifications();
        invalidateMarketNotifications();
    }, [invalidateStockNotifications, invalidateMarketNotifications]);

    // Forcer le refetch immédiat des notifications
    const refetchNotifications = useCallback(async () => {
        await Promise.all([
            queryClient.refetchQueries({
                queryKey: ['pending-stock-validation-count'],
            }),
            queryClient.refetchQueries({
                queryKey: ['pending-market-sessions-count'],
            }),
        ]);
    }, [queryClient]);

    return {
        invalidateStockNotifications,
        invalidateMarketNotifications,
        invalidateAllNotifications,
        refetchNotifications,
    };
}