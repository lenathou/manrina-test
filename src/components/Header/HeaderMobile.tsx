'use client';

import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { colorUsages } from '../../theme';
import { AppImage } from '../Image';
import { BaseHeader, BaseHeaderProps } from './BaseHeader';
import { ManrinaLogo } from './ManrinaLogo';
import { NAVBAR_LINKS } from '../../constants/NAVBAR_LINKS';
import { NavbarItem } from './NavbarItem';
import { Link } from '../Link';
import { ROUTES } from '@/router/routes';
import { NavbarBasket } from './NavbarBasket';

export const HeaderMobile = (props: BaseHeaderProps) => {
  const [isNavbarVisible, setIsNavbarVisible] = useState(false);

  const toggleNavbar = () => {
    setIsNavbarVisible((state) => !state);
  };

  const rightSection =
    props.RightSection ?? (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <Link href={ROUTES.CUSTOMER.LOGIN}>
          <Text style={{ fontWeight: '600', color: '#374151' }}>Connexion</Text>
        </Link>
        {!props.hideBasket && <NavbarBasket />}
      </View>
    );

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
              <MenuBurger toggleNavbar={toggleNavbar} />
              <ManrinaLogo />
            </View>
          )
        }
        CentralSection={props.CentralSection ?? null}
        RightSection={rightSection}
      />
      {isNavbarVisible && <NavbarLinks onPress={toggleNavbar} />}
    </>
  );
};

const NavbarLinks = ({ onPress }: { onPress?: () => void }) => {
  return (
    <TouchableOpacity
      style={{
        backgroundColor: colorUsages.background,
        padding: 24,
        marginTop: 70,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        gap: 16,
        zIndex: 1,
      }}
      onPress={() => onPress?.()}
    >
      {NAVBAR_LINKS.map((link) => (
        <NavbarItem {...link} key={link.title} />
      ))}
    </TouchableOpacity>
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
