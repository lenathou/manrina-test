import { IProduct, IProductVariant, IUnit } from '@/server/product/IProduct';
import { useQuery } from '@tanstack/react-query';
import { backendFetchService } from '@/service/BackendFetchService';

interface VariantCalculatedStockProps {
    product: IProduct;
    variant: IProductVariant;
    units: IUnit[];
}

export function VariantCalculatedStock({ product, variant }: VariantCalculatedStockProps) {
    // Récupérer les stocks calculés pour ce produit
    const { data: stockCalculation } = useQuery({
        queryKey: ['calculateGlobalStock', product.id],
        queryFn: async () => {
            try {
                const response = await backendFetchService.calculateGlobalStock(product.id);
                return response;
            } catch (error) {
                console.error('Erreur lors du calcul du stock global:', error);
                return null;
            }
        },
        enabled: !!product.baseUnit && !!product.baseQuantity,
        staleTime: 0, // Pas de cache, toujours récupérer les données fraîches
    });
    
    
    // Trouver le stock calculé pour ce variant
    const variantStock = stockCalculation?.variantStocks?.find(
        vs => vs.variantId === variant.id
    );
    
    const calculatedStock = variantStock?.calculatedStock ?? 0;
    
    // Si le produit n'a pas d'unité de base définie, afficher un message
    if (!product.baseUnit || !product.baseQuantity) {
        return (
            <div className="text-xs text-gray-400 italic">
                Unité de base non définie
            </div>
        );
    }
    
    return (
        <div className="text-sm">
            <div className="font-medium text-gray-900">
                {calculatedStock} unités
            </div>
            <div className="text-xs text-gray-500">
                Calculé automatiquement
            </div>
        </div>
    );
}