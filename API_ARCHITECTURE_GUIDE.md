# Guide d'Architecture API - Manrina Store

## Vue d'ensemble

Ce document décrit les bonnes pratiques pour l'architecture API du projet Manrina Store, en se basant sur les patterns établis et les migrations effectuées.

## Architecture en Couches

### 1. Couche de Présentation (Frontend)
- **Hooks personnalisés** : Utilisation de React Query pour la gestion des états et du cache
- **BackendFetchService** : Service centralisé pour les appels API côté client
- **Composants** : Interface utilisateur réactive

### 2. Couche API (Routes Next.js)
- **Routes dynamiques** : `/api/[functionToRun].ts` pour les appels génériques
- **Routes spécialisées** : Routes dédiées pour des fonctionnalités complexes
- **Authentification** : Vérification des tokens admin/client

### 3. Couche Métier (Use Cases)
- **ApiUseCases** : Orchestrateur principal des opérations
- **Use Cases spécialisés** : CustomerUseCases, AdminUseCases, etc.
- **Logique métier** : Validation, transformation, règles business

### 4. Couche Données (Repositories)
- **Prisma ORM** : Accès aux données avec type safety
- **Repositories** : Abstraction de l'accès aux données

## Patterns Recommandés

### Pattern BackendFetchService (Recommandé)

**Utilisation** : Pour la majorité des opérations CRUD simples

```typescript
// Frontend - Hook personnalisé
export const useClientOrders = ({ clientId, page = 1, limit = 10 }) => {
  return useQuery({
    queryKey: ['admin', 'client', clientId, 'orders', { page, limit }],
    queryFn: async () => {
      return await backendFetchService.getCustomerOrders(clientId, { limit, offset: (page - 1) * limit });
    },
    enabled: !!clientId,
  });
};

// ApiUseCases - Méthode métier
public getCustomerOrders = async (clientId?: string, options?: { limit?: number; offset?: number }, { req }: ReqInfos = {} as ReqInfos) => {
  if (clientId) {
    // Appel admin avec clientId
    return await this.customerUseCases.getCustomerOrders(clientId);
  }
  
  // Appel client avec token depuis les cookies
  const token = req.cookies.customerToken;
  if (!token) {
    throw new Error('Token client requis');
  }
  const customerData = await this.customerUseCases.verifyToken(token);
  return await this.customerUseCases.getCustomerOrders(customerData.id);
};
```

**Avantages** :
- Centralisation de la logique métier
- Gestion automatique de l'authentification
- Type safety avec TypeScript
- Cache et optimisations automatiques

### Pattern Route API Directe (Cas spéciaux)

**Utilisation** : Pour des opérations complexes nécessitant une logique spécifique

```typescript
// Route API spécialisée
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ClientsApiResponse | ErrorResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Vérification d'authentification
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token manquant' });
    }

    const token = authHeader.substring(7);
    await verifyAdminToken(token);

    // Logique spécifique à la route
    const apiUseCases = new ApiUseCases();
    const result = await apiUseCases.listCustomersWithPagination(options);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
}
```

**Cas d'usage** :
- Pagination complexe avec filtres multiples
- Upload de fichiers
- Webhooks externes
- Opérations nécessitant des headers HTTP spécifiques

## Gestion de l'Authentification

### Authentification Client
- **Token stocké** : Dans les cookies (`customerToken`)
- **Vérification** : Automatique via `ApiUseCases`
- **Accès** : Données du client connecté uniquement

### Authentification Admin
- **Token transmis** : Via header `Authorization: Bearer <token>`
- **Paramètre clientId** : Pour accéder aux données d'un client spécifique
- **Accès** : Toutes les données selon les permissions

## Conventions de Nommage

### Terminologie
- **Customer** : Utilisé côté backend/base de données
- **Client** : Utilisé côté frontend/interface admin
- **Cohérence** : Les deux termes sont interchangeables dans le contexte

### Méthodes API
- `getCustomer*` : Récupération de données
- `listCustomers*` : Listing avec pagination
- `createCustomer*` : Création
- `updateCustomer*` : Mise à jour
- `deleteCustomer*` : Suppression

### Hooks Frontend
- `useClient*` : Hooks pour l'interface admin
- `useCustomer*` : Hooks pour l'interface client
- Préfixe `use` + nom descriptif + suffixe optionnel

## Gestion des Erreurs

