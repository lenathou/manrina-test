import { usePendingStockValidationCount } from '@/hooks/usePendingStockValidationCount';
import { usePendingMarketSessionsCount } from '@/hooks/usePendingMarketSessionsCount';
import { usePendingGrowerApplicationsCount } from '@/hooks/usePendingGrowerApplicationsCount';
import { useNewClientsCount } from '@/hooks/useNewClientsCount';

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

    // Hook pour les candidatures de producteurs en attente
    const {
        data: pendingApplicationsCount = 0,
        isLoading: isLoadingApplications,
        error: applicationsError,
    } = usePendingGrowerApplicationsCount();

    // Hook pour les nouveaux clients
    const {
        unviewedClientsCount = 0,
        isLoading: isLoadingNewClients,
        error: newClientsError,
    } = useNewClientsCount();

    // Logique dérivée pour déterminer s'il y a des alertes à afficher
    const hasPendingDeliveryUpdate = pendingStockCount > 0;
    const hasPendingApplications = pendingApplicationsCount > 0;
    const hasNewClients = unviewedClientsCount > 0;
    const isLoading = isLoadingStock || isLoadingMarket || isLoadingApplications || isLoadingNewClients;
    const error = stockError || marketError || applicationsError || newClientsError;
    
    // Permet l'affichage des alertes (toujours true car plus de dépendance au chargement des produits)
    const allowDisplay = true;

    return {
        // Compteurs (pendingStockCount = nombre de producteurs ayant des demandes en attente)
        pendingStockCount,
        pendingMarketCount,
        pendingApplicationsCount,
        newClientsCount: unviewedClientsCount, // Utilise unviewedClientsCount mais garde le même nom pour la compatibilité
        
        // Indicateurs booléens pour l'affichage conditionnel
        hasPendingDeliveryUpdate,
        hasPendingMarketSubmission,
        hasPendingApplications,
        hasNewClients,
        
        // États de chargement et d'erreur
        isLoading,
        error,
        
        // Autorisation d'affichage (découplé du chargement des produits)
        allowDisplay,
    };
}