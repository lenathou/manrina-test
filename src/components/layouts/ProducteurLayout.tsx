/* eslint-disable react/no-unescaped-entities */
import React, { ReactNode, ComponentType } from 'react';
import { ProducteurSidebar } from '@/components/sidebars/ProducteurSidebar';
import { ProducteurMobileSidebar } from '@/components/sidebars/ProducteurMobileSidebar';
import { withGrowerAuth } from '@/components/grower/withGrowerAuth';
import { IGrowerTokenPayload } from '@/server/grower/IGrower';

interface ProducteurLayoutProps {
  children: ReactNode;
  authenticatedGrower?: IGrowerTokenPayload;
}

export const ProducteurLayout: React.FC<ProducteurLayoutProps> = ({ children, authenticatedGrower }) => {
  // Cloner les enfants avec la prop authenticatedGrower
  const childrenWithProps = React.isValidElement(children)
    ? React.cloneElement(children, { authenticatedGrower } as Partial<{ authenticatedGrower: IGrowerTokenPayload }>)
    : children;

  return (
    <div className="flex h-screen bg-[var(--color-background)]">
      {/* Sidebar Desktop - visible uniquement sur les écrans larges */}
      <div className="hidden lg:block">
        <ProducteurSidebar className="w-64 bg-white shadow-lg" />
      </div>
      
      {/* Sidebar Mobile - visible uniquement sur les petits écrans */}
      <div className="lg:hidden">
        <ProducteurMobileSidebar 
          isOpen={false} 
          onClose={() => {}} 
        />
      </div>

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col overflow-hidden">        
        {/* Contenu de la page */}
        <main className="flex-1 overflow-auto p-6">
          {childrenWithProps}
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