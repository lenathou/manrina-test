import { PropsWithChildren } from 'react';
import { Text, TextStyle, View, useWindowDimensions } from 'react-native';
import { common } from '../../theme';
import { BaseHeader, BaseHeaderProps } from './BaseHeader';
import { HeaderMobile } from './HeaderMobile';
import { ManrinaLogo } from './ManrinaLogo';
import { NAVBAR_LINKS } from './NAVBAR_LINKS';
import { NavbarItem } from './NavbarItem';

export const Header = (props: BaseHeaderProps) => {
    const { width } = useWindowDimensions();
    const isMobile = width < 768;
    return isMobile ? <HeaderMobile {...props} /> : <HeaderOrdi {...props} />;
};

const HeaderOrdi = (props: BaseHeaderProps) => {
    return (
        <BaseHeader
            hideBasket={props.hideBasket}
            backgroundStyle={props.backgroundStyle}
            LeftSection={props.LeftSection ?? <ManrinaLogo />}
            CentralSection={props.CentralSection ?? null}
        />
    );
};

export const HeaderTitle = ({ children, style }: PropsWithChildren<{ style?: TextStyle }>) => {
    return (
        <Text
            style={{
                ...common.text.h1HighlightInfo,
                paddingTop: 8, // this is used to center title because the font slightly pushes everything up...
                ...style,
            }}
        >
            {children}
        </Text>
    );
};

const NavbarLinks = () => {
    return (
        <View
            style={{
                padding: 4,
                gap: 10,
                flexDirection: 'row',
                justifyContent: 'center',
            }}
        >
            {NAVBAR_LINKS.map((link) => (
                <NavbarItem
                    {...link}
                    key={link.title}
                />
            ))}
        </View>
    );
};
