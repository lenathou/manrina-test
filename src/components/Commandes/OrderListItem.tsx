import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BasketWithCustomerToShow } from '../../server/checkout/IBasket';
import { colorUsages, common } from '../../theme';
import { convertUTCToLocaleString } from '../../utils/dateUtils';

interface OrderListItemProps {
    basketWithCustomer: BasketWithCustomerToShow;
    isSelected: boolean;
    onSelect: (order: BasketWithCustomerToShow) => void;
}

export const OrderListItem = ({ basketWithCustomer, isSelected, onSelect }: OrderListItemProps) => {
    const { basket, customer, order } = basketWithCustomer;
    const formattedDate = basket.deliveryDay || '';

    const totalPaid = order.Total;
    const discount = +order.Discount;
    const hasDiscount = discount > 0;
    const totalToPay = basket.total;
    const isPaid = basket.paymentStatus === 'paid';
    const totalToShow = isPaid ? totalPaid : totalToPay;

    return (
        <TouchableOpacity
            onPress={() => onSelect(basketWithCustomer)}
            style={[styles.container, isSelected && styles.selectedContainer]}
        >
            <View style={styles.leftSection}>
                <Text style={styles.orderNumber}>#{basket.orderIndex}</Text>
                <StatusBadge status={basket.paymentStatus} />
                {basket.delivered ? (
                    <StatusBadge
                        status="delivered"
                        statusContent="Livré"
                    />
                ) : null}
            </View>

            <View style={styles.mainSection}>
                <View
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 4,
                        flexWrap: 'wrap',
                    }}
                >
                    <Text style={styles.name}>{customer.name}</Text>
                </View>
                <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                    <Text style={styles.location}>📅 {formattedDate}</Text>
                    {basket.address && <Text style={styles.location}>📍 {basket.address.city}</Text>}
                </View>
            </View>

            <View
                style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: 2,
                    flexWrap: 'wrap',
                    maxWidth: '100%',
                }}
            >
                <Text style={styles.date}>{convertUTCToLocaleString(basket.createdAt)}</Text>
                <Text style={styles.price}>{+totalToShow}€</Text>
                {hasDiscount && <Text style={styles.priceDetail}>[dont {discount}€ coupon]</Text>}
            </View>
        </TouchableOpacity>
    );
};

const StatusBadge = ({ status, statusContent }: { status: string; statusContent?: string }) => {
    const getStatusStyle = () => {
        switch (status) {
            case 'paid':
                return styles.statusPaid;
            case 'pending':
                return styles.statusPending;
            case 'cancelled':
                return styles.statusCancelled;
            case 'delivered':
                return styles.statusDelivered;
            default:
                return {};
        }
    };

    return (
        <View style={[styles.badge, getStatusStyle()]}>
            <Text style={styles.badgeText}>{statusContent || status}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 8,
        borderBottomWidth: 1,
        borderBottomColor: colorUsages.borderColor,
        backgroundColor: colorUsages.white,
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 12,
        rowGap: 4,
        minWidth: 90,
    },
    selectedContainer: {
        backgroundColor: `${colorUsages.primary}10`,
        borderLeftWidth: 4,
        borderLeftColor: colorUsages.primary,
    },
    leftSection: {
        alignItems: 'center',
        gap: 4,
        width: 60,
    },
    mainSection: {
        flex: 1,
        gap: 8,
        minWidth: 70,
    },
    orderNumber: {
        ...common.text.h2Title,
        fontSize: 16,
    },
    price: {
        ...common.text.h2Title,
        color: colorUsages.primary,
        fontSize: 16,
        lineHeight: 16,
    },
    priceDetail: {
        ...common.text.text,
        color: colorUsages.lightInfo,
        fontSize: 12,
    },
    location: {
        ...common.text.text,
        fontSize: 14,
    },
    name: {
        fontSize: 14,
    },
    date: {
        fontSize: 12,
        color: colorUsages.lightInfo,
    },
    badge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 12,
        minWidth: 50,
        alignItems: 'center',
    },
    statusPaid: {
        backgroundColor: '#4CAF50',
    },
    statusPending: {
        backgroundColor: '#FF9800',
    },
    statusCancelled: {
        backgroundColor: '#F44336',
    },
    statusDelivered: {
        backgroundColor: '#7CCF70',
    },
    badgeText: {
        color: colorUsages.white,
        fontSize: 10,
        textTransform: 'uppercase',
        fontWeight: '600',
    },
});
