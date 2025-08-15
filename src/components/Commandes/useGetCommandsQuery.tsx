import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Switch, Text, View } from 'react-native';
import { useDebounce } from 'react-use';
import { backendFetchService } from '../../service/BackendFetchService';

export const useGetCommandsQuery = (props?: { paid?: boolean; notDelivered?: boolean }) => {
    const [afterDate, setAfterDate] = useState<Date>(getDate10DaysAgo());
    const [debouncedAfterDate, setDebouncedAfterDate] = useState<Date>(afterDate);
    const [paid, setPaid] = useState<boolean>(props?.paid ?? false);
    const [notDelivered, setNotDelivered] = useState<boolean>(props?.notDelivered ?? false);
    const [authenticatedCustomers, setAuthenticatedCustomers] = useState<boolean | undefined>(undefined);
    const commandsQuery = useQuery({
        queryKey: ['commands', debouncedAfterDate.toISOString(), paid, notDelivered, authenticatedCustomers],
        queryFn: () =>
            backendFetchService.getBasketSessions({ 
                afterDate: debouncedAfterDate.toISOString(), 
                paid, 
                notDelivered, 
                authenticatedCustomers 
            }),
    });

    const CommandsQueryUpdater = () => {
        return (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View>
                    <Text>Commandes depuis le </Text>
                    <Text>
                        <input
                            type="date"
                            value={afterDate?.toISOString().split('T')[0]}
                            onChange={(e) => {
                                const dateToSet = new Date(e.target.value);
                                if (isNaN(dateToSet.getTime())) {
                                    return;
                                }
                                if (dateToSet > new Date()) {
                                    return;
                                }
                                setAfterDate(dateToSet);
                            }}
                        />
                    </Text>
                </View>
                <View style={{ gap: 8 }}>
                    <Text>Payées</Text>
                    <Switch
                        value={paid}
                        onValueChange={setPaid}
                    />
                </View>
                <View style={{ gap: 8 }}>
                    <Text>Non livrées</Text>
                    <Switch
                        value={notDelivered}
                        onValueChange={setNotDelivered}
                    />
                </View>
                <View style={{ gap: 8 }}>
                    <Text>Type de client</Text>
                    <select
                        value={authenticatedCustomers === undefined ? 'all' : authenticatedCustomers ? 'authenticated' : 'guest'}
                        onChange={(e) => {
                            const value = e.target.value;
                            if (value === 'all') {
                                setAuthenticatedCustomers(undefined);
                            } else if (value === 'authenticated') {
                                setAuthenticatedCustomers(true);
                            } else {
                                setAuthenticatedCustomers(false);
                            }
                        }}
                        style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    >
                        <option value="all">Tous les clients</option>
                        <option value="authenticated">Clients authentifiés</option>
                        <option value="guest">Clients sans compte</option>
                    </select>
                </View>
            </View>
        );
    };

    useDebounce(
        () => {
            setDebouncedAfterDate(afterDate);
        },
        500,
        [afterDate],
    );

    return { commandsQuery, CommandsQueryUpdater };
};

const getDate10DaysAgo = () => {
    const date10DaysAgo = new Date();
    date10DaysAgo.setDate(date10DaysAgo.getDate() - 10);
    return date10DaysAgo;
};
