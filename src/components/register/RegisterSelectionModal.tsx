import { useRouter } from 'next/router';
import { Fragment } from 'react';

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
        <div className="bg-background rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
          {/* Header */}
          <div className="p-6 border-b bg-tertiary/60 border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">
                Créer un compte
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                aria-label="Fermer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-gray-600 mt-2">
              Choisissez le type de compte que vous souhaitez créer
            </p>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Client Option */}
            <button
              onClick={handleClientRegister}
              className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 bg-white hover:bg-green-50 transition-all duration-200 text-left group"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-green-100 transition-colors">
                  <svg className="w-6 h-6 text-blue-600 group-hover:text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 group-hover:text-green-700">
                    Client
                  </h3>
                  <p className="text-sm text-gray-600">
                    Achetez des produits frais directement auprès des producteurs locaux
                  </p>
                </div>
                <div className="text-gray-400 group-hover:text-green-500">
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
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 group-hover:text-green-700">
                    Producteur
                  </h3>
                  <p className="text-sm text-gray-600">
                    Vendez vos produits agricoles directement aux consommateurs
                  </p>
                </div>
                <div className="text-gray-400 group-hover:text-green-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
            <p className="text-xs text-gray-500 text-center">
              Vous pourrez modifier ces informations plus tard dans vos paramètres
            </p>
          </div>
        </div>
      </div>
    </Fragment>
  );
}