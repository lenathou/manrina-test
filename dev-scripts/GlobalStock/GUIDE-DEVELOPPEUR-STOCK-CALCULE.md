# Guide Développeur - Configuration du Stock Calculé

## 📋 Vue d'ensemble

Ce guide vous aide à configurer le système de stock calculé dans votre application, même avec une base de données différente mais utilisant le même schéma Prisma.

## 🎯 Objectif

Le système de stock calculé permet d'afficher automatiquement le stock disponible pour chaque variant d'un produit, basé sur :
- Le stock global du produit
- La quantité de base du produit
- L'unité de base du produit
- La quantité et l'unité de chaque variant

## 📁 Scripts Disponibles

### 1. Script de Configuration Principal
**Fichier :** `setup-calculated-stock-system.js`
**Usage :** `node setup-calculated-stock-system.js`
**Description :** Configure automatiquement votre base de données pour le stock calculé

### 2. Script de Test et Validation
**Fichier :** `test-stock-setup-script.js`
**Usage :** `node test-stock-setup-script.js`
**Description :** Valide que la configuration fonctionne correctement

### 3. Documentation de Configuration
**Fichier :** `README-CALCULATED-STOCK-SETUP.md`
**Description :** Documentation détaillée du processus de configuration

## 🚀 Processus de Configuration Complet

### Étape 1 : Préparation

```bash
# 1. Vérifiez que votre base de données est accessible
npx prisma db pull

# 2. Générez le client Prisma
npx prisma generate

# 3. Vérifiez la connexion
node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.\$connect().then(() => console.log('✅ Connexion OK')).catch(console.error);"
```

### Étape 2 : Configuration Automatique

```bash
# Exécutez le script de configuration
node setup-calculated-stock-system.js
```

**Ce script va :**
- ✅ Vérifier l'environnement et les dépendances
- ✅ Créer les unités par défaut si nécessaires
- ✅ Configurer les produits avec des unités de base
- ✅ Corriger les données manquantes des variants
- ✅ Effectuer une vérification finale

### Étape 3 : Validation

```bash
# Testez que tout fonctionne
node test-setup-script.js
```

**Ce script va tester :**
- 🔍 Connexion à la base de données
- 🔍 Accessibilité des tables
- 🔍 Présence d'unités actives
- 🔍 Produits avec unité de base
- 🔍 Variants avec données complètes
- 🔍 Condition VariantCalculatedStock
- 🔍 Simulation de calcul de stock
- 🔍 Performance des requêtes

### Étape 4 : Vérification Interface

1. **Redémarrez votre serveur de développement**
2. **Accédez à l'interface d'administration du stock**
3. **Cliquez sur "Actualiser Cache" si disponible**
4. **Vérifiez que la colonne "Stock Calculé" s'affiche**

## 🔧 Configuration Personnalisée

### Unités par Défaut

Le script crée automatiquement ces unités si elles n'existent pas :

```javascript
const defaultUnits = [
    { name: 'Pièce', symbol: 'pcs', isActive: true },
    { name: 'Kilogramme', symbol: 'kg', isActive: true },
    { name: 'Gramme', symbol: 'g', isActive: true },
    { name: 'Litre', symbol: 'L', isActive: true },
    { name: 'Millilitre', symbol: 'mL', isActive: true }
];
```

### Personnalisation des Unités

Pour ajouter vos propres unités, modifiez le tableau `defaultUnits` dans `setup-calculated-stock-system.js` :

```javascript
const defaultUnits = [
    // Unités existantes...
    { name: 'Votre Unité', symbol: 'VU', isActive: true },
    { name: 'Autre Unité', symbol: 'AU', isActive: true }
];
```

## 🐛 Résolution de Problèmes

### Problème : "Cannot find module '@prisma/client'"

```bash
# Solution
npm install @prisma/client
npx prisma generate
```

### Problème : "Database connection failed"

1. Vérifiez votre fichier `.env`
2. Vérifiez que la base de données est démarrée
3. Testez la connexion manuellement

### Problème : "Table 'unit' doesn't exist"

```bash
# Appliquez les migrations Prisma
npx prisma db push
# ou
npx prisma migrate dev
```

### Problème : Tests échouent

1. **Relancez le script de configuration :**
   ```bash
   node setup-calculated-stock-system.js
   ```

2. **Vérifiez les logs d'erreur**

3. **Contactez le support avec les détails de l'erreur**

## 📊 Interprétation des Résultats

### Script de Configuration

```
✅ Environnement vérifié
✅ 5 unités par défaut créées/vérifiées
✅ 150 produits configurés avec unité de base
✅ 311 variants corrigés
✅ Vérification finale : 100% des produits prêts
```

### Script de Test

```
✅ Tests réussis: 8
❌ Tests échoués: 0
⚠️  Avertissements: 0
📈 Taux de réussite: 100%
```

## 🔄 Maintenance

### Ajout de Nouveaux Produits

Les nouveaux produits créés après la configuration initiale doivent avoir :
- Une `baseUnitId` définie
- Une `baseQuantity` définie
- Des variants avec `quantity` et `unitId`

### Script de Maintenance

Pour maintenir la cohérence, relancez périodiquement :

```bash
# Vérification mensuelle recommandée
node test-stock-setup-script.js
```

## 🎯 Bonnes Pratiques

### 1. Sauvegarde

```bash
# Sauvegardez votre base avant configuration
mysqldump -u user -p database > backup_before_stock_config.sql
# ou pour PostgreSQL
pg_dump database > backup_before_stock_config.sql
```

### 2. Test en Environnement de Développement

Testez toujours la configuration sur une copie de votre base de données de production.

### 3. Validation Post-Configuration

Toujours exécuter le script de test après la configuration :

```bash
node setup-calculated-stock-system.js && node test-stock-setup-script.js
```

### 4. Documentation des Modifications

Documentez toute personnalisation apportée aux scripts pour faciliter la maintenance future.

## 📞 Support

### Logs Utiles

En cas de problème, collectez :

1. **Sortie complète du script de configuration**
2. **Résultats du script de test**
3. **Version de Node.js :** `node --version`
4. **Version de Prisma :** `npx prisma --version`
5. **Schéma de base de données :** `schema.prisma`

### Informations de Debug

```bash
# Informations système
node --version
npm --version
npx prisma --version

# Test de connexion
node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.\$connect().then(() => console.log('OK')).catch(console.error);"

# Statistiques de base
node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); Promise.all([prisma.product.count(), prisma.productVariant.count(), prisma.unit.count()]).then(([p,v,u]) => console.log(\`Produits: \${p}, Variants: \${v}, Unités: \${u}\`));"
```

## 🎉 Conclusion

Après avoir suivi ce guide :

✅ Votre système de stock calculé est configuré
✅ Tous les produits et variants ont les données nécessaires
✅ L'interface affiche correctement les stocks calculés
✅ Le système est prêt pour la production

**Prochaines étapes :**
1. Former votre équipe sur l'utilisation du stock calculé
2. Mettre à jour votre documentation utilisateur
3. Planifier la maintenance périodique

---

*Ce guide a été généré automatiquement. Pour toute question ou amélioration, contactez l'équipe de développement.*