🎯 Objectif général

Nettoyer et centraliser la logique d’alertes admin (sans changer le design ni la logique métier) afin de supprimer le couplage avec le chargement des produits et améliorer la performance de la page /admin/stock.

🧱 Étapes à exécuter :

1. Création du hook central useAdminAlerts

Crée un fichier src/alerts/useAdminAlerts.ts.

Implémente le hook tel que proposé par ChatGPT : il doit regrouper les deux hooks existants usePendingStockValidationCount et usePendingMarketSessionsCount et retourner :

{
pendingStockCount,
pendingMarketCount,
hasPendingDeliveryUpdate,
hasPendingMarketSubmission,
isLoading,
error,
allowDisplay
}

Ce hook ne doit dépendre d’aucun chargement de produits, seulement des deux queries déjà existantes.

2. Refactor des fichiers suivants

a) src/components/sidebars/AdminSidebar.tsx

Supprime les imports et la logique liés à :

useProductsLoading

usePendingStockValidationCount

usePendingMarketSessionsCount

Les useEffect/setTimeout qui conditionnaient le déclenchement des alertes.

Importe et utilise useAdminAlerts à la place.

Les notifications (pendingStockCount, pendingMarketCount) doivent provenir du hook central.

b) src/components/sidebars/AdminMobileSidebar.tsx

Même refactor que ci-dessus, avec le même hook useAdminAlerts.

c) src/components/admin/stock/AlertsContainer.tsx

Supprime toute dépendance à productsLoaded et les timers shouldLoadAlerts.

Branche ce composant sur useAdminAlerts :

hasPendingDeliveryUpdate remplace la logique précédente.

Le rendu visuel et le composant GlobalStockValidationAlert doivent rester inchangés.

d) Créer un petit composant src/components/admin/market/MarketAlertsBanner.tsx

Basé sur useAdminAlerts, il affiche uniquement une bannière si hasPendingMarketSubmission est true.

Ce composant sera utilisé dans les pages :

/admin/gestion-marche/index.tsx

/admin/gestion-marche/[id].tsx

Rendu minimal : même style visuel que les alertes existantes (bg-blue-50, border-blue-200, etc.).

3. Nettoyage du code obsolète

Supprime toute logique ou import inutilisé dans les fichiers suivants :

AdminSidebar.tsx

AdminMobileSidebar.tsx

AlertsContainer.tsx

Tout import résiduel de useProductsLoading servant uniquement à conditionner les alertes.

Vérifie que usePendingStockValidationCount et usePendingMarketSessionsCount ne sont plus appelés directement ailleurs que dans useAdminAlerts.

Supprime les setTimeout et états intermédiaires (shouldLoadNotifications, shouldLoadAlerts) devenus inutiles.

4. Résolution des erreurs éventuelles

Lance le projet et corrige toutes les erreurs TypeScript ou lint générées par le refactor.

Vérifie le bon fonctionnement sur :

/admin/stock

/admin/gestion-marche

/admin/gestion-marche/[id]

Les deux sidebars (desktop + mobile)

Confirme que les alertes apparaissent toujours avec le même texte, le même style, mais sans délai artificiel ni dépendance au chargement des produits.

5. Documentation du nouveau module d’alertes

Rédige un fichier src/alerts/README.md décrivant :

Le rôle du hook useAdminAlerts.

Les alertes actuellement gérées (pending_delivery_update, pending_market_submission).

Les fichiers qui les consomment (stock, marchés, sidebars).

Les règles à suivre pour ajouter une future alerte (pattern à copier dans useAdminAlerts).

Ajoute une courte section “Historique du refactor” pour préciser que cette version découple le système d’alertes du chargement des produits.

⚙️ Objectif final :

Plus aucun setTimeout ni productsLoaded dans les logiques d’alerte.

Chargement de la page /admin/stock sensiblement plus rapide.

Code des alertes centralisé, propre et documenté.

Aucun changement visuel pour l’utilisateur final.
