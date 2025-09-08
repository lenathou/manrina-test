import { useRouter } from 'next/router';

export default function RegisterPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header avec logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Manrina</h1>
          <p className="text-gray-600">Choisissez votre type de compte</p>
        </div>

        {/* Sélecteur de type d'inscription */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="space-y-4">
            {/* Inscription Client */}
            <button
              onClick={() => router.push('/client-register')}
              className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all duration-200 text-left group"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-green-100 transition-colors">
                  <span className="text-2xl">🛒</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 group-hover:text-green-700">Client</h3>
                  <p className="text-sm text-gray-600">Je souhaite acheter des produits locaux</p>
                </div>
                <div className="text-gray-400 group-hover:text-green-500">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>

            {/* Inscription Producteur */}
            <button
              onClick={() => router.push('/producteur-register')}
              className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all duration-200 text-left group"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <span className="text-2xl">🌱</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 group-hover:text-green-700">Producteur</h3>
                  <p className="text-sm text-gray-600">Je souhaite vendre mes produits locaux</p>
                </div>
                <div className="text-gray-400 group-hover:text-green-500">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Lien vers la connexion */}
        <div className="text-center">
          <p className="text-gray-600">
            Vous avez déjà un compte ?{' '}
            <button
              onClick={() => router.push('/login')}
              className="text-green-600 hover:text-green-700 font-medium transition-colors"
            >
              Se connecter
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}