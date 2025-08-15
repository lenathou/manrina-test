import { useState } from 'react';
import { useRouter } from 'next/router';
import { Form } from './Form';
import { backendFetchService } from '@/service/BackendFetchService';
import { ROUTES } from '@/router/routes';

type LoginFormData = {
  email: string;
  password: string;
};

type LoginResponse = {
  success: boolean;
  message?: string;
};

type LoginError = {
  message: string;
  status?: number;
  name?: string;
};

type ClientLoginFormProps = {
  onError: (error: LoginError | string | null) => void;
};

export function ClientLoginForm({ onError }: ClientLoginFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: LoginFormData) => {
    onError(null);
    setIsLoading(true);

    try {
      const response: LoginResponse = await backendFetchService.customerLogin(data);

      if (response.success) {
        router.push(ROUTES.PRODUITS);
      } else {
        onError(response.message || 'Échec de la connexion');
      }
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'message' in error) {
        const loginError = error as LoginError;
        onError(loginError);
      } else {
        onError('Une erreur est survenue lors de la connexion');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Connexion Client
      </h2>
      <Form<LoginFormData>
        formFields={[
          {
            type: 'text',
            placeholder: 'Email',
            name: 'email',
            required: true,
          },
          {
            type: 'password',
            placeholder: 'Mot de passe',
            name: 'password',
            required: true,
          },
        ]}
        onSubmit={handleSubmit}
        submitLabel="Se connecter"
        isDisabled={isLoading}
      />
      <div className="text-sm text-center mt-4">
        <button
          onClick={() => router.push('/mot-de-passe-oublie')}
          className="font-medium text-green-600 hover:text-green-700 transition-colors"
        >
          Mot de passe oublié ?
        </button>
      </div>
    </div>
  );
}