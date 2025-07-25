import { ProductSuggestionForm } from '@/components/grower/ProductSuggestionForm';
import { GrowerStockEditor } from '@/components/grower/StockEditor';
import { withProducteurLayout } from '@/components/layouts/ProducteurLayout';
import { TrashIcon } from '@/components/icons/Trash';
import { ProductSelector } from '@/components/products/Selector';
import { ProductTable } from '@/components/products/Table';
import { ActionIcon } from '@/components/ui/ActionIcon';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/text';
import { useGrowerStock } from '@/hooks/useGrowerStock';
import { useProductQuery } from '@/hooks/useProductQuery';
import { IGrowerProductVariant, IGrowerTokenPayload } from '@/server/grower/IGrower';
import { IProduct } from '@/server/product/IProduct';
import { useState } from 'react';

function GrowerStocksPage({ authenticatedGrower }: { authenticatedGrower: IGrowerTokenPayload }) {
    const growerId = authenticatedGrower?.id;
    const { data: allProducts = [], isLoading: isLoadingProducts } = useProductQuery();
    const {
        growerProducts: rawGrowerProducts,
        isLoading: isLoadingGrowerProducts,
        addGrowerProduct,
        removeGrowerProduct,
        updateGrowerProductStock,
    } = useGrowerStock(growerId);
    const growerProducts: IGrowerProductVariant[] = Array.isArray(rawGrowerProducts) ? rawGrowerProducts : [];
    const [showProductModal, setShowProductModal] = useState(false);



    const handleAddToGrowerProducts = async (product: IProduct) => {
        if (!product.variants || product.variants.length === 0) return;
        // Find variants not already in growerProducts
        const missingVariants = product.variants.filter(
            (variant) => !growerProducts.some((gp) => gp.variantId === variant.id),
        );
        if (missingVariants.length === 0) return;
        await Promise.all(
            missingVariants.map((variant) =>
                addGrowerProduct.mutateAsync({
                    productId: product.id,
                    variantId: variant.id,
                    stock: 1,
                }),
            ),
        );
    };

    const handleRemoveFromGrowerProducts = async (variantId: string) => {
        await removeGrowerProduct.mutateAsync(variantId);
    };

    const handleStockUpdate = async (variantId: string, newStock: number) => {
        await updateGrowerProductStock.mutateAsync({ variantId, stock: newStock });
    };

    // Only show allowed products and not already in growerProducts (by variant)
    const addableProducts = allProducts.filter(
        (p) => p.showInStore && p.variants.some((v) => growerProducts.every((gp) => gp.variantId !== v.id)),
    );

    return (
        <div className="flex flex-col min-h-screen bg-background">
            {/* 1. Page Header */}
            <div className="p-8">
                <Text
                    variant="h1"
                    className="text-secondary"
                >
                    Gestion de mes stocks
                </Text>
            </div>

            {/* 2. Product Search Bar (to add to grower list) */}
            <div className="p-8">
                <Text
                    variant="h3"
                    className="mb-2"
                >
                    Ajouter un produit existant à ma liste
                </Text>
                <div className="flex items-center justify-between gap-8">
                    <ProductSelector
                        items={addableProducts}
                        onSelect={handleAddToGrowerProducts}
                    />

                    <Button
                        variant="primary"
                        className="shrink-0"
                        onClick={() => setShowProductModal(true)}
                    >
                        Proposer un nouveau produit
                    </Button>
                </div>
            </div>

            {/* 3. Grower Product List */}
            <div className="mx-8 p-8 bg-white rounded">
                <Text
                    variant="h3"
                    className="mb-4"
                >
                    Mes produits
                </Text>
                {isLoadingProducts || isLoadingGrowerProducts ? (
                    <div>Chargement...</div>
                ) : growerProducts.length === 0 ? (
                    <div className="text-gray-500">
                        Aucun produit dans votre liste. Utilisez la recherche ci-dessus pour en ajouter.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <ProductTable>
                            <ProductTable.Header>
                                <ProductTable.HeaderRow>
                                    <ProductTable.HeaderCell>Produit</ProductTable.HeaderCell>
                                    <ProductTable.HeaderCell className="text-center">Variante </ProductTable.HeaderCell>
                                    <ProductTable.HeaderCell className="text-center">Prix</ProductTable.HeaderCell>
                                    <ProductTable.HeaderCell className="text-center">Stock</ProductTable.HeaderCell>
                                    <ProductTable.HeaderCell className="text-center">Actions</ProductTable.HeaderCell>
                                </ProductTable.HeaderRow>
                            </ProductTable.Header>
                            <ProductTable.Body>
                                {growerProducts.map((entry) => (
                                    <ProductTable.Row key={`${entry.productId}-${entry.variantId}`}>
                                        {/* Product Column */}
                                        <ProductTable.Cell>
                                            <img
                                                src={entry.productImageUrl}
                                                alt={entry.productName}
                                                className="w-10 h-10 rounded object-cover"
                                            />
                                            {entry.productName}
                                        </ProductTable.Cell>

                                        {/* Variant Column */}
                                        <ProductTable.Cell className="text-center">
                                            <span className="text-sm text-gray-700">{entry.variantOptionValue}</span>
                                        </ProductTable.Cell>

                                        {/* Price Column */}
                                        <ProductTable.Cell className="text-center">
                                            <span className="font-medium text-gray-900">{entry.price}€</span>
                                        </ProductTable.Cell>

                                        {/* Stock Column */}
                                        <ProductTable.Cell className="text-center">
                                            <GrowerStockEditor
                                                growerId={growerId}
                                                variant={{
                                                    id: entry.variantId,
                                                    stock: entry.stock,
                                                    optionSet: '',
                                                    optionValue: entry.variantOptionValue,
                                                    productId: entry.productId,
                                                    description: '',
                                                    imageUrl: '',
                                                    price: entry.price,
                                                }}
                                                onStockUpdate={(newStock) =>
                                                    handleStockUpdate(entry.variantId, newStock)
                                                }
                                            />
                                        </ProductTable.Cell>

                                        {/* Actions Column */}
                                        <ProductTable.Cell className="text-center">
                                            <div className="flex items-center justify-center">
                                                <ActionIcon
                                                    label="Retirer le produit"
                                                    onClick={() => handleRemoveFromGrowerProducts(entry.variantId)}
                                                >
                                                    <TrashIcon
                                                        height={20}
                                                        width={20}
                                                    />
                                                </ActionIcon>
                                            </div>
                                        </ProductTable.Cell>
                                    </ProductTable.Row>
                                ))}
                            </ProductTable.Body>
                        </ProductTable>
                    </div>
                )}
            </div>

            {/* 4. MODAL Suggest New Product */}
            {showProductModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 bg-opacity-50">
                    <div className="bg-white rounded shadow p-6 max-w-lg w-full relative">
                        <ActionIcon
                            label="Fermer"
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
                            onClick={() => setShowProductModal(false)}
                        >
                            ×
                        </ActionIcon>
                        <ProductSuggestionForm
                            growerId={growerId}
                            onSuccess={() => setShowProductModal(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default withProducteurLayout(GrowerStocksPage);
