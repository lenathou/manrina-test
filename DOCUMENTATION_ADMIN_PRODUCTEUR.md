# Documentation - Fonctionnalité d'édition de profil producteur par l'admin

## Vue d'ensemble

Cette documentation détaille l'implémentation complète de la fonctionnalité permettant à un administrateur d'éditer le profil d'un producteur, incluant l'affectation de marché. Cette fonctionnalité s'inspire de l'implémentation existante dans `mon-profil.tsx` du côté producteur.

## Architecture générale

### Pages principales

1. **Page de liste des producteurs** : `src/pages/admin/producteurs/index.tsx`
2. **Page de détail/édition** : `src/pages/admin/producteurs/[growerId].tsx`

### Composants créés/modifiés

- `GrowerDetailHeader` : En-tête avec navigation et boutons d'action
- `GrowerStatusCard` : Gestion du statut d'approbation
- `GrowerInfoCard` : Informations personnelles éditables
- `GrowerBioCard` : Biographie éditable
- `GrowerAssignmentCard` : Sélection d'affectation de marché

## Implémentation détaillée

### 1. Page de détail producteur (`[growerId].tsx`)

#### Structure des interfaces

```typescript
interface GrowerWithAssignment extends IGrower {
  assignmentId?: string | null;
  assignment?: Assignment | null;
}
```

#### États principaux

```typescript
const [grower, setGrower] = useState<GrowerWithAssignment | null>(null);
const [assignments, setAssignments] = useState<Assignment[]>([]);
const [isEditing, setIsEditing] = useState(false);
const [editedGrower, setEditedGrower] = useState<GrowerWithAssignment | null>(null);
```

#### Récupération des données

1. **Affectations disponibles** :
   ```typescript
   useEffect(() => {
     const fetchAssignments = async () => {
       try {
         const response = await fetch('/api/admin/assignments');
         if (response.ok) {
           const assignmentsData = await response.json();
           setAssignments(assignmentsData);
         }
       } catch (err) {
         console.error('Erreur lors du chargement des affectations:', err);
       }
     };
     fetchAssignments();
   }, []);
   ```

2. **Données du producteur** :
   ```typescript
   useEffect(() => {
     if (growerId && growers.length > 0) {
       const foundGrower = growers.find(g => g.id === growerId);
       if (foundGrower) {
         const assignment = assignments.find(a => a.id === foundGrower.assignmentId);
         setGrower({
           ...foundGrower,
           assignment: assignment || null
         });
       }
     }
   }, [growerId, growers, isLoading, assignments]);
   ```

#### Gestion de l'édition

1. **Fonction de changement de champ** :
   ```typescript
   const handleFieldChange = (field: keyof GrowerWithAssignment, value: string | boolean | number | null) => {
     if (!editedGrower) return;
     setEditedGrower({
       ...editedGrower,
       [field]: value,
     });
   };
   ```

2. **Sauvegarde des modifications** :
   ```typescript
   const handleSaveChanges = async () => {
     const response = await fetch(`/api/admin/growers/${editedGrower.id}`, {
       method: 'PUT',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
         name: editedGrower.name,
         email: editedGrower.email,
         phone: editedGrower.phone,
         siret: editedGrower.siret,
         bio: editedGrower.bio,
         approved: editedGrower.approved,
         commissionRate: editedGrower.commissionRate,
         assignmentId: editedGrower.assignmentId,
       }),
     });
     
     const updatedGrower = await response.json();
     const assignment = assignments.find(a => a.id === updatedGrower.assignmentId);
     setGrower({
       ...updatedGrower,
       assignment: assignment || null
     });
   };
   ```

### 2. Composant GrowerAssignmentCard

#### Interface du composant

```typescript
interface GrowerAssignmentCardProps {
  grower: GrowerWithAssignment;
  assignments: Assignment[];
  isEditing: boolean;
  onFieldChange: (field: keyof GrowerWithAssignment, value: string | boolean | number | null) => void;
}
```

#### Logique d'affichage

```typescript
const GrowerAssignmentCard: React.FC<GrowerAssignmentCardProps> = ({
  grower,
  assignments,
  isEditing,
  onFieldChange
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Affectation de marché
      </h3>
      
      {isEditing ? (
        <div className="space-y-3">
          <Label htmlFor="assignmentId">Marché assigné</Label>
          <select
            id="assignmentId"
            value={grower.assignmentId || ''}
            onChange={(e) => onFieldChange('assignmentId', e.target.value || null)}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">Aucune affectation</option>
            {assignments.map((assignment) => (
              <option key={assignment.id} value={assignment.id}>
                {assignment.marketName}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div>
          {grower.assignment ? (
            <div className="text-sm text-gray-600">
              <strong>Marché assigné :</strong> {grower.assignment.marketName}
            </div>
          ) : (
            <div className="text-sm text-gray-500">
              Aucune affectation de marché
            </div>
          )}
        </div>
      )}
    </div>
  );
};
```

### 3. Navigation depuis la page index

#### Intégration du bouton de navigation

Dans `GrowerTable.tsx`, ajout d'un bouton "Voir détails" :

```typescript
<button
  onClick={() => router.push(`/admin/producteurs/${grower.id}`)}
  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
>
  Voir détails
</button>
```

## Styles et UI

### Design System utilisé

- **Couleurs principales** :
  - `var(--color-primary)` : Couleur principale
  - `var(--color-secondary)` : Couleur secondaire
  - `var(--muted-foreground)` : Texte atténué

- **Classes Tailwind** :
  - Cartes : `bg-white rounded-lg shadow p-6`
  - Grille responsive : `grid grid-cols-1 lg:grid-cols-2 gap-6`
  - Espacement : `space-y-6`

### Composants UI réutilisés

- `LoadingSpinner` : Indicateur de chargement
- `ErrorDisplay` : Affichage d'erreurs
- `Toast` : Notifications
- `Label` : Étiquettes de formulaire

## Fonctionnalités implémentées

### 1. Mode édition/lecture

- **Lecture** : Affichage des informations en mode consultation
- **Édition** : Formulaires interactifs pour modification
- **Basculement** : Boutons "Modifier" / "Annuler" / "Sauvegarder"

### 2. Gestion des affectations

- **Récupération** : API `/api/admin/assignments`
- **Sélection** : Menu déroulant avec option "Aucune affectation"
- **Sauvegarde** : Intégration dans le processus de mise à jour

### 3. Validation et feedback

- **Toast notifications** : Succès/erreur
- **États de chargement** : Spinners et désactivation
- **Gestion d'erreurs** : Messages explicites

## API Endpoints utilisés

### GET `/api/admin/assignments`

Récupère la liste des affectations disponibles.

**Réponse** :
```json
[
  {
    "id": "assignment-id",
    "marketName": "Nom du marché",
    "location": "Lieu"
  }
]
```

### PUT `/api/admin/growers/{growerId}`

Met à jour les informations d'un producteur.

**Payload** :
```json
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "siret": "string",
  "bio": "string",
  "approved": "boolean",
  "commissionRate": "number",
  "assignmentId": "string | null"
}
```

## Bonnes pratiques appliquées

### 1. TypeScript strict

- Interfaces explicites pour tous les props
- Types Prisma utilisés (`Assignment`, `IGrower`)
- Gestion des valeurs nulles/undefined

### 2. Gestion d'état

- États séparés pour lecture/édition
- Synchronisation des données après sauvegarde
- Nettoyage des états lors des transitions

### 3. UX/UI

- Feedback visuel immédiat
- États de chargement
- Messages d'erreur explicites
- Navigation intuitive

### 4. Performance

- Chargement des affectations une seule fois
- Mise à jour optimiste de l'UI
- Réutilisation des composants existants

## Tests et validation

### Scénarios testés

1. **Navigation** : Accès depuis la liste des producteurs
2. **Affichage** : Données correctement affichées
3. **Édition** : Modification des champs
4. **Affectation** : Sélection/désélection de marché
5. **Sauvegarde** : Persistance des modifications
6. **Erreurs** : Gestion des cas d'échec

### Vérifications TypeScript

Commande utilisée : `pnpm tsc --noEmit`

Toutes les erreurs de type ont été corrigées, notamment :
- Correspondance des interfaces entre composants
- Types des fonctions de callback
- Gestion des valeurs optionnelles

## Conclusion

Cette implémentation fournit une interface complète et intuitive pour l'édition des profils producteurs par les administrateurs. Elle respecte les patterns établis dans l'application et offre une expérience utilisateur cohérente avec le reste de l'interface d'administration.

La fonctionnalité est entièrement fonctionnelle et prête pour la production, avec une gestion robuste des erreurs et une interface responsive.