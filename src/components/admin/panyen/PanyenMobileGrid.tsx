import React from 'react';
import { IPanyenProduct } from '@/server/panyen/IPanyen';
import PanyenCard from './PanyenCard';

interface PanyenMobileGridProps {
    panyens: IPanyenProduct[];
    onEdit: (panyen: IPanyenProduct) => void;
    onDelete: (id: string) => void;
    deletingIds: Set<string>;
    availabilityById?: Record<string, { stock: number; blockingProducts: string[]; isAvailable: boolean }>;
    isLoadingStock: boolean;
    isUpdatingVisibility: boolean;
}

const PanyenMobileGrid: React.FC<PanyenMobileGridProps> = ({
    panyens,
    onEdit,
    onDelete,
    deletingIds,
    availabilityById,
    isLoadingStock,
    isUpdatingVisibility,
}) => {
    return (
        <div className="md:hidden">
            {/* Scroll horizontal pour mobile */}
            <div className="overflow-x-auto pb-4">
                <div
                    className="flex space-x-4 px-4"
                    style={{ width: 'max-content' }}
                >
                    {panyens.map((panyen) => (
                        <div
                            key={panyen.id}
                            className="flex-shrink-0 w-80"
                        >
                            <PanyenCard
                                panyen={panyen}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                isDeleting={deletingIds.has(panyen.id)}
                                availability={availabilityById?.[panyen.id]}
                                isLoadingStock={isLoadingStock}
                                isUpdatingVisibility={isUpdatingVisibility}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Indicateur de scroll si necessaire */}
            {panyens.length > 1 && (
                <div className="flex justify-center mt-2">
                    <div className="flex space-x-1">
                        {panyens.map((_, index) => (
                            <div
                                key={index}
                                className="w-2 h-2 rounded-full bg-gray-300"
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Message d'aide pour le scroll */}
            {panyens.length > 1 && (
                <p className="text-center text-sm text-gray-500 mt-2">
                    Faites glisser horizontalement pour voir plus de panyens
                </p>
            )}
        </div>
    );
};

export default PanyenMobileGrid;
