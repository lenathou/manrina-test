/* eslint-disable react/no-unescaped-entities */
import React, { ReactNode, ComponentType } from 'react';
import { ClientSidebar } from '@/components/sidebars/ClientSidebar';
import { ClientMobileSidebar } from '@/components/sidebars/ClientMobileSidebar';
import { withClientAuth } from '@/components/client/withClientAuth';
import { ICustomerTokenPayload } from '@/server/customer/ICustomer';

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
        
        {/* Contenu de la page */}
        <main className="flex-1 overflow-auto p-2 md:p-6">
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