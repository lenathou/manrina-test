# Tests de Validation des Sessions de Marché

Ce guide explique comment tester la fonctionnalité de validation des sessions de marché et comment revenir facilement à l'état initial après les tests.

## Modifications Temporaires pour les Tests

Pour permettre les tests, les modifications suivantes ont été apportées :

### 1. Interface utilisateur (`commissions.tsx`)
- **Ligne 317** : Condition modifiée pour afficher le bouton "Valider la session" :
  ```typescript
  // AVANT (production)
  {session.status === 'ACTIVE' && (
  
  // APRÈS (tests)
  {(session.status === 'ACTIVE' || session.status === 'UPCOMING') && (
  ```

### 2. API endpoint (`validate.ts`)
- **Lignes 41-43** : Condition de validation assouplie :
  ```typescript
  // AVANT (production)
  if (session.status !== 'ACTIVE') {
    return res.status(400).json({ message: 'Seules les sessions actives peuvent être validées' });
  }
  
  // APRÈS (tests)
  if (session.status !== 'ACTIVE' && session.status !== 'UPCOMING') {
    return res.status(400).json({ message: 'Seules les sessions actives ou à venir peuvent être validées' });
  }
  ```

## Workflow de Test Recommandé

### 1. Sauvegarde de l'état actuel
```bash
cd test-scripts
node reset-validation-tests.js --backup
```
Cela créera un fichier `backup-[timestamp].json` avec l'état actuel de toutes les participations et sessions.

### 2. Effectuer les tests
- Naviguez vers une session de marché (ACTIVE ou UPCOMING)
- Testez la validation avec différents scénarios :
  - Tous les producteurs avec chiffre d'affaires
  - Quelques producteurs sans chiffre d'affaires
  - Aucun producteur avec chiffre d'affaires

### 3. Réinitialisation après les tests
```bash
node reset-validation-tests.js --reset
```
Cela :
- Remet toutes les participations `VALIDATED` à `CONFIRMED`
- Remet toutes les participations `DECLINED` à `CONFIRMED`
- Remet toutes les sessions `COMPLETED` à `ACTIVE` ou `UPCOMING`
- Supprime les commissions avec turnover = 0

## Scénarios de Test

### Scénario 1 : Validation complète
1. Aller sur une session avec des producteurs confirmés
2. Saisir un chiffre d'affaires pour tous les producteurs
3. Cliquer sur "Valider la session"
4. Vérifier que la modale de confirmation s'affiche
5. Confirmer la validation
6. Vérifier que la session est clôturée et les statuts mis à jour

### Scénario 2 : Validation partielle
1. Aller sur une session avec des producteurs confirmés
2. Saisir un chiffre d'affaires pour seulement quelques producteurs
3. Cliquer sur "Valider la session"
4. Vérifier que la modale d'avertissement s'affiche avec la liste des producteurs sans chiffre
5. Confirmer malgré tout
6. Vérifier que les producteurs sans chiffre sont marqués comme absents

### Scénario 3 : Annulation
1. Commencer une validation
2. Cliquer sur "Annuler" dans la modale
3. Vérifier que rien n'est modifié

## Retour à la Configuration de Production

Après les tests, pour revenir à la configuration de production :

### 1. Réinitialiser les données
```bash
node reset-validation-tests.js --reset
```

### 2. Restaurer le code de production

**Dans `commissions.tsx` (ligne 317)** :
```typescript
// Remettre la condition stricte
{session.status === 'ACTIVE' && (
```

**Dans `validate.ts` (lignes 41-43)** :
```typescript
// Remettre la vérification stricte
if (session.status !== 'ACTIVE') {
  return res.status(400).json({ message: 'Seules les sessions actives peuvent être validées' });
}
```

## Structure des Fichiers de Sauvegarde

Les fichiers de sauvegarde contiennent :
```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "participations": [
    {
      "id": "participation-id",
      "sessionId": "session-id",
      "growerId": "grower-id",
      "status": "CONFIRMED",
      "growerName": "Nom du producteur",
      "growerEmail": "email@example.com",
      "sessionName": "Marché du 15/01/2024",
      "sessionDate": "2024-01-15T00:00:00.000Z"
    }
  ],
  "sessions": [
    {
      "id": "session-id",
      "name": "Marché du 15/01/2024",
      "status": "ACTIVE",
      "date": "2024-01-15T00:00:00.000Z"
    }
  ]
}
```

## Notes Importantes

- ⚠️ **Ne jamais utiliser ces modifications en production**
- 🔄 **Toujours faire une sauvegarde avant les tests**
- 🧹 **Toujours réinitialiser après les tests**
- 📝 **Documenter les résultats des tests**

## Dépannage

Si le script de réinitialisation échoue :
1. Vérifiez que la base de données est accessible
2. Vérifiez que Prisma est correctement configuré
3. Consultez les logs d'erreur
4. En dernier recours, restaurez manuellement depuis le fichier de sauvegarde

## Contact

Pour toute question sur ces tests, consultez la documentation du projet ou contactez l'équipe de développement.

## Tests prix par producteur/variant

Un script de validation est disponible pour vérifier que l’affichage des prix privilégie bien le prix défini par le producteur pour chaque variant.

- Script: `test-scripts/test-grower-variant-pricing.js`
- Pré-requis: `DATABASE_URL` configuré et schéma migré/seedé
- Usage:
  ```bash
  node test-scripts/test-grower-variant-pricing.js <GROWER_ID> <PRODUCT_ID>
  ```

Le script récupère les variants du produit, et compare pour chacun:
- prix producteur (GrowerVariantPrice) s’il existe
- sinon prix global du variant (ProductVariant.price)

Il affiche un JSON récapitulatif et termine par `PASS` si la préférence est correcte.
