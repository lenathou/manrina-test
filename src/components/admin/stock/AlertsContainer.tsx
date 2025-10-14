import React, { useEffect, useState } from 'react';
import { GlobalStockValidationAlert } from './GlobalStockValidationAlert';
import { usePendingStockValidationCount } from '@/hooks/usePendingStockValidationCount';

interface AlertsContainerProps {
    /** Délai avant de commencer à charger les alertes (en ms) */
    delayMs?: number;
    /** Indique si les produits sont complètement chargés */
    productsLoaded?: boolean;
}

/**
 * Composant conteneur pour les alertes qui se charge de manière indépendante
 * Permet de séparer le chargement des alertes du chargement des produits
 */
export function AlertsContainer({ delayMs = 10000, productsLoaded = false }: AlertsContainerProps) {
    const [shouldLoadAlerts, setShouldLoadAlerts] = useState(false);

    // Délai avant de commencer à charger les alertes, mais seulement après que les produits soient chargés
    useEffect(() => {
        if (!productsLoaded) {
            setShouldLoadAlerts(false);
            return;
        }

        const timer = setTimeout(() => {
            setShouldLoadAlerts(true);
        }, delayMs);

        return () => clearTimeout(timer);
    }, [delayMs, productsLoaded]);

    // Hook pour récupérer le nombre de demandes en attente de validation
    // Ne se déclenche qu'après le délai pour éviter l'interférence avec le chargement des produits
    const { data: pendingCount = 0 } = usePendingStockValidationCount({
        enabled: shouldLoadAlerts,
    });

    const hasPendingRequests = pendingCount > 0;

    // Ne rien afficher si les alertes ne sont pas encore chargées ou s'il n'y a pas d'alertes
    if (!shouldLoadAlerts || !hasPendingRequests) {
        return null;
    }

    return <GlobalStockValidationAlert enabled={shouldLoadAlerts} />;
}