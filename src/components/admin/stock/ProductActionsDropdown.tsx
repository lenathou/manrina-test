import React, { useState } from 'react';
// Removed Decimal import - using number instead
import { ActionDropdown } from '@/components/ui/ActionDropdown';
import { IProduct, IUnit } from '@/server/product/IProduct';
import { GrowerPricesModal } from '@/components/admin/GrowerPricesModal';
import { ProductEditModal } from '@/components/admin/stock/ProductEditModal';
import { VariantManagementModal } from '@/components/admin/stock/VariantManagementModal';
import { backendFetchService } from '@/service/BackendFetchService';
import {  useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { invalidateAllProductQueries } from '@/utils/queryInvalidation';

interface ProductActionsDropdownProps {
    product: IProduct;
    units: IUnit[];
}

export const ProductActionsDropdown: React.FC<ProductActionsDropdownProps> = ({
    product
    
}) => {
    const [isGrowerPricesModalOpen, setIsGrowerPricesModalOpen] = useState(false);
    const [isProductEditModalOpen, setIsProductEditModalOpen] = useState(false);
    const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
    const [isUpdating] = useState(false);
    const queryClient = useQueryClient();
    const router = useRouter();





    const toggleProductVisibility = async () => {
        try {
            await backendFetchService.updateProduct(product.id, {
                showInStore: !product.showInStore
            });
            
            // Invalider les caches pour rafraîchir les données
            invalidateAllProductQueries(queryClient);
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la visibilité du produit:', error);
        }
    };

    const deleteProduct = async () => {
        const confirmed = window.confirm(
            `Êtes-vous sûr de vouloir supprimer le produit "${product.name}" ? Cette action est irréversible.`
        );
        
        if (confirmed) {
            try {
                await backendFetchService.deleteProduct(product.id);
                
                // Invalider les caches pour rafraîchir les données
                invalidateAllProductQueries(queryClient);
            } catch (error) {
                console.error('Erreur lors de la suppression du produit:', error);
                alert('Erreur lors de la suppression du produit');
            }
        }
    };


    const actions = [
        {
            id: 'edit-product',
            label: 'Modifier le produit',
            onClick: () => setIsProductEditModalOpen(true),
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
            )
        },
        {
            id: 'variant-management',
            label: 'Gestion de variants',
            onClick: () => setIsVariantModalOpen(true),
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
            )
        },
        {
            id: 'stock-producteurs',
            label: 'Stocks producteurs',
            onClick: () => router.push(`/admin/stock/${product.id}/stock-producteurs`),
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            )
        },
        {
            id: 'grower-prices',
            label: 'Prix producteurs',
            onClick: () => router.push(`/admin/stock/${product.id}/prix-producteurs`),
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
            )
        },
        {
            id: 'toggle-visibility',
            label: product.showInStore ? 'Masquer du magasin' : 'Afficher dans le magasin',
            onClick: toggleProductVisibility,
            icon: product.showInStore ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
            ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
            )
        },
        {
            id: 'delete-product',
            label: 'Supprimer le produit',
            onClick: deleteProduct,
            className: 'text-red-600 hover:text-red-700 hover:bg-red-50',
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            )
        }
    ];

    return (
        <>
            <ActionDropdown
                actions={actions}
                placeholder="Actions"
                className="min-w-[150px] opacity-100"
                disabled={isUpdating}
            />

            {/* Modales */}
            <GrowerPricesModal
                productId={product.id}
                productName={product.name}
                isOpen={isGrowerPricesModalOpen}
                onClose={() => setIsGrowerPricesModalOpen(false)}
                isAdminMode={true}
            />

            <ProductEditModal
                product={product}
                isOpen={isProductEditModalOpen}
                onClose={() => setIsProductEditModalOpen(false)}
            />

            <VariantManagementModal
                isOpen={isVariantModalOpen}
                onClose={() => setIsVariantModalOpen(false)}
                product={product}
            />
        </>
    );
};

export default ProductActionsDropdown;