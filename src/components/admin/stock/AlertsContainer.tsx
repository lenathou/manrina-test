import React from 'react';
import { GlobalStockValidationAlert } from './GlobalStockValidationAlert';
import { useAdminAlerts } from '@/components/alerts/hooks/useAdminAlerts';

interface AlertsContainerProps {
    /** Délai avant de commencer à charger les alertes (en ms) - OBSOLÈTE */
    delayMs?: number;
    /** Indique si les produits sont complètement chargés - OBSOLÈTE */
    productsLoaded?: boolean;
}

/**
 * Composant conteneur pour les alertes qui se charge de manière indépendante
 * Utilise maintenant le hook central useAdminAlerts pour une gestion simplifiée
 */
export function AlertsContainer({}: AlertsContainerProps) {
    // Hook central pour toutes les alertes admin
    const { hasPendingDeliveryUpdate, allowDisplay } = useAdminAlerts();

    // Ne rien afficher si l'affichage n'est pas autorisé ou s'il n'y a pas d'alertes
    if (!allowDisplay || !hasPendingDeliveryUpdate) {
        return null;
    }

    return <GlobalStockValidationAlert enabled={allowDisplay} />;
}
