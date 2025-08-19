import React from 'react';
import { MarketSessionWithProducts } from '@/types/market';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';

interface PartnersModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: MarketSessionWithProducts | null;
  onEditPartners?: (session: MarketSessionWithProducts) => void;
}

const PartnersModal: React.FC<PartnersModalProps> = ({
  isOpen,
  onClose,
  session,
  onEditPartners
}) => {
  if (!isOpen || !session) return null;

  const partners = session.partners || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Partenaires - {session.name}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {partners.length} partenaire{partners.length !== 1 ? 's' : ''} associé{partners.length !== 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4 max-h-96 overflow-y-auto">
          {partners.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <Text className="text-gray-500 mb-2">Aucun partenaire associé</Text>
              <Text className="text-sm text-gray-400">
                Cette session n'a pas encore de partenaires associés.
              </Text>
            </div>
          ) : (
            <div className="space-y-3">
              {partners.map((sessionPartner) => (
                <div
                  key={sessionPartner.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    {sessionPartner.partner.imageUrl ? (
                      <img
                        src={sessionPartner.partner.imageUrl}
                        alt={sessionPartner.partner.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-lg">
                          {sessionPartner.partner.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {sessionPartner.partner.name}
                      </h3>
                      {sessionPartner.partner.description && (
                        <p className="text-sm text-gray-500 mt-1">
                          {sessionPartner.partner.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                      Actif
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Session du {new Date(session.date).toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={onClose}
                variant="outline"
                className="px-4 py-2"
              >
                Fermer
              </Button>
              {onEditPartners && (
                <Button
                  onClick={() => {
                    onEditPartners(session);
                    onClose();
                  }}
                  className="px-4 py-2 bg-primary text-white hover:bg-primary/90"
                >
                  Gérer les partenaires
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnersModal;