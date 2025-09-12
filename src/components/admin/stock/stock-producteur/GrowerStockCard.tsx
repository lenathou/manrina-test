import { ReactNode } from 'react';
// Removed Decimal import - using number instead
import { IGrowerStockInfo } from '@/server/grower/GrowerStockService';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { formatDateTimeShort } from '@/utils/dateUtils';

interface GrowerStockCardProps {
    growerStock: IGrowerStockInfo;
    onEdit: () => void;
    children?: ReactNode;
    productBaseUnitSymbol?: string | null;
}

function GrowerStockCard({ growerStock, onEdit, children, productBaseUnitSymbol }: GrowerStockCardProps) {
    return (
        <div className=" border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                    <Text variant="h5" className="font-semibold text-gray-900 mb-1">
                        {growerStock.growerName}
                    </Text>
                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <Text variant="body" className="text-gray-600">
                                Stock disponible:
                            </Text>
                            <Text 
                                variant="body" 
                                className={`font-medium ${
                                    growerStock.stock > 0 
                                        ? 'text-green-600' 
                                        : 'text-red-600'
                                }`}
                            >
                                {growerStock.stock} {productBaseUnitSymbol || 'unités'}
                            </Text>
                        </div>
                        {growerStock.lastUpdated && (
                            <Text variant="small" className="text-gray-500">
                                Mis à jour le {formatDateTimeShort(growerStock.lastUpdated)}
                            </Text>
                        )}
                    </div>
                </div>
            </div>
            
            <div className="flex justify-end">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onEdit}
                    className="flex items-center gap-2"
                >
                    ✏️ Modifier le stock
                </Button>
            </div>
            
            {children}
        </div>
    );
}

export default GrowerStockCard;