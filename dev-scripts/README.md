# Scripts de développement

Ce dossier contient des scripts utiles pour le développement et les tests.

## seed-paid-orders.ts

### Description
Script de seed qui crée deux commandes payées pour le client `client1@manrina.com` avec des produits réels du catalogue.

### Fonctionnalités
- ✅ Crée ou utilise un client existant (`client1@manrina.com`)
- ✅ Crée une adresse de livraison
- ✅ Génère 2 commandes avec statut `paid`
- ✅ Chaque commande contient 3 produits différents
- ✅ Crée les sessions de checkout associées
- ✅ Utilise des produits réels du fichier `products.json`

### Utilisation
```bash
# Exécuter le script
npm run db:seed-paid-orders
```

### Détails des commandes créées

**Commande 1 :**
- 2x Ananas Unité (6€ chacun)
- 1x Abricot pays Bio (6€)
- 1x Ananas bio (6€)
- Frais de livraison : 5€
- **Total : 29€**

**Commande 2 :**
- 3x Ananas Unité (6€ chacun)
- 2x Abricot pays Bio (6€ chacun)
- 1x Ananas bio (6€)
- Frais de livraison : 5€
- **Total : 41€**

### Données créées
- 1 client (si n'existe pas déjà)
- 1 adresse de livraison
- 2 BasketSession avec statut `paid`
- 6 BasketSessionItem (3 par commande)
- 2 CheckoutSession avec statut `paid`

### Notes
- Les produits utilisés sont basés sur les vrais IDs du fichier `products.json`
- Les dates de livraison sont définies à J+2 et J+3
- Les commandes sont automatiquement marquées comme payées
- Le script peut être exécuté plusieurs fois (il créera de nouvelles commandes à chaque fois)

### Nettoyage
Pour supprimer les commandes créées, vous pouvez utiliser :
```bash
npm run db:delete-user-orders-confirm
```