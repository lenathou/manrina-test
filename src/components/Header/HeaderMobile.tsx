import { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { colorUsages } from '../../theme';
import { AppImage } from '../Image';
import { BaseHeader, BaseHeaderProps } from './BaseHeader';
import { ManrinaLogo } from './ManrinaLogo';
import { NAVBAR_LINKS } from './NAVBAR_LINKS';
import { NavbarItem } from './NavbarItem';

export const HeaderMobile = (props: BaseHeaderProps) => {
    const [isNavbarVisible, setIsNavbarVisible] = useState(false);

    const toggleNavbar = () => {
        setIsNavbarVisible((state) => !state);
    };

    return (
        <>
            <BaseHeader
                hideBasket={props.hideBasket}
                backgroundStyle={props.backgroundStyle}
                LeftSection={
                    props.LeftSection ?? (
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 10,
                            }}
                        >
                            {/* <MenuBurger toggleNavbar={toggleNavbar} /> */}
                            <ManrinaLogo />
                        </View>
                    )
                }
                CentralSection={props.CentralSection || null}
            />
            {/* {isNavbarVisible && <NavbarLinks onPress={toggleNavbar} />} */}
        </>
    );
};

const NavbarLinks = ({ onPress }: { onPress?: () => void }) => {
    return (
        <View
            style={{
                backgroundColor: colorUsages.background,
                padding: 24,
                marginTop: 70,
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                gap: 16,
                zIndex: 1,
            }}
            onClick={() => onPress?.()}
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

const MenuBurger = ({ toggleNavbar }: { toggleNavbar: () => void }) => {
    return (
        <TouchableOpacity onPress={toggleNavbar}>
            <AppImage
                source="/icons/burger.svg"
                style={{ height: 40, width: 40 }}
                alt="Menu Burger"
            />
        </TouchableOpacity>
    );
};
