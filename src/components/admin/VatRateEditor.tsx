import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTaxRates } from '../../contexts/TaxRatesContext';
import { TaxRate } from '../../server/payment/PaymentService';
import { IProductVariant, VatRate } from '../../server/product/IProduct';
import { colorUsages, common, variables } from '../../theme';
import { useUpdateVariant } from './useUpdateVariant';

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
            <View style={styles.vatRateDisplay}>
                <Text style={styles.vatRateText}>Loading...</Text>
            </View>
        );
    }

    if (!isSelecting) {
        const displayRate = taxRates.find((rate) => rate.taxId === currentVatRate.taxId) || defaultTaxRate;
        return (
            <TouchableOpacity
                style={styles.vatRateDisplay}
                onPress={() => setIsSelecting(true)}
                disabled={updating}
            >
                <Text style={styles.vatRateText}>
                    {displayRate
                        ? `${displayRate.displayName} (${displayRate.taxRate}%)`
                        : `VAT: ${currentVatRate.taxRate}%`}
                </Text>
            </TouchableOpacity>
        );
    }

    return (
        <View style={styles.vatRateSelector}>
            {taxRates.map((rate) => (
                <TouchableOpacity
                    key={rate.taxId}
                    style={[styles.vatRateOption, currentVatRate.taxId === rate.taxId && styles.selectedVatRate]}
                    onPress={() =>
                        updateVatMutation.mutate({
                            variantId: variant.id,
                            dataToUpdate: { vatRate: convertTaxRate(rate) },
                        })
                    }
                    disabled={updating}
                >
                    <Text
                        style={[
                            styles.vatRateOptionText,
                            currentVatRate.taxId === rate.taxId && styles.selectedVatRateText,
                        ]}
                    >
                        {rate.taxRate}%
                        <Text style={styles.vatRatePercentage}>
                            {'\n'}
                            {rate.displayName}
                        </Text>
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    vatRateDisplay: {
        padding: variables.spaceSmall,
        borderRadius: 4,
        backgroundColor: colorUsages.backgroundLight,
        minWidth: 80,
    },
    vatRateText: {
        ...common.text.text,
    },
    vatRateSelector: {
        flexDirection: 'row',
        gap: variables.spaceSmall,
        alignItems: 'center',
        backgroundColor: colorUsages.backgroundLight,
        padding: variables.spaceSmall,
        borderRadius: 4,
        flexWrap: 'wrap',
    },
    vatRateOption: {
        padding: variables.spaceSmall,
        borderRadius: 4,
        backgroundColor: colorUsages.white,
        minWidth: 80,
        alignItems: 'center',
    },
    selectedVatRate: {
        backgroundColor: colorUsages.primary,
    },
    vatRateOptionText: {
        ...common.text.text,
        textAlign: 'center',
        lineHeight: 16,
    },
    selectedVatRateText: {
        color: colorUsages.white,
    },
    vatRatePercentage: {
        fontSize: 12,
        opacity: 0.8,
    },
});
