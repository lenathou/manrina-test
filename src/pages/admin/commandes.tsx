import { UseQueryResult } from '@tanstack/react-query';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { OrderDetails } from '@/components/Commandes/OrderDetails';
import { OrderListItem } from '@/components/Commandes/OrderListItem';
import { useGetCommandsQuery } from '@/components/Commandes/useGetCommandsQuery';
import { Link } from '@/components/Link';
import { BasketWithCustomerToShow } from '@/server/checkout/IBasket';
import { colorUsages } from '@/theme';

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
        <View style={styles.pageContainer}>
            {/* Header personnalisé sans panier ni rôle utilisateur */}
            <View style={styles.customHeader}>
                <View style={styles.headerContent}>
                    <Text style={styles.pageTitle}>Gestion des Commandes</Text>
                    <View style={styles.headerActions}>
                        <CommandsQueryUpdater />
                        <Link href="/admin/commandes_impression">
                            <TouchableOpacity style={styles.printButton}>
                                <Text style={styles.printButtonText}>Imprimer</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                </View>
            </View>
            <CommandesContent commandsQuery={commandsQuery} />
        </View>
    );
};

const styles = StyleSheet.create({
    pageContainer: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    customHeader: {
        backgroundColor: 'white',
        paddingVertical: 20,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: 1000,
        width: '100%',
        marginHorizontal: 'auto',
    },
    pageTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        flexWrap: 'wrap',
    },
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
        backgroundColor: '#007bff',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 4,
    },
    printButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default CommandesPage;
