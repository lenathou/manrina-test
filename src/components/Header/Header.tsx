'use client';

import { useEffect, useState } from 'react';
import { BaseHeader, BaseHeaderProps } from './BaseHeader';
import { NavbarDesktop } from './NavbarDesktop';
import { HeaderMobile } from './HeaderMobile';
import { ManrinaLogo } from './ManrinaLogo';
import { useClientAuth } from '@/hooks/useClientAuth';
import Image from 'next/image';
import Link from 'next/link';
import { ROUTES } from '@/router/routes';
import { NavbarBasket } from './NavbarBasket';
import { Text, TextStyle } from 'react-native';
import { PropsWithChildren } from 'react';
import { common } from '@/theme';


export const Header = (props: BaseHeaderProps) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile ? <HeaderMobile {...props} /> : <HeaderOrdi {...props} />;
};

const HeaderOrdi = (props: BaseHeaderProps) => {
  const { isAuthenticated } = useClientAuth();

  const RightSection = (
    <div className="flex items-center gap-4">
      {/* Afficher l’icône login uniquement si l'utilisateur n’est PAS connecté */}
      {!isAuthenticated && (
        <Link href={ROUTES.CUSTOMER.LOGIN}>
          <Image
            src="/icons/user-icon.svg"
            alt="Connexion client"
            width={24}
            height={24}
          />
        </Link>
      )}
      <NavbarBasket />
    </div>
  );

  return (
    <BaseHeader
      hideBasket={props.hideBasket}
      backgroundStyle={props.backgroundStyle}
      LeftSection={props.LeftSection ?? <ManrinaLogo />}
      CentralSection={props.CentralSection ?? <NavbarDesktop />}
      RightSection={RightSection}
    />
  );
};

export const HeaderTitle = ({ children, style }: PropsWithChildren<{ style?: TextStyle }>) => {
  return (
    <Text
      style={{
        ...common.text.h1HighlightInfo,
        paddingTop: 8,
        ...style,
      }}
    >
      {children}
    </Text>
  );
};