### Côté API
```typescript
try {
  // Logique métier
} catch (error) {
  console.error('Error in [operation]:', error);
  res.status(500).json({ error: 'Erreur interne du serveur' });
}
```

### Côté Frontend
```typescript
const mutation = useMutation({
  mutationFn: (payload) => backendFetchService.createCustomer(payload),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['clients'] });
    success('Client créé avec succès');
  },
  onError: (error: Error) => {
    const errorMessage = error.message || 'Erreur lors de la création';
    showError(errorMessage);
  },
});
```

## Migration des Routes Existantes

### Étapes de Migration
1. **Analyser** la route existante et sa logique
2. **Créer** la méthode correspondante dans les Use Cases
3. **Ajouter** la méthode à `ApiUseCases`
4. **Mettre à jour** les hooks frontend
5. **Tester** le fonctionnement
6. **Supprimer** l'ancienne route (optionnel)

### Exemple de Migration
```typescript
// Avant : Route directe
// /api/admin/clients.ts avec logique Prisma directe

// Après : Pattern BackendFetchService
// 1. CustomerUseCases.listCustomersWithPagination()
// 2. ApiUseCases.listCustomersWithPagination()
// 3. Route /api/admin/listCustomersWithPagination.ts
// 4. Hook useClients() mis à jour
```

## Bonnes Pratiques

### Performance
- Utiliser la pagination pour les listes importantes
- Implémenter le cache avec React Query
- Optimiser les requêtes Prisma avec `select` et `include`

### Sécurité
- Toujours vérifier l'authentification
- Valider les paramètres d'entrée
- Utiliser les types TypeScript pour la validation

### Maintenabilité
- Centraliser la logique métier dans les Use Cases
- Utiliser des interfaces TypeScript strictes
- Documenter les APIs complexes

### Tests
- Tester les Use Cases indépendamment
- Mocker les dépendances externes
- Valider les cas d'erreur

## Corrections d'Adresses - Cas d'Étude

### Problème Initial
Les adresses utilisaient un schéma obsolète avec des champs incompatibles :
- `street` au lieu de `address`
- `isDefault` au lieu de `type`
- Routes API directes non harmonisées avec BackendFetchService

### Solutions Appliquées

#### 1. Harmonisation du Schéma
```typescript
// Ancien schéma
interface OldAddress {
  street: string;
  isDefault: boolean;
}

// Nouveau schéma
interface Address {
  address: string;
  type: string; // 'home', 'work', 'other'
  customerId: string;
}
```

#### 2. Migration des Interfaces
- **CreateAddressData** : Ajout de `customerId` obligatoire
- **UpdateAddressData** : Remplacement `street` → `address`, `isDefault` → `type`
- **Composants** : Mise à jour des appels de mutation

#### 3. Harmonisation des Routes API
```typescript
// ApiUseCases - Support admin et client
public createCustomerAddress = async (
    addressData: {
        address: string;
        city: string;
        postalCode: string;
        country: string;
        type: string;
        customerId?: string; // Pour les appels admin
    },
    { req }: ReqInfos = {} as ReqInfos,
) => {
    // Si customerId fourni (appel admin)
    if (addressData.customerId) {
        return await this.customerUseCases.createCustomerAddress({
            ...addressData,
            customerId: addressData.customerId
        });
    }
    
    // Sinon, utiliser le token client
    const token = req.cookies.customerToken;
    // ... validation et utilisation du token
};
```

#### 4. Avantages de cette Approche
- **Compatibilité** : Support des appels admin et client
- **Sécurité** : Validation automatique des tokens
- **Maintenabilité** : Logique centralisée dans ApiUseCases
- **Type Safety** : Interfaces TypeScript strictes

### Leçons Apprises
1. **Toujours vérifier la cohérence** entre schéma Prisma et interfaces TypeScript
2. **Privilégier la migration progressive** plutôt que les changements brutaux
3. **Centraliser la logique d'authentification** dans ApiUseCases
4. **Tester les types** avec `pnpm tsc --noEmit` avant les tests fonctionnels

## Conclusion

Cette architecture en couches avec les patterns BackendFetchService et routes API directes offre :
- **Flexibilité** : Choix du pattern selon le besoin
- **Maintenabilité** : Code organisé et réutilisable
- **Performance** : Cache et optimisations intégrées
- **Sécurité** : Authentification centralisée
- **Type Safety** : TypeScript dans toutes les couches

Pour toute nouvelle fonctionnalité, privilégier le pattern BackendFetchService sauf cas spécifique nécessitant une route dédiée.