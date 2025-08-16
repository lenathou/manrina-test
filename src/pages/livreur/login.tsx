import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Form } from '@/components/Form/Form';
import { BackButton } from '@/components/products/BackButton';
import { ROUTES } from '@/router/routes';
import { backendFetchService } from '@/service/BackendFetchService';
import { colorUsages, common, variables } from '@/theme';

export default function DelivererLogin() {
    const router = useRouter();
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const isValid = await backendFetchService.verifyDelivererToken();
                if (isValid) {
                    router.replace('/livreur/commandes');
                }
            } catch {
                // Not authenticated, stay on login page
            }
        };

        checkAuthStatus();
    }, [router]);

    const handleSubmit = async (data: { email: string; password: string }) => {
        setError('');
        setIsLoading(true);

        try {
            const response = await backendFetchService.delivererLogin(data);

            if (response.success) {
                // Store the token in a cookie (this will be handled by the API)
                // Redirect to deliverer orders
                router.push('/livreur/commandes');
            } else {
                setError(response.message || 'Échec de la connexion');
            }
        } catch {
            setError('Une erreur est survenue lors de la connexion');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.formContainer}>
                <View style={styles.backButtonContainer}>
                    <BackButton href={ROUTES.PRODUITS} />
                </View>
                <Text style={styles.title}>Connexion Livreur</Text>
                <Form
                    formFields={[
                        {
                            type: 'text',
                            placeholder: 'Email',
                            name: 'email',
                            required: true,
                            inputMode: 'email',
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
                {error && <Text style={styles.errorMessage}>{error}</Text>}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: variables.spaceXL,
        backgroundColor: colorUsages.background,
    },
    formContainer: {
        width: '100%',
        maxWidth: 400,
        padding: variables.spaceXL,
        backgroundColor: colorUsages.white,
        borderRadius: 8,
        shadowColor: colorUsages.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    backButtonContainer: {
        position: 'absolute',
        top: variables.spaceXL,
        left: variables.spaceXL,
    },
    title: {
        ...common.text.h1HighlightInfo,
        textAlign: 'center',
        marginBottom: variables.spaceXL,
        marginTop: variables.spaceBig,
    },
    errorMessage: {
        ...common.text.text,
        color: colorUsages.secondary,
        textAlign: 'center',
        marginTop: variables.space,
    },
});