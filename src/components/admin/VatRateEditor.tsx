import { useState } from 'react';
import { useTaxRates } from '../../contexts/TaxRatesContext';
import { TaxRate } from '../../server/payment/PaymentService';
import { IProductVariant, VatRate } from '../../server/product/IProduct';
import { useUpdateVariant } from '../../hooks/useUpdateVariant';

interface VatRateEditorProps {
    variant: IProductVariant;
}

export function VatRateEditor({ variant }: VatRateEditorProps) {
    const [isSelecting, setIsSelecting] = useState(false);
    const { taxRates, defaultTaxRate, isLoading } = useTaxRates();

    const updateVatMutation = useUpdateVariant<'vatRate'>({ errorMessage: 'Failed to update VAT rate' });
    const updating = updateVatMutation.isPending;

    // Convert TaxRate to VatRate
    const convertTaxRate = (taxRate: TaxRate): VatRate => ({
        taxRate: taxRate.taxRate,
        taxId: taxRate.taxId,
    });

    const currentVatRate = variant.vatRate || { taxRate: 0, taxId: 'none' };

    if (isLoading || !currentVatRate) {
        return (
            <div className="px-3 py-2 rounded bg-gray-100 min-w-20">
                <span className="text-sm">Loading...</span>
            </div>
        );
    }

    if (!isSelecting) {
        const displayRate = taxRates.find((rate) => rate.taxId === currentVatRate.taxId) || defaultTaxRate;
        return (
            <button
                className="px-3 py-2 rounded bg-gray-100 min-w-20 text-sm hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setIsSelecting(true)}
                disabled={updating}
            >
                {displayRate
                    ? `${displayRate.displayName} (${displayRate.taxRate}%)`
                    : `VAT: ${currentVatRate.taxRate}%`}
            </button>
        );
    }

    return (
        <div className="flex flex-row gap-2 items-center bg-gray-100 p-2 rounded flex-wrap">
            {taxRates.map((rate) => (
                <button
                    key={rate.taxId}
                    className={`p-2 rounded min-w-20 text-center text-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                        currentVatRate.taxId === rate.taxId
                            ? 'bg-blue-500 text-white'
                            : 'bg-white hover:bg-gray-50'
                    }`}
                    onClick={() =>
                        updateVatMutation.mutate({
                            variantId: variant.id,
                            dataToUpdate: { vatRate: convertTaxRate(rate) },
                        })
                    }
                    disabled={updating}
                >
                    <div>
                        {rate.taxRate}%
                        <div className="text-xs opacity-80">
                            {rate.displayName}
                        </div>
                    </div>
                </button>
            ))}
        </div>
    );
}
