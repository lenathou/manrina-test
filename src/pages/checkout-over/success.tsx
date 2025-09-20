
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { useEffect, useRef } from 'react';
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
    const { session_id, checkoutId, status } = router.query;

    const rawSessionId = session_id || checkoutId;
    const sessionId = Array.isArray(rawSessionId) ? rawSessionId[0] : rawSessionId;
    const statusValue = Array.isArray(status) ? status[0] : status;
    const isSuccessFlow = statusValue === 'success' || router.pathname.endsWith('/checkout-over/success');
    const hasResetRef = useRef(false);

    const { data, isLoading } = useQuery({
        queryKey: ['checkoutSession', sessionId],
        queryFn: () => {
            if (!sessionId) {
                throw new Error('Missing checkout session identifier');
            }
            return backendFetchService.getCheckoutSessionById(sessionId);
        },
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
        if (!router.isReady || !sessionId || !isSuccessFlow || hasResetRef.current) {
            return;
        }

        const clearBasketAndRedirect = () => {
            if (hasResetRef.current) {
                return;
            }
            hasResetRef.current = true;

            appContext.resetBasketStorage();

            try {
                localStorage.removeItem('selectedDeliveryData');
            } catch {
                // localStorage might be unavailable (e.g., during tests)
            }

            window.setTimeout(() => {
                router.replace('/');
            }, 1500);
        };

        if (data?.checkoutSession && isCheckoutSessionPaid(data.checkoutSession)) {
            clearBasketAndRedirect();
            return;
        }

        let shouldReset = false;
        try {
            const markResult = checkoutSessionService.markCheckoutSessionAsPaid(sessionId);
            shouldReset = markResult.shouldEraseBasket !== false;
        } catch {
            // No locally stored checkout session (expected for authenticated customers)
        }

        if (shouldReset) {
            clearBasketAndRedirect();
            return;
        }

        const fallbackTimeout = window.setTimeout(clearBasketAndRedirect, 5000);
        return () => window.clearTimeout(fallbackTimeout);
    }, [
        router.isReady,
        sessionId,
        isSuccessFlow,
        data?.checkoutSession?.paymentStatus,
        appContext.resetBasketStorage,
        router,
    ]);

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
