import React, { ReactNode, ComponentType } from 'react';
import { LivreurSidebar } from '@/components/sidebars/LivreurSidebar';
import { LivreurMobileSidebar } from '@/components/sidebars/LivreurMobileSidebar';
import { IDelivererTokenPayload } from '@/server/deliverer/IDeliverer';
import { withDelivererAuth } from '@/components/deliverer/withDelivererAuth';

interface LivreurLayoutProps {
    children: ReactNode;
    authenticatedDeliverer: IDelivererTokenPayload;
}

export const LivreurLayout: React.FC<LivreurLayoutProps> = ({ children, authenticatedDeliverer }) => {
    // Transmission automatique des props d'authentification aux enfants
    const childrenWithProps = React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
            return React.cloneElement(child, { authenticatedDeliverer } as Partial<{ authenticatedDeliverer: IDelivererTokenPayload }>);
        }
        return child;
    });

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar Desktop - visible uniquement sur les grands écrans */}
            <LivreurSidebar className="hidden lg:block" />
            
            {/* Sidebar Mobile - visible uniquement sur les petits écrans */}
            <LivreurMobileSidebar className="lg:hidden" />

            {/* Contenu principal */}
            <div className="flex-1 flex flex-col overflow-hidden">

                {/* Contenu de la page */}
                <main className="flex-1 overflow-auto p-2 md:p-6">{childrenWithProps}</main>
            </div>
        </div>
    );
};

// HOC combiné pour layout et authentification
export function withDelivererLayout<P extends object>(
  WrappedComponent: ComponentType<P & { authenticatedDeliverer: IDelivererTokenPayload }>
) {
  const ComponentWithLayout = ({ authenticatedDeliverer, ...props }: P & { authenticatedDeliverer: IDelivererTokenPayload }) => {
    return (
      <LivreurLayout authenticatedDeliverer={authenticatedDeliverer}>
        <WrappedComponent {...(props as P)} authenticatedDeliverer={authenticatedDeliverer} />
      </LivreurLayout>
    );
  };
  
  return withDelivererAuth(ComponentWithLayout);
}
