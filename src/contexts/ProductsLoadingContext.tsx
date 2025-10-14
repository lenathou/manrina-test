import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ProductsLoadingContextType {
    areProductsLoaded: boolean;
    setProductsLoaded: (loaded: boolean) => void;
}

const ProductsLoadingContext = createContext<ProductsLoadingContextType | undefined>(undefined);

export function ProductsLoadingProvider({ children }: { children: ReactNode }) {
    const [areProductsLoaded, setAreProductsLoaded] = useState(false);

    const setProductsLoaded = (loaded: boolean) => {
        setAreProductsLoaded(loaded);
    };

    return (
        <ProductsLoadingContext.Provider value={{ areProductsLoaded, setProductsLoaded }}>
            {children}
        </ProductsLoadingContext.Provider>
    );
}

export function useProductsLoading() {
    const context = useContext(ProductsLoadingContext);
    if (context === undefined) {
        throw new Error('useProductsLoading must be used within a ProductsLoadingProvider');
    }
    return context;
}