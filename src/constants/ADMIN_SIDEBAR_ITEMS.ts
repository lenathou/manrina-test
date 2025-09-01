// src/constants/ADMIN_SIDEBAR_ITEMS.ts

export interface SidebarLink {
  label: string;
  href?: string;
  icon?: string;
  children?: SidebarLink[];
}

export const ADMIN_SIDEBAR_ITEMS: SidebarLink[] = [
  {
    label: 'Tableau de bord',
    href: '/admin/dashboard',
    icon: '/icons/dashboard/suivi-commande.svg',
  },
  {
    label: 'Commandes',
    icon: '/icons/dashboard/suivi-commande.svg',
    children: [
      { label: 'Gestion des commandes', href: '/admin/commandes' },
      { label: 'Impression des commandes', href: '/admin/commandes_impression' },
      { label: 'Commandes groupées', href: '/admin/commandes/groupees' },
      { label: 'Commandes clients', href: '/admin/commandes/clients' },
    ],
  },
  {
    label: 'Ressources',
    icon: '/icons/dashboard/products.svg',
    children: [
      { label: 'Stocks', href: '/admin/stock' },
      { label: 'Producteurs', href: '/admin/producteurs' },
      { label: 'Clients', href: '/admin/clients' },
      { label: 'Produits', href: '/admin/produits' },
    ],
  },
  {
    label: 'Marché',
    icon: '/icons/dashboard/location.svg',
    children: [
      { label: 'Gestion du marché', href: '/admin/gestion-marche' },
      { label: 'Historique Sessions', href: '/admin/gestion-marche/historique-sessions' },
      { label: 'Paramètres généraux', href: '/admin/gestion-marche/parametres-generaux' },
      { label: 'Suggestions de produits', href: '/admin/gestion-marche/suggestions-produits' },
    ],
  },
  {
    label: 'Livraisons',
    icon: '/icons/dashboard/location.svg',
    children: [
      { label: 'Préparation de tournées', href: '/admin/livraisons/preparation' },
      { label: 'Livraisons en cours', href: '/admin/livraisons/en-cours' },
    ],
  },
  {
    label: 'Sécurité',
    href: '/admin/securite',
    icon: '/icons/dashboard/security.svg',
  },
];