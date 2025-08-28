// src/constants/CLIENT_SIDEBAR_ITEMS.ts

export interface SidebarLink {
  label: string;
  href?: string;
  icon?: string;
  children?: SidebarLink[];
}

export const CLIENT_SIDEBAR_ITEMS: SidebarLink[] = [
  {
    label: 'Nos Produits',
    href: '/',
    icon: '/icons/dashboard/products.svg',
  },
  {
    label: 'Mes commandes',
    href: '/client/mes-commandes',
    icon: '/icons/dashboard/suivi-commande.svg',
  },
  {
    label: 'Mon panier',
    href: '/panier',
    icon: '/icons/basket-empty.svg',
  },
  {
    label: 'Mon portefeuille',
    href: '/client/wallet',
    icon: '/icons/dashboard/wallet.svg',
  },
  {
    label: 'Mon profil',
    icon: '/icons/dashboard/user.svg',
    children: [
      { label: 'Informations personnelles', href: '/client/mon-profil/informations-personnelles' },
      { label: 'Mes adresses', href: '/client/mon-profil/adresses-de-livraison' },
    ],
  },
  {
    label: 'Sécurité',
    href: '/client/securite',
    icon: '/icons/dashboard/security.svg',
  },
];
