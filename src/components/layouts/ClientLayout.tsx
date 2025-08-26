/* eslint-disable react/no-unescaped-entities */
import React, { ReactNode, ComponentType } from 'react';
import { ClientSidebar } from '@/components/sidebars/ClientSidebar';
import { ClientMobileSidebar } from '@/components/sidebars/ClientMobileSidebar';
import { withClientAuth } from '@/components/client/withClientAuth';
import { ICustomerTokenPayload } from '@/server/customer/ICustomer';
import { NavbarBasket } from '@/components/Header/NavbarBasket';

interface ClientLayoutProps {
  children: ReactNode;
  authenticatedClient: ICustomerTokenPayload;
}

export const ClientLayout: React.FC<ClientLayoutProps> = ({ children, authenticatedClient }) => {
  // Transmission automatique des props d'authentification aux enfants
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { authenticatedClient } as Partial<{ authenticatedClient: ICustomerTokenPayload }>);
    }
    return child;
  });

  return (
    <div className="flex h-screen bg-[var(--color-background)]">
      {/* Sidebar Desktop - visible uniquement sur les écrans larges */}
      <div className="hidden lg:block">
        <ClientSidebar className="w-64 bg-white shadow-lg" />
      </div>
      
      {/* Sidebar Mobile - visible uniquement sur les petits écrans */}
      <div className="lg:hidden">
        <ClientMobileSidebar />
      </div>
      
      {/* Contenu principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-secondary md:rounded-2xl text-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-secondary font-bold ">
              Mon Espace Client
            </h1>
            <div className="flex items-center space-x-4">
              {authenticatedClient && (
                <div className="text-sm ">
                  <span className="font-medium">Bonjour {authenticatedClient.name}</span>
                </div>
              )}
              <NavbarBasket />
            </div>
          </div>
        </header>
        
        {/* Contenu de la page */}
        <main className="flex-1 overflow-auto p-6">
          {childrenWithProps}
        </main>
      </div>
    </div>
  );
};

// HOC pour layout client avec authentification
export function withClientLayout<P extends object>(
  WrappedComponent: ComponentType<P & { authenticatedClient: ICustomerTokenPayload }>
) {
  const ComponentWithLayout = ({ authenticatedClient, ...props }: P & { authenticatedClient: ICustomerTokenPayload }) => {
    return (
      <ClientLayout authenticatedClient={authenticatedClient}>
        <WrappedComponent {...(props as P)} authenticatedClient={authenticatedClient} />
      </ClientLayout>
    );
  };
  
  return withClientAuth(ComponentWithLayout);
}