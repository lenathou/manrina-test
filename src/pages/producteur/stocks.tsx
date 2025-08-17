/* eslint-disable react/no-unescaped-entities */
import { ProductSuggestionForm } from '@/components/grower/ProductSuggestionForm';
import { GrowerPriceModal } from '@/components/grower/GrowerPriceModal';
import { GrowerStockInput } from '@/components/grower/GrowerStockInput';
import { TrashIcon } from '@/components/icons/Trash';
import { withProducteurLayout } from '@/components/layouts/ProducteurLayout';
import { ProductSelector } from '@/components/products/Selector';
import { ActionIcon } from '@/components/ui/ActionIcon';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import Image from 'next/image';
import { useGrowerProductsGrouped } from '@/hooks/useGrowerProductsGrouped';
import { useGrowerStockValidation } from '@/hooks/useGrowerStockValidation';
import { useProductQuery } from '@/hooks/useProductQuery';
import { useUnitById } from '@/hooks/useUnits';
import { IGrowerTokenPayload } from '@/server/grower/IGrower';
import { IProduct } from '@/server/product/IProduct';
import { IGrowerProduct } from '@/types/grower';
import { useState, useEffect } from 'react';

function GrowerStocksPage({ authenticatedGrower }: { authenticatedGrower: IGrowerTokenPayload }) {
    const growerId = authenticatedGrower?.id;
    const { data: allProducts = [], isLoading: isLoadingProducts } = useProductQuery();
    const {
        growerProducts,
        isLoading: isLoadingGrowerProducts,
        refetch,
        addGrowerProduct,
        removeGrowerProduct,
        updateProductStock,
        updateVariantPrices,
        adjustGlobalStockAdditive,
    } = useGrowerProductsGrouped(growerId);
    useGrowerStockValidation(growerId);
    const [showProductModal, setShowProductModal] = useState(false);
    const [showPriceModal, setShowPriceModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<IGrowerProduct | null>(null);
    const [localStocks, setLocalStocks] = useState<Record<string, number>>({});
    const [hasChanges, setHasChanges] = useState(false);
    const [isValidating, setIsValidating] = useState(false);

    // Initialiser tous les stocks locaux
    useEffect(() => {
        const initialStocks: Record<string, number> = {};
        growerProducts.forEach((product) => {
            initialStocks[product.id] = product.totalStock;
        });
        setLocalStocks(initialStocks);
        // Ne pas réinitialiser hasChanges automatiquement pour préserver l'état pendant la saisie
        // hasChanges sera géré manuellement lors des modifications et validations
    }, [growerProducts]);

    const handleAddToGrowerProducts = async (product: IProduct) => {
        if (!product.variants || product.variants.length === 0) return;
        // Check if product is already in growerProducts
        const existingProduct = growerProducts.find((gp) => gp.id === product.id);
        if (existingProduct) return;

        // Add all variants of the product
        await addGrowerProduct.mutateAsync(product);
    };

    const handleRemoveFromGrowerProducts = async (productId: string) => {
        await removeGrowerProduct.mutateAsync(productId);
    };

    const handleLocalStockChange = (productId: string, newStock: number) => {
        const validStock = Math.max(0, newStock);

        setLocalStocks((prev) => ({
            ...prev,
            [productId]: validStock,
        }));
        setHasChanges(true);
    };

    // La mise à jour du stock global se fait uniquement via le bouton "Valider"

    const handleOpenPriceModal = (product: IGrowerProduct) => {
        setSelectedProduct(product);
        setShowPriceModal(true);
    };

    const handlePriceUpdate = async (variantPrices: Record<string, number>) => {
        if (!selectedProduct) return;
        await updateVariantPrices.mutateAsync({
            productId: selectedProduct.id,
            variantPrices,
        });
        setShowPriceModal(false);
        setSelectedProduct(null);
    };

    const handleResetToInitial = () => {
        const initialStocks: Record<string, number> = {};
        growerProducts.forEach((product) => {
            initialStocks[product.id] = product.totalStock;
        });
        setLocalStocks(initialStocks);
        setHasChanges(false);
    };

    const handleValidateAllStocks = async () => {
        try {
            if (!growerId) {
                console.error('Aucun ID de producteur disponible');
                return;
            }

            // Éviter les validations simultanées
            if (isValidating) {
                console.log('Validation déjà en cours, ignorer cette demande');
                return;
            }

            setIsValidating(true);

            // Traitement des produits modifiés

            // Sauvegarder les produits modifiés avant les mutations
            const modifiedProducts = Object.entries(localStocks)
                .filter(([productId, stock]) => {
                    const product = growerProducts.find((p) => p.id === productId);
                    return product && stock !== product.totalStock && stock > 0;
                })
                .map(([productId, newTotalStock]) => {
                    const product = growerProducts.find((p) => p.id === productId);
                    return { productId, newTotalStock, originalStock: product?.totalStock || 0 };
                });

            // Traitement séquentiel pour éviter les conflits de cache
            for (const { productId, newTotalStock, originalStock } of modifiedProducts) {
                // Calculer la différence (seulement si positive)
                const stockDifference = newTotalStock - originalStock;
                if (stockDifference > 0) {
                    try {
                        // Ajuster le stock global de manière additive
                        await adjustGlobalStockAdditive.mutateAsync({
                            productId,
                            additionalStock: stockDifference,
                            growerId,
                        });

                        // Attendre un court délai pour éviter les conflits de cache
                        await new Promise((resolve) => setTimeout(resolve, 100));

                        // Remettre le stock local du producteur à 0 après validation
                        await updateProductStock.mutateAsync({
                            productId,
                            totalStock: 0,
                        });

                        // Attendre un court délai entre chaque produit
                        await new Promise((resolve) => setTimeout(resolve, 100));
                    } catch (productError) {
                        console.error(`Erreur lors du traitement du produit ${productId}:`, productError);
                        // Continuer avec les autres produits même en cas d'erreur
                    }
                }
            }

            // Réinitialiser tous les stocks locaux à 0 après validation
            const resetStocks: Record<string, number> = {};
            growerProducts.forEach((product) => {
                resetStocks[product.id] = 0;
            });

            // Mettre à jour localStocks avec tous les stocks à 0
            setLocalStocks(resetStocks);
            setHasChanges(false);

            // Forcer un refetch des données après un délai pour s'assurer de la cohérence
            setTimeout(() => {
                refetch();
            }, 500);
        } catch (error) {
            console.error('Erreur lors de la validation des stocks:', error);
        } finally {
            setIsValidating(false);
        }
    };

    // Nettoyer les timeouts lors du démontage du composant

    // Only show allowed products and not already in growerProducts
    const addableProducts = allProducts.filter((p) => p.showInStore && !growerProducts.some((gp) => gp.id === p.id));

    return (
        <div className="flex flex-col min-h-screen bg-background">
            {/* 1. Page Header */}
            <div className="p-4 md:p-8">
                <Text
                    variant="h1"
                    className="text-secondary text-xl md:text-3xl"
                >
                    Gestion de mes stocks
                </Text>
            </div>

            {/* 2. Product Search Bar (to add to grower list) */}
            <div className="p-4 md:p-8">
                <Text
                    variant="h3"
                    className="mb-2 text-lg md:text-xl"
                >
                    Ajouter un produit existant à ma liste
                </Text>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-8">
                    <div className="flex-1">
                        <ProductSelector
                            items={addableProducts}
                            onSelect={handleAddToGrowerProducts}
                        />
                    </div>

                    <Button
                        variant="primary"
                        className="shrink-0 w-full md:w-auto"
                        onClick={() => setShowProductModal(true)}
                    >
                        Proposer un nouveau produit
                    </Button>
                </div>
            </div>

            {/* 3. Grower Product List */}
            <div className="mx-4 md:mx-8 p-4 md:p-8 bg-white rounded">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-4">
                    <Text
                        variant="h3"
                        className="text-lg md:text-xl"
                    >
                        Mes produits
                    </Text>

                    {growerProducts.length > 0 && (
                        <div className="flex flex-col md:flex-row gap-3">
                            {hasChanges && (
                                <Button
                                    variant="secondary"
                                    onClick={handleResetToInitial}
                                    className="flex items-center justify-center gap-2 w-full md:w-auto"
                                >
                                    <Image
                                        src="/icons/rollback-icon.svg"
                                        alt="Reset"
                                        width={16}
                                        height={16}
                                    />
                                    <span className="hidden md:inline">Retour à l'état initial</span>
                                    <span className="md:hidden">Reset</span>
                                </Button>
                            )}
                            <Button
                                variant="primary"
                                onClick={handleValidateAllStocks}
                                disabled={!hasChanges || isValidating}
                                className="w-full md:w-auto"
                            >
                                {isValidating ? 'Validation...' : 'Valider tous les stocks'}
                            </Button>
                        </div>
                    )}
                </div>
                {isLoadingProducts || isLoadingGrowerProducts ? (
                    <div>Chargement...</div>
                ) : growerProducts.length === 0 ? (
                    <div className="text-gray-500">
                        Aucun produit dans votre liste. Utilisez la recherche ci-dessus pour en ajouter.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {growerProducts.map((product) => {
                            const ProductWithUnit = () => {
                                const globalUnit = useUnitById(product.baseUnitId || null);

                                return (
                                    <div className="border rounded-lg p-4 bg-gray-50">
                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                            {/* Product Info */}
                                            <div className="flex items-center gap-4">
                                                <Image
                                                    src={product.imageUrl || '/placeholder-product.svg'}
                                                    alt={product.name}
                                                    width={64}
                                                    height={64}
                                                    className="w-12 h-12 md:w-16 md:h-16 rounded object-cover flex-shrink-0"
                                                    priority={false}
                                                    placeholder="blur"
                                                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-medium text-base md:text-lg truncate">
                                                        {product.name}
                                                    </h3>
                                                    <p className="text-xs md:text-sm text-gray-600">
                                                        {product.variants.length} variant
                                                        {product.variants.length > 1 ? 's' : ''}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Stock Input and Actions */}
                                            <div className="flex flex-col md:flex-row md:items-center gap-4">
                                                <div className="text-center relative">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Stock total{globalUnit ? ` en ${globalUnit.name}` : ''}
                                                    </label>
                                                    <GrowerStockInput
                                                        value={localStocks[product.id] || 0}
                                                        onChange={(value) => handleLocalStockChange(product.id, value)}
                                                        disabled={false}
                                                    />
                                                </div>

                                                <div className="flex flex-col md:flex-row gap-2 md:gap-4">
                                                    {/* Price Management Button */}
                                                    <Button
                                                        variant="secondary"
                                                        onClick={() => handleOpenPriceModal(product)}
                                                        className="whitespace-nowrap text-sm w-full md:w-auto"
                                                    >
                                                        <span className="hidden md:inline">Gérer les prix</span>
                                                        <span className="md:hidden">Prix</span>
                                                    </Button>

                                                    {/* Remove Button */}
                                                    <ActionIcon
                                                        label="Retirer le produit"
                                                        onClick={() => handleRemoveFromGrowerProducts(product.id)}
                                                        className="self-center md:self-auto"
                                                    >
                                                        <TrashIcon
                                                            height={20}
                                                            width={20}
                                                        />
                                                    </ActionIcon>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            };

                            return <ProductWithUnit key={product.id} />;
                        })}
                    </div>
                )}
            </div>

            {/* 4. MODAL Suggest New Product */}
            {showProductModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 bg-opacity-50 p-4">
                    <div className="bg-white rounded shadow p-4 md:p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto relative">
                        <ActionIcon
                            label="Fermer"
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl z-10"
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

            {/* 5. MODAL Price Management */}
            {showPriceModal && selectedProduct && (
                <GrowerPriceModal
                    isOpen={showPriceModal}
                    onClose={() => {
                        setShowPriceModal(false);
                        setSelectedProduct(null);
                    }}
                    product={
                        {
                            id: selectedProduct.id,
                            name: selectedProduct.name,
                            imageUrl: selectedProduct.imageUrl,
                            variants: selectedProduct.variants.map((v) => ({
                                id: v.variantId,
                                optionValue: v.variantOptionValue || '',
                                price: v.price,
                            })),
                        } as IProduct
                    }
                    currentPrices={selectedProduct.variants.reduce(
                        (acc, v) => {
                            acc[v.variantId] = v.customPrice || v.price;
                            return acc;
                        },
                        {} as Record<string, number>,
                    )}
                    onSave={handlePriceUpdate}
                />
            )}
        </div>
    );
}

export default withProducteurLayout(GrowerStocksPage);
