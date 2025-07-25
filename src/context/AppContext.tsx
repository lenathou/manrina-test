import { useQuery } from '@tanstack/react-query';
import { PropsWithChildren, createContext, useContext, useMemo } from 'react';
import { BasketStorage, useBasketStorage } from '../hooks/useBasketStorage';
import { IProduct, IProductVariant, IUnit } from '../server/product/IProduct';
import { backendFetchService } from '../service/BackendFetchService';
import { useUnits } from '../hooks/useUnits';
import { getDisplayVariantValue } from '../utils/productDisplay';
import { IPanyenProduct } from '../server/panyen/IPanyen';

type AppContextType = {
    basketStorage: BasketStorage;
    totalProducts: number;
    addProductToBasket: (product: IProduct, quantity: number, variantId: string) => void;
    removeProductFromBasket: (productId: string, variantId: string) => void;
    decrementProductQuantity: (productId: string, variantId: string) => void;
    updateProductQuantity: (productId: string, variantId: string, quantity: number, setQuantity?: boolean) => boolean;
    getProductQuantityInBasket: (productId: string, variantId: string) => number;
    products: IProduct[];
    getProductsByCategory: (category: string) => IProduct[];
    isLoading: boolean;
    resetBasketStorage: () => void;
    units: IUnit[];
    getDisplayVariantValue: (variant: IProductVariant) => string;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider = ({ children }: PropsWithChildren) => {
    const {
        basketStorage,
        totalProducts,
        addProductToBasket,
        removeProductFromBasket,
        decrementProductQuantity,
        resetBasketStorage,
        updateProductQuantity,
        getProductQuantityInBasket,
    } = useBasketStorage();

    // Récupérer les produits réguliers
    const { data: regularProducts = [], isLoading: isLoadingRegularProducts } = useQuery({
        queryKey: ['products'],
        queryFn: () => backendFetchService.getAllProductsWithStock(),
    });

    // Récupérer les paniers visibles dans le magasin
    const { data: panyenProducts = [], isLoading: isLoadingPanyenProducts } = useQuery({
        queryKey: ['panyen-store-products'], // Clé différente pour éviter les conflits avec l'admin
        queryFn: async (): Promise<IPanyenProduct[]> => {
            // Récupérer seulement les paniers visibles dans le magasin
            const result = await backendFetchService.getAllPanyen(true);
            return result.filter((panyen) => panyen.showInStore);
        },
    });

    // Convertir les paniers en format IProduct
    const convertPanyenToProduct = (panyen: IPanyenProduct): IProduct => {
        return {
            id: `panyen_${panyen.id}`,
            name: panyen.name,
            description: panyen.description || null,
            imageUrl: panyen.imageUrl,
            showInStore: panyen.showInStore,
            category: 'Nos Paniers Manrina',
            variants: [
                {
                    id: `panyen_variant_${panyen.id}`,
                    optionSet: 'Panier',
                    optionValue: 'Standard',
                    productId: `panyen_${panyen.id}`,
                    description: panyen.description || null,
                    imageUrl: panyen.imageUrl,
                    price: panyen.price,
                    stock: 999, // Stock illimité pour les paniers
                    vatRate: null,
                    showDescriptionOnPrintDelivery: true,
                    unit: null,
                    unitId: null,
                    quantity: null,
                    displayOrder: 0,
                    isPrimary: true,
                },
            ],
            primaryVariantId: `panyen_variant_${panyen.id}`,
        };
    };

    // Combiner les produits réguliers et les paniers convertis
    const products = useMemo(() => {
        const convertedPanyens = panyenProducts.map(convertPanyenToProduct);
        const allProducts = [...regularProducts, ...convertedPanyens];
        return allProducts
            .filter((product) => product.showInStore) // Filtrer par visibilité
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [regularProducts, panyenProducts]);

    const isLoading = isLoadingRegularProducts || isLoadingPanyenProducts;

    const { data: units = [] } = useUnits();

    const getProductsByCategory = (category: string) => {
        if (!category) return products;
        return products.filter((product) => product.category === category);
    };

    const getDisplayVariantValueWithUnits = (variant: IProductVariant) => {
        return getDisplayVariantValue(variant, units);
    };

    return (
        <AppContext.Provider
            value={{
                basketStorage,
                totalProducts,
                addProductToBasket,
                removeProductFromBasket,
                decrementProductQuantity,
                updateProductQuantity,
                getProductQuantityInBasket,
                products,
                getProductsByCategory,
                isLoading,
                resetBasketStorage,
                units,
                getDisplayVariantValue: getDisplayVariantValueWithUnits,
            }}
        >
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const appContext = useContext(AppContext);
    if (!appContext) {
        throw new Error('useAppContext must be used within an AppContextProvider');
    }
    return appContext;
};
