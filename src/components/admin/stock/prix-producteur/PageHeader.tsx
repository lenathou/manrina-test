import { useRouter } from 'next/router';
import { IProductPriceInfo, IVariantPriceInfo } from '@/server/grower/GrowerPricingService';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';

interface PageHeaderProps {
  productPriceInfo: IProductPriceInfo | null;
  selectedVariant: IVariantPriceInfo | null;
}

export default function PageHeader({ productPriceInfo, selectedVariant }: PageHeaderProps) {
  const router = useRouter();

  const handleGoBack = () => {
    router.push('/admin/stock');
  };

  return (
    <>
      {/* Navigation */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={handleGoBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 p-0"
        >
          ← Retour à la gestion du stock
        </Button>
      </div>

      {/* En-tête avec informations du produit */}
      <div className=" p-6 mb-6">
        <div className="flex items-start space-x-6">
          <div className="flex-1">
            <Text
            variant='h1'
            className="text-2xl font-bold text-secondary mb-2">
              Prix producteurs - {productPriceInfo?.product?.name || 'Produit'}
            </Text>
            {selectedVariant ? (
              <>
                <p className="text-gray-600 mb-4">
                  Variant sélectionné: <span className="font-medium">{selectedVariant.variantOptionValue}</span>
                  {selectedVariant.variantQuantity && selectedVariant.variantUnitSymbol && (
                    <span className="text-gray-500 ml-2">
                      ({selectedVariant.variantQuantity} {selectedVariant.variantUnitSymbol})
                    </span>
                  )}
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Prix le plus bas:</span>
                    <span className="ml-2 font-medium">
                      {selectedVariant.lowestPrice ? `${selectedVariant.lowestPrice}€` : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Producteurs:</span>
                    <span className="ml-2 font-medium">{selectedVariant.growerPrices.length}</span>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-gray-600 mb-4">
                Aucun variant sélectionné
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}