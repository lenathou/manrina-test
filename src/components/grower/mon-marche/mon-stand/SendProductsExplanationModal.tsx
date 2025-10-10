/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface SendProductsExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SendProductsExplanationModal: React.FC<SendProductsExplanationModalProps> = ({ 
  isOpen, 
  onClose 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl bg-background max-h-[90vh] overflow-y-auto p-0">
        <CardHeader className="bg-secondary text-white p-6 m-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-white">
              📋 Envoyer vos produits à une session de marché
            </CardTitle>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </CardHeader>
        
        <CardContent className="bg-background space-y-6 p-6">
        {/* Introduction simple */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-blue-900 mb-2">🎯 À quoi ça sert ?</h3>
          <p className="text-blue-800 text-sm leading-relaxed">
            Cette fonctionnalité vous permet d'informer les organisateurs du marché 
            de quels produits vous comptez apporter lors d'une session future.
          </p>
        </div>

        {/* Étapes simples */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">📝 Comment ça marche ?</h3>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-sm font-medium">
                1
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Préparez vos produits</h4>
                <p className="text-sm text-gray-600">
                  Assurez-vous que vos produits sont bien configurés dans votre stand 
                  avec les prix, stocks et descriptions à jour.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-sm font-medium">
                2
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Choisissez une session</h4>
                <p className="text-sm text-gray-600">
                  Sélectionnez la date de marché pour laquelle vous voulez envoyer votre liste.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-sm font-medium">
                3
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Envoyez votre liste</h4>
                <p className="text-sm text-gray-600">
                  Cliquez sur "Envoyer ma liste de produits" pour transmettre vos produits 
                  aux organisateurs.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Points importants */}
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-yellow-900 mb-2">⚠️ Points importants</h3>
          <ul className="space-y-2 text-sm text-yellow-800">
            <li className="flex gap-2">
              <span>•</span>
              <span>Seuls vos produits <strong>actifs</strong> (avec le statut vert 🟢) seront envoyés</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>Vous pouvez modifier votre liste et la renvoyer autant de fois que nécessaire</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>Les organisateurs pourront voir vos produits et ajuster les commissions si besoin</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>Cette action ne vous engage pas définitivement - c'est juste une information</span>
            </li>
          </ul>
        </div>

        {/* Aide supplémentaire */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-2">💡 Besoin d'aide ?</h3>
          <p className="text-sm text-gray-600">
            Si vous avez des questions ou des difficultés, n'hésitez pas à contacter 
            les organisateurs du marché. Ils sont là pour vous aider !
          </p>
        </div>

        </CardContent>
        
        {/* Bouton de fermeture */}
        <CardFooter className="flex justify-end p-6 border-t border-gray-200">
          <Button onClick={onClose} className="px-6">
            J'ai compris
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};