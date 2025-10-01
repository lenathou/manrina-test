'use client';

import { BaseHeader, BaseHeaderProps } from './BaseHeader';
import { NavbarDesktop } from './NavbarDesktop';
import { ManrinaLogo } from './ManrinaLogo';
import Link from 'next/link';
import { ROUTES } from '@/router/routes';
import { NavbarBasket } from './NavbarBasket';
import { Text, TextStyle } from 'react-native';
import { PropsWithChildren } from 'react';
import { common } from '@/theme';
import { useRouter } from 'next/router';

const HeaderActions = () => {
  const router = useRouter();
  const currentPath = router.pathname;
  
  // Masquer le bouton connexion sur les pages panier et payment
  const hideLoginButton = currentPath === '/panier' || currentPath === '/payment';
  
  return (
    <div className="flex items-center gap-4">
      {!hideLoginButton && (
        <Link href={ROUTES.CUSTOMER.LOGIN} className="text-gray-700 hover:text-primary font-semibold">
          Connexion
        </Link>
      )}
      <NavbarBasket />
    </div>
  );
};

export const Header = (props: BaseHeaderProps) => {
  // Toujours utiliser la version desktop
  return <HeaderOrdi {...props} />;
};

const HeaderOrdi = (props: BaseHeaderProps) => {
  return (
    <BaseHeader
      hideBasket={props.hideBasket}
      backgroundStyle={props.backgroundStyle}
      LeftSection={props.LeftSection ?? <ManrinaLogo />}
      CentralSection={props.CentralSection ?? <NavbarDesktop />}
      RightSection={props.RightSection ?? <HeaderActions />}
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
