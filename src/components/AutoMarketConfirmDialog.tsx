import React from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';

interface AutoMarketConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  marketDate: string;
}

const AutoMarketConfirmDialog: React.FC<AutoMarketConfirmDialogProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  marketDate
}) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <Text variant="h4" className="text-lg font-medium text-gray-900">
                Confirmation de création
              </Text>
            </div>
          </div>
          
          <div className="mb-6">
            <Text variant="body" className="text-gray-600">
              Vous êtes sur le point de créer un marché pour la date du{' '}
              <span className="font-semibold text-gray-900">{marketDate}</span>.
            </Text>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
            <Button
              onClick={onCancel}
              variant="secondary"
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Annuler
            </Button>
            <Button
              onClick={onConfirm}
              variant="primary"
              className="w-full sm:w-auto order-1 sm:order-2"
            >
              Confirmer la création
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AutoMarketConfirmDialog;