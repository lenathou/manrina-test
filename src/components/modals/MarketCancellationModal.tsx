/* eslint-disable react/no-unescaped-entities */
'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from '@/components/ui/Card';
import CloseIcon from '@/icons/close';
import CancelIcon from '@/icons/cancel';

interface MarketCancellationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (message: string) => Promise<void>;
  marketName: string;
  marketDate: Date | string;
  confirmedProducersCount: number;
}

const MarketCancellationModal: React.FC<MarketCancellationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  marketName,
  marketDate,
  confirmedProducersCount,
}) => {
  const [message, setMessage] = useState(
    `Nous vous informons que le marché "${marketName}" prévu le ${new Date(marketDate).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })} a été annulé.\n\nNous nous excusons pour la gêne occasionnée et vous tiendrons informés de la reprogrammation éventuelle.\n\nCordialement,\nL'équipe Manrina`
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    if (!message.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      await onConfirm(message);
      onClose();
    } catch (error) {
      console.error('Erreur lors de l\'annulation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto p-0">
        {/* Header */}
        <CardHeader className="bg-secondary text-white p-0 m-0">
          <div className="px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 text-white" dangerouslySetInnerHTML={{ __html: CancelIcon({ color: '#ffffff' }) }} />
              <CardTitle className="font-semibold text-white">
                Annulation du marché
              </CardTitle>
            </div>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 disabled:opacity-50"
            >
              <div className="w-5 h-5" dangerouslySetInnerHTML={{ __html: CloseIcon({ primary: '#ffffff' }) }} />
            </button>
          </div>
        </CardHeader>

        {/* Content */}
        <CardContent className="bg-background p-6">
          {/* Warning */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" dangerouslySetInnerHTML={{ __html: CancelIcon({ color: '#ef4444' }) }} />
              <div>
                <Text variant="body" className="font-semibold text-red-800 mb-2">
                  Attention : Ce marché a {confirmedProducersCount} producteur(s) confirmé(s)
                </Text>
                <Text variant="small" className="text-red-700">
                  L'annulation de ce marché enverra automatiquement une notification à tous les utilisateurs connectés (clients et producteurs) ainsi qu'un email de notification.
                </Text>
              </div>
            </div>
          </div>

          {/* Market Info */}
          <div className="mb-6">
            <Text variant="body" className="font-semibold mb-2">
              Marché à annuler :
            </Text>
            <div className="bg-gray-50 p-3 rounded-lg">
              <Text variant="body" className="font-medium">
                {marketName}
              </Text>
              <Text variant="small" className="text-gray-600">
                Date : {new Date(marketDate).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </div>
          </div>

          {/* Message */}
          <div className="mb-6">
            <Text variant="body" className="font-semibold mb-3">
              Message de notification :
            </Text>
            <Text variant="small" className="text-gray-600 mb-2">
              Ce message sera envoyé par email et affiché dans l'application à tous les utilisateurs concernés.
            </Text>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isLoading}
              className="w-full h-40 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
              placeholder="Saisissez le message d'annulation..."
            />
            <Text variant="small" className="text-gray-500 mt-1">
              {message.length} caractères
            </Text>
          </div>
        </CardContent>

        {/* Actions */}
        <CardFooter className="flex justify-end gap-3 p-6 pt-0">
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirm}
            disabled={!message.trim() || isLoading}
            className="min-w-[140px]"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Annulation...
              </div>
            ) : (
              'Confirmer l\'annulation'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>,
    document.body
  );
};

export default MarketCancellationModal;