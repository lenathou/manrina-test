import React from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/Card';
import type { PublicMarketProduct } from '@/types/market';

interface ProductCardProps {
  product: PublicMarketProduct;
  producerName: string;
  variant?: 'default' | 'compact';
}

export function ProductCard({ product, producerName }: ProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  const isOutOfStock = product.stock === 0;

  return (
    <Card className={`overflow-hidden transition-all duration-200 hover:shadow-lg ${
      isOutOfStock ? 'opacity-60' : 'hover:scale-[1.02]'
    }`}>
      <CardContent className="p-0">
        {/* Image du produit */}
        <div className="relative h-48 bg-gray-100">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
              <svg className="w-16 h-16 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </div>
          )}
          
          {/* Badge de stock */}
          {isOutOfStock && (
            <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              Épuisé
            </div>
          )}
          
          {/* Badge de catégorie */}
          {product.category && (
            <div className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium">
              {product.category}
            </div>
          )}
        </div>

        {/* Contenu */}
        <div className="p-4">
          <div className="mb-2">
            <h3 className="font-semibold text-lg text-gray-900 mb-1">{product.name}</h3>
            <p className="text-sm text-gray-600">Par {producerName}</p>
          </div>

          {product.description && (
            <p className="text-gray-600 text-sm mb-3" style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {product.description}
            </p>
          )}

          {/* Prix et unité */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-baseline space-x-1">
              <span className="text-xl font-bold text-green-600">
                {formatPrice(product.price)}
              </span>
              {product.unit && (
                <span className="text-sm text-gray-500">/ {product.unit}</span>
              )}
            </div>
            
            {/* Stock disponible */}
            <div className="text-right">
              <p className="text-xs text-gray-500">Stock</p>
              <p className={`text-sm font-medium ${
                product.stock > 10 ? 'text-green-600' : 
                product.stock > 0 ? 'text-orange-600' : 'text-red-600'
              }`}>
                {product.stock > 0 ? `${product.stock} disponible${product.stock > 1 ? 's' : ''}` : 'Épuisé'}
              </p>
            </div>
          </div>

          {/* Indicateur de disponibilité */}
          <div className={`w-full h-1 rounded-full ${
            product.stock > 10 ? 'bg-green-200' :
            product.stock > 0 ? 'bg-orange-200' : 'bg-red-200'
          }`}>
            <div 
              className={`h-full rounded-full transition-all duration-300 ${
                product.stock > 10 ? 'bg-green-500' :
                product.stock > 0 ? 'bg-orange-500' : 'bg-red-500'
              }`}
              style={{ 
                width: product.stock > 0 ? `${Math.min((product.stock / 20) * 100, 100)}%` : '0%' 
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ProductCard;