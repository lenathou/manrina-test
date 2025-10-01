/* eslint-disable react/no-unescaped-entities */
import { useRouter } from 'next/router';
import { Fragment } from 'react';
import Image from 'next/image';
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from '@/components/ui/Card';

interface RegisterSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RegisterSelectionModal({ isOpen, onClose }: RegisterSelectionModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleClientRegister = () => {
    router.push('/client-register');
    onClose();
  };

  const handleProducerRegister = () => {
    router.push('/producteur-register');
    onClose();
  };

  return (
    <Fragment>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <Card className="bg-background shadow-xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100" padding="none">
          {/* Header */}
          <CardHeader className="p-6 border-b bg-secondary border-gray-200">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold text-white">
                Créer un compte
              </CardTitle>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors p-1"
                aria-label="Fermer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-white opacity-80 mt-2">
              Choisissez le type de compte que vous souhaitez créer
            </p>
          </CardHeader>

          {/* Content */}
          <CardContent className="p-6 space-y-4">
            {/* Client Option */}
            <button
              onClick={handleClientRegister}
              className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 bg-white hover:bg-green-50 transition-all duration-200 text-left group"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-green-100 transition-colors">
                  <Image
                    src="/icons/account-select.svg"
                    alt="Icône client"
                    width={24}
                    height={24}
                    className="text-blue-600 group-hover:text-green-600"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 group-hover:text-green-700">
                    Client
                  </h3>
                  <p className="text-sm text-gray-600">
                    Achetez des produits frais directement auprès des producteurs locaux
                  </p>
                </div>
                <div className="text-primary group-hover:text-primary-dark">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>

            {/* Producer Option */}
            <button
              onClick={handleProducerRegister}
              className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 bg-white hover:bg-green-50 transition-all duration-200 text-left group"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <Image
                    src="/icons/producer-color.svg"
                    alt="Icône producteur"
                    width={24}
                    height={24}
                    className="text-green-600"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 group-hover:text-green-700">
                    Producteur
                  </h3>
                  <p className="text-sm text-gray-600">
                    Vendez vos produits agricoles directement aux consommateurs
                  </p>
                </div>
                <div className="text-primary group-hover:text-primary-dark">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>
          </CardContent>

          {/* Footer */}
          <CardFooter className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
            <p className="text-xs text-gray-500 text-center">
              Il ne vous sera pas possible de modifier votre statut après l'inscription
            </p>
          </CardFooter>
        </Card>
      </div>
    </Fragment>
  );
}