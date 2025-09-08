// src/constants/PRODUCTEUR_SIDEBAR_ITEMS.ts

import { ROUTES } from '@/router/routes';

export interface SidebarLink {
  label: string;
  href?: string;
  icon?: string;
  children?: SidebarLink[];
}

export const PRODUCTEUR_SIDEBAR_ITEMS: SidebarLink[] = [
  {
    label: 'Mes stocks',
    href: ROUTES.GROWER.STOCKS,
    icon: '/icons/dashboard/products.svg',
  },
  {
    label: 'Mon marché',
    icon: '/icons/dashboard/location.svg',
    children: [
      {
        label: 'Participations',
        href: '/producteur/mon-marche',
      },
      {
        label: 'Mon stand',
        href: '/producteur/mon-marche/mon-stand',
      },
    ],
  },
  {
    label: 'Mon profil',
    href: ROUTES.GROWER.PROFILE,
    icon: '/icons/dashboard/producer.svg',
  },
  {
    label: 'Sécurité',
    href: '/producteur/securite',
    icon: '/icons/dashboard/security.svg',
  },
];