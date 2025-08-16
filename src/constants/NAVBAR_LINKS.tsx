// src/components/Header/NAVBAR_LINKS.ts

export interface NavbarLink {
  title: string;
  path: string;
}

export const NAVBAR_LINKS: NavbarLink[] = [
  { title: 'Produits', path: '/' },
  { title: 'Manrina an Peyi a', path: '/manrina-an-peyi-a' },
  // Tu peux rajouter ici d'autres liens à afficher
];
