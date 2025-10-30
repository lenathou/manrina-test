import React from 'react';
import { Button } from '@/components/ui/Button';
import { AppImage } from '@/components/Image';
import { PanyenShowInStoreBadge } from '@/components/admin/PanyenShowInStoreBadge';
import { IPanyenProduct } from '@/server/panyen/IPanyen';
import { htmlToPlainText } from '@/utils/text';

interface PanyenCardProps {
    panyen: IPanyenProduct;
    onEdit: (panyen: IPanyenProduct) => void;
    onDelete: (id: string) => void;
    isDeleting?: boolean;
    availability?: {
        stock: number;
        blockingProducts: string[];
        isAvailable: boolean;
    };
    isLoadingStock?: boolean;
    isUpdatingVisibility?: boolean;
}

const PanyenCard: React.FC<PanyenCardProps> = ({
    panyen,
    onEdit,
    onDelete,
    isDeleting = false,
    availability,
    isLoadingStock = false,
    isUpdatingVisibility = false,
}) => {
    const handleEdit = () => {
        onEdit(panyen);
    };

    const handleDelete = () => {
        if (window.confirm(`Etes-vous sur de vouloir supprimer le panyen "${panyen.name}" ?`)) {
            onDelete(panyen.id);
        }
    };

    const stockAvailable = availability?.stock ?? 0;
    const blockingProducts = availability?.blockingProducts ?? [];
    const hasMoreBlocking = blockingProducts.length > 2;
    const blockingSummary = blockingProducts.slice(0, 3).join(', ');
    const summaryForReason = blockingProducts.slice(0, 2).join(', ');
    const isOutOfStock = availability ? !availability.isAvailable : false;
    const toggleDisabled = isLoadingStock || isUpdatingVisibility;
    const plainDescription = htmlToPlainText(panyen.description || '');
    const ellipsis = hasMoreBlocking ? '...' : '';

    const badgeReason = isOutOfStock
        ? blockingProducts.length > 0
            ? 'Stock indisponible: ' + summaryForReason + ellipsis
            : 'Stock indisponible'
        : undefined;

    const statusMessage = isLoadingStock
        ? 'Analyse du stock global...'
        : availability
          ? isOutOfStock
              ? blockingProducts.length > 0
                  ? 'Rupture: ' + blockingSummary + ellipsis
                  : 'Rupture: stock indisponible'
              : stockAvailable + ' panier' + (stockAvailable > 1 ? 's' : '') + ' disponibles'
          : null;

    const statusClass = isLoadingStock ? 'text-gray-500' : isOutOfStock ? 'text-red-600' : 'text-emerald-600';

    return (
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div className="relative h-48 bg-gray-100">
                {panyen.imageUrl ? (
                    <AppImage
                        source={panyen.imageUrl}
                        alt={panyen.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <span className="text-gray-400 text-2xl">PANIER</span>
                    </div>
                )}
                <div className="absolute top-3 right-3">
                    <PanyenShowInStoreBadge
                        panyen={panyen}
                        forcedHidden={isOutOfStock && panyen.showInStore}
                        hasStockIssues={isOutOfStock}
                        disabled={toggleDisabled}
                        reason={badgeReason}
                        blockingProducts={blockingProducts}
                    />
                </div>
            </div>

            <div className="p-6">
                <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{panyen.name}</h3>
                    {plainDescription && <p className="text-gray-600 text-sm line-clamp-3 mb-3">{plainDescription}</p>}
                    <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-primary">{panyen.price.toFixed(2)}€</span>
                        <span className="text-sm text-gray-500">
                            {panyen.components?.length || 0} produit{(panyen.components?.length || 0) > 1 ? 's' : ''}
                        </span>
                    </div>
                    {statusMessage && <div className={`mt-3 text-sm font-medium ${statusClass}`}>{statusMessage}</div>}
                </div>

                {panyen.components && panyen.components.length > 0 && (
                    <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Contenu :</h4>
                        <div className="space-y-1">
                            {panyen.components.slice(0, 3).map((component) => (
                                <div
                                    key={component.id}
                                    className="flex items-center justify-between text-xs text-gray-600"
                                >
                                    <span className="truncate">
                                        {component.product?.name} ({component.productVariant?.optionValue})
                                    </span>
                                    <span className="ml-2 font-medium">x{component.quantity}</span>
                                </div>
                            ))}
                            {panyen.components.length > 3 && (
                                <div className="text-xs text-gray-500 italic">
                                    +{panyen.components.length - 3} autre{panyen.components.length - 3 > 1 ? 's' : ''}{' '}
                                    produit{panyen.components.length - 3 > 1 ? 's' : ''}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className="flex gap-2">
                    <Button
                        onClick={handleEdit}
                        variant="secondary"
                        size="sm"
                        className="flex-1"
                    >
                        Modifier
                    </Button>
                    <Button
                        onClick={handleDelete}
                        variant="danger"
                        size="sm"
                        className="flex-1"
                        disabled={isDeleting}
                    >
                        {isDeleting ? 'Suppression...' : 'Supprimer'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default PanyenCard;
