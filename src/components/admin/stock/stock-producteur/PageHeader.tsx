import { useRouter } from 'next/router';
// Removed Decimal import - using number instead
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
interface PageHeaderProps {
    product: {
        id: string;
        name: string;
        baseUnit?: {
            symbol: string;
        } | null;
    };
    onAdjustGlobalStock?: () => void;
}

function PageHeader({ product, onAdjustGlobalStock }: PageHeaderProps) {
    const router = useRouter();

    const handleGoBack = () => {
        router.push('/admin/stock');
    };

    // Ces statistiques seront calculées côté serveur si nécessaire
    // Pour l'instant, on affiche juste le nom du produit

    return (
        <div className="mb-8">
            {/* Navigation */}
            <div className="mb-6">
                <div className="flex gap-3">
                    <Button
                        variant="ghost"
                        onClick={handleGoBack}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 p-0"
                    >
                        ← Retour à la gestion du stock
                    </Button>
                    {onAdjustGlobalStock && (
                        <Button
                            variant="primary"
                            onClick={onAdjustGlobalStock}
                            className="flex items-center gap-2"
                        >
                            Ajuster stock global
                        </Button>
                    )}
                </div>
            </div>

            {/* En-tête du produit */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <Text
                            variant="h4"
                            className="font-bold text-gray-900 mb-2"
                        >
                            Gestion du stock par producteur
                        </Text>
                        <Text
                            variant="h5"
                            className="text-gray-700 mb-1"
                        >
                            {product.name}
                        </Text>
                        <Text
                            variant="body"
                            className="text-gray-600"
                        >
                            Gérez le stock de chaque producteur pour ce produit
                        </Text>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                            <Text
                                variant="h5"
                                className="font-semibold text-blue-900"
                            >
                                -
                            </Text>
                            <Text
                                variant="small"
                                className="text-blue-700"
                            >
                                Stock total
                            </Text>
                        </div>

                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                            <Text
                                variant="h5"
                                className="font-semibold text-green-900"
                            >
                                -
                            </Text>
                            <Text
                                variant="small"
                                className="text-green-700"
                            >
                                Producteurs actifs
                            </Text>
                        </div>
                    </div>
                </div>
            </div>

            {/* Informations sur le produit */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <Text
                    variant="body"
                    className="text-gray-600 text-center"
                >
                    Gestion du stock pour le produit {product.name}
                </Text>
            </div>
        </div>
    );
}

export default PageHeader;
