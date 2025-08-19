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
        <header className="bg-secondary md:rounded-2xl text-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">
              Administration
            </h1>
            <div className="flex items-center space-x-4">
              {authenticatedAdmin && (
                <div className="text-sm">
                  <span className="font-medium">{authenticatedAdmin.username}</span>
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Administrateur</span>
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