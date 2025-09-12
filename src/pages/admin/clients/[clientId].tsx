/* eslint-disable react/no-unescaped-entities */
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { IAdminTokenPayload } from '@/server/admin/IAdmin';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorDisplay } from '@/components/ui/ErrorDisplay';
import { useToast } from '@/components/ui/Toast';
import { ClientDetailHeader } from '@/components/admin/clients/ClientDetailHeader';
import { ClientInfoCard } from '@/components/admin/clients/ClientInfoCard';
import { ClientOrdersCard } from '@/components/admin/clients/ClientOrdersCard';
import { ClientAddressesCard } from '@/components/admin/clients/ClientAddressesCard';
import { useClientDetails, useUpdateClient } from '@/hooks/admin/useClientDetails';

interface ClientWithDetails {
  id: string;
  email: string;
  name: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
  totalOrders?: number;
  totalSpent?: string;
  registrationDate?: string;
  lastOrderDate?: string | null;
}

interface ClientDetailPageProps {
  authenticatedAdmin: IAdminTokenPayload;
}

function ClientDetailPage({ }: ClientDetailPageProps) {
  const router = useRouter();
  const { clientId } = router.query;
  const { success, error: showError } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedClient, setEditedClient] = useState<ClientWithDetails | null>(null);
  const [notFound, setNotFound] = useState(false);
  
  const { 
    data: client, 
    isLoading, 
    error: fetchError 
  } = useClientDetails(clientId as string);
  
  const updateClientMutation = useUpdateClient();

  // Gestion des erreurs de récupération
  useEffect(() => {
    if (fetchError) {
      if (fetchError.message.includes('404')) {
        setNotFound(true);
      } else {
        showError('Erreur lors du chargement des données du client');
      }
    }
  }, [fetchError, showError]);

  const handleBackClick = () => {
    router.push('/admin/clients');
  };

  const handleEditClick = () => {
    if (client) {
      setEditedClient({ ...client });
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedClient(null);
  };

  const handleFieldChange = (field: keyof ClientWithDetails, value: string | boolean | number | null) => {
    if (!editedClient) return;
    setEditedClient({
      ...editedClient,
      [field]: value,
    });
  };

  const handleSaveChanges = async () => {
    if (!editedClient || !clientId) return;
    
    try {
      await updateClientMutation.mutateAsync({
        clientId: clientId as string,
        updateData: {
          name: editedClient.name,
          email: editedClient.email,
          phone: editedClient.phone,
        }
      });
      
      setIsEditing(false);
      setEditedClient(null);
      success('Informations du client mises à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      showError('Erreur lors de la sauvegarde des modifications');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <h2 className="font-secondary font-bold text-2xl text-[var(--color-secondary)] mb-4">
            Client introuvable
          </h2>
          <p className="text-[var(--muted-foreground)] mb-6">
            Le client demandé n'existe pas ou a été supprimé.
          </p>
          <button
            onClick={handleBackClick}
            className="bg-[var(--color-primary)] text-white py-2 px-4 rounded-lg font-secondary font-medium hover:opacity-90 transition-opacity"
          >
            Retour à la liste des clients
          </button>
        </div>
      </div>
    );
  }

  if (!client) {
    return <ErrorDisplay message="Erreur lors du chargement des données du client" />;
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec navigation et actions */}
      <ClientDetailHeader
        client={client}
        isEditing={isEditing}
        isSaving={updateClientMutation.isPending}
        onBackClick={handleBackClick}
        onEditClick={handleEditClick}
        onSaveClick={handleSaveChanges}
        onCancelClick={handleCancelEdit}
      />

      {/* Contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informations personnelles */}
        <ClientInfoCard
          client={isEditing ? editedClient! : client}
          isEditing={isEditing}
          onFieldChange={handleFieldChange}
          onEdit={() => setIsEditing(true)}
          onCancel={() => {
            setIsEditing(false);
            setEditedClient(null);
          }}
        />

        {/* Historique des commandes */}
        <ClientOrdersCard
          clientId={client.id}
        />

        {/* Adresses du client */}
        <ClientAddressesCard
          clientId={client.id}
        />

        {/* Statistiques et informations supplémentaires */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Informations du compte
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-500">Date d'inscription</span>
              <span className="text-sm text-gray-900">
                {new Date(client.createdAt).toLocaleDateString('fr-FR')}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-500">Dernière mise à jour</span>
              <span className="text-sm text-gray-900">
                {new Date(client.updatedAt).toLocaleDateString('fr-FR')}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-500">ID Client</span>
              <span className="text-sm text-gray-900 font-mono">
                {client.id}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClientDetailPage;