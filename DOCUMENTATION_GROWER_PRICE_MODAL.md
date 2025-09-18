# Documentation - Intégration de getDisplayVariantValue dans GrowerPriceModal

## 📋 Résumé du Problème

L'objectif était d'intégrer la fonction `getDisplayVariantValue` dans le composant `GrowerPriceModal` pour améliorer l'affichage des variantes de produits, en remplaçant l'affichage statique "100 unité(s)" par un affichage dynamique comme "100g".

## 🚨 Erreurs Rencontrées

### 1. Erreur TypeScript - Propriété manquante
```
Property 'units' is missing in type '{ isOpen: boolean; onClose: () => void; product: IProduct; variants: { id: string; optionValue: string; price: number; }[]; currentPrices: Record<string, number>; onSave: (variantPrices: Record<string, number>) => void; }' but required in type 'GrowerPriceModalProps'.
```

### 2. Erreur Runtime - Variable non définie
```
ReferenceError: units is not defined
    at GrowerPriceModal.tsx:101
```

### 3. Erreur API - 403 Forbidden
```
Failed to load resource: the server responded with a status of 403 (Forbidden)
```

### 4. Modal ne s'ouvre pas
Le modal `GrowerPriceModal` ne s'affichait plus après les modifications.

## 📁 Fichiers Impliqués

### 1. `src/utils/productDisplay.ts`
**Fonction principale :**
```typescript
export function getDisplayVariantValue(variant: IProductVariant, units: IUnit[]) {
    if (variant.quantity && variant.unitId) {
        const unit = units.find((u) => u.id === variant.unitId);
        return `${variant.quantity} ${unit?.symbol || 'unité'}`;
    }
    return variant.optionValue || 'Variante par défaut';
}
```

### 2. `src/components/grower/GrowerPriceModal.tsx`
**Interface mise à jour :**
```typescript
interface GrowerPriceModalProps {
    product: IProduct;
    units: IUnit[];  // ← Propriété ajoutée
    isOpen: boolean;
    onClose: () => void;
    onSave: (variantPrices: Record<string, number>) => void;
    currentPrices?: Record<string, number>;
    isLoading?: boolean;
}
```

**Composant mis à jour :**
```typescript
export function GrowerPriceModal({
    product,
    units,  // ← Propriété destructurée
    isOpen,
    onClose,
    onSave,
    currentPrices = {},
    isLoading = false,
}: GrowerPriceModalProps) {
    // ...
    {getDisplayVariantValue(variant, units)}  // ← Utilisation de la fonction
    // ...
}
```

### 3. `src/pages/producteur/stocks.tsx`
**Imports mis à jour :**
```typescript
import { useUnitById, useUnits } from '@/hooks/useUnits';  // ← useUnits ajouté
```

**Hook ajouté dans GrowerStocksPage :**
```typescript
const { data: units = [] } = useUnits();  // ← Hook pour récupérer les unités
```

**Props du composant mis à jour :**
```typescript
<GrowerPriceModal
    isOpen={showPriceModal}
    onClose={() => {
        setShowPriceModal(false);
        setSelectedProduct(null);
    }}
    product={/* ... */}
    currentPrices={/* ... */}
    units={units}  // ← Propriété ajoutée
    onSave={handlePriceUpdate}
/>
```

## 🔧 Solutions Adoptées

### 1. Ajout de l'import de getDisplayVariantValue
```typescript
import { getDisplayVariantValue } from '@/utils/productDisplay';
```

### 2. Mise à jour de l'interface GrowerPriceModalProps
Ajout de la propriété `units: IUnit[]` comme propriété requise.

### 3. Destructuration de la propriété units
Ajout de `units` dans les paramètres destructurés du composant.

### 4. Ajout du hook useUnits
Import et utilisation du hook `useUnits` dans `stocks.tsx` pour récupérer toutes les unités.

### 5. Transmission de la propriété units
Ajout de `units={units}` dans les props du composant `GrowerPriceModal`.

### 6. Remplacement de l'affichage conditionnel
Remplacement du code conditionnel par l'appel à `getDisplayVariantValue(variant, units)`.

## 🎯 Résultat Attendu

Avant :
```
100 unité(s)
```

Après :
```
100g
```

## 🔍 Analyse des Erreurs

### Erreur TypeScript
- **Cause :** La propriété `units` était requise dans l'interface mais pas fournie lors de l'utilisation du composant.
- **Solution :** Ajout du hook `useUnits` et transmission de la propriété.

### Erreur Runtime
- **Cause :** La variable `units` n'était pas destructurée dans les paramètres du composant.
- **Solution :** Ajout de `units` dans la destructuration des props.

### Erreur 403 Forbidden
- **Cause :** Probablement liée à des problèmes d'authentification ou de permissions API non liés aux modifications.
- **Solution :** Vérifier les tokens d'authentification et les permissions API.

### Modal ne s'ouvre pas
- **Cause :** Erreurs JavaScript empêchant le rendu du composant.
- **Solution :** Résolution des erreurs TypeScript et Runtime.

## ✅ Solutions implémentées pour résoudre les problèmes

### 1. **Propriété `units` rendue optionnelle dans `GrowerPriceModal`** ✅
- **Modifié :** Interface `GrowerPriceModalProps` avec `units?: IUnit[]`
- **Ajouté :** Valeur par défaut `units = []` dans la destructuration des props
- **Résultat :** Évite les erreurs runtime si les unités ne sont pas encore chargées

### 2. **Amélioration de la robustesse de `getDisplayVariantValue`** ✅
- **Modifié :** Fonction pour accepter `units` optionnel avec valeur par défaut `[]`
- **Ajouté :** Gestion des données partielles avec `variant?.quantity` et `variant?.unitId`
- **Amélioré :** Formatage intelligent et retour par défaut plus robuste
- **Résultat :** Fonction résistante aux données manquantes ou partielles

### 3. **Vérification et correction des appels à `GrowerPriceModal`** ✅
- **Vérifié :** Appel dans `stocks.tsx` avec prop `units={units}` correctement passée
- **Corrigé :** Ajout de `quantity` et `unitId` dans la construction des variants du produit
- **Résultat :** Cohérence des données transmises au composant

### 4. **Protection contre l'ouverture pendant le chargement des unités** ✅
- **Ajouté :** Récupération de `isLoading` depuis `useUnits()` 
- **Modifié :** `handleOpenPriceModal` pour bloquer l'ouverture si `isLoadingUnits`
- **Ajouté :** Prop `isLoadingUnits` au composant `ProductWithUnit`
- **Amélioré :** Bouton "Gérer les prix" désactivé avec indicateur "Chargement..." pendant le chargement
- **Résultat :** Prévention des erreurs d'ouverture de modal avec données incomplètes

### 5. **Structure des données `variants` côté serveur corrigée** ✅
- **Identifié :** Interface `IGrowerProductVariant` ne contenait pas `quantity` et `unitId`
- **Modifié :** Interface `IGrowerProductVariantWithPrice` pour inclure ces propriétés
- **Corrigé :** Fonction `groupVariantsByProduct` pour enrichir les variants avec les données du produit original
- **Résultat :** Variants contiennent maintenant toutes les informations nécessaires pour l'affichage

## 📚 Leçons Apprises

1. **Importance de la cohérence TypeScript :** Toujours s'assurer que les interfaces et leur utilisation sont synchronisées.

2. **Gestion des dépendances :** Quand une fonction utilitaire nécessite des données externes, s'assurer que ces données sont disponibles dans le contexte d'utilisation.

3. **Tests progressifs :** Tester chaque modification individuellement pour identifier rapidement les sources d'erreur.

4. **Documentation des hooks :** Bien comprendre quels hooks sont disponibles et comment les utiliser (`useUnits` vs `useUnitById`).

5. **Protection contre les états de chargement :** Toujours empêcher les actions utilisateur quand les données nécessaires ne sont pas encore disponibles.

6. **Enrichissement des données côté serveur :** S'assurer que toutes les propriétés nécessaires sont incluses dans les réponses API.

## 🚀 État Final

Le composant `GrowerPriceModal` utilise maintenant correctement la fonction `getDisplayVariantValue` pour afficher les variantes de produits avec leurs unités appropriées (ex: "100g" au lieu de "100 unité(s)"). Toutes les erreurs TypeScript, runtime et d'affichage ont été résolues.

## 🔧 Configuration Technique

- **Framework :** Next.js avec TypeScript
- **Gestionnaire de paquets :** pnpm
- **Port de développement :** 3059
- **Styles :** Tailwind CSS
- **Base de données :** Prisma

## 📝 Notes Importantes

- Toujours utiliser les types Prisma générés pour les modèles de base de données
- Éviter l'utilisation de `any` en TypeScript
- Utiliser le composant `Image` de Next.js pour les images
- Les migrations Prisma doivent se faire via `pnpm prisma db push` + `pnpm prisma generate`

solution proposées.
Bien reçu — j’oublie totalement Better-Auth/Next-Auth pour Manrina. Voilà la version corrigée, uniquement centrée sur ton stack actuel.

# Plan de fix (rapide & concret)

## A) Props/TS & “units is not defined”

1. Rends `units` **optionnel dans le composant** (défensif) mais assure-toi de **le passer partout** côté page.

```tsx
// GrowerPriceModal.tsx
interface GrowerPriceModalProps {
  product: IProduct;
  units?: IUnit[];               // ← optionnel (pour éviter les crashs)
  isOpen: boolean;
  onClose: () => void;
  onSave: (variantPrices: Record<string, number>) => void;
  currentPrices?: Record<string, number>;
  isLoading?: boolean;
}

export function GrowerPriceModal({
  product,
  units = [],                    // ← défaut : tableau vide
  isOpen,
  onClose,
  onSave,
  currentPrices = {},
  isLoading = false,
}: GrowerPriceModalProps) {
  // …
}
```

2. Rends la fonction utilitaire **robuste** (gère données partielles).

