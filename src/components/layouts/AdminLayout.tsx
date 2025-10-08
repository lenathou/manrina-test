/* eslint-disable react/no-unescaped-entities */
import React, { ReactNode, ComponentType } from 'react';
import { AdminSidebar } from '@/components/sidebars/AdminSidebar';
import { AdminMobileSidebar } from '@/components/sidebars/AdminMobileSidebar';
import { withAdminAuth } from '@/components/admin/withAdminAuth';
import { IAdminTokenPayload } from '@/server/admin/IAdmin';

interface AdminLayoutProps {
  children: ReactNode;
  authenticatedAdmin?: IAdminTokenPayload;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, authenticatedAdmin }) => {
  // Transmission automatique des props d'authentification aux enfants
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { authenticatedAdmin } as Partial<{ authenticatedAdmin: IAdminTokenPayload }>);
    }
    return child;
  });

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Desktop - visible uniquement sur les écrans larges */}
      <div className="hidden lg:block">
        <AdminSidebar className="w-64 bg-white shadow-lg" />
      </div>
      
      {/* Sidebar Mobile - visible uniquement sur les petits écrans */}
      <div className="lg:hidden">
        <AdminMobileSidebar />
      </div>
      
      {/* Contenu principal */}
      <div className="flex-1 flex flex-col overflow-hidden bg-background">
        {/* Header */}
        
        {/* Contenu de la page */}
        <main className="flex-1 overflow-auto p-2 md:p-6">
          {childrenWithProps}
        </main>
      </div>
    </div>
  );
};

// HOC combiné pour layout et authentification
export function withAdminLayout<P extends object>(
  WrappedComponent: ComponentType<P & { authenticatedAdmin: IAdminTokenPayload }>
) {
  const ComponentWithLayout = ({ authenticatedAdmin, ...props }: P & { authenticatedAdmin: IAdminTokenPayload }) => {
    return (
      <AdminLayout authenticatedAdmin={authenticatedAdmin}>
        <WrappedComponent {...(props as P)} authenticatedAdmin={authenticatedAdmin} />
      </AdminLayout>
    );
  };
  
  return withAdminAuth(ComponentWithLayout);
}