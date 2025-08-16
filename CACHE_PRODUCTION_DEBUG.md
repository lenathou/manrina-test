# Documentation - Problème de Cache en Production

## 🔍 État des Lieux du Problème

### Erreur Initiale
```
ENOENT: no such file or directory, mkdir '/var/task/.cache'
```

### Contexte
- **Environnement local** : Fonctionne correctement
- **Environnement Vercel** : Erreur lors de la création du dossier cache
- **Cause** : Tentative de création d'un dossier `.cache` dans un environnement serverless où le système de fichiers est en lecture seule (sauf `/tmp`)

## 🛠️ Solutions Implémentées

### 1. Détection d'Environnement Serverless

**Fichier** : `src/utils/cache.ts`

```typescript
// Détection automatique de l'environnement serverless
this.isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.LAMBDA_TASK_ROOT ? true : false;
```

**Variables d'environnement détectées** :
- `VERCEL` (Vercel)
- `AWS_LAMBDA_FUNCTION_NAME` (AWS Lambda)
- `LAMBDA_TASK_ROOT` (AWS Lambda)

### 2. Redirection du Cache vers /tmp

```typescript
// Utilisation de /tmp en serverless, .cache en local
const defaultCacheDir = this.isServerless ? '/tmp/.cache' : path.join(process.cwd(), '.cache');
this.cacheDir = options.cacheDir || defaultCacheDir;
```

### 3. Gestion d'Erreur Robuste

```typescript
private ensureCacheDir(): void {
    try {
        if (!fs.existsSync(this.cacheDir)) {
            fs.mkdirSync(this.cacheDir, { recursive: true });
        }
    } catch (error) {
        // En cas d'échec en serverless, désactiver le cache
        if (this.isServerless) {
            console.warn('Cache directory creation failed in serverless environment, disabling file cache:', error);
            this.cacheDir = '';
        } else {
            throw error;
        }
    }
}
```

### 4. Cache en Mémoire comme Alternative

```typescript
// Cache en mémoire pour les environnements serverless
class MemoryCache {
    private cache = new Map<string, CacheData<unknown>>();
    // ... implémentation complète
}

// Sélection automatique du type de cache
const isServerlessEnv = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.LAMBDA_TASK_ROOT;
export const defaultCache = isServerlessEnv ? new MemoryCache() : new FileCache();
```

### 5. Protection de Toutes les Méthodes

Toutes les méthodes (`get`, `set`, `delete`, `clear`) vérifient maintenant si le cache est disponible :

```typescript
if (!this.cacheDir) {
    return; // ou return null pour get()
}
```

## 📍 Points d'Utilisation du Cache

### Service Airtable
**Fichier** : `src/service/airtable/index.ts`

```typescript
import { withFileCache } from '../../utils/cache';

// Méthode qui utilise le cache
getCurrentSumupProductsCached = withFileCache('sumup_products', this.getCurrentSumupProducts.bind(this), {
    maxAge: 60 * 60 * 1000, // 1 heure
});
```

### Intégration dans ProductUseCases
**Fichier** : `src/server/product/ProductUseCases.ts`

```typescript
// Utilisation du cache Airtable
const products = await this.airtableService.getCurrentSumupProducts();
```

## 🔧 Configuration Vercel

### Variables d'Environnement à Vérifier

1. **VERCEL** - Automatiquement définie par Vercel
2. **DATABASE_URL** - URL de la base de données PostgreSQL
3. **AIRTABLE_TOKEN** - Token pour l'API Airtable
4. **Autres variables** (voir `.env.example`)

### Script de Build
**Fichier** : `package.json`

```json
{
  "scripts": {
    "start": "prisma migrate deploy && prisma generate && next start",
    "build": "next build"
  }
}
```

## 🚨 Points de Vérification pour le Débogage

### 1. Logs Vercel

Vérifier dans les logs Vercel :
- Messages de warning du cache : `"Cache directory creation failed in serverless environment"`
- Erreurs de Prisma lors du déploiement
- Erreurs de variables d'environnement manquantes

### 2. Variables d'Environnement

S'assurer que ces variables sont définies dans Vercel :
```bash
VERCEL=1  # Automatique
DATABASE_URL=postgresql://...
AIRTABLE_TOKEN=...
JWT_SECRET=...
# Autres selon .env.example
```

### 3. Test de Santé de la Base de Données

Créer un endpoint de test :

```typescript
// pages/api/health.ts
import { prisma } from '@/server/database/prisma';

export default async function handler(req, res) {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.status(200).json({ status: 'ok', database: 'connected' });
    } catch (error) {
        res.status(500).json({ status: 'error', database: 'disconnected', error: error.message });
    }
}
```

### 4. Test du Cache

Créer un endpoint de test du cache :

```typescript
// pages/api/test-cache.ts
import { defaultCache } from '@/utils/cache';

export default async function handler(req, res) {
    try {
        // Test d'écriture
        defaultCache.set('test', { message: 'Cache works!' });
        
        // Test de lecture
        const cached = defaultCache.get('test');
        
        res.status(200).json({ 
            status: 'ok', 
            cache: cached ? 'working' : 'not working',
            data: cached 
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'error', 
            cache: 'failed', 
            error: error.message 
        });
    }
}
```

## 🔍 Diagnostic Avancé

### Vérifications à Effectuer

1. **Environnement détecté** :
   ```typescript
   console.log('Environment variables:', {
       VERCEL: process.env.VERCEL,
       AWS_LAMBDA_FUNCTION_NAME: process.env.AWS_LAMBDA_FUNCTION_NAME,
       LAMBDA_TASK_ROOT: process.env.LAMBDA_TASK_ROOT
   });
   ```

2. **Type de cache utilisé** :
   ```typescript
   console.log('Cache type:', defaultCache.constructor.name);
   ```

3. **Permissions système** :
   ```typescript
   console.log('Process CWD:', process.cwd());
   console.log('Temp dir:', require('os').tmpdir());
   ```

### Problèmes Potentiels Restants

1. **Prisma Binary** : Vérifier que `binaryTargets` inclut `linux-openssl-3.0.x`
2. **Variables d'environnement** : Vérifier que toutes les variables requises sont définies
3. **Timeout** : Les fonctions serverless ont des limites de temps
4. **Mémoire** : Le cache en mémoire peut être limité

## 📋 Checklist de Déploiement

- [ ] Variables d'environnement configurées dans Vercel
- [ ] `binaryTargets` mis à jour dans `schema.prisma`
- [ ] Build local réussi
- [ ] Tests des endpoints de santé
- [ ] Vérification des logs Vercel après déploiement
- [ ] Test fonctionnel de l'application

## 🔗 Fichiers Modifiés

- `src/utils/cache.ts` - Système de cache complet
- Aucun autre fichier modifié (solution non-intrusive)

## 💡 Recommandations

1. **Monitoring** : Ajouter des logs pour surveiller l'utilisation du cache
2. **Fallback** : Le système fonctionne même si le cache échoue
3. **Performance** : Le cache en mémoire est plus rapide que le cache fichier
4. **Évolutivité** : Considérer Redis pour un cache distribué si nécessaire

---

**Note** : Cette documentation reflète l'état actuel du code après les modifications apportées pour résoudre le problème de cache en production.