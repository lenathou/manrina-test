'use client';

import { BaseHeader, BaseHeaderProps } from './BaseHeader';
import { NavbarDesktop } from './NavbarDesktop';
import { ManrinaLogo } from './ManrinaLogo';
import { useGlobalAuth } from '@/hooks/useGlobalAuth';
import Link from 'next/link';
import { ROUTES } from '@/router/routes';
import { NavbarBasket } from './NavbarBasket';
import { Text, TextStyle } from 'react-native';
import { PropsWithChildren } from 'react';
import { common } from '@/theme';


export const Header = (props: BaseHeaderProps) => {
  // Toujours utiliser la version desktop
  return <HeaderOrdi {...props} />;
};

const HeaderOrdi = (props: BaseHeaderProps) => {
  const { isAuthenticated, role, user } = useGlobalAuth();

  const RightSection = (
    <div className="flex items-center gap-4">
      {/* Afficher les informations de l'utilisateur connecté */}
      {isAuthenticated && user && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            {role === 'admin' && '👨‍💼 Admin:'}
            {role === 'client' && '👤 Client:'}
            {role === 'producteur' && '🌱 Producteur:'}
            {role === 'livreur' && '🚚 Livreur:'}
          </span>
          <span className="text-sm font-medium text-gray-800">
            {String('name' in user ? user.name : 'email' in user ? user.email : 'Utilisateur')}
          </span>
        </div>
      )}
      {/* Afficher le lien connexion uniquement si l'utilisateur n'est PAS connecté */}
      {!isAuthenticated && (
        <Link href={ROUTES.CUSTOMER.LOGIN} className="text-gray-700 hover:text-primary font-semibold">
          Connexion
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
