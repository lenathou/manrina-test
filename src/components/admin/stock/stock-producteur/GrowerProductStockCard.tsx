import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { IGrowerProductStockInfo } from '@/server/grower/ProductStockService';
import { formatDateTimeShort } from '@/utils/dateUtils';
import Image from 'next/image';

interface GrowerProductStockCardProps {
    growerStock: IGrowerProductStockInfo;
    productBaseUnitSymbol?: string | null;
    onEdit: () => void;
}

function GrowerProductStockCard({ growerStock, productBaseUnitSymbol, onEdit }: GrowerProductStockCardProps) {

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                        {growerStock.growerAvatar ? (
                            <Image
                                src={growerStock.growerAvatar}
                                alt={growerStock.growerName}
                                width={40}
                                height={40}
                                className="w-10 h-10 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <Text
                                    variant="small"
                                    className="text-gray-600 font-medium"
                                >
                                    {growerStock.growerName.charAt(0).toUpperCase()}
                                </Text>
                            </div>
                        )}
                        <div>
                            <Text
                                variant="body"
                                className="font-medium text-gray-900"
                            >
                                {growerStock.growerName}
                            </Text>
                            <Text
                                variant="small"
                                className="text-gray-500"
                            >
                                Producteur
                            </Text>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onEdit}
                        className="text-xs"
                    >
                        Modifier
                    </Button>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <Text
                            variant="small"
                            className="text-gray-600"
                        >
                            Stock total:
                        </Text>
                        <Text
                            variant="body"
                            className="font-semibold text-green-600"
                        >
                            {growerStock.stock} {productBaseUnitSymbol || 'unités'}
                        </Text>
                    </div>

                    <div className="flex justify-between items-center">
                        <Text
                            variant="small"
                            className="text-gray-600"
                        >
                            Dernière mise à jour:
                        </Text>
                        <Text
                            variant="small"
                            className="text-gray-500"
                        >
                            {growerStock.lastUpdated ? formatDateTimeShort(growerStock.lastUpdated) : 'Non défini'}
                        </Text>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default GrowerProductStockCard;
