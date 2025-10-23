import React from 'react';
import Link from 'next/link';
import { usePendingOrdersCount } from '@/hooks/usePendingOrdersCount';

interface PendingOrdersAlertProps {
    growerId: string;
}

const PendingOrdersAlert: React.FC<PendingOrdersAlertProps> = ({ growerId }) => {
    const { data: count, isLoading, error } = usePendingOrdersCount(growerId);

    if (isLoading || error || !count || count === 0) {
        return null;
    }

    return (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
                <div className="flex-shrink-0">
                    <svg
                        className="h-5 w-5 text-orange-400"
                        xmlns="http://www.w3.org/2000/svg"
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
                <div className="ml-3 flex-1">
                    <h3 className="text-sm font-medium text-orange-800">
                        Commandes en attente
                    </h3>
                    <div className="mt-2 text-sm text-orange-700">
                        <p>
                            Vous avez {count} commande{count > 1 ? 's' : ''} en attente de traitement.
                        </p>
                    </div>
                    <div className="mt-4">
                        <div className="-mx-2 -my-1.5 flex">
                            <Link
                                href="/producteur/commandes"
                                className="bg-orange-50 px-2 py-1.5 rounded-md text-sm font-medium text-orange-800 hover:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-orange-50 focus:ring-orange-600"
                            >
                                Voir les commandes
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PendingOrdersAlert;