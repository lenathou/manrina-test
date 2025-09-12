import React from 'react';
import { Button } from '@/components/ui/Button';
import type { IGrower } from '@/server/grower/IGrower';

interface GrowerDetailHeaderProps {
  grower: IGrower;
  onBackClick: () => void;
  isEditing?: boolean;
  onEditClick?: () => void;
  onCancelEdit?: () => void;
  onSaveChanges?: () => void;
  isSaving?: boolean;
}

const GrowerDetailHeader: React.FC<GrowerDetailHeaderProps> = ({ 
  grower, 
  onBackClick, 
  isEditing = false,
  onEditClick,
  onCancelEdit,
  onSaveChanges,
  isSaving = false
}) => {
  return (
    <div className="px-8 py-6 bg-secondary">
      {/* Version desktop */}
      <div className="hidden md:flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            onClick={onBackClick}
            variant="ghost"
            size="md"
            className="text-white border-white/30 hover:bg-white/30"
          >
            ← Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Détail du producteur</h1>
            <p className="text-white/80 text-lg">{grower.name}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="bg-white/20 rounded-lg px-6 py-3">
            <p className="text-white/90 text-sm font-medium">Statut</p>
            <p className="text-white text-2xl font-bold">
              {grower.approved ? 'Approuvé' : 'En attente'}
            </p>
          </div>
          {!isEditing ? (
            <Button
              onClick={onEditClick}
              variant="ghost"
              size="md"
              className="text-white border-white/30 hover:bg-white/30"
            >
              ✏️ Modifier
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button
                onClick={onCancelEdit}
                variant="ghost"
                size="md"
                className="text-white border-white/30 hover:bg-white/30"
                disabled={isSaving}
              >
                ❌ Annuler
              </Button>
              <Button
                onClick={onSaveChanges}
                variant="ghost"
                size="md"
                className="text-white border-white/30 hover:bg-white/30 bg-white/20"
                disabled={isSaving}
              >
                {isSaving ? '💾 Sauvegarde...' : '💾 Sauvegarder'}
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Version mobile */}
      <div className="md:hidden">
        {/* Titre en haut */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">Détail du producteur</h1>
          <p className="text-white/80 text-base">{grower.name}</p>
        </div>
        
        {/* Bouton et statut en bas */}
        <div className="flex items-center justify-between mb-4">
          <Button
            onClick={onBackClick}
            variant="ghost"
            size="md"
            className="text-white border-white/30 hover:bg-white/30"
          >
            ← Retour
          </Button>
          <div className="bg-white/20 rounded-lg px-4 py-2">
            <p className="text-white/90 text-xs font-medium">Statut</p>
            <p className="text-white text-xl font-bold text-center">
              {grower.approved ? 'Approuvé' : 'En attente'}
            </p>
          </div>
        </div>
        
        {/* Boutons d'édition mobile */}
        <div className="flex justify-center">
          {!isEditing ? (
            <Button
              onClick={onEditClick}
              variant="ghost"
              size="md"
              className="text-white border-white/30 hover:bg-white/30"
            >
              ✏️ Modifier
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button
                onClick={onCancelEdit}
                variant="ghost"
                size="sm"
                className="text-white border-white/30 hover:bg-white/30"
                disabled={isSaving}
              >
                ❌ Annuler
              </Button>
              <Button
                onClick={onSaveChanges}
                variant="ghost"
                size="sm"
                className="text-white border-white/30 hover:bg-white/30 bg-white/20"
                disabled={isSaving}
              >
                {isSaving ? '💾 Sauvegarde...' : '💾 Sauvegarder'}
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-4 bg-white/10 rounded-lg px-4 py-3">
        <p className="text-white/90 text-sm">👤 Consultez et gérez les informations de ce producteur</p>
      </div>
    </div>
  );
};

export default GrowerDetailHeader;