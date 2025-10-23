# Analyse de la Gestion des Stocks et Prix - Système Actuel

## Vue d'ensemble du problème

Le système actuel présente un problème critique : **quand un producteur modifie à la fois le stock ET le prix dans le modal, seule la modification de stock est sauvegardée**. La modification de prix n'est possible que si le stock n'est pas modifié.

## Architecture Actuelle

### 1. Stockage Local (localStorage)

#### Structure des données dans localStorage
```typescript
interface PendingChanges {
  [productId: string]: {
    productId: string;
    productName: string;
    variantData: Record<string, VariantPriceData>; // Modifications de prix
    stockData?: {                                  // Modifications de stock
      newStock: number;
      originalStock: number;
    };
    modifiedAt: number;
  }
}
```

#### Fonctions de sauvegarde séparées
1. **`savePendingProductChanges`** : Sauvegarde les modifications de prix
   - Préserve les `stockData` existantes
   - Met à jour uniquement `variantData`

2. **`savePendingStockChanges`** : Sauvegarde les modifications de stock
   - Préserve les `variantData` existantes
   - Met à jour uniquement `stockData`

### 2. Modal de Modification (`GrowerProductEditorModal.tsx`)

#### Logique de soumission actuelle (PROBLÉMATIQUE)
```typescript
const handleSubmit = async () => {
    // Vérification séparée des changements
    const priceChanges = /* logique de détection prix */;
    const stockChanged = /* logique de détection stock */;

    // Sauvegarde séparée - PROBLÈME ICI
    if (priceChanges) {
        savePendingProductChanges(product.id, product.name, variantData);
    }
    if (stockChanged) {
        savePendingStockChanges(product.id, product.name, parseFloat(currentStock), product.totalStock);
    }
}
```

**PROBLÈME IDENTIFIÉ** : Les deux fonctions de sauvegarde sont appelées de manière séquentielle, mais il semble y avoir un conflit ou une écrasement des données.

### 3. Soumission à la Base de Données

#### Fonction `getAllPendingChangesForSubmission`
Cette fonction fonctionne correctement et combine bien les données :
```typescript
const getAllPendingChangesForSubmission = () => {
    // Retourne un objet avec :
    // - productId
    // - variantPrices (array des prix modifiés)
    // - stockChange (optionnel, si stock modifié)
}
```

#### Soumission dans `stocks.tsx`
La logique de soumission à la DB est correcte et traite bien les deux types de données :
```typescript
await createStockUpdateRequest.mutateAsync({
    newStock: changeData.stockChange ? changeData.stockChange.newStock : product.totalStock,
    variantPrices: variantPricesForRequest,
    reason: changeData.stockChange ? 'Mise à jour du stock et des prix' : 'Mise à jour des prix des variants'
});
```

## Diagnostic du Problème

### Hypothèses sur la cause du problème

1. **Race Condition** : Les deux fonctions `savePendingProductChanges` et `savePendingStockChanges` sont appelées rapidement l'une après l'autre, causant potentiellement un écrasement des données.

2. **Problème de timing** : Le `localStorage` pourrait ne pas être mis à jour assez rapidement entre les deux appels.

3. **Problème dans la logique de préservation** : Bien que les fonctions préservent théoriquement les données existantes, il pourrait y avoir un problème dans la récupération des `pendingChanges` actuelles.

## Solutions Proposées

### Solution 1 : Fonction de Sauvegarde Unifiée (RECOMMANDÉE)

Créer une seule fonction qui gère à la fois les prix et le stock :

```typescript
const savePendingProductAndStockChanges = useCallback((
    productId: string,
    productName: string,
    variantData?: Record<string, VariantPriceData>,
    stockData?: { newStock: number; originalStock: number }
) => {
    const existingChanges = pendingChanges[productId];
    const newChanges = {
        ...pendingChanges,
        [productId]: {
            productId,
            productName,
            variantData: variantData || existingChanges?.variantData || {},
            stockData: stockData || existingChanges?.stockData,
            modifiedAt: Date.now()
        }
    };
    savePendingChanges(newChanges);
}, [pendingChanges, savePendingChanges]);
```

### Solution 2 : Modification du Modal

Modifier le `handleSubmit` pour un seul appel de sauvegarde :

```typescript
const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
        const priceChanges = /* détection prix */;
        const stockChanged = /* détection stock */;

        if (priceChanges || stockChanged) {
            // UN SEUL APPEL de sauvegarde
            savePendingProductAndStockChanges(
                product.id,
                product.name,
                priceChanges ? variantData : undefined,
                stockChanged ? { newStock: parseFloat(currentStock), originalStock: product.totalStock } : undefined
            );
            success('Modifications sauvegardées localement.');
        }
        onClose();
    } catch (error) {
        // gestion erreur
    }
};
```

## Avantages de la Solution Unifiée

1. **Atomicité** : Une seule opération de sauvegarde, pas de race condition
2. **Simplicité** : Une seule fonction à maintenir
3. **Fiabilité** : Garantit que les deux types de modifications sont sauvegardées ensemble
4. **Performance** : Un seul accès au localStorage au lieu de deux

## Prochaines Étapes

1. Implémenter la fonction unifiée dans `usePendingVariantChanges.ts`
2. Modifier le modal pour utiliser cette nouvelle fonction
3. Tester que les modifications simultanées de prix et stock fonctionnent
4. Vérifier que l'affichage sur la page admin reflète bien les deux types de modifications

## Impact sur l'Existant

- ✅ Aucun impact sur la structure des données localStorage
- ✅ Aucun impact sur la soumission à la DB
- ✅ Aucun impact sur l'affichage admin
- ✅ Rétrocompatible avec les données existantes