import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Form } from '@/components/Form/Form';
import { BackButton } from '@/components/products/BackButton';
import { backendFetchService } from '@/service/BackendFetchService';
import { ROUTES } from '@/router/routes';
import { Text } from '@/components/ui/text';

export default function GrowerLogin() {
    const router = useRouter();
    const [error, setError] = useState('');

    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const isValid = await backendFetchService.verifyGrowerToken();
                if (isValid) {
                    router.replace(ROUTES.GROWER.STOCKS);
                }
            } catch {
                // Not authenticated, stay on login page
            }
        };
        checkAuthStatus();
    }, [router]);

    const handleSubmit = async (data: { email: string; password: string }) => {
        setError('');
        try {
            const response = await backendFetchService.growerLogin(data);
            if (response.success) {
                router.push(ROUTES.GROWER.STOCKS);
            } else {
                setError(response.message || 'Login failed');
            }
        } catch {
            setError('An error occurred during login');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 bg-white p-8 rounded shadow">
                <div className="mb-6 flex items-center justify-between">
                    <BackButton href="/" />
                    <Text
                        variant="h2"
                        className="text-gray-900 text-center w-full"
                    >
                        Connexion Producteur
                    </Text>
                </div>
                <Form
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
                    submitLabel="Connexion"
                />
                {error && <div className="mt-4 text-center text-red-600">{error}</div>}
            </div>
        </div>
    );
}
