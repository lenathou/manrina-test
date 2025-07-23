/* eslint-disable react/no-unescaped-entities */
import React, { ReactNode, ComponentType, useState } from 'react';
import { ProducteurSidebar } from '@/components/sidebars/ProducteurSidebar';
import { ProducteurMobileSidebar } from '@/components/sidebars/ProducteurMobileSidebar';
import { withGrowerAuth } from '@/components/grower/withGrowerAuth';
import { IGrowerTokenPayload } from '@/server/grower/IGrower';

interface ProducteurLayoutProps {
  children: ReactNode;
  authenticatedGrower?: IGrowerTokenPayload;
}

export const ProducteurLayout: React.FC<ProducteurLayoutProps> = ({ children, authenticatedGrower }) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-[var(--color-background)]">
      {/* Sidebar Desktop - visible uniquement sur les écrans larges */}
      <div className="hidden lg:block">
        <ProducteurSidebar className="w-64 bg-white shadow-lg" />
      </div>
      
      {/* Sidebar Mobile - visible uniquement sur les petits écrans */}
      <ProducteurMobileSidebar 
        isOpen={isMobileSidebarOpen} 
        onClose={closeMobileSidebar} 
      />
      
      {/* Contenu principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {/* Bouton burger pour mobile */}
              <button
                onClick={toggleMobileSidebar}
                className="lg:hidden mr-4 p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              >
                <svg
                  className="w-6 h-6 text-[var(--color-secondary)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
              <h1 className="text-xl font-secondary font-bold text-[var(--color-secondary)]">
                Espace Producteur
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {authenticatedGrower && (
                <div className="text-sm text-[var(--muted-foreground)]">
                  <span className="font-medium">{authenticatedGrower.name}</span>
                  <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Producteur</span>
                </div>
              )}
            </div>
          </div>
        </header>
        
        {/* Contenu de la page */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

// HOC pour layout producteur avec authentification
export function withProducteurLayout<P extends object>(
  WrappedComponent: ComponentType<P & { authenticatedGrower: IGrowerTokenPayload }>
) {
  const ComponentWithLayoutAndAuth = withGrowerAuth((props: P & { authenticatedGrower: IGrowerTokenPayload }) => {
    return (
      <ProducteurLayout authenticatedGrower={props.authenticatedGrower}>
        <WrappedComponent {...props} />
      </ProducteurLayout>
    );
  });
  
  return ComponentWithLayoutAndAuth;
}