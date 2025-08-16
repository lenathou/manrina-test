import { useRouter } from 'next/router';
import { backendFetchService } from '../service/BackendFetchService';
import { ROUTES } from './routes';

export function useAppRouter() {
    const router = useRouter();

    const navigate = {
        to: (route: string) => router.push(route),

        // Product routes
        toHome: () => router.push(ROUTES.PRODUITS),
        toTaNouBio: () => router.push(ROUTES.TA_NOU_BIO),
        toNosPaniersBio: () => router.push(ROUTES.NOS_PANIERS_BIO),
        toNosPaniersManrina: () => router.push(ROUTES.NOS_PANIERS_MANRINA),
        toPanier: () => router.push(ROUTES.PANIER),
        toPaiement: () => router.push(ROUTES.PAIEMENT),
        toArticle: (productId: string) => router.push(ROUTES.ARTICLE(productId)),

        // Admin routes
        admin: {
            toLogin: () => router.push(ROUTES.ADMIN.LOGIN),
            toDashboard: () => router.push(ROUTES.ADMIN.DASHBOARD),
            toStock: () => router.push(ROUTES.ADMIN.STOCK),
            toCommandes: () => router.push(ROUTES.ADMIN.COMMANDES),
            toProducteurs: () => router.push(ROUTES.ADMIN.GROWERS),
            toClients: () => router.push(ROUTES.ADMIN.CLIENTS),
            logout: async () => {
                await backendFetchService.adminLogout();
                router.push(ROUTES.ADMIN.LOGIN);
            },
        },

        // Deliverer routes
        deliverer: {
            toLogin: () => router.push(ROUTES.DELIVERER.LOGIN),
            toOrders: () => router.push(ROUTES.DELIVERER.ORDERS),
            toDeliveries: () => router.push(ROUTES.DELIVERER.DELIVERIES),
            toProfile: () => router.push(ROUTES.DELIVERER.PROFILE),
        },

        // Grower routes
        grower: {
            toLogin: () => router.push(ROUTES.GROWER.LOGIN),
            toStocks: () => router.push(ROUTES.GROWER.STOCKS),
            toProfile: () => router.push(ROUTES.GROWER.PROFILE),
        },

        // Customer routes
        customer: {
            toLogin: () => router.push(ROUTES.CUSTOMER.LOGIN),
            toOrders: () => router.push(ROUTES.CUSTOMER.ORDERS),
            toProfile: () => router.push(ROUTES.CUSTOMER.PROFILE),
            toAddresses: () => router.push(ROUTES.CUSTOMER.ADDRESSES),
        },
    };

    return {
        ...router,
        navigate,
        currentRoute: router.pathname,
        isAdminRoute: router.pathname.startsWith('/admin'),
    };
}
