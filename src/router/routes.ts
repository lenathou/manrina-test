export const ROUTES = {
    PRODUITS: '/',
    TA_NOU_BIO: '/?category=Ta+Nou+Bio',
    NOS_PANIERS_BIO: '/?category=Nos+Paniers+Bio',
    NOS_PANIERS_MANRINA: '/?category=Nos+Paniers+Manrina',
    PANIER: '/panier',
    PAIEMENT: '/payment',
    ARTICLE: (productId: string) => `/article/${productId}`,
    ADMIN: {
        LOGIN: '/admin/login',
        DASHBOARD: '/admin/dashboard',
        STOCK: '/admin/stock',
        COMMANDES: '/admin/commandes',
        GROWERS: '/admin/producteurs',
        CLIENTS: '/admin/clients',
    },GROWER: {
        LOGIN: '/producteur/login',
        REGISTER: '/producteur/register',
        PROFILE: '/producteur/profile',
        STOCKS: '/producteur/stocks',
    },
    DELIVERER: {
        LOGIN: '/livreur/login',
        ORDERS: '/livreur/commandes',
        DELIVERIES: '/livreur/livraisons',
        PROFILE: '/livreur/profile',
    },
    CUSTOMER: {
        LOGIN: '/client/login',
        PROFILE: '/client/mon-profil/informations-personnelles',
        ADDRESSES: '/client/mon-profil/adresses-de-livraison',
        ORDERS: '/client/mes-commandes',
    },
    VALIDATION: {
        DELIVERY: '/client/validation-commande/livraison',
        SUMMARY: '/client/validation-commande/resume-commande',
    },
} as const;
