import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BasketValidated } from '@/components/icons/BasketValidated';
import { useAppContext } from '@/context/AppContext';
import { isCheckoutSessionPaid } from '@/server/checkout/ICheckout';
import { backendFetchService } from '@/service/BackendFetchService';
import { checkoutSessionService } from '@/service/CheckoutSessionService';
import { colorUsages } from '@/theme';

const useCheckoutSession = () => {
    const router = useRouter();
    const appContext = useAppContext();
    const { session_id, checkoutId } = router.query;
    const sessionId = session_id || checkoutId;
    const { data, isLoading } = useQuery({
        queryKey: ['checkoutSession'],
        queryFn: () => backendFetchService.getCheckoutSessionById(sessionId as string),
        enabled: !!sessionId,
        refetchInterval: (query) => {
            return query.state.data && isCheckoutSessionPaid(query.state.data.checkoutSession)
                ? false
                : query.state.error
                  ? 20000
                  : 5000;
        },
    });
    useEffect(() => {
        console.log('useEffect triggered, payment status:', data?.checkoutSession.paymentStatus);
        console.log('Current basket items:', appContext.basketStorage.items.length);
        
        if (data?.checkoutSession.paymentStatus === 'paid') {
            console.log('Payment is paid, clearing basket...');
            
            // Marquer la session comme payée dans le service local si possible
            try {
                checkoutSessionService.markCheckoutSessionAsPaid(sessionId as string);
                console.log('Marked session as paid in localStorage');
            } catch (error) {
                console.log('Session not found in localStorage (normal for authenticated users)');
            }
            
            // TOUJOURS vider le panier après un paiement réussi, peu importe le type d'utilisateur
            console.log('Clearing basket for all users after successful payment');
            appContext.resetBasketStorage();
            console.log('Basket cleared, new basket items:', appContext.basketStorage.items.length);
        }
    }, [data?.checkoutSession.paymentStatus, sessionId, appContext.resetBasketStorage]);
    return { checkoutSession: data, isLoading };
};

export default function HomeSuccessPage() {
    useCheckoutSession();
    return (
        <View style={styles.container}>
            <View style={styles.body}>
                <View style={{ margin: 10, marginTop: '15vh', gap: 10 }}>
                    <View style={styles.roundBackground}>
                        <BasketValidated
                            width={120}
                            height={120}
                        />
                    </View>
                    <Text
                        style={{
                            fontSize: 20,
                            margin: 'auto',
                            color: '#333',
                            textAlign: 'center',
                            lineHeight: 30,
                        }}
                    >
                        Votre paiement a bien été validé.
                        <br /> Nous vous avons envoyé un email récapitulatif avec les détails de votre commande.
                    </Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        margin: 0,
        padding: 0,
        height: '100%',
        backgroundColor: colorUsages.background,
    },
    body: {
        flex: 1,
    },
    roundBackground: {
        margin: 'auto',
        height: 200,
        width: 200,
        borderRadius: '100%',
        backgroundColor: '#cccccc',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
