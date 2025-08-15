import { useMutation, useQueryClient } from '@tanstack/react-query';
import { StyleSheet, Text, View } from 'react-native';
import { BasketWithCustomerToShow, getDeliveryTypeFromBasket } from '../../server/checkout/IBasket';
import { backendFetchService } from '../../service/BackendFetchService';
import { colorUsages, common } from '../../theme';
import { convertUTCToLocaleString } from '../../utils/dateUtils';
import { TooltipButton } from '../common/TooltipButton';
import { OrderItemsList } from './OrderItemsList';
import { OrderItemsListAdmin } from './OrderItemsListAdmin';

interface OrderDetailsProps {
    basketWithCustomer: BasketWithCustomerToShow;
}

export const OrderDetails = ({ basketWithCustomer }: OrderDetailsProps) => {
    const { basket, customer } = basketWithCustomer;
    const queryClient = useQueryClient();

    // Détecter si le client est authentifié (email ne commence pas par "temp_")
    const isAuthenticatedCustomer = customer.email && !customer.email.startsWith('temp_');

    const markAsDeliveredMutation = useMutation({
        mutationFn: (basketId: string) => backendFetchService.markBasketAsDelivered(basketId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['commands'] });
        },
        onError: (error) => {
            console.error('Failed to mark order as delivered:', error);
            // You might want to add a toast or some other error feedback here
        },
    });

    if (!basket) return null;

    const handleMarkAsDelivered = async () => {
        if (basket.paymentStatus !== 'paid') return;
        markAsDeliveredMutation.mutate(basket.id);
    };

    const isButtonDisabled = basket.paymentStatus !== 'paid';

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Détails de la commande</Text>
                    <Text style={styles.subtitle}>ID: {basket.id}</Text>
                    <Text style={styles.subtitle}>Date: {convertUTCToLocaleString(basket.createdAt)}</Text>
                </View>
                <Text style={styles.status}>{basket.paymentStatus.toUpperCase()}</Text>
            </View>

            <View style={styles.infoGrid}>
                <InfoCard
                    title="Livraison"
                    icon="📍"
                    content={
                        basket.address && (
                            <>
                                <Text style={styles.text}>{customer.name}</Text>
                                <Text style={styles.text}>{getDeliveryTypeFromBasket(basket)}</Text>
                                <Text style={styles.text}>{basket.address.address}</Text>
                                <Text style={styles.text}>
                                    {basket.address.city}, {basket.address.postalCode}
                                </Text>
                                <Text style={styles.text}>📧 {customer.email}</Text>
                                <Text style={styles.text}>📞 {customer.phone}</Text>
                                {basket.deliveryMessage && (
                                    <View style={styles.deliveryMessageContainer}>
                                        <Text style={styles.deliveryMessageLabel}>Message:</Text>
                                        <Text style={styles.deliveryMessage}>{basket.deliveryMessage}</Text>
                                    </View>
                                )}
                            </>
                        )
                    }
                />

                <InfoCard
                    title="Date"
                    icon="📅"
                    content={<Text style={styles.text}>{basket.deliveryDay || ''}</Text>}
                />

                <InfoCard
                    title="Statut"
                    icon="📦"
                    content={
                        <>
                            {basket.delivered && (
                                <>
                                    <Text style={styles.text}>Livré: {basket.delivered}</Text>
                                    <SendDeliveryEmailButton basketId={basket.id} />
                                </>
                            )}
                            {basket.retrieved && <Text style={styles.text}>Récupéré: {basket.retrieved}</Text>}
                            {!basket.delivered && (
                                <View style={styles.buttonContainer}>
                                    <TooltipButton
                                        onPress={handleMarkAsDelivered}
                                        disabled={isButtonDisabled}
                                        isLoading={markAsDeliveredMutation.isPending}
                                        tooltipText={
                                            isButtonDisabled
                                                ? 'La commande doit être payée avant de pouvoir être marquée comme livrée'
                                                : undefined
                                        }
                                    >
                                        Marquer comme livré
                                    </TooltipButton>
                                </View>
                            )}
                        </>
                    }
                />
            </View>

            <Section title="Articles commandés">
                {isAuthenticatedCustomer ? (
                    <OrderItemsListAdmin order={basket} isAuthenticatedCustomer={true} />
                ) : (
                    <OrderItemsList order={basket} />
                )}
            </Section>
        </View>
    );
};

const SendDeliveryEmailButton = ({ basketId }: { basketId: string }) => {
    const sendDeliveryEmailMutation = useMutation({
        mutationFn: (basketId: string) => backendFetchService.sendDeliveryEmail(basketId),
    });

    return (
        <TooltipButton
            onPress={() => sendDeliveryEmailMutation.mutate(basketId)}
            isLoading={sendDeliveryEmailMutation.isPending}
            tooltipText={'Renvoyer le mail de livraison'}
        >
            Envoyer mail de notification
        </TooltipButton>
    );
};

const InfoCard = ({ title, icon, content }: { title: string; icon: string; content: React.ReactNode }) => (
    <View style={styles.infoCard}>
        <View style={styles.infoCardHeader}>
            <Text style={styles.infoCardIcon}>{icon}</Text>
            <Text style={styles.infoCardTitle}>{title}</Text>
        </View>
        <View style={styles.infoCardContent}>{content}</View>
    </View>
);

const Section = ({ title, children }: React.PropsWithChildren<{ title: string }>) => (
    <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {children}
    </View>
);

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: colorUsages.white,
        height: '100%',
        overflow: 'auto',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
    },
    title: {
        ...common.text.h2Title,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 12,
        color: colorUsages.lightInfo,
    },
    status: {
        ...common.text.h2Title,
        fontSize: 14,
        color: colorUsages.primary,
    },
    infoGrid: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 24,
        flexWrap: 'wrap',
    },
    infoCard: {
        flex: 1,
        minWidth: 200,
        backgroundColor: `${colorUsages.primary}05`,
        borderRadius: 8,
        padding: 12,
    },
    infoCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    infoCardIcon: {
        fontSize: 16,
    },
    infoCardTitle: {
        ...common.text.h2Title,
        fontSize: 14,
    },
    infoCardContent: {
        gap: 4,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        ...common.text.h2Title,
        fontSize: 16,
        marginBottom: 16,
    },
    text: {
        ...common.text.text,
        fontSize: 13,
    },
    buttonContainer: {
        marginTop: 8,
    },
    deliveryMessageContainer: {
        marginTop: 8,
        padding: 8,
        backgroundColor: `${colorUsages.primary}10`,
        borderRadius: 4,
    },
    deliveryMessageLabel: {
        ...common.text.text,
        fontSize: 12,
        color: colorUsages.lightInfo,
        marginBottom: 4,
    },
    deliveryMessage: {
        ...common.text.text,
        fontSize: 13,
        fontStyle: 'italic',
    },
});
