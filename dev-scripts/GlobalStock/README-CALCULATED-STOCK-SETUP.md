# 🚀 Configuration du Système de Stock Calculé

Ce guide explique comment configurer le système de "stock calculé" sur une nouvelle base de données avec le même schéma Prisma.

## 📋 Prérequis

### Environnement Technique
- **Node.js** (version 16 ou supérieure)
- **Prisma** installé et configuré
- **Base de données** avec le schéma Prisma identique
- **Variable d'environnement** `DATABASE_URL` configurée

### Structure de Base de Données Requise
Le script nécessite les tables suivantes :
- `Product` (avec champs `baseUnitId`, `baseQuantity`, `globalStock`)
- `ProductVariant` (avec champs `quantity`, `unitId`, `stock`)
- `Unit` (avec champs `name`, `symbol`, `category`, etc.)

## 🛠️ Installation et Usage

### 1. Télécharger le Script
```bash
# Copier le fichier setup-calculated-stock-system.js dans votre projet
cp setup-calculated-stock-system.js /votre/projet/
```

### 2. Vérifier la Configuration
```bash
# Vérifier que Prisma est configuré
npx prisma generate

# Vérifier la connexion à la base de données
npx prisma db pull
```

### 3. Exécuter le Script
```bash
# Exécution simple
node setup-calculated-stock-system.js

# Afficher l'aide
node setup-calculated-stock-system.js --help
```

## 🔧 Ce que Fait le Script

### Étape 1: Vérification de l'Environnement
- ✅ Test de connexion à la base de données
- ✅ Vérification de l'accessibilité des tables essentielles
- ✅ Validation du schéma Prisma

### Étape 2: Configuration des Unités
- 🔍 Recherche d'unités existantes
- 🏗️ Création d'une unité par défaut si nécessaire (Gramme)
- ✅ Sélection de l'unité de base pour les produits

### Étape 3: Configuration des Produits
- 📊 Identification des produits sans unité de base
- 🔧 Attribution automatique de `baseUnitId` et `baseQuantity`
- ✅ Mise à jour par lots pour optimiser les performances

### Étape 4: Configuration des Variants
- 📊 Identification des variants avec données manquantes
- 🔧 Attribution automatique de `quantity` et `unitId`
- ✅ Correction basée sur les données du produit parent

### Étape 5: Vérification Finale
- 📈 Statistiques complètes de la configuration
- 🧪 Tests sur des produits avec stock
- ✅ Validation du bon fonctionnement

## 📊 Exemple de Sortie

```
🚀 Configuration du Système de Stock Calculé
==================================================

🔍 Vérification de l'environnement...
✅ Connexion à la base de données réussie
✅ Table Product accessible
✅ Table ProductVariant accessible
✅ Table Unit accessible

🏗️ Configuration des unités...
📊 5 unités existantes trouvées
✅ Unité par défaut sélectionnée: Gramme (g)

🛍️ Configuration des produits...
📊 45 produits sans unité de base
🔧 Attribution de l'unité de base aux produits...
  ✅ 45/45 produits mis à jour
✅ 150/150 produits ont une unité de base

🎯 Configuration des variants...
📊 89 variants avec des données manquantes
🔧 Correction des variants...
  ✅ 50/89 variants corrigés
  ✅ 89/89 variants corrigés
✅ 89 variants corrigés au total

🔍 Vérification finale...

📊 STATISTIQUES FINALES:
Produits avec unité de base: 150/150 (100%)
Variants avec quantité: 200/200 (100%)
Variants avec unité: 200/200 (100%)
Produits avec stock > 0: 75

🧪 Test sur des produits avec stock...
✅ Pommes Bio: Peut calculer le stock
✅ Farine T65: Peut calculer le stock
✅ Huile d'Olive: Peut calculer le stock

🎯 3/3 produits testés peuvent afficher leur stock calculé

🎉 CONFIGURATION PARFAITE !
✅ Tous les produits ont une unité de base
✅ Tous les variants ont des données complètes
✅ Le système de stock calculé devrait fonctionner parfaitement

✅ Configuration terminée avec succès !

📋 Prochaines étapes :
1. Redémarrer votre serveur de développement
2. Vider le cache du navigateur
3. Vérifier que la colonne "Stock calculé" s'affiche
```

