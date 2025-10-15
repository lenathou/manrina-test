import React from 'react';
import Link from 'next/link';
import { useAdminAlerts } from './useAdminAlerts';

interface MarketAlertsBannerProps {
    /** Classe CSS personnalisée pour le conteneur */
    className?: string;
}

/**
 * Bannière d'alertes pour les pages marché
 * Affiche les alertes liées aux sessions de marché en attente de validation
 */
export function MarketAlertsBanner({ className = '' }: MarketAlertsBannerProps) {
    const { hasPendingMarketSubmission, pendingMarketCount, allowDisplay } = useAdminAlerts();

    // Ne rien afficher si l'affichage n'est pas autorisé ou s'il n'y a pas d'alertes
    if (!allowDisplay || !hasPendingMarketSubmission) {
        return null;
    }

    return (
        <div className={`bg-orange-50 border-l-4 border-orange-400 p-4 mb-6 ${className}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                        <svg
                            className="h-5 w-5 text-orange-400"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-orange-700">
                            <span className="font-medium">
                                {pendingMarketCount} session{pendingMarketCount > 1 ? 's' : ''} de marché
                            </span>{' '}
                            {pendingMarketCount > 1 ? 'nécessitent' : 'nécessite'} votre attention.
                        </p>
                    </div>
                </div>
                <div className="flex-shrink-0">
                    <Link
                        href="/admin/gestion-marche"
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-orange-700 bg-orange-100 hover:bg-orange-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors duration-200"
                    >
                        Voir les sessions
                        <svg
                            className="ml-2 -mr-0.5 h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </Link>
                </div>
            </div>
        </div>
    );
}