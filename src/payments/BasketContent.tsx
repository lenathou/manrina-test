import { useRouter } from 'next/router';
import { PropsWithChildren } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppButton } from '../components/button';
import { EmptyBasket } from '../components/icons/EmptyBasket';
import { BasketItem } from '../components/products/BasketItem';
import { useAppContext } from '../context/AppContext';
import { BasketStorage } from '../hooks/useBasketStorage';
import { ROUTES } from '../router/routes';
import { BasketValidationResult } from '../server/product/ProductUseCases';
import { backendFetchService } from '../service/BackendFetchService';
import { numberFormat } from '../service/NumberFormat';
import { colorUsages, common } from '../theme';
import { DeliveryMethod } from '../types/DeliveryMethodsType';
import { getTotalPriceWithDelivery } from './getTotalPrice';

export const BasketContentFromAppContext = ({
    children,
    canUpdate,
    deliveryMethod,
    validationResult,
}: PropsWithChildren<{
    canUpdate?: boolean;
    deliveryMethod?: DeliveryMethod;
    validationResult?: BasketValidationResult;
}>) => {
    const { basketStorage, totalProducts } = useAppContext();

    if (totalProducts === 0) {
        return <BasketIsEmpty />;
    }
    const { basketTotalPrice, deliveryCost, totalPrice } = getTotalPriceWithDelivery(basketStorage, deliveryMethod);
    return (
        <View style={{ maxWidth: 600 }}>
            <Text style={styles.title}>
                {totalProducts} ARTICLE{totalProducts > 1 ? 'S' : ''}
            </Text>
            <BasketItems
                basketStorage={basketStorage}
                canUpdate={canUpdate}
                validationResult={validationResult}
            />

            <View style={styles.summary}>
                <View style={styles.summaryLine}>
                    <Text style={styles.summaryLabel}>Coût Total</Text>
                    <Text style={styles.summaryValue}>{numberFormat.toPrice(basketTotalPrice)}</Text>
                </View>
                <View style={styles.summaryLine}>
                    <Text style={styles.summaryLabel}>Livraison</Text>
                    <Text>
                        {deliveryMethod ? `${numberFormat.toPrice(deliveryCost)}` : 'calculé au moment du paiement'}
                    </Text>
                </View>
                <View style={styles.summaryLine}>
                    <Text style={styles.summaryTotalLabel}>Total</Text>
                    <Text style={styles.summaryTotalValue}>{numberFormat.toPrice(totalPrice)}</Text>
                </View>
                {children}
            </View>
        </View>
    );
};

const BasketItems = ({
    basketStorage,
    canUpdate,
    validationResult,
}: {
    basketStorage: BasketStorage;
    canUpdate?: boolean;
    validationResult?: BasketValidationResult;
}) => {
    const { addProductToBasket, decrementProductQuantity } = useAppContext();

    return (
        <View>
            {basketStorage.items.map((element) => {
                return (
                    <BasketItem
                        key={`${element.product.id}-${element.productVariant.id}`}
                        element={element}
                        decrementProductQuantity={decrementProductQuantity}
                        addProductToBasket={addProductToBasket}
                        canUpdate={canUpdate}
                        validationResult={validationResult}
                    />
                );
            })}
        </View>
    );
};

const BasketIsEmpty = () => {
    const router = useRouter();
    return (
        <View
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <View>
                <EmptyBasket
                    width={120}
                    height={120}
                />
            </View>
            <Text style={{ ...common.text.h1HighlightInfo }}>Votre panier est vide</Text>
            <Text style={{ ...common.text.text, maxWidth: 270 }}>
                Commencez par faire un tour dans les rayons et ajoutez vos produits !
            </Text>

            <View style={{ height: 32 }}></View>
            <AppButton
                label="Voir les rayons"
                action={() => {
                    router.push({
                        pathname: '/',
                    });
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    title: {
        fontFamily: 'Fredoka',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    summary: {
        marginTop: 20,
        backgroundColor: '#f7f7f7',
        padding: 16,
        borderRadius: 8,
    },
    summaryLine: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#666',
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    summaryTotalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    summaryTotalValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
    },
    payButton: {
        backgroundColor: colorUsages.primary,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    payButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export const ValidateBasketButton = ({ disabled, message }: { disabled?: boolean; message?: string }) => {
    const router = useRouter();
    
    const handleValidateBasket = async () => {
        try {
            // Vérifier si le client est connecté
            const customerData = await backendFetchService.verifyCustomerToken();
            if (customerData) {
                // Client connecté : rediriger vers la sélection de livraison
                router.push(ROUTES.VALIDATION.DELIVERY);
            } else {
                // Client non connecté : rediriger vers le paiement classique
                router.push(ROUTES.PAIEMENT);
            }
        } catch (error) {
            // En cas d'erreur, rediriger vers le paiement classique
            router.push(ROUTES.PAIEMENT);
        }
    };
    
    return (
        <TouchableOpacity
            style={[styles.payButton, disabled && { opacity: 0.5 }]}
            disabled={disabled}
            onPress={handleValidateBasket}
        >
            <Text style={styles.payButtonText}>{message || 'Valider mon panier'}</Text>
        </TouchableOpacity>
    );
};
