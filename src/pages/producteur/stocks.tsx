/* eslint-disable react/no-unescaped-entities */
import { ProductSuggestionForm } from '@/components/grower/ProductSuggestionForm';
import { ProductSelector } from '@/components/products/Selector';
import { Button } from '@/components/ui/Button';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { Text } from '@/components/ui/Text';
import Image from 'next/image';
import { useGrowerStockPageData } from '@/hooks/useGrowerStockPageData';
import { useGrowerStockValidation } from '@/hooks/useGrowerStockValidation';
import { GrowerStockValidationStatus } from '@/server/grower/IGrowerStockValidation';
import { useUnitById } from '@/hooks/useUnits';
import GrowerPriceModal from '@/components/grower/GrowerProductEditorModal';
import { IGrowerTokenPayload } from '@/server/grower/IGrower';
import { IProduct } from '@/server/product/IProduct';
import { IGrowerProductDisplay } from '@/types/grower';
import { useState, useEffect, useCallback, memo, useMemo } from 'react';
import GlobalGrowerAlerts from '@/components/grower/alerts/GlobalGrowerAlerts';
import { usePendingVariantChanges, PendingProductChanges } from '@/hooks/usePendingVariantChanges';
import ProductPriceDropdown from '@/components/grower/stocks/ProductPricePreviewDropdown';

// Composant mémorisé pour éviter les re-rendus
const ProductWithUnit = memo(
    ({
        product,
        localStock,
        onOpenPriceModal,
        onRemoveProduct,
        isLoadingUnits,
        hasPendingChanges,
        hasPendingValidation,
        pendingProductChanges,
    }: {
        product: IGrowerProductDisplay;
        localStock: number;
        onStockChange: (productId: string, value: number) => void;
        onOpenPriceModal: (product: IGrowerProductDisplay) => void;
        onRemoveProduct: (productId: string) => void;
        cardIndex?: number;
        isLoadingUnits?: boolean;
        hasPendingChanges?: boolean;
        hasPendingValidation?: boolean;
        pendingProductChanges?: PendingProductChanges;
    }) => {
        const globalUnit = useUnitById(product.baseUnitId || null);

        return (
            <div
                className={`bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200 h-96 flex flex-col relative ${
                    hasPendingValidation
                        ? 'border-orange-400 bg-orange-50/30'
                        : hasPendingChanges
                          ? 'border-blue-400 bg-blue-50/30'
                          : 'border-secondary/20'
                }`}
            >
                {/* Badge de validation en attente admin */}
                {hasPendingValidation && (
                    <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium z-10">
                        En attente validation
                    </div>
                )}
                {/* Badge de modification en attente (seulement si pas de validation en attente) */}
                {hasPendingChanges && !hasPendingValidation && (
                    <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium z-10">
                        Modifié
                    </div>
                )}

                {/* Header avec image et nom */}
                <div className="flex items-start gap-4 mb-4">
                    <div className="relative">
                        <Image
                            src={product.imageUrl || '/placeholder-product.svg'}
                            alt={product.name}
                            width={80}
                            height={80}
                            className="w-20 h-20 rounded-lg object-cover border border-secondary/10"
                            priority={false}
                            placeholder="blur"
                            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                        />
                        {/* Bouton supprimer en overlay */}
                        <button
                            onClick={() => onRemoveProduct(product.id)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-accent text-white rounded-full flex items-center justify-center text-xs hover:bg-accent/80 transition-colors"
                            title="Retirer le produit"
                        >
                            ×
                        </button>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg text-secondary leading-tight mb-1 line-clamp-2">
                            {product.name}
                        </h3>
                        <p className="text-sm text-tertiary">
                            {product.variants.length} variant{product.variants.length > 1 ? 's' : ''}
                        </p>
                    </div>
                </div>

                {/* Stock actuel */}
                <div className="mb-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-secondary">Stock actuel</span>
                        {(() => {
                            // Vérifier s'il y a une modification de stock en attente
                            const pendingStockData = pendingProductChanges?.stockData;
                            const hasModifiedStock = pendingStockData && pendingStockData.newStock !== pendingStockData.originalStock;
                            const displayStock = hasModifiedStock ? pendingStockData.newStock : localStock;
                            
                            return (
                                <span
                                    className={`text-lg font-bold ${
                                        hasModifiedStock
                                            ? 'text-blue-600 text-sm bg-blue-50 px-2 py-1 rounded border border-blue-200'
                                            : 'text-primary'
                                    }`}
                                >
                                    {displayStock} {globalUnit?.name || ''}
                                    {hasModifiedStock && <span className="ml-1 text-xs text-blue-500">*</span>}
                                </span>
                            );
                        })()}
                    </div>
                </div>

                {/* Prix des variants */}
                <div className="flex-1 mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-secondary">Prix par variant</h4>
                        <ProductPriceDropdown product={product}>
                            <button
                                className="text-xs text-primary hover:text-primary/80 transition-colors bg-primary/5 hover:bg-primary/10 px-2 py-1 rounded border border-primary/20 hover:border-primary/30"
                                title="Voir l'analyse des prix"
                            >
                                💰 Prix min
                            </button>
                        </ProductPriceDropdown>
                    </div>
                    <div className="space-y-1 max-h-20 ">
                        {product.variants.map((variant) => {
                            // Vérifier s'il y a un prix modifié en attente pour ce variant
                            const pendingVariantData = pendingProductChanges?.variantData?.[variant.variantId];
                            const hasPendingPrice = pendingVariantData && pendingVariantData.price !== null;
                            const displayPrice = hasPendingPrice ? pendingVariantData.price : variant.customPrice;
                            const isModified = hasPendingPrice && pendingVariantData.price !== variant.customPrice;

                            return (
                                <div
                                    key={variant.variantId}
                                    className="flex justify-between items-center text-sm"
                                >
                                    <span className="text-tertiary truncate flex-1 mr-2">
                                        {variant.variantOptionValue}
                                    </span>
                                    <span
                                        className={`font-medium whitespace-nowrap ${
                                            isModified
                                                ? 'text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-200'
                                                : 'text-primary'
                                        }`}
                                    >
                                        {displayPrice !== null && displayPrice !== undefined
                                            ? `${displayPrice.toFixed(2)} €`
                                            : 'Non défini'}
                                        {isModified && <span className="ml-1 text-xs text-blue-500">*</span>}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Bouton modifier les valeurs */}
                <Button
                    variant="secondary"
                    onClick={() => onOpenPriceModal(product)}
                    disabled={isLoadingUnits}
                    className="w-full mt-auto"
                    size="sm"
                >
                    {isLoadingUnits ? 'Chargement...' : 'Mettre à jour'}
                </Button>
            </div>
        );
    },
);

ProductWithUnit.displayName = 'ProductWithUnit';

function GrowerStocksPage({ authenticatedGrower }: { authenticatedGrower: IGrowerTokenPayload }) {
    const growerId = authenticatedGrower?.id;

    const {
        growerProducts,
        allProducts,
        units,
        addableProducts,
        isLoadingProducts,
        isLoadingGrowerProducts,
        isLoadingUnits,
        addGrowerProduct,
        removeGrowerProduct,
    } = useGrowerStockPageData(growerId);
    const { pendingStockUpdates, hasPendingUpdate, createStockUpdateRequest } = useGrowerStockValidation(growerId);
    const {
        pendingChanges,
        hasProductPendingChanges,
        getPendingChangesCount,
        clearAllPendingChanges,
        getAllPendingChangesForSubmission,
        savePendingStockChanges,
    } = usePendingVariantChanges(growerId);

    // Fonction pour vérifier si un produit a des demandes de validation en attente
    const hasProductPendingValidation = useCallback(
        (productId: string) => {
            return pendingStockUpdates.some((request) => request.productId === productId);
        },
        [pendingStockUpdates],
    );
    const [showProductModal, setShowProductModal] = useState(false);
    const [showPriceModal, setShowPriceModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<IGrowerProductDisplay | null>(null);
    const [localStocks, setLocalStocks] = useState<Record<string, number>>({});
    const [hasChanges, setHasChanges] = useState(false);
    const [isValidating, setIsValidating] = useState(false);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [productToReplace, setProductToReplace] = useState<IProduct | null>(null);
    


    // Initialiser les stocks locaux à partir des données React Query
    const initialStocks = useMemo(() => {
        const stocks: Record<string, number> = {};
        growerProducts.forEach((product) => {
            stocks[product.id] = product.totalStock;
        });
        return stocks;
    }, [growerProducts]);

    // Synchroniser localStocks avec les données initiales seulement si pas de changements en cours
    useEffect(() => {
        if (!hasChanges) {
            setLocalStocks(initialStocks);
        }
    }, [initialStocks, hasChanges]);

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
        const product = growerProducts.find(p => p.id === productId);
        
        if (product) {
            const originalStock = product.totalStock;
            
            // Sauvegarder les modifications de stock dans les changements en attente
            if (validStock !== originalStock) {
                savePendingStockChanges(productId, product.name, validStock, originalStock);
            }
        }

        setLocalStocks((prev) => ({
            ...prev,
            [productId]: validStock,
        }));
        setHasChanges(true);
    }, [growerProducts, savePendingStockChanges]);

    // La mise à jour du stock global se fait uniquement via le bouton "Valider"

    const handleOpenPriceModal = useCallback(
        (product: IGrowerProductDisplay) => {
            if (isLoadingUnits) return;
            setSelectedProduct(product);
            setShowPriceModal(true);
        },
        [isLoadingUnits],
    );



    // Mettre à jour selectedProduct avec les données les plus récentes
    const currentSelectedProduct = useMemo(() => {
        if (!selectedProduct) return null;
        // Trouver le produit mis à jour dans growerProducts
        const updatedProduct = growerProducts.find((p) => p.id === selectedProduct.id);
        return updatedProduct || selectedProduct;
    }, [selectedProduct, growerProducts]);

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

            // Récupérer toutes les modifications en attente
            const allPendingChangesForSubmission = getAllPendingChangesForSubmission();

            if (allPendingChangesForSubmission.length === 0) {
                console.log('Aucune modification en attente à valider');
                setIsValidating(false);
                return;
            }

            // Créer des demandes de validation pour chaque produit modifié
            for (const changeData of allPendingChangesForSubmission) {
                try {
                    const product = growerProducts.find((p) => p.id === changeData.productId);
                    if (!product) continue;

                    // Vérifier qu'il n'y a pas déjà une demande en attente pour ce produit
                    if (hasPendingUpdate(changeData.productId)) {
                        console.log(`Demande déjà en attente pour le produit ${changeData.productId}`);
                        continue;
                    }

                    // Préparer les prix des variants pour la demande de validation
                    let variantPricesForRequest: Array<{ variantId: string; newPrice: number }> | undefined;

                    if (changeData.variantPrices && changeData.variantPrices.length > 0) {
                        variantPricesForRequest = changeData.variantPrices
                            .filter((vp) => vp.price !== null)
                            .map((vp) => ({
                                variantId: vp.variantId,
                                newPrice: vp.price!,
                            }));
                    }

                    // Obtenir la valeur actuelle du stock (incluant les modifications localStorage)
                    const currentStock = changeData.stockChange 
                        ? changeData.stockChange.newStock 
                        : localStocks[changeData.productId] || product.totalStock;

                    // Créer une demande de validation pour l'admin
                    await createStockUpdateRequest.mutateAsync({
                        growerId,
                        productId: changeData.productId,
                        newStock: currentStock,
                        variantPrices: variantPricesForRequest,
                        reason: changeData.stockChange ? 'Mise à jour du stock et des prix' : 'Mise à jour des prix des variants',
                        status: GrowerStockValidationStatus.PENDING,
                        requestDate: new Date().toISOString(),
                    });

                    // Attendre un court délai entre chaque demande
                    await new Promise((resolve) => setTimeout(resolve, 100));
                } catch (productError) {
                    console.error(
                        `Erreur lors de la création de la demande pour le produit ${changeData.productId}:`,
                        productError,
                    );
                    // Continuer avec les autres produits même en cas d'erreur
                }
            }

            // Effacer toutes les modifications en attente après validation
            clearAllPendingChanges();

            console.log(`${allPendingChangesForSubmission.length} demande(s) de validation créée(s) avec succès`);
        } catch (error) {
            console.error('Erreur lors de la création des demandes de validation:', error);
        } finally {
            setIsValidating(false);
        }
    };

    // Nettoyer les timeouts lors du démontage du composant

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

            {/* Alertes globales pour le producteur */}
            <div className="px-4 md:px-8">
                <GlobalGrowerAlerts growerId={growerId} />
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
                    <div className="flex items-center gap-3">
                        <Text
                            variant="h3"
                            className="text-lg md:text-xl"
                        >
                            Mes produits
                        </Text>
                        {getPendingChangesCount() > 0 && (
                            <div className="bg-blue-500 text-white text-sm px-3 py-1 rounded-full font-medium">
                                {getPendingChangesCount()} modifié{getPendingChangesCount() > 1 ? 's' : ''}
                            </div>
                        )}
                    </div>

                    {growerProducts.length > 0 && (
                        <div className="flex flex-col md:flex-row gap-3">
                            {getPendingChangesCount() > 0 && (
                                <Button
                                    variant="secondary"
                                    onClick={() => clearAllPendingChanges()}
                                    className="flex items-center justify-center gap-2 w-full md:w-auto"
                                >
                                    <Image
                                        src="/icons/rollback-icon.svg"
                                        alt="Reset"
                                        width={16}
                                        height={16}
                                    />
                                    Annuler les modifications
                                </Button>
                            )}
                            <Button
                                variant="primary"
                                onClick={handleValidateAllStocks}
                                disabled={getPendingChangesCount() === 0 || isValidating}
                                className="w-full md:w-auto"
                            >
                                {isValidating ? 'Validation...' : 'Valider tous les stocks'}
                            </Button>
                        </div>
                    )}
                </div>

                {isLoadingProducts || isLoadingGrowerProducts ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                            <p className="text-secondary">Chargement des produits...</p>
                        </div>
                    </div>
                ) : growerProducts.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-tertiary text-lg mb-2">📦</div>
                        <p className="text-secondary font-medium mb-1">Aucun produit dans votre liste</p>
                        <p className="text-tertiary text-sm">Utilisez la recherche ci-dessus pour en ajouter.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {growerProducts.map((product, index) => (
                            <ProductWithUnit
                                key={product.id}
                                product={product}
                                localStock={localStocks[product.id] || 0}
                                onStockChange={handleLocalStockChange}
                                onOpenPriceModal={handleOpenPriceModal}
                                onRemoveProduct={handleRemoveFromGrowerProducts}
                                cardIndex={index}
                                isLoadingUnits={isLoadingUnits}
                                hasPendingChanges={hasProductPendingChanges(product.id)}
                                hasPendingValidation={hasProductPendingValidation(product.id)}
                                pendingProductChanges={pendingChanges[product.id]}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* 4. MODAL Suggest New Product */}
            {showProductModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 bg-opacity-50 p-4">
                    <div className="bg-white rounded shadow p-4 md:p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto relative">
                        <button
                            className="absolute top-2 right-2 w-8 h-8 bg-accent text-white rounded-full flex items-center justify-center hover:bg-accent/80 transition-colors z-10"
                            onClick={() => setShowProductModal(false)}
                            title="Fermer"
                        >
                            ×
                        </button>
                        <ProductSuggestionForm
                            growerId={growerId}
                            onSuccess={() => setShowProductModal(false)}
                        />
                    </div>
                </div>
            )}

            {/* 5. MODAL Price Management */}
            {showPriceModal && currentSelectedProduct && (
                <GrowerPriceModal
                    isOpen={showPriceModal}
                    onClose={() => {
                        setShowPriceModal(false);
                        setSelectedProduct(null);
                    }}
                    product={{
                        id: currentSelectedProduct.id,
                        name: currentSelectedProduct.name,
                        totalStock: currentSelectedProduct.totalStock,
                        baseUnitId: allProducts.find((p) => p.id === currentSelectedProduct.id)?.baseUnitId ?? null,
                        variants: (allProducts.find((p) => p.id === currentSelectedProduct.id)?.variants || []).map(
                            (v) => {
                                const gpVar = currentSelectedProduct.variants.find((x) => x.variantId === v.id);
                                return {
                                    id: v.id,
                                    optionValue: v.optionValue,
                                    price: (gpVar?.customPrice ?? gpVar?.price ?? v.price) as number,
                                    quantity: v.quantity ?? null,
                                    unitId: v.unitId ?? null,
                                };
                            },
                        ),
                    }}
                    units={units}
                    growerId={growerId}
                />
            )}

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
