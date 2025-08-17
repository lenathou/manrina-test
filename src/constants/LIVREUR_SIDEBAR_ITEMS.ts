export interface SidebarLink {
    label: string;
    icon?: string;
    href?: string;
    children?: SidebarLink[];
}

export const LIVREUR_SIDEBAR_ITEMS: SidebarLink[] = [
    {
        icon: '/icons/dashboard/location.svg',
        label: 'Mes livraisons',
        href: '/livreur/livraisons',
    },
    {
        icon: '/icons/dashboard/suivi-commande.svg',
        label: 'Historique',
        href: '/livreur/historique',
    },
    {
        icon: '/icons/dashboard/location.svg',
        label: 'Mon profil',
        href: '/livreur/profil',
    },
];