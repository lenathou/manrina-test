/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import Image from 'next/image';
import { MarketProduct, Grower, MarketSession } from '@prisma/client';

type MarketProductWithDetails = MarketProduct & {
    grower: Grower;
    marketSession: MarketSession;
};

interface AdminMarketProductCardProps {
    product: MarketProductWithDetails;
    unitSymbol: string;
}

export function AdminMarketProductCard({ product, unitSymbol }: AdminMarketProductCardProps) {
    return (
        <div className="bg-white border rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-200 min-h-80 flex flex-col relative border-gray-200">
            {/* Badge de statut */}
            <div className="absolute top-2 left-2 z-10">
                <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                >
                    {product.isActive ? 'Actif' : 'Inactif'}
                </span>
            </div>

            {/* Header avec image et nom */}
            <div className="flex items-start gap-4 mb-4">
                <div className="relative">
                    <Image
                        src={product.imageUrl || '/placeholder-product.svg'}
                        alt={product.name}
                        width={80}
                        height={80}
                        className="w-20 h-20 rounded-lg object-cover border border-gray-200"
                        priority={false}
                    />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg text-gray-900 leading-tight mb-1 line-clamp-2">
                        {product.name}
                    </h3>
                    <p className="text-sm text-gray-600">Catégorie: {product.category || 'Non spécifiée'}</p>
                </div>
            </div>

            {/* Prix */}
            <div className="mb-4">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Prix</span>
                    <span className="text-lg font-bold text-gray-900">
                        {Number(product.price).toFixed(2)}€ / {unitSymbol}
                    </span>
                </div>
            </div>

            {/* Description */}
            {product.description && (
                <div className="flex-1 mb-4">
                    <h4 className="text-sm font-medium text-gray-600 mb-2">Description</h4>
                    <p className="text-sm text-gray-700 line-clamp-3">{product.description}</p>
                </div>
            )}

            {/* Informations du producteur */}
            <div className="mt-auto pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-500">Producteur</p>
                        <p className="text-sm font-medium text-gray-900">{product.grower.name}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-500">Ajouté le</p>
                        <p className="text-sm text-gray-700">
                            {new Date(product.createdAt).toLocaleDateString('fr-FR')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
