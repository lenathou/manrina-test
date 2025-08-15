import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { useAppContext } from '../../../context/AppContext';
import { IProduct, IProductVariant } from '../../../server/product/IProduct';
import { colorUsages, common, variables } from '../../../theme';
import { BasketStatusBadge } from '../../BasketStatusBadge';

const variantStyles = StyleSheet.create({
    variantSelector: {
        flexDirection: 'row',
        gap: variables.space,
        flexWrap: 'wrap',
    },
    variantButton: {
        paddingHorizontal: variables.space,
        paddingVertical: variables.spaceSmall,
        borderRadius: variables.radiusXS,
        backgroundColor: colorUsages.notSelected,
        flexDirection: 'row',
        alignItems: 'center',
        gap: variables.spaceSmall,
    },
    selectedVariant: {
        backgroundColor: colorUsages.selected,
        color: colorUsages.white,
    },
    variantText: {
        ...common.text.paragraph,
        lineHeight: common.text.paragraph.fontSize,
        paddingTop: variables.spaceSmaller,
        color: 'inherit',
        maxWidth: 140,
    },
    outOfStockText: {
        color: colorUsages.lightInfo,
    },
    outOfStockVariant: {
        opacity: 0.5,
    },
    variantContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: variables.spaceSmall,
    },
});

export const VariantSelector = ({
    product,
    selectedVariantId,
    setSelectedVariantId,
    maxVariantsToDisplay = Infinity,
}: {
    product: IProduct;
    selectedVariantId?: string;
    setSelectedVariantId: (variantId: string) => void;
    maxVariantsToDisplay?: number;
}) => {
    const { getProductQuantityInBasket } = useAppContext();
    const numberVariantsNotShown = product.variants.length - maxVariantsToDisplay;

    return (
        <>
            {product.variants.length > 0 && (
                <View style={variantStyles.variantSelector}>
                    {product.variants.slice(0, maxVariantsToDisplay).map((variant) => {
                        const quantityInBasket = getProductQuantityInBasket(product.id, variant.id);
                        return (
                            <VariantElement
                                key={variant.id}
                                selected={selectedVariantId === variant.id}
                                variant={variant}
                                onPress={() => setSelectedVariantId(variant.id)}
                                quantityInBasket={quantityInBasket}
                            />
                        );
                    })}
                    {numberVariantsNotShown > 0 && (
                        <VariantElement
                            variant={{
                                id: 'more',
                                optionValue: `+${numberVariantsNotShown}`,
                                stock: 0,
                            }}
                        />
                    )}
                </View>
            )}
        </>
    );
};

export const VariantElement = ({
    variant,
    onPress,
    style,
    selected,
    quantityInBasket = 0,
}: {
    variant: Pick<IProductVariant, 'id' | 'optionValue' | 'stock'>;
    onPress?: () => void;
    style?: ViewStyle;
    selected?: boolean;
    quantityInBasket?: number;
}) => {
    const { getDisplayVariantValue } = useAppContext();
    const outOfStock = variant.stock <= 0;

    // Utiliser getDisplayVariantValue au lieu de variant.optionValue directement
    const displayValue =
        variant.id === 'more' ? variant.optionValue : getDisplayVariantValue(variant as IProductVariant);

    if (!displayValue) {
        return null;
    }

    return (
        <TouchableOpacity
            style={[
                variantStyles.variantButton,
                selected && variantStyles.selectedVariant,
                outOfStock && variantStyles.outOfStockVariant,
                style,
            ]}
            onPress={onPress}
            disabled={outOfStock}
        >
            <View style={variantStyles.variantContent}>
                <Text
                    style={[variantStyles.variantText, outOfStock && variantStyles.outOfStockText]}
                    accessibilityLabel={'En rupture de stock'}
                    accessibilityHint={'En rupture de stock'}
                >
                    {displayValue}
                </Text>
                {variant.id !== 'more' && (
                    <BasketStatusBadge
                        quantity={quantityInBasket}
                        size={20}
                    />
                )}
            </View>
        </TouchableOpacity>
    );
};
