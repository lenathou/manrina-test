import Link from 'next/link';
import { IProductPriceInfo, IVariantPriceInfo } from '@/server/grower/GrowerPricingService';

interface PageHeaderProps {
  productPriceInfo: IProductPriceInfo;
  selectedVariant: IVariantPriceInfo | null;
}

export default function PageHeader({ productPriceInfo, selectedVariant }: PageHeaderProps) {
  return (
    <>
      {/* Navigation */}
      <div className="mb-6">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-4">
            <li>
              <Link href="/admin" className="text-gray-400 hover:text-gray-500">
                Admin
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <Link href="/admin/stock" className="ml-4 text-gray-400 hover:text-gray-500">
                  Stock
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span className="ml-4 text-gray-500">
                  Prix producteurs - {productPriceInfo.product.name}
                </span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      {/* En-tête avec informations du produit */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex items-start space-x-6">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Prix producteurs - {productPriceInfo.product.name}
            </h1>
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