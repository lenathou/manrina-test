import { UseQueryResult } from '@tanstack/react-query';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { OrderDetails } from '@/components/Commandes/OrderDetails';
import { OrderListItem } from '@/components/Commandes/OrderListItem';
import { useGetCommandsQuery } from '@/components/Commandes/useGetCommandsQuery';
import { Link } from '@/components/Link';
import { PageContainer } from '@/components/products/PageContainer';
import { BasketWithCustomerToShow } from '@/server/checkout/IBasket';
import { colorUsages } from '@/theme';
import { withAdminLayout } from '@/components/layouts/AdminLayout';

function CommandesContent({ commandsQuery }: { commandsQuery: UseQueryResult<BasketWithCustomerToShow[]> }) {
    const [selectedOrder, setSelectedOrder] = useState<BasketWithCustomerToShow | null>(null);

    if (commandsQuery.isLoading) {
        return <ActivityIndicator />;
    }

    return (
        <View style={styles.container}>
            <View style={styles.ordersList}>
                {(commandsQuery.data || []).map((item) => {
                    const order = item.basket;
                    return (
                        <OrderListItem
                            key={order.id}
                            basketWithCustomer={item}
                            isSelected={selectedOrder?.basket.id === order.id}
                            onSelect={setSelectedOrder}
                        />
                    );
                })}
            </View>

            <View style={styles.orderDetails}>
                {selectedOrder ? (
                    <OrderDetails basketWithCustomer={selectedOrder} />
                ) : (
                    <View style={styles.noSelection}>
                        <Text>Sélectionnez une commande pour voir les détails</Text>
                    </View>
                )}
            </View>
        </View>
    );
}

const CommandesPage = () => {
    const { commandsQuery, CommandsQueryUpdater } = useGetCommandsQuery();

    return (
        <PageContainer
            header={{
                CentralSection: (
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            maxWidth: '80vw',
                            gap: 16,
                        }}
                    >
                        <CommandsQueryUpdater />
                        <Link href="/admin/commandes_impression">
                            <TouchableOpacity style={styles.printButton}>
                                <Text style={styles.printButtonText}>Imprimer</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                ),
                hideBasket: true,
            }}
        >
            <CommandesContent commandsQuery={commandsQuery} />
        </PageContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        height: '100%',
    },
    ordersList: {
        flexBasis: 80,
        borderRightWidth: 1,
        flex: 3,
        borderRightColor: colorUsages.borderColor,
        overflow: 'auto',
    },
    orderDetails: {
        flex: 9,
        flexBasis: 200,
    },
    noSelection: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    printButton: {
        backgroundColor: colorUsages.primary,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 4,
    },
    printButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default withAdminLayout(CommandesPage);
