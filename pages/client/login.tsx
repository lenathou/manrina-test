import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Form } from '@/components/Form/Form';
import { BackButton } from '@/components/products/BackButton';
import { ROUTES } from '@/router/routes';
import { backendFetchService } from '@/service/BackendFetchService';
import { colorUsages, common, variables } from '@/theme';

export default function CustomerLogin() {
    const router = useRouter();
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const isValid = await backendFetchService.verifyCustomerToken();
                if (isValid) {
                    router.replace(ROUTES.PRODUITS);
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
            console.log('backendFetchService:', backendFetchService);
            console.log('customerLogin method:', backendFetchService.customerLogin);
            
            const response = await backendFetchService.customerLogin(data);

            if (response.success) {
                // Store the token in a cookie (this will be handled by the API)
                // Redirect to customer orders
                router.push(ROUTES.PRODUITS);
            } else {
                setError(response.message || 'Échec de la connexion');
            }
        } catch (error) {
            console.error('Login error:', error);
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
                <Text style={styles.title}>Connexion Client</Text>
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
                <View style={{ marginTop: variables.space }}>
                    <Text 
                        style={{ ...common.text.text, textAlign: 'center', color: colorUsages.primary }}
                        onPress={() => router.push('/mot-de-passe-oublie')}
                    >
                        Mot de passe oublié ?
                    </Text>
                </View>
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