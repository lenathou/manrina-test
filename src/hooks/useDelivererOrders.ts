import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useDebounce } from 'react-use';
import { backendFetchService } from '../service/BackendFetchService';

export const useDelivererOrders = () => {
    const [afterDate, setAfterDate] = useState<Date>(getDate10DaysAgo());
    const [debouncedAfterDate, setDebouncedAfterDate] = useState<Date>(afterDate);
    const [onlyPaid, setOnlyPaid] = useState<boolean>(false); // Afficher toutes les commandes par défaut
    const [onlyNotDelivered, setOnlyNotDelivered] = useState<boolean>(false); // Afficher toutes les commandes par défaut

    const ordersQuery = useQuery({
        queryKey: ['deliverer-orders', debouncedAfterDate.toISOString(), onlyPaid, onlyNotDelivered],
        queryFn: () =>
            backendFetchService.getBasketSessions({
                afterDate: debouncedAfterDate.toISOString(),
                paid: onlyPaid,
                notDelivered: onlyNotDelivered,
            }),
        refetchInterval: 30000, // Actualisation automatique toutes les 30 secondes
    });

    useDebounce(
        () => {
            setDebouncedAfterDate(afterDate);
        },
        500,
        [afterDate],
    );

    // Filtrer les commandes pour ne garder que celles qui sont pertinentes pour les livreurs
    const deliveryOrders = ordersQuery.data?.filter(order => {
        const { basket } = order;
        // Garder toutes les commandes qui ont une adresse de livraison
        // (exclure seulement les commandes sans adresse)
        return basket.address !== null;
    }) || [];

    return {
        orders: deliveryOrders,
        isLoading: ordersQuery.isLoading,
        isError: ordersQuery.isError,
        error: ordersQuery.error,
        refetch: ordersQuery.refetch,
        // Fonctions de contrôle des filtres
        filters: {
            afterDate,
            setAfterDate,
            onlyPaid,
            setOnlyPaid,
            onlyNotDelivered,
            setOnlyNotDelivered,
        },
    };
};

const getDate10DaysAgo = () => {
    const date10DaysAgo = new Date();
    date10DaysAgo.setDate(date10DaysAgo.getDate() - 10);
    return date10DaysAgo;
};