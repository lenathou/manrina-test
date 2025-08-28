/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';

interface AddressDeleteConfirmDialogProps {
  isOpen: boolean;
  addressName: string;
  addressDetails: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

export default function AddressDeleteConfirmDialog({
  isOpen,
  addressName,
  addressDetails,
  onConfirm,
  onCancel,
  isDeleting = false
}: AddressDeleteConfirmDialogProps) {
  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md mx-auto shadow-xl">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mr-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-red-600">
                <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Supprimer l'adresse
              </h3>
              <Text className="text-sm text-gray-600" variant="small">
                Cette action est irréversible
              </Text>
            </div>
          </div>
          
          <div className="mb-6 bg-gray-50 rounded-lg p-4">
            <Text className="text-sm text-gray-700 mb-3" variant={'small'}>
              Vous êtes sur le point de supprimer l'adresse :
            </Text>
            {addressName && (
              <Text className="text-sm font-medium text-gray-900 mb-2" variant={'small'}>
                "{addressName}"
              </Text>
            )}
            <Text className="text-sm text-gray-600 mb-3" variant={'small'}>
              {addressDetails}
            </Text>
            <Text className="text-sm text-red-600 font-medium" variant={'small'}>
              Cette action ne peut pas être annulée.
            </Text>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
            <Button
              variant="secondary"
              onClick={onCancel}
              disabled={isDeleting}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Annuler
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isDeleting}
              className="w-full sm:w-auto order-1 sm:order-2 bg-red-600 hover:bg-red-700 text-white flex items-center justify-center"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Suppression...
                </>
              ) : (
                'Supprimer définitivement'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
}