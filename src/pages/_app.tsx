import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { AppContextProvider } from '@/context/AppContext';
import { ToastProvider } from '@/components/ui/Toast';
import { NotificationProvider } from '@/contexts/NotificationContext';
import NotificationDisplay from '@/components/notifications/NotificationDisplay';
import '@/styles/globals.css';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
        },
    },
});

export default function App({ Component, pageProps }: AppProps) {
    return (
        <QueryClientProvider client={queryClient}>
            <AppContextProvider>
                {/* <InstallPrompt />
                <PushNotificationManager /> */}
                <Head>
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
                        <Component {...pageProps} />
                    </NotificationProvider>
                </ToastProvider>
            </AppContextProvider>
        </QueryClientProvider>
    );
}
