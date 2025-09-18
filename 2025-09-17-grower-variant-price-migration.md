# Migration fonctionnelle — Prix par producteur et par variant (2025‑09‑17)

## Contexte

Historiquement, l’affichage/édition des prix côté page Producteur > Stocks pouvait être influencé par:
- le prix global du variant (`ProductVariant.price`),
- et/ou un prix au niveau du couple producteur-produit (`GrowerProduct.price`).

Depuis l’introduction du modèle `GrowerVariantPrice`, l’objectif est d’avoir une gestion des prix par producteur ET par variant, sans retomber sur une « gestion globale » qui masque les prix saisis par le producteur dans le modal.

## Objectifs

- Toujours privilégier le prix défini par le producteur pour chaque variant.
- Supprimer la dépendance à un unique `variant` rattaché au `GrowerProduct` qui empêchait de traiter tous les variants d’un produit.
- Éviter d’écrire des prix au niveau `GrowerProduct.price` (portée ambiguë) lors des mises à jour.

## Changements appliqués

### Backend

- `src/server/grower/GrowerRepositoryPrismaImplementation.ts`
  - `listGrowerProducts(growerId)`
    - N’inclut plus la relation unique `variant`.
    - Inclut `product.variants` avec:
      - `unit`
      - `growerVariantPrices` filtré par le `growerId` courant
    - Pour chaque variant retourné, le prix privilégié est:
      1) `GrowerVariantPrice.price` s’il existe,
      2) sinon `ProductVariant.price`.
    - Le champ `variant` est forcé à `null` dans le résultat pour contraindre le front à s’appuyer sur la liste complète `product.variants`.

  - `updateGrowerProductPrice({ growerId, variantId, price })`
    - N’écrit plus dans `GrowerProduct.price` ni dans `GrowerProduct.variantId`.
    - Effectue un `upsert` dans `GrowerVariantPrice` (couple producteur/variant).
    - Garantit l’existence de la ligne `GrowerProduct` via `upsert` (stock au niveau produit), sans modifier son prix.

### Front (rappel)

- Page: `src/pages/producteur/stocks.tsx`
  - La modale “Gérer les prix” lit désormais (via les hooks) la liste de tous les variants d’un produit avec le prix producteur déjà injecté côté serveur.
  - `backendFetchService.updateGrowerProductPrice` enregistre dans `GrowerVariantPrice`.

## Modèle & Schéma

- `GrowerVariantPrice` (Prisma): prix par `growerId` et `variantId` avec contrainte `@@unique([growerId, variantId])`.
- `ProductVariant.price` est conservé comme prix par défaut (fallback lorsqu’aucun prix producteur n’est défini).
- `GrowerProduct.price` est conservé pour compatibilité, mais n’est plus alimenté par la mise à jour des prix de variants.

## Flux de mise à jour

1) Le producteur ouvre “Gérer les prix” sur un produit.
2) Il saisit un prix pour un (ou plusieurs) variants.
3) Côté API, `updateGrowerProductPrice` fait un `upsert` dans `GrowerVariantPrice`.
4) Lors du rafraîchissement, `listGrowerProducts` renvoie les variants avec le prix producteur prioritaire.
5) L’UI affiche le nouveau prix saisi (et non plus le prix global du variant).

## Validation

- Script de validation: `test-scripts/test-grower-variant-pricing.js`
  - Usage: `node test-scripts/test-grower-variant-pricing.js <GROWER_ID> <PRODUCT_ID>`
  - Vérifie que chaque variant d’un produit utilise le prix producteur s’il existe, sinon le prix global du variant.

## Points de vigilance

- Les vues ou calculs externes qui s’appuient sur `ProductVariant.price` ne voient pas automatiquement le prix producteur. Utiliser `GrowerVariantPrice` lorsque l’intention est d’afficher un prix spécifique au producteur.
- La persistance des prix au niveau `GrowerProduct.price` est désormais évitée pour empêcher toute incohérence d’affichage.

## Résumé

- Prix par producteur/variant rendu effectif côté Stocks & Modale.
- Lecture/affichage des prix alignés sur `GrowerVariantPrice`.
- Écritures “globales” supprimées pour ne plus écraser les valeurs saisies par les producteurs.

