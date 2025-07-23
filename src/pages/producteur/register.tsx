import { useRouter } from 'next/router';
import { useState } from 'react';
import { Form } from '@/components/Form/Form';
import { BackButton } from '@/components/products/BackButton';
import { backendFetchService } from '@/service/BackendFetchService';
import { ROUTES } from '@/router/routes';
import { Text } from '@/components/ui/Text';

export default function GrowerRegister() {
    const router = useRouter();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (data: { name: string; email: string; password: string }) => {
        setError('');
        setSuccess('');
        setLoading(true);
        try {
            const response = await backendFetchService.createGrowerAccount({
                name: data.name,
                email: data.email,
                password: data.password,
            });
            if (response.success) {
                setSuccess('Compte producteur créé avec succès ! Vous pouvez maintenant vous connecter.');
                setTimeout(() => router.push(ROUTES.GROWER.LOGIN), 2000);
            } else {
                setError(response.message || 'Erreur lors de la création du compte.');
            }
        } catch {
            setError('Erreur lors de la création du compte.');
        } finally {
            setLoading(false);
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
                        Créer un compte producteur
                    </Text>
                </div>
                <Form
                    formFields={[
                        {
                            type: 'text',
                            placeholder: 'Nom',
                            name: 'name',
                            required: true,
                        },
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
                    submitLabel={loading ? 'Création...' : 'Créer le compte'}
                    isDisabled={loading}
                />
                {error && <div className="mt-4 text-center text-red-600">{error}</div>}
                {success && <div className="mt-4 text-center text-green-600">{success}</div>}
            </div>
        </div>
    );
}
