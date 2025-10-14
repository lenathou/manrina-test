# Liste des fichiers utilisant des sélecteurs natifs HTML

Cette liste répertorie tous les fichiers qui utilisent des éléments `<select>` HTML natifs au lieu du composant Select personnalisé.

## Fichiers identifiés

### 1. Pages Client
- **`src/pages/client/mon-profil/adresses-de-livraison.tsx`**
  - Ligne ~348-358 : Sélecteur pour le type d'adresse (Client, Point relais, Autre)
  - Usage : Formulaire d'ajout/modification d'adresse de livraison

### 2. Pages Producteur
- **`src/pages/producteur/mon-profil.tsx`**
  - Ligne ~227-244 : Sélecteur pour le rayon de marché (assignments)
  - Usage : Formulaire de profil producteur

- **`src/pages/producteur/mon-marche/historiques/index.tsx`**
  - Ligne ~254-265 : Sélecteur pour filtrer par statut de validation
  - Ligne ~270-277 : Sélecteur pour trier par date
  - Usage : Filtres pour l'historique des marchés

### 3. Pages Admin
- **`src/pages/admin/gestion-marche/suggestions-produits.tsx`**
  - Ligne ~190-199 : Sélecteur pour filtrer par statut des suggestions
  - Usage : Filtrage des suggestions de produits par statut

## Recommandations

Tous ces sélecteurs natifs devraient être remplacés par le composant Select personnalisé (`src/components/ui/Select.tsx`) pour :

1. **Cohérence visuelle** : Uniformiser l'apparence des sélecteurs dans toute l'application
2. **Accessibilité** : Bénéficier des améliorations d'accessibilité du composant personnalisé
3. **Personnalisation** : Avoir un contrôle total sur le style et le comportement
4. **Maintenance** : Centraliser la logique des sélecteurs

## Prochaines étapes

1. ✅ Remplacer les sélecteurs dans `ProductModal.tsx`
2. ⏳ Remplacer les sélecteurs dans les autres fichiers listés ci-dessus
3. ⏳ Tester tous les remplacements
4. ⏳ Supprimer les styles CSS spécifiques aux sélecteurs natifs si nécessaire

---
*Généré automatiquement le ${new Date().toLocaleDateString('fr-FR')}*