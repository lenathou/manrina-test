# Test du stockage d'images en base de données

## Configuration requise

Aucune configuration externe nécessaire ! Les images sont maintenant stockées directement dans la base de données PostgreSQL.

## Pages à tester

1. **Page de profil producteur** : `/producteur/mon-profil`
   - Tester l'upload d'image de profil
   - Vérifier l'affichage de l'image uploadée

## Fonctionnalités à vérifier

### Upload d'images
1. Sélectionner une image (JPEG, PNG, GIF, WebP)
2. Vérifier que l'upload fonctionne sans erreur
3. Vérifier que l'URL retournée est au format `/api/images/{id}`
4. Vérifier que l'image s'affiche correctement

### Récupération d'images
1. L'image uploadée doit s'afficher immédiatement
2. L'URL `/api/images/{id}` doit retourner l'image avec les bons headers
3. Les images doivent être mises en cache (header Cache-Control)

### Validation
1. Tester avec des fichiers non-images (doit être rejeté)
2. Tester avec des images trop grandes (>5MB, doit être rejeté)
3. Tester avec différents formats d'images

## Avantages de cette solution

1. **Compatible Vercel** : Pas de système de fichiers requis
2. **Simplicité** : Aucune configuration externe nécessaire
3. **Sécurité** : Images stockées dans la base de données sécurisée
4. **Performance** : Cache intégré pour les images
5. **Backup** : Images sauvegardées avec le reste des données

## Vérifications techniques

1. L'image est stockée en base64 dans la table `uploaded_images`
2. L'API `/api/images/{id}` retourne l'image avec le bon Content-Type
3. Le composant `ImageUpload` fonctionne sans modification
4. Les images sont optimisées pour le cache navigateur

## Commandes de test

```bash
# Démarrer le serveur de développement
pnpm dev

# Vérifier la base de données
pnpm prisma studio
```

## Tailles d'images recommandées

- **Images de profil** : 400x400px maximum
- **Images de produits** : 800x600px maximum
- **Limite de taille** : 5MB par image