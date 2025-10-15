1. Ne jamais mettre de "any"
2. Toujours utilisr le composant Image de next pour inséeer les images plutot que la balise img
3. Toujours utiliser pnpm pour les dépendances et autre
4. Toujours lancer les commandes de vérifications d'erreurs avant de tenter, d'une façon ou d'une autre, de lancer le serveur de développement. ex npx tsc --noEmit
5. les erreurs de permisions next impliquent le plus souvent que le serveur est déja en cours. inutile de supprimer le dossier next. n'envisager la suppression qu'en toute dernière possibilté.
6. Le migrations prisma doivent se faire en priorité via pnpm prisma db push + pnpm prisma generate
7. Toujours utiliser les types prisma générés par next pour les models de la base de données.
8. Le style doit etre exclusivement définis en tailwind pour tout ce qui sera créé.
9. les serveur est et sera toujours accessible sur le port 3059. jamais 3000 ou quoi que ce soit d'autre. Ne jamais utiliser le port 3000.
10. Ne jamais appliqué de background global pour les composant tels que les pages, un backgroun global est déja initialisé.
11. Ne jamais lancer le lancement de serveur pour les tets. se fier aux logs principalement.
