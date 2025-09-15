import { IGrowerProductVariant } from '@/server/grower/IGrower';
import { backendFetchService } from '@/service/BackendFetchService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const GROWER_STOCK_QUERY_KEY = 'grower-stock';

// Type helper pour gérer les différentes structures de données
type ProductWithVariant = {
    product?: { id: string; name: string; imageUrl?: string; variants?: IGrowerProductVariant[] };
    variant?: { id: string; optionValue: string; price?: number };
    variants?: Array<{ id: string; optionValue: string; price?: number; variant?: IGrowerProductVariant }>;
    stock?: number;
    price?: number;
    productId?: string;
    productName?: string;
    productImageUrl?: string;
    variantId?: string;
    variantStock?: number;
    available?: number;
    id?: string;
    growerId?: string;
    createdAt?: Date;
    updatedAt?: Date;
};

// Type pour les variants intermédiaires avant transformation en IGrowerProductVariant
type VariantRecord = {
    id?: string;
    variantId?: string;
    optionValue?: string;
    name?: string;
    price?: number;
    productId?: string;
};

function toVariantRecords(p: ProductWithVariant): VariantRecord[] {
    // 1) p.variant (objet)
    if (p?.variant && typeof p.variant === "object") return [p.variant];

    // 2) p.variants (tableau) — ex: table de jointure growerVariants
    if (Array.isArray(p?.variants) && p.variants.length > 0) {
        // Certains repos stockent la vraie donnée sous variants[i].variant
        const hasNested = p.variants.some((v) => !!v?.variant);
        if (hasNested) {
            return p.variants.map((v) => v.variant).filter((variant): variant is IGrowerProductVariant => variant !== undefined);
        }
        return p.variants;
    }

    // 3) p.product?.variants (tableau) — ex: produit avec ses variants
    if (Array.isArray(p?.product?.variants)) {
        return p.product?.variants || [];
    }

    // 4) Pas de variant trouvé → on crée un variant par défaut
    return [{
        id: `${p?.product?.id || p?.productId || "prod"}::default`,
        optionValue: "Default",
        price: p?.price || 0
    }];
}

export function useGrowerStock(growerId: string | undefined) {
    const queryClient = useQueryClient();

    // Fetch all grower product variants
    const {
        data: growerProducts = [],
        isLoading,
        refetch,
       
    } = useQuery<IGrowerProductVariant[]>({
        queryKey: [GROWER_STOCK_QUERY_KEY, growerId],
        queryFn: async () => {
            if (!growerId) {
                return [];
            }
            try {
                const products = await backendFetchService.listGrowerProducts(growerId);
                
                const flatVariants: IGrowerProductVariant[] = [];

                for (const p of products as ProductWithVariant[]) {
                    const variants = toVariantRecords(p);

                    for (const v of variants) {
                        // certains schémas véhiculent le stock/prix au niveau grower-variant (ligne de jointure)
                        const stockFromP = p.stock ?? p.variantStock ?? p.available ?? 0;
                        const priceFromV = v?.price ?? p?.price ?? 0;

                        flatVariants.push({
                            productId: p.product?.id ?? p.productId ?? v.productId ?? "unknown",
                            productName: p.product?.name ?? p.productName ?? "Sans nom",
                            productImageUrl: p.product?.imageUrl ?? p.productImageUrl ?? "",
                            variantId: v?.variantId ?? v?.id ?? `${p.product?.id || "prod"}::default`,
                            variantOptionValue: v?.optionValue ?? v?.name ?? "Default",
                            price: priceFromV,
                            stock: stockFromP,
                        });
                    }
                }

                // Sécurité : on filtre les entrées sans id
                const safeFlat = flatVariants.filter(v => v.productId && v.variantId);
                
                return safeFlat;
            } catch (error) {
                console.error('useGrowerStock - Error in queryFn:', error);
                throw error;
            }
        },
        enabled: !!growerId,
        retry: 1,
        retryDelay: 1000,
    });

    // Add products
    const addGrowerProduct = useMutation({
        mutationFn: async (payload: { productId: string; stock: number }) => {
            if (!growerId) throw new Error('No growerId');
            return backendFetchService.addGrowerProduct(growerId, payload.productId, payload.stock);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: [GROWER_STOCK_QUERY_KEY, growerId] });
            // Invalider le cache du calcul du stock global pour le produit affecté
            queryClient.invalidateQueries({ queryKey: ['calculateGlobalStock', variables.productId] });
            // Invalider le cache des produits pour mettre à jour le stock global affiché
            queryClient.invalidateQueries({ queryKey: ['stock-products-all'] });
        },
    });

    // Remove product
    const removeGrowerProduct = useMutation({
        mutationFn: async (productId: string) => {
            if (!growerId) throw new Error('No growerId');
            return backendFetchService.removeGrowerProduct({ growerId, productId });
        },
        onSuccess: (_, productId) => {
            queryClient.invalidateQueries({ queryKey: [GROWER_STOCK_QUERY_KEY, growerId] });
            // Invalider le cache du calcul du stock global pour le produit spécifique
            queryClient.invalidateQueries({ queryKey: ['calculateGlobalStock', productId] });
            // Invalider le cache des produits pour mettre à jour le stock global affiché
            queryClient.invalidateQueries({ queryKey: ['stock-products-all'] });
        },
    });

    // Update stock
    const updateGrowerProductStock = useMutation({
        mutationFn: async ({ productId, stock }: { productId: string; stock: number }) => {
            if (!growerId) throw new Error('No growerId');
            return backendFetchService.updateGrowerProductStock({ growerId, productId, stock });
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: [GROWER_STOCK_QUERY_KEY, growerId] });
            // Invalider le cache du calcul du stock global pour le produit spécifique
            queryClient.invalidateQueries({ queryKey: ['calculateGlobalStock', variables.productId] });
            // Invalider le cache des produits pour mettre à jour le stock global affiché
            queryClient.invalidateQueries({ queryKey: ['stock-products-all'] });
        },
    });

    return {
        growerProducts,
        isLoading,
        refetch,
        addGrowerProduct,
        removeGrowerProduct,
        updateGrowerProductStock,
    };
}
