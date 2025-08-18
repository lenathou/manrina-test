import React from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';

interface AutoSessionConfirmDialogProps {
  isOpen: boolean;
  sessionName: string;
  onConfirm: () => void;
  onCancel: () => void;
  onSkip: () => void;
}

export default function AutoSessionConfirmDialog({
  isOpen,
  sessionName,
  onConfirm,
  onCancel,
  onSkip
}: AutoSessionConfirmDialogProps) {
  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md mx-auto shadow-xl">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
              <span className="text-xl">🗓️</span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Création de session automatique
              </h3>
              <Text className="text-sm text-gray-600" variant="small">
                Gestion des sessions de marché
              </Text>
            </div>
          </div>
          
          <div className="mb-6 bg-gray-50 rounded-lg p-4">
            <Text className="text-sm text-gray-700 mb-3" variant={'small'}>
              Vous êtes sur le point de supprimer la session :
            </Text>
            <Text className="text-sm font-medium text-gray-900 mb-3" variant={'small'}>
              "{sessionName}"
            </Text>
            <Text className="text-sm text-gray-600" variant={'small'}>
              Souhaitez-vous créer automatiquement une nouvelle session pour la semaine suivante ?
            </Text>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
            <Button
              variant="secondary"
              onClick={onCancel}
              className="w-full sm:w-auto order-3 sm:order-1"
            >
              Annuler
            </Button>
            <Button
              variant="secondary"
              onClick={onSkip}
              className="w-full sm:w-auto order-2 bg-red-600 hover:bg-red-700 text-white"
            >
              Supprimer sans créer
            </Button>
            <Button
              onClick={onConfirm}
              className="w-full sm:w-auto order-1 sm:order-3"
            >
              Supprimer et créer suivante
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
}