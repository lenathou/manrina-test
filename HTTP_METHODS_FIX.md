# Correction des Erreurs 405 (Method Not Allowed)

## Problème Identifié

Les erreurs 405 en production étaient causées par un **mismatch entre les méthodes HTTP** utilisées côté client et celles acceptées par les routes API.

### Routes Problématiques
- `/api/verifyCustomerToken` - Route manquante
- `/api/getAllProductsWithStock` - Route manquante  
- `/api/getAllUnits` - Accepte uniquement GET
- `/api/getAllPanyen` - Route manquante
- `/api/[functionToRun]` - N'avait pas de vérification de méthode HTTP

## Solutions Implémentées

### 1. Correction de la Route Dynamique

**Fichier**: `src/pages/api/[functionToRun].ts`

✅ **Ajout de la vérification de méthode HTTP**:
```typescript
if (request.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
}
```

### 2. Création des Routes API Manquantes

#### ✅ `/api/verifyCustomerToken.ts`
- Accepte uniquement POST
- Utilise `apiUseCases.verifyCustomerToken()`
- Gestion d'erreurs appropriée

#### ✅ `/api/getAllProductsWithStock.ts`
- Accepte uniquement POST
- Utilise `apiUseCases.getAllProductsWithStock()`
- Gestion d'erreurs appropriée

#### ✅ `/api/getAllPanyen.ts`
- Accepte uniquement POST
- Utilise `apiUseCases.getAllPanyen()`
- Support du paramètre `includeStock`

### 3. Architecture du BackendFetchService

Le `BackendFetchService` utilise un **Proxy** qui :
- Fait des appels **POST** vers `/api/[functionToRun]`
- Passe les paramètres dans le body
- Utilise la route dynamique pour exécuter les méthodes d'`ApiUseCases`

## Vérification

✅ **Build réussi** - Aucune erreur de compilation
✅ **Routes créées** - Toutes les routes manquantes sont maintenant disponibles
✅ **Méthodes HTTP** - Vérification appropriée des méthodes

## Déploiement

1. **Commit et push** des changements
2. **Redéployer** sur Vercel
3. **Tester** les endpoints problématiques :
   - `https://manrina-test.vercel.app/api/verifyCustomerToken`
   - `https://manrina-test.vercel.app/api/getAllProductsWithStock`
   - `https://manrina-test.vercel.app/api/getAllPanyen`

## Résultat Attendu

- ❌ **Avant** : Erreurs 405 "Method Not Allowed"
- ✅ **Après** : Appels API fonctionnels en production

Les erreurs 405 devraient être complètement résolues après le déploiement.