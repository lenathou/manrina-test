import { useMutation } from '@tanstack/react-query';
import { PropsWithChildren, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../components/button';
import { useAppContext } from '../context/AppContext';
import { anonymizeCheckoutSession, ICheckoutCreatePayload } from '../server/payment/CheckoutSession';
import { backendFetchService } from '../service/BackendFetchService';
import { checkoutSessionService } from '../service/CheckoutSessionService';
import { numberFormat } from '../service/NumberFormat';
import { colorUsages, common, palette, variables } from '../theme';
import { DeliveryMethod } from '../types/DeliveryMethodsType';
import { AdditionalMessageInput } from './AdditionalMessageInput';
import { BasketContentFromAppContext } from './BasketContent';
import { ContactInfo } from './ContactInfo';
import { DeliveryPageContainer } from './DeliveryPageContainer';
import { getTotalPriceWithDelivery } from './getTotalPrice';

export const SummaryPage = ({
    category,
    deliveryMethod,
    contactData,
    dayChosen,
}: {
    category: string;
    deliveryMethod: DeliveryMethod;
    contactData: ContactInfo;
    dayChosen: string;
}) => {
    const { basketStorage } = useAppContext();
    const { totalPrice } = getTotalPriceWithDelivery(basketStorage, deliveryMethod);
    const formatedTotal = numberFormat.toPrice(totalPrice);
    const createCheckoutSessionMutation = useMutation({
        mutationFn: (checkoutCreatePayload: ICheckoutCreatePayload) => {
            const checkoutStatusUrl = `${window.location.origin}/checkout-over`;
            return backendFetchService.createCheckoutSession(checkoutCreatePayload, checkoutStatusUrl);
        },
        onSuccess: (data, checkoutSession) => {
            const { checkoutSessionId } = data;
            checkoutSessionService.saveCheckoutSession(
                anonymizeCheckoutSession({ id: checkoutSessionId, ...checkoutSession }),
            );
        },
        onError: (error) => {
            Alert.alert('Error', error.message);
        },
    });
    const hasPaymentUrl = createCheckoutSessionMutation.data?.paymentUrl;
    const [deliveryMessage, setDeliveryMessage] = useState('');

    return (
        <DeliveryPageContainer
            title="Résumé de la commande"
            Footer={
                <View
                    style={{
                        padding: variables.spaceXL,
                        position: 'absolute',
                        bottom: 0,
                        width: '100%',
                        backgroundColor: colorUsages.white,
                    }}
                >
                    {hasPaymentUrl ? (
                        <AppButton
                            label={`Payer ma commande (${formatedTotal})`}
                            action={() => window.open(createCheckoutSessionMutation.data?.paymentUrl, '_blank')}
                        />
                    ) : (
                        <AppButton
                            label={`Valider ma commande (${formatedTotal})`}
                            loading={createCheckoutSessionMutation.isPending}
                            action={() =>
                                createCheckoutSessionMutation.mutateAsync({
                                    contact: contactData,
                                    deliveryMethod: deliveryMethod,
                                    dayChosen: dayChosen,
                                    items: basketStorage.items,
                                    lastUpdated: basketStorage.lastUpdated,
                                    deliveryMessage,
                                })
                            }
                            btnStyle={{
                                backgroundColor: palette.secondary,
                            }}
                        />
                    )}
                </View>
            }
        >
            <Section title={category}>
                <Text style={common.text.text}>Jour de livraison: {dayChosen}</Text>
                {deliveryMethod.location ? (
                    <View>
                        <Text style={common.text.text}>{deliveryMethod.name}</Text>
                        <Text style={common.text.text}>{deliveryMethod.additionalInfo}</Text>
                        <Text style={common.text.text}>{deliveryMethod.location?.address}</Text>
                        <Text style={common.text.text}>{deliveryMethod.location?.city}</Text>
                        <Text style={common.text.text}>{deliveryMethod.location?.postalCode}</Text>
                        <Text style={common.text.text}>{deliveryMethod.location?.phone}</Text>
                    </View>
                ) : null}
            </Section>
            <Section title="Contact">
                <Text style={common.text.text}>{contactData.name}</Text>
                <Text style={common.text.text}>{contactData.email}</Text>
                <Text style={common.text.text}>{contactData.phone}</Text>
            </Section>
            <AdditionalMessageInput
                onMessageChange={setDeliveryMessage}
                initialMessage={deliveryMessage}
            />
            <BasketContentFromAppContext deliveryMethod={deliveryMethod} />
            {/* This spacing is to make up for the footer */}
            <View style={{ minHeight: 150 }}></View>
        </DeliveryPageContainer>
    );
};

const Section = ({ children, title }: PropsWithChildren<{ title?: string }>) => {
    return (
        <View style={sectionStyles.section}>
            <Text style={sectionStyles.sectionTitle}>{title}</Text>
            <View style={{ padding: 8 }}>{children}</View>
        </View>
    );
};
const sectionStyles = StyleSheet.create({
    section: {
        borderBottomWidth: 1,
        borderBottomColor: colorUsages.borderColor,
        paddingVertical: 8,
        marginBottom: 16,
        maxWidth: 400,
        width: '100%',
    },
    sectionTitle: {
        fontFamily: 'Fredoka',
        fontSize: 20,
        fontWeight: 500,
        marginBottom: 8,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#666',
    },
});
