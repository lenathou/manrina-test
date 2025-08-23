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
                {/* Header optionnel */}
                <header className="bg-secondary md:rounded-2xl text-white shadow-sm border-b border-gray-200 px-6 py-4">

                    <div className="flex items-center justify-between">
                        <h1 className="text-xl font-semibold">
                            Espace Livreur
                        </h1>
                        <div className="flex items-center space-x-4">
                            <div className="text-sm">
                                <span className="font-medium">{authenticatedDeliverer.name}</span>
                                <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">Livreur</span>
                                {authenticatedDeliverer.zone && (
                                    <span className="ml-2 text-xs text-gray-500">Zone: {authenticatedDeliverer.zone}</span>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Contenu de la page */}
                <main className="flex-1 overflow-auto p-6">{childrenWithProps}</main>
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