```ts
// utils/productDisplay.ts
export function getDisplayVariantValue(variant: IProductVariant, units: IUnit[] = []) {
  const qty = variant?.quantity;
  const unitId = variant?.unitId;
  const option = variant?.optionValue?.trim();

  if (qty != null && unitId) {
    const unit = units.find(u => u.id === unitId);
    const symbol = unit?.symbol || unit?.name || 'unité';
    return `${qty}${/^[A-Za-z]/.test(symbol) ? ' ' : ''}${symbol}`;
  }
  return option || 'Variante';
}
```

3. **Passe `units` partout** où `GrowerPriceModal` est utilisé (pas seulement dans `stocks.tsx`). Fais une recherche globale “`<GrowerPriceModal`” et vérifie chaque appel : ajoute `units={units}`.

4. Empêche l’ouverture de la modal tant que les unités ne sont pas chargées.

```tsx
const { data: units = [], isLoading: isLoadingUnits } = useUnits();

<Button disabled={isLoadingUnits} onClick={() => {
  if (isLoadingUnits) return;
  setSelectedProduct(p);
  setShowPriceModal(true);
}}>
  {isLoadingUnits ? 'Chargement…' : 'Fixer le prix'}
</Button>
```

## B) Données variants = (quantity + unitId)

Le bon affichage “100g / 1 kg / 25 cl” dépend de **la présence de `quantity` + `unitId` sur chaque variant** côté data.

* **Vérifie la réponse de ton endpoint** (sans présumer de lib d’auth) : les objets variants doivent exposer `id, optionValue, price, quantity, unitId`.
* Si tu construis un objet combiné côté serveur, **inclue explicitement** `quantity` et `unitId` lors de la sélection/agrégation.
* Si certains produits sont **monovariants**, crée un “pseudo-variant” par défaut avec ces champs (ou laisse `getDisplayVariantValue` retomber sur `optionValue`).

*Patron de sélection (pseudo-code, adapte à ton ORM/service)*

```ts
// Exemple d'extraction côté serveur
const growerProductWithVariants = await repo.getGrowerProductWithVariants(growerId, productId, {
  select: {
    product: { id: true, name: true, imageUrl: true },
    variants: { id: true, optionValue: true, price: true, quantity: true, unitId: true },
  }
});
```

## C) “403 Forbidden” quand un producteur fixe un prix

Sans parler d’outil d’auth spécifique : ce 403 vient soit du **guard serveur**, soit de la **session/jeton** non transmis, soit d’un **CORS/cookie/csrf**.

Checklist agnostique :

* L’utilisateur **est-il authentifié** et **porte un rôle** autorisé à **mettre à jour des prix** (ex. PRODUCTEUR/ADMIN) dans **ton** système custom ?
* La **requête frontend** transmet bien les **cookies/headers** attendus par **ton** middleware (ex. `credentials: 'include'`, header d’API key, etc.) ?
* Côté serveur, la route “update price” **autorise** explicitement le rôle producteur (et pas seulement admin).
* Si tu utilises une **API key/CSRF token**, vérifie qu’il est envoyé (et pas bloqué par le navigateur/CORS).

*Patron de guard serveur (pseudocode générique)*

```ts
export async function updateGrowerVariantPrice(req) {
  const session = await getSessionFromYourAuth(req); // ta méthode à toi
  if (!session?.user) return json({ error: 'Unauthenticated' }, 401);

  // Autoriser PRODUCTEUR & ADMIN
  if (!['PRODUCTEUR','ADMIN'].includes(session.user.role))
    return json({ error: 'Forbidden' }, 403);

  // (Optionnel) Vérifier ownership: le producteur modifie bien ses propres produits
  const { variantId, price } = await req.json();
  const ok = await repo.isVariantOwnedByGrower(variantId, session.user.id);
  if (!ok && session.user.role !== 'ADMIN')
    return json({ error: 'Not owner' }, 403);

  await repo.updateGrowerVariantPrice({ variantId, growerId: session.user.id, price });
  return json({ success: true }, 200);
}
```

Côté client, pense à :

```ts
await fetch('/api/grower/prices', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',           // ← si tu relies la session par cookie
  body: JSON.stringify({ variantId, price }),
});
```

## D) Pourquoi la modal ne s’ouvrait plus ?

Parce qu’une **erreur runtime** (ex. `units` non défini) casse le rendu React.
En corrigeant A/B et en **bloquant l’ouverture tant que `useUnits` charge**, tu élimines la cause.

---

## Check-list finale

* [ ] `GrowerPriceModal` accepte `units?` et fait `units = []` par défaut.
* [ ] Tous les appels passent `units={units}`.
* [ ] `getDisplayVariantValue` gère les cas dégradés et formate proprement.
* [ ] L’endpoint de listing variants **expose** `quantity` + `unitId`.
* [ ] L’endpoint d’update prix **autorise** PRODUCTEUR + ownership (selon ta logique).
* [ ] Les requêtes client envoient bien cookies/headers requis (`credentials: 'include'` si cookie).
* [ ] Bouton “Fixer le prix” désactivé tant que `useUnits` n’a pas fini.

Si tu veux, colle ici un extrait **réel** d’un objet variant renvoyé par **ta** route (après sélection/agrégation), je te donne la forme exacte du mapper + un test rapide pour s’assurer que tous les cas affichent “100g / 1 kg / 25 cl” comme prévu.