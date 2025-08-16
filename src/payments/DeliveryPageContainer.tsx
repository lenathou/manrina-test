import { PropsWithChildren, ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { Header, HeaderTitle } from '../components/Header/Header';
import { AppImage } from '../components/Image';
import { BackButton } from '../components/products/BackButton';
import { colorUsages, variables } from '../theme';

export const DeliveryPageContainer = ({
    children,
    title,
    Footer,
}: PropsWithChildren<{ title?: string; Footer?: ReactNode }>) => {
    return (
        <View style={{ height: '100svh' }}>
            <Header
                backgroundStyle={{
                    backgroundColor: colorUsages.secondary,
                }}
                LeftSection={<BackButton color={colorUsages.white} />}
                CentralSection={<HeaderTitle style={{ color: colorUsages.white }}>{title || 'Livraison'}</HeaderTitle>}
                hideBasket
            />
            <ScrollView
                style={{ padding: variables.spaceXL, flex: 1 }}
                contentContainerStyle={{
                    alignItems: 'center',
                }}
            >
                <AppImage
                    source="icons/delivery.svg"
                    alt="delivery icon"
                    width={200}
                    height={200}
                    style={{
                        objectFit: 'contain',
                        margin: 'auto',
                    }}
                />
                {children}
            </ScrollView>
            {Footer}
        </View>
    );
};
