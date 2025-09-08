/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface SendProductsExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SendProductsExplanationModal: React.FC<SendProductsExplanationModalProps> = ({ 
  isOpen, 
  onClose 
}) => {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="📋 Envoyer vos produits à une session de marché"
    >
      <div className="space-y-6">
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

        {/* Bouton de fermeture */}
        <div className="flex justify-end pt-4">
          <Button onClick={onClose} className="px-6">
            J'ai compris
          </Button>
        </div>
      </div>
    </Modal>
  );
};