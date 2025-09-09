/* eslint-disable react/no-unescaped-entities */
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';

export default function LoginSelectionPage() {
  const router = useRouter();

  const handleClientLogin = () => {
    router.push('/client-login');
  };

  const handleProducerLogin = () => {
    router.push('/producteur-login');
  };

  return (
    <div className="min-h-screen  flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="p-6 border-b bg-tertiary/60 border-gray-200">
          <h1 className="text-2xl font-semibold text-gray-800 text-center">
            Se connecter
          </h1>
          <p className="text-gray-600 mt-2 text-center">
            Choisissez votre type de compte pour vous connecter
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Client Option */}
          <button
            onClick={handleClientLogin}
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
                  Accédez à votre compte client pour commander des produits frais
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
            onClick={handleProducerLogin}
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
                  Accédez à votre espace producteur pour gérer vos produits
                </p>
              </div>
              <div className="text-primary group-hover:text-primary-dark">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <p className="text-sm text-gray-600 text-center">
            Pas encore de compte ?{' '}
            <Link href="/register" className="text-primary hover:text-primary-dark font-medium">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}