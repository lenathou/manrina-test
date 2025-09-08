import React from 'react';
import { Button } from '@/components/ui/Button';

interface StandHeaderProps {
  showAddForm: boolean;
  onToggleAddForm: () => void;
}

export const StandHeader: React.FC<StandHeaderProps> = ({
  showAddForm,
  onToggleAddForm
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Mon Stand</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          Gérez les produits de votre stand pour les sessions de marché
        </p>
      </div>
      <Button
        onClick={onToggleAddForm}
        className="flex items-center gap-2 w-full sm:w-auto justify-center"
      >
        <span>➕</span>
        <span className="hidden sm:inline">{showAddForm ? 'Annuler' : 'Ajouter un produit'}</span>
        <span className="sm:hidden">{showAddForm ? 'Annuler' : 'Ajouter'}</span>
      </Button>
    </div>
  );
};