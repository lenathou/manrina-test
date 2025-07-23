import { useQuery } from '@tanstack/react-query';
import { createContext, ReactNode, useContext } from 'react';
import { TaxRate } from '../server/payment/PaymentService';
import { backendFetchService } from '../service/BackendFetchService';

interface TaxRatesContextType {
    taxRates: TaxRate[];
    defaultTaxRate: TaxRate | null;
    isLoading: boolean;
    error: Error | null;
}

const TaxRatesContext = createContext<TaxRatesContextType | undefined>(undefined);

export function TaxRatesProvider({ children }: { children: ReactNode }) {
    const {
        data: stripeTaxRatesQueryResult,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['stripeTaxRates'],
        queryFn: backendFetchService.getTaxRates,
    });

    const value = {
        taxRates: stripeTaxRatesQueryResult?.allRates || [],
        defaultTaxRate: stripeTaxRatesQueryResult?.defaultTaxRate || null,
        isLoading,
        error: error as Error | null,
    };

    return <TaxRatesContext.Provider value={value}>{children}</TaxRatesContext.Provider>;
}

export function useTaxRates() {
    const context = useContext(TaxRatesContext);
    if (context === undefined) {
        throw new Error('useTaxRates must be used within a TaxRatesProvider');
    }
    return context;
}
