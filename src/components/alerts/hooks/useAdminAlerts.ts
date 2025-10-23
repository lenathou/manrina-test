import { usePendingStockValidationCount } from '@/hooks/usePendingStockValidationCount';
import { usePendingMarketSessionsCount } from '@/hooks/usePendingMarketSessionsCount';

/**
 * Hook central pour gérer toutes les alertes admin
 * Regroupe les différents types d'alertes et fournit une interface unifiée
 */
export function useAdminAlerts() {
    // Hook pour les validations de stock en attente (compte les producteurs uniques)
    const {
        data: pendingStockCount = 0,
        isLoading: isLoadingStock,
        error: stockError,
    } = usePendingStockValidationCount();

    // Hook pour les sessions de marché en attente
    const {
        pendingCount: pendingMarketCount = 0,
        isLoading: isLoadingMarket,
        error: marketError,
        hasPendingRequests: hasPendingMarketSubmission,
    } = usePendingMarketSessionsCount();

    // Logique dérivée pour déterminer s'il y a des alertes à afficher
    const hasPendingDeliveryUpdate = pendingStockCount > 0;
    const isLoading = isLoadingStock || isLoadingMarket;
    const error = stockError || marketError;
    
    // Permet l'affichage des alertes (toujours true car plus de dépendance au chargement des produits)
    const allowDisplay = true;

    return {
        // Compteurs (pendingStockCount = nombre de producteurs ayant des demandes en attente)
        pendingStockCount,
        pendingMarketCount,
        
        // Indicateurs booléens pour l'affichage conditionnel
        hasPendingDeliveryUpdate,
        hasPendingMarketSubmission,
        
        // États de chargement et d'erreur
        isLoading,
        error,
        
        // Autorisation d'affichage (découplé du chargement des produits)
        allowDisplay,
    };
}