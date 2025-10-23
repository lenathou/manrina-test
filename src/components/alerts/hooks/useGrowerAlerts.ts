import { usePendingOrdersCount } from '@/hooks/usePendingOrdersCount';
import { useStockValidationResponsesCount } from '@/hooks/useStockValidationResponsesCount';

/**
 * Hook central pour gérer toutes les alertes des producteurs
 * Suit le même pattern que useAdminAlerts pour la cohérence
 */
export const useGrowerAlerts = (growerId: string) => {
  // Hooks spécialisés pour chaque type d'alerte
  const { data: pendingOrdersCount = 0 } = usePendingOrdersCount(growerId);
  const { data: stockValidationResponsesCount = 0 } = useStockValidationResponsesCount(growerId);

  // Calculs dérivés pour l'affichage conditionnel
  const hasPendingOrders = pendingOrdersCount > 0;
  const hasStockValidationResponses = stockValidationResponsesCount > 0;
  const hasAnyAlert = hasPendingOrders || hasStockValidationResponses;

  return {
    // Compteurs bruts
    pendingOrdersCount,
    stockValidationResponsesCount,
    
    // États dérivés pour l'affichage conditionnel
    hasPendingOrders,
    hasStockValidationResponses,
    hasAnyAlert,
    
    // Total des alertes (pour un badge global si nécessaire)
    totalAlertsCount: pendingOrdersCount + stockValidationResponsesCount,
  };
};