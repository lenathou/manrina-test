import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { backendFetchService } from '@/service/BackendFetchService';
import { IUnit, IProductVariant } from '@/server/product/IProduct';
import { IGrowerProductWithRelations } from '@/server/grower/IGrowerRepository';
import { IGrowerStockPageData } from '@/hooks/useGrowerStockPageData';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';

interface GrowerPriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    name: string;
    variants: Array<{
      id: string;
      optionValue: string | null;
      price: number;
      quantity: number | null;
      unitId: string | null;
    }>;
  };
  units: IUnit[];
  growerId: string;
}

type GrowerProductWithVariantCache = IGrowerProductWithRelations & {
  product: IGrowerProductWithRelations['product'] & {
    variants?: IProductVariant[];
  };
};

export default function GrowerPriceModal({
  isOpen,
  onClose,
  product,
  units,
  growerId
}: GrowerPriceModalProps) {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();


 const [variantPrices, setVariantPrices] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialiser les prix avec les prix actuels du produit
  useEffect(() => {
    if (isOpen && product) {
      console.log('GrowerPriceModal - Product data:', product);
      console.log('GrowerPriceModal - Variants:', product.variants);
      product.variants.forEach(variant => {
        console.log(`Variant ${variant.id}:`, {
          optionValue: variant.optionValue,
          quantity: variant.quantity,
          unitId: variant.unitId,
          price: variant.price
        });
      });
      
      const initialPrices: Record<string, string> = {};
      product.variants.forEach(variant => {
        initialPrices[variant.id] = variant.price.toString();
      });
      setVariantPrices(initialPrices);
      setErrors({});
    }
  }, [isOpen, product]);

  // Fonction pour obtenir le nom d'affichage d'une variante
  const getVariantDisplayName = (variant: typeof product.variants[0]): string => {
    // Si on a quantity et unitId, afficher "quantity unit"
    if (variant.quantity && variant.unitId) {
      const unit = units.find(u => u.id === variant.unitId);
      if (unit) {
        return `${variant.quantity} ${unit.symbol}`;
      }
    }
    
    // Sinon utiliser variantOptionValue
    if (variant.optionValue && variant.optionValue.trim() !== "" && variant.optionValue !== "Default") {
      return variant.optionValue;
    }
    
    // Pour les variantes par défaut, afficher le nom du produit
    return product.name;
  };

  // Mutation pour mettre à jour les prix
  const updatePricesMutation = useMutation({
    mutationFn: async () => {
      const toUpdate = product.variants
        .map((v) => ({
          variantId: v.id,
          oldPrice: typeof v.price === 'number' ? v.price : parseFloat(String(v.price)),
          newPriceStr: variantPrices[v.id],
        }))
        .filter((e) => {
          if (e.newPriceStr === undefined || e.newPriceStr === null) return false;
          const newPrice = parseFloat(e.newPriceStr);
          if (isNaN(newPrice)) return false;
          return newPrice !== e.oldPrice;
        })
        .map(({ variantId, newPriceStr }) => ({ variantId, price: parseFloat(newPriceStr!) }));

      if (toUpdate.length === 0) return [] as unknown[];

      return backendFetchService.updateMultipleVariantPrices({
        growerId,
        variantPrices: toUpdate,
      });
    },
    onMutate: async () => {
      // Cancel outgoing refetches so we don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ['growerStockPageData', growerId] });

      // Snapshot previous value
      const previous = queryClient.getQueryData<IGrowerStockPageData>(['growerStockPageData', growerId]);

      try {
        // Compute changes
        const changes: Record<string, number> = {};
        product.variants.forEach((variant) => {
          const value = variantPrices[variant.id];
          if (value != null && value !== '') {
            const nextPrice = parseFloat(value);
            if (!Number.isNaN(nextPrice) && nextPrice !== (typeof variant.price === 'number' ? variant.price : parseFloat(String(variant.price)))) {
              changes[variant.id] = nextPrice;
            }
          }
        });

        // Apply optimistic update to cached page data
        if (previous && Array.isArray(previous.growerProducts) && Array.isArray(previous.allProducts)) {
          const growerProductsWithVariants = previous.growerProducts as GrowerProductWithVariantCache[];

          const updated = {
            ...previous,
            growerProducts: growerProductsWithVariants.map((growerProduct) => {
              if (growerProduct.product?.id !== product.id || !Array.isArray(growerProduct.product?.variants)) {
                return growerProduct;
              }

              const updatedVariants = growerProduct.product.variants.map((variant) =>
                changes[variant.id] != null ? { ...variant, price: changes[variant.id]! } : variant,
              );

              return {
                ...growerProduct,
                product: {
                  ...growerProduct.product,
                  variants: updatedVariants,
                },
              };
            }),
            allProducts: previous.allProducts.map((storeProduct) => {
              if (storeProduct.id !== product.id) {
                return storeProduct;
              }

              return {
                ...storeProduct,
                variants: storeProduct.variants.map((storeVariant) =>
                  changes[storeVariant.id] != null ? { ...storeVariant, price: changes[storeVariant.id]! } : storeVariant,
                ),
              };
            }),
          };

          queryClient.setQueryData<IGrowerStockPageData>(['growerStockPageData', growerId], updated);
        }
      } catch {}

      return { previous };
    },
    onSuccess: () => {
      success('Prix mis à jour avec succès');
      onClose();
    },
    onError: (error, _vars, context) => {
      // Rollback optimistic update on error
      if (context?.previous) {
        queryClient.setQueryData(['growerStockPageData', growerId], context.previous);
      }
      console.error('Erreur lors de la mise à  jour des prix:', error);
      setErrors({ general: 'Erreur lors de la mise à  jour des prix' });
      toastError('Erreur lors de la mise à  jour des prix');
    },
    onSettled: () => {
      // Ensure server truth
      queryClient.invalidateQueries({ queryKey: ['growerStockPageData', growerId] });
      queryClient.invalidateQueries({ queryKey: ['grower-stock', growerId] });
      queryClient.invalidateQueries({ queryKey: ['calculateGlobalStock', product.id] });
    },
  });

  const handlePriceChange = (variantId: string, value: string) => {
    setVariantPrices(prev => ({
      ...prev,
      [variantId]: value
    }));
    
    // Supprimer l'erreur pour ce variant si elle existe
    if (errors[variantId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[variantId];
        return newErrors;
      });
    }
  };

  const validatePrices = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    Object.entries(variantPrices).forEach(([variantId, priceStr]) => {
      const price = parseFloat(priceStr);
      if (isNaN(price) || price < 0) {
        newErrors[variantId] = 'Le prix doit être un nombre positif';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validatePrices()) {
      updatePricesMutation.mutate();
    }
  };

  const handleCancel = () => {
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="mx-4 w-full max-w-lg max-h-[90vh] overflow-hidden p-0">
        <CardHeader className="bg-secondary text-white p-6 m-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white text-lg font-semibold">Gérer les prix</CardTitle>
              <CardDescription className="text-white/90 mt-1">{product.name}</CardDescription>
            </div>
            <button
              onClick={handleCancel}
              className="text-white/80 hover:text-white transition-colors"
              disabled={updatePricesMutation.isPending}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </CardHeader>

        <CardContent className="bg-background p-6 space-y-4">
          {errors.general && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {errors.general}
            </div>
          )}

          <div className="max-h-[50vh] space-y-4 overflow-y-auto pr-1">
            {product.variants.map((variant) => {
              const priceError = errors[variant.id];
              return (
                <Card key={variant.id} variant="outlined" padding="md" className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{getVariantDisplayName(variant)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      value={variantPrices[variant.id] ?? ''}
                      onChange={(event) => handlePriceChange(variant.id, event.target.value)}
                      className={`flex-1 ${priceError ? 'border-red-400 focus-visible:ring-red-500' : ''}`}
                      placeholder="Prix"
                      min="0"
                      step="0.01"
                      disabled={updatePricesMutation.isPending}
                    />
                    <span className="text-sm font-medium text-gray-500">€</span>
                  </div>
                  {priceError && (
                    <p className="text-sm text-red-600">{priceError}</p>
                  )}
                </Card>
              );
            })}
          </div>
        </CardContent>

        <CardFooter className="bg-background p-6 border-t border-gray-200 flex justify-end space-x-3">
          <Button
            onClick={handleCancel}
            variant="secondary"
            disabled={updatePricesMutation.isPending}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={updatePricesMutation.isPending}
          >
            {updatePricesMutation.isPending ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}