## 🎯 Configuration Personnalisée

### Modifier les Valeurs par Défaut
Vous pouvez personnaliser la configuration en modifiant l'objet `CONFIG` dans le script :

```javascript
const CONFIG = {
    // Unité par défaut si aucune unité n'existe
    DEFAULT_UNIT: {
        name: 'Kilogramme',  // Changer ici
        symbol: 'kg',        // Changer ici
        category: 'WEIGHT',
        conversionFactor: 1000, // Changer ici
        isActive: true
    },
    // Quantité par défaut pour les variants
    DEFAULT_VARIANT_QUANTITY: 500, // Changer ici
    // Quantité de base par défaut pour les produits
    DEFAULT_BASE_QUANTITY: 1000,   // Changer ici
};
```

### Utilisation Programmatique
```javascript
const { setupCalculatedStockSystem, CONFIG } = require('./setup-calculated-stock-system.js');

// Modifier la configuration
CONFIG.DEFAULT_VARIANT_QUANTITY = 250;

// Exécuter la configuration
setupCalculatedStockSystem()
    .then(() => console.log('Configuration terminée'))
    .catch(error => console.error('Erreur:', error));
```

## 🚨 Résolution de Problèmes

### Erreur de Connexion
```
❌ Erreur de connexion: P1001: Can't reach database server
```
**Solution** : Vérifiez votre `DATABASE_URL` et que la base de données est accessible.

### Table Non Accessible
```
❌ Table Product non accessible
```
**Solution** : Exécutez `npx prisma generate` et `npx prisma db push` pour synchroniser le schéma.

### Timeout sur les Gros Volumes
```
❌ Timeout lors de la mise à jour des variants
```
**Solution** : Réduisez `BATCH_SIZE` dans la configuration ou exécutez le script plusieurs fois.

### Unités Manquantes
```
⚠️ Aucune unité trouvée, création de l'unité par défaut
```
**Solution** : Normal, le script créera automatiquement une unité "Gramme" par défaut.

## 🔄 Après l'Exécution

### 1. Redémarrer le Serveur
```bash
# Si vous utilisez Next.js
npm run dev
# ou
yarn dev
```

### 2. Vider le Cache
- **Navigateur** : Ctrl+F5 ou Cmd+Shift+R
- **Next.js** : Supprimer le dossier `.next/cache`

### 3. Vérifier l'Interface
- Aller sur la page d'administration du stock
- Vérifier que la colonne "Stock calculé" s'affiche
- Tester avec des produits ayant du stock > 0

## 📝 Logs et Débogage

### Activer les Logs Détaillés
```bash
# Activer les logs Prisma
DEBUG=prisma:* node setup-calculated-stock-system.js
```

### Vérification Manuelle
```sql
-- Vérifier les produits sans unité de base
SELECT COUNT(*) FROM "Product" WHERE "baseUnitId" IS NULL;

-- Vérifier les variants sans données
SELECT COUNT(*) FROM "ProductVariant" 
WHERE "quantity" IS NULL OR "unitId" IS NULL;

-- Vérifier les unités disponibles
SELECT * FROM "Unit" WHERE "isActive" = true;
```

## 🤝 Support

Si vous rencontrez des problèmes :
1. Vérifiez que votre schéma Prisma est identique
2. Consultez les logs d'erreur détaillés
3. Testez la connexion à la base de données
4. Vérifiez les permissions de votre utilisateur de base de données

## 📚 Ressources Supplémentaires

- [Documentation Prisma](https://www.prisma.io/docs/)
- [Guide de Migration de Base de Données](https://www.prisma.io/docs/guides/database/developing-with-prisma-migrate)
- [Troubleshooting Prisma](https://www.prisma.io/docs/reference/api-reference/error-reference)

---

**Note** : Ce script est conçu pour être sûr et idempotent. Vous pouvez l'exécuter plusieurs fois sans risque de corruption des données.