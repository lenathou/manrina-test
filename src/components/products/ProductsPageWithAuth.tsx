import React from 'react';
import { View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { useClientAuth } from '@/hooks/useClientAuth';
import { ProductsPageContainer, ProductsPageContainerWithoutHeader } from './ProductsPage';
import { ClientLayout } from '@/components/layouts/ClientLayout';
import { PageContainer } from './PageContainer';
import { colorUsages, variables } from '@/theme';
import { useAppContext } from '@/context/AppContext';
import { ROUTES } from '@/router/routes';
import { NavbarBasket } from '@/components/Header/NavbarBasket';

export const ProductsPageWithAuth = () => {
    const { isAuthenticated, authenticatedClient, isLoading: authLoading } = useClientAuth();
    const { isLoading: appLoading } = useAppContext();
    const router = useRouter();

    const handleLoginClick = () => {
        router.push(ROUTES.CUSTOMER.LOGIN);
    };

    if (authLoading || appLoading) {
        return (
            <PageContainer>
                <View style={{ padding: variables.spaceXL, alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                    <ActivityIndicator
                        animating={true}
                        color={colorUsages.primary}
                        size={40}
                    />
                </View>
            </PageContainer>
        );
    }

    if (isAuthenticated && authenticatedClient) {
        // Client connecté : afficher avec le layout client (sidebars) sans header
        return (
            <ClientLayout authenticatedClient={authenticatedClient}>
                <ProductsPageContainerWithoutHeader />
            </ClientLayout>
        );
    }

    // Client non connecté : afficher avec header personnalisé incluant le bouton de connexion
    const RightSection = (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity onPress={handleLoginClick} style={{ padding: 8 }}>
                <Image 
                    src="/icons/user-icon.svg" 
                    alt="Connexion client"
                    width={24}
                    height={24}
                />
            </TouchableOpacity>
            <NavbarBasket />
        </View>
    );

    return <ProductsPageContainer customRightSection={RightSection} />;
};