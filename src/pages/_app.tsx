import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { AppContextProvider } from '@/context/AppContext';
import { ToastProvider } from '@/components/ui/Toast';
import { NotificationProvider } from '@/contexts/NotificationContext';
import NotificationDisplay from '@/components/notifications/NotificationDisplay';
import { ProductsLoadingProvider } from '@/contexts/ProductsLoadingContext';
import { DynamicLayout } from '@/components/layouts/DynamicLayout';
import '@/styles/globals.css';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
            // Configuration optimisée pour éviter les refetch excessifs
            refetchOnWindowFocus: false, // Désactiver le refetch au focus par défaut
            refetchOnMount: true,
            refetchOnReconnect: true,
            // Augmenter le staleTime pour réduire les refetch automatiques
            staleTime: 5 * 60 * 1000, // 5 minutes - données considérées fraîches plus longtemps
            // Garder les données en cache plus longtemps
            gcTime: 10 * 60 * 1000, // 10 minutes (anciennement cacheTime)
        },
    },
});

export default function App({ Component, pageProps }: AppProps) {
    return (
        <QueryClientProvider client={queryClient}>
            <ProductsLoadingProvider>
                <AppContextProvider>
                    {/* <InstallPrompt />
                    <PushNotificationManager /> */}
                    <Head>
                        <meta charSet="utf-8" />
                        <link
                            rel="apple-touch-icon"
                            href="web-app-manifest-192x192.png"
                        />
                        <meta
                            name="mobile-web-app-capable"
                            content="yes"
                        />
                        <link
                            rel="manifest"
                            href="/manifest.json"
                        />
                        {/* <link
                            rel="apple-touch-icon"
                            sizes="152x152"
                            href="touch-icon-ipad.png"
                        />
                        <link
                            rel="apple-touch-icon"
                            sizes="180x180"
                            href="touch-icon-iphone-retina.png"
                        />
                        <link
                            rel="apple-touch-icon"
                            sizes="167x167"
                            href="touch-icon-ipad-retina.png"
                        /> */}
                    </Head>
                    <ToastProvider>
                        <NotificationProvider>
                            <NotificationDisplay />
                            <DynamicLayout>
                                <Component {...pageProps} />
                            </DynamicLayout>
                        </NotificationProvider>
                    </ToastProvider>
                </AppContextProvider>
            </ProductsLoadingProvider>
        </QueryClientProvider>
    );
}
