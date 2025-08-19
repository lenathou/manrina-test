import React from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';

interface AutoMarketConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  marketDate: string;
  isLoading?: boolean;
  error?: string | null;
}

const AutoMarketConfirmDialog: React.FC<AutoMarketConfirmDialogProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  marketDate,
  isLoading = false,
  error = null
}) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                ) : (
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
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z"
                    />
                  </svg>
                )}
              </div>
            </div>
            <div className="ml-4">
              <Text variant="h4" className="text-lg font-medium text-gray-900">
                {isLoading ? 'Création en cours...' : 'Confirmation de création'}
              </Text>
            </div>
          </div>
          
          <div className="mb-6">
            {error ? (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3 flex-1">
                    <h4 className="text-sm font-medium text-amber-800 mb-1">
                      Marché déjà existant
                    </h4>
                    <div className="text-sm text-amber-700">
                      {error.split('\n').map((line, index) => (
                        <p key={index} className={index > 0 ? 'mt-2' : ''}>
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <Text variant="body" className="text-gray-600">
                {isLoading ? (
                  <>
                    Création du marché en cours pour la date du{' '}
                    <span className="font-semibold text-gray-900">{marketDate}</span>...
                    <br />
                    <span className="text-sm text-gray-500 mt-2 block">
                      Veuillez patienter, cette opération peut prendre quelques secondes.
                    </span>
                  </>
                ) : (
                  <>
                    Vous êtes sur le point de créer un marché pour la date du{' '}
                    <span className="font-semibold text-gray-900">{marketDate}</span>.
                  </>
                )}
              </Text>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
            <Button
              onClick={onCancel}
              variant="secondary"
              className="w-full sm:w-auto order-2 sm:order-1"
              disabled={isLoading}
            >
              {isLoading ? 'Annulation...' : 'Annuler'}
            </Button>
            <Button
              onClick={onConfirm}
              variant="primary"
              className="w-full sm:w-auto order-1 sm:order-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Création...
                </div>
              ) : (
                'Confirmer la création'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AutoMarketConfirmDialog;