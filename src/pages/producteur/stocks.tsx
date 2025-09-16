/* eslint-disable react/no-unescaped-entities */
import { ProductSuggestionForm } from '@/components/grower/ProductSuggestionForm';
import { GrowerStockInput } from '@/components/grower/GrowerStockInput';
import { TrashIcon } from '@/components/icons/Trash';

import { ProductSelector } from '@/components/products/Selector';
import { ActionIcon } from '@/components/ui/ActionIcon';
import { Button } from '@/components/ui/Button';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { Text } from '@/components/ui/Text';
import Image from 'next/image';
import { useGrowerProductsGrouped } from '@/hooks/useGrowerProductsGrouped';
import { useGrowerStockValidation } from '@/hooks/useGrowerStockValidation';
import { useProductQuery } from '@/hooks/useProductQuery';
import { GrowerStockValidationStatus } from '@/server/grower/IGrowerStockValidation';
import { useUnitById, useUnits } from '@/hooks/useUnits';
import { IGrowerTokenPayload } from '@/server/grower/IGrower';
import { IProduct } from '@/server/product/IProduct';
import { IGrowerProduct } from '@/types/grower';
import { useState, useEffect, useCallback, memo } from 'react';

// Composant mémorisé pour éviter les re-rendus
const ProductWithUnit = memo(
    ({
        product,
        localStock,
        onStockChange,
        onOpenPriceModal,
        onRemoveProduct,
        isLoadingUnits,
    }: {
        product: IGrowerProduct;
        localStock: number;
        onStockChange: (productId: string, value: number) => void;
        onOpenPriceModal: (product: IGrowerProduct) => void;
        onRemoveProduct: (productId: string) => void;
        isLoadingUnits?: boolean;
    }) => {
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
                            <h3 className="font-medium text-base md:text-lg truncate">{product.name}</h3>
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
                                value={localStock}
                                onChange={(value) => onStockChange(product.id, value)}
                                disabled={false}
                            />
                        </div>

                        <div className="flex flex-col md:flex-row gap-2 md:gap-4">
                            {/* Price Management Button */}
                            <Button
                                variant="secondary"
                                onClick={() => onOpenPriceModal(product)}
                                disabled={isLoadingUnits}
                                className="whitespace-nowrap text-sm w-full md:w-auto"
                            >
                                {isLoadingUnits ? (
                                    <>
                                        <span className="hidden md:inline">Chargement...</span>
                                        <span className="md:hidden">...</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="hidden md:inline">Gérer les prix</span>
                                        <span className="md:hidden">Prix</span>
                                    </>
                                )}
                            </Button>

                            {/* Remove Button */}
                            <ActionIcon
                                label="Retirer le produit"
                                onClick={() => onRemoveProduct(product.id)}
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
    },
);

ProductWithUnit.displayName = 'ProductWithUnit';

function GrowerStocksPage({ authenticatedGrower }: { authenticatedGrower: IGrowerTokenPayload }) {
    const growerId = authenticatedGrower?.id;

    const { data: allProducts = [], isLoading: isLoadingProducts } = useProductQuery();
    const {
        growerProducts,
        isLoading: isLoadingGrowerProducts,
        addGrowerProduct,
        removeGrowerProduct,
    } = useGrowerProductsGrouped(growerId);
    const { createStockUpdateRequest, pendingStockUpdates, hasPendingUpdate } = useGrowerStockValidation(growerId);
    const { isLoading: isLoadingUnits } = useUnits();
    const [showProductModal, setShowProductModal] = useState(false);
    const [, setShowPriceModal] = useState(false);
    const [, setSelectedProduct] = useState<IGrowerProduct | null>(null);
    const [localStocks, setLocalStocks] = useState<Record<string, number>>({});
    const [hasChanges, setHasChanges] = useState(false);
    const [isValidating, setIsValidating] = useState(false);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [productToReplace, setProductToReplace] = useState<IProduct | null>(null);

    // Réinitialiser les stocks locaux quand les produits changent
    const growerProductsSignature = growerProducts.map((p) => `${p.id}:${p.totalStock}`).join(',');

    useEffect(() => {
        const initialStocks: Record<string, number> = {};
        growerProducts.forEach((product) => {
            initialStocks[product.id] = product.totalStock;
        });

        // Ne mettre à jour que si les stocks ont réellement changé
        setLocalStocks((prevStocks) => {
            const hasChanged = growerProducts.some((product) => prevStocks[product.id] !== product.totalStock);
            return hasChanged ? initialStocks : prevStocks;
        });
        // Ne pas réinitialiser hasChanges automatiquement pour préserver l'état pendant la saisie
        // hasChanges sera géré manuellement lors des modifications et validations
    }, [growerProducts, growerProductsSignature]);

    const handleAddToGrowerProducts = async (product: IProduct) => {
        if (!product.variants || product.variants.length === 0) return;

        try {
            // Try to add the product normally first
            await addGrowerProduct.mutateAsync({ product });
        } catch (error: unknown) {
            // If we get a unique constraint error, show confirmation modal
            const errorMessage = (error as Error)?.message?.toLowerCase() || '';
            const errorCode = (error as { code?: string })?.code;

            // Détecter les erreurs HTTP 400 qui pourraient être des contraintes uniques
            const isHttp400Error = errorMessage.includes('http error! status: 400');

            if (
                errorMessage.includes('unique') ||
                errorMessage.includes('constraint') ||
                errorMessage.includes('duplicate') ||
                errorMessage.includes('already exists') ||
                errorCode === 'P2002' ||
                isHttp400Error
            ) {
                // Prisma unique constraint error code or HTTP 400
                console.log('✅ DETECTED DUPLICATE PRODUCT - SHOWING CONFIRMATION MODAL');
                console.log('Product to replace:', product);
                setProductToReplace(product);
                setShowConfirmationModal(true);
                console.log('Modal state set - showConfirmationModal should be true');
            } else {
                // Re-throw other errors
                console.error('❌ UNHANDLED ERROR in handleAddToGrowerProducts:', error);
                throw error;
            }
        }
    };

    const handleRemoveFromGrowerProducts = useCallback(
        async (productId: string) => {
            await removeGrowerProduct.mutateAsync(productId);
        },
        [removeGrowerProduct],
    );

    const handleConfirmReplacement = async () => {
        if (!productToReplace) return;

        try {
            // Add the product with forceReplace = true
            await addGrowerProduct.mutateAsync({
                product: productToReplace,
                forceReplace: true,
            });
            setShowConfirmationModal(false);
            setProductToReplace(null);
        } catch (error) {
            console.error('Error replacing product:', error);
        }
    };

    const handleCancelReplacement = () => {
        setShowConfirmationModal(false);
        setProductToReplace(null);
    };

    const handleLocalStockChange = useCallback((productId: string, newStock: number) => {
        const validStock = Math.max(0, newStock);

        setLocalStocks((prev) => ({
            ...prev,
            [productId]: validStock,
        }));
        setHasChanges(true);
    }, []);

    // La mise à jour du stock global se fait uniquement via le bouton "Valider"

    const handleOpenPriceModal = useCallback((product: IGrowerProduct) => {
        if (isLoadingUnits) return;
        setSelectedProduct(product);
        setShowPriceModal(true);
    }, [isLoadingUnits]);


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

            // Identifier les produits modifiés
            const modifiedProducts = Object.entries(localStocks)
                .filter(([productId, stock]) => {
                    const product = growerProducts.find((p) => p.id === productId);
                    // Vérifier qu'il n'y a pas déjà une demande en attente pour ce produit
                    const hasPending = hasPendingUpdate(productId);
                    return product && stock !== product.totalStock && stock > 0 && !hasPending;
                })
                .map(([productId, newTotalStock]) => {
                    const product = growerProducts.find((p) => p.id === productId);
                    return {
                        productId,
                        newTotalStock,
                        originalStock: product?.totalStock || 0,
                        productName: product?.name || 'Produit inconnu',
                    };
                });

            if (modifiedProducts.length === 0) {
                console.log('Aucun produit modifié à valider');
                setIsValidating(false);
                return;
            }

            // Créer des demandes de validation pour chaque produit modifié
            for (const { productId, newTotalStock, productName } of modifiedProducts) {
                try {
                    await createStockUpdateRequest.mutateAsync({
                        growerId,
                        productId,
                        newStock: newTotalStock,
                        reason: `Mise à jour du stock pour ${productName} - Nouveau stock: ${newTotalStock}`,
                        status: GrowerStockValidationStatus.PENDING,
                        requestDate: new Date().toISOString(),
                    });

                    // Attendre un court délai entre chaque demande
                    await new Promise((resolve) => setTimeout(resolve, 100));
                } catch (productError) {
                    console.error(
                        `Erreur lors de la création de la demande pour le produit ${productId}:`,
                        productError,
                    );
                    // Continuer avec les autres produits même en cas d'erreur
                }
            }

            // Réinitialiser les stocks locaux aux valeurs actuelles (pas à 0)
            const resetStocks: Record<string, number> = {};
            growerProducts.forEach((product) => {
                resetStocks[product.id] = product.totalStock;
            });

            setLocalStocks(resetStocks);
            setHasChanges(false);

            console.log(
                `${modifiedProducts.length} demande(s) de validation créée(s). En attente d'approbation par un administrateur.`,
            );
        } catch (error) {
            console.error('Erreur lors de la création des demandes de validation:', error);
        } finally {
            setIsValidating(false);
        }
    };

    // Nettoyer les timeouts lors du démontage du composant

    // Only show allowed products and not already in growerProducts
    const addableProducts = allProducts.filter((p) => p.showInStore && !growerProducts.some((gp) => gp.id === p.id));

    return (
        <div className="flex flex-col min-h-screen">
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
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div className="md:w-96">
                        <ProductSelector
                            items={addableProducts}
                            onSelect={handleAddToGrowerProducts}
                        />
                    </div>

                    <Button
                        variant="secondary"
                        className="shrink-0 rounded-full py-4 w-full md:w-auto"
                        onClick={() => setShowProductModal(true)}
                    >
                        Proposer un nouveau produit
                    </Button>
                </div>
            </div>

            {/* 3. Pending Stock Validation Requests */}
            {pendingStockUpdates.length > 0 && (
                <div className="mx-4 md:mx-8 p-4 md:p-8 bg-yellow-50 border border-yellow-200 rounded mb-6">
                    <Text
                        variant="h3"
                        className="text-lg md:text-xl mb-4 text-yellow-800"
                    >
                        Demandes de validation en attente
                    </Text>
                    <div className="space-y-3">
                        {pendingStockUpdates.map((request) => {
                            const product = growerProducts.find((p) => p.id === request.productId);
                            return (
                                <div
                                    key={request.id}
                                    className="flex items-center justify-between p-3 bg-white border border-yellow-300 rounded"
                                >
                                    <div className="flex-1">
                                        <Text
                                            variant="body"
                                            className="font-medium text-gray-900"
                                        >
                                            {product?.name || 'Produit inconnu'}
                                        </Text>
                                        <Text
                                            variant="body"
                                            className="text-sm text-gray-600"
                                        >
                                            Nouveau stock demandé: {request.newStock}
                                        </Text>
                                        <Text
                                            variant="body"
                                            className="text-xs text-gray-500"
                                        >
                                            {request.reason}
                                        </Text>
                                    </div>
                                    <div className="text-right">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                            En attente
                                        </span>
                                        <Text
                                            variant="body"
                                            className="text-xs text-gray-500 mt-1"
                                        >
                                            {new Date(request.requestDate).toLocaleDateString('fr-FR')}
                                        </Text>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                        <Text
                            variant="body"
                            className="text-sm text-blue-800"
                        >
                            ℹ️ Ces demandes sont en attente d'approbation par un administrateur. Une fois approuvées,
                            vos stocks seront automatiquement ajoutés au stock global.
                        </Text>
                    </div>
                </div>
            )}

            {/* 4. Grower Product List */}
            <div className="mx-4 md:mx-8 p-4 md:p-8  rounded">
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
                        {growerProducts.map((product) => (
                            <ProductWithUnit
                                key={product.id}
                                product={product}
                                localStock={localStocks[product.id] || 0}
                                onStockChange={handleLocalStockChange}
                                onOpenPriceModal={handleOpenPriceModal}
                                onRemoveProduct={handleRemoveFromGrowerProducts}
                                isLoadingUnits={isLoadingUnits}
                            />
                        ))}
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

            {/* 6. MODAL Confirmation de remplacement */}
            {showConfirmationModal && productToReplace && (
                <ConfirmationModal
                    isOpen={showConfirmationModal}
                    onConfirm={handleConfirmReplacement}
                    onClose={handleCancelReplacement}
                    title="Remplacer le produit existant ?"
                    message={`Le produit "${productToReplace.name}" est déjà dans votre liste. Voulez-vous le remplacer ? Cette action supprimera l'ancien produit et ses données de stock.`}
                    confirmText="Remplacer"
                    cancelText="Annuler"
                    variant="warning"
                    isLoading={addGrowerProduct.isPending}
                />
            )}
        </div>
    );
}

// Interface pour la page wrapper qui reçoit l'authentification du layout
interface StocksPageProps {
    authenticatedGrower: IGrowerTokenPayload;
}

// Page wrapper qui reçoit l'authentification et la passe au composant
function StocksPage({ authenticatedGrower }: StocksPageProps) {
    return <GrowerStocksPage authenticatedGrower={authenticatedGrower} />;
}

export default StocksPage;
