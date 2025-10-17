import { useMutation } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Header, HeaderTitle } from '@/components/Header/Header';
import { BackButton } from '@/components/products/BackButton';
import { useAppContext } from '@/context/AppContext';
import { BasketContentFromAppContext, ValidateBasketButton } from '@/payments/BasketContent';
import { BasketValidationResult } from '@/server/product/ProductUseCases';
import { backendFetchService } from '@/service/BackendFetchService';
import { colorUsages } from '@/theme';
import { BasketElement } from '@/types/BasketElement';
const Panier = () => {
    const { basketStorage } = useAppContext();
    const [validationResult, setValidationResult] = useState<BasketValidationResult | undefined>();

    const validateBasketMutation = useMutation({
        mutationFn: (items: Array<{ productId: string; variantId: string; quantity: number }>) =>
            backendFetchService.validateBasketItems(items),
        onSuccess: (data) => {
            setValidationResult(data);
        },
    });

    const validateBasket = useCallback(() => {
        if (basketStorage.items.length > 0) {
            validateBasketMutation.mutate(
                basketStorage.items.map((item: BasketElement) => ({
                    productId: item.product.id,
                    variantId: item.productVariant.id,
                    quantity: item.quantity,
                })),
            );
        } else {
            setValidationResult(undefined);
        }
    }, [basketStorage.items]);

    useEffect(() => {
        validateBasket();
    }, [validateBasket]);

    const isValidating = validateBasketMutation.isPending;

    return (
        <>
            <Header
                backgroundStyle={{
                    backgroundColor: colorUsages.secondary,
                }}
                LeftSection={<BackButton color={colorUsages.white} />}
                CentralSection={<HeaderTitle style={{ color: colorUsages.white }}>Mon panier</HeaderTitle>}
                hideBasket
            />
            <View style={stylesPanier.container}>
                <BasketContentFromAppContext
                    canUpdate
                    validationResult={validationResult}
                >
                    <ValidateBasketButton
                        disabled={(validationResult && !validationResult?.isValid) || isValidating}
                        message={
                            validationResult && !validationResult?.isValid
                                ? 'Certains produits ne sont plus disponibles'
                                : undefined
                        }
                    />
                </BasketContentFromAppContext>
            </View>
        </>
    );
};

export default Panier;

const stylesPanier = StyleSheet.create({
    container: {
        display: 'flex',
        padding: 20,
        width: '100%',
        flexDirection: 'column',
        alignItems: 'center',
        flex: 1,
    },
});
