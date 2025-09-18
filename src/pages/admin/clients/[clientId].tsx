import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useClientDetails, useUpdateClient } from '@/hooks/admin/useClientDetails';
import { useClientStats, useClientRecentOrders } from '@/hooks/admin/useClientStats';
import { success, error } from '@/utils/notifications';
import { ClientDetailHeader } from '@/components/admin/clients/ClientDetailHeader';
import { ClientInfoCard } from '@/components/admin/clients/ClientInfoCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

interface ClientWithDetails {
    id: string;
    name: string;
    email: string;
    phone?: string;
    createdAt: Date;
    updatedAt: Date;
    totalOrders?: number;
    totalSpent?: string;
    registrationDate?: string;
    lastOrderDate?: string | null;
}

const ClientDetailPage: React.FC = () => {
    const router = useRouter();
    const { clientId } = router.query;
    const [isEditing, setIsEditing] = useState(false);

    const clientIdStr = typeof clientId === 'string' ? clientId : '';

    // Utilisation des nouveaux hooks optimisés
    const { data: client, isLoading, error: clientError } = useClientDetails(clientIdStr);
    const { data: clientStats, isLoading: statsLoading } = useClientStats(clientIdStr);
    useClientRecentOrders(clientIdStr, 5);
    const updateClientMutation = useUpdateClient();
    const [isSaving, setIsSaving] = useState(false);

    // Initialiser editedClient quand client est chargé
    const [editedClient, setEditedClient] = useState<ClientWithDetails | null>(null);

    React.useEffect(() => {
        if (client) {
            setEditedClient({
                ...client,
                totalOrders: clientStats?.totalOrders,
                totalSpent: clientStats?.totalSpent,
                lastOrderDate: clientStats?.lastOrderDate,
                registrationDate: client.createdAt.toISOString(),
            });
        }
    }, [client, clientStats]);

    const handleBackClick = () => {
        router.push('/admin/clients');
    };

    const handleEditClick = () => {
        setIsEditing(true);
        if (client) {
            setEditedClient({
                ...client,
                totalOrders: clientStats?.totalOrders,
                totalSpent: clientStats?.totalSpent,
                registrationDate: client.createdAt.toLocaleDateString('fr-FR'),
                lastOrderDate: clientStats?.lastOrderDate,
            });
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditedClient(null);
    };

    const handleSaveChanges = async () => {
        if (!editedClient || !client) return;

        try {
            setIsSaving(true);
            await updateClientMutation.mutateAsync({
                clientId: editedClient.id,
                updateData: {
                    name: editedClient.name,
                    email: editedClient.email,
                    phone: editedClient.phone,
                },
            });

            setIsEditing(false);
            success('Client mis à jour avec succès');
        } catch (err) {
            console.error('Error updating client:', err);
            error('Erreur lors de la mise à jour du client');
        } finally {
            setIsSaving(false);
        }
    };

    const handleFieldChange = (field: keyof ClientWithDetails, value: string | boolean | number | null) => {
        if (!editedClient) return;
        setEditedClient({
            ...editedClient,
            [field]: value,
        });
    };

    if (isLoading || statsLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <LoadingSpinner />
            </div>
        );
    }

    if (clientError || !client) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <ErrorMessage message="Client non trouvé" />
                <button
                    onClick={handleBackClick}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Retour à la liste
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <ClientDetailHeader
                client={isEditing ? editedClient! : client}
                isEditing={isEditing}
                isSaving={isSaving}
                onBackClick={handleBackClick}
                onEditClick={handleEditClick}
                onSaveClick={handleSaveChanges}
                onCancelClick={handleCancelEdit}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-8">
                        <ClientInfoCard
                            client={{
                                ...(isEditing ? editedClient! : client),
                                totalOrders: clientStats?.totalOrders || 0,
                                totalSpent: clientStats?.totalSpent || '0,00 €',
                                lastOrderDate: clientStats?.lastOrderDate,
                            }}
                            isEditing={isEditing}
                            onEdit={handleEditClick}
                            onCancel={handleCancelEdit}
                            isSaving={isSaving}
                            onFieldChange={handleFieldChange}
                        />
                    </div>

                    <div className="space-y-8">
                        {/* Statistiques du client */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-6">Statistiques</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center p-4 bg-gray-50 rounded-lg">
                                    <div className="text-2xl font-bold text-gray-900">
                                        {clientStats?.totalOrders || 0}
                                    </div>
                                    <div className="text-sm text-gray-600">Commandes</div>
                                </div>
                                <div className="text-center p-4 bg-gray-50 rounded-lg">
                                    <div className="text-2xl font-bold text-gray-900">
                                        {clientStats?.totalSpent || '0,00 €'}
                                    </div>
                                    <div className="text-sm text-gray-600">Total dépensé</div>
                                </div>
                            </div>
                            <div className="mt-4 text-sm text-gray-600">
                                <div>Inscrit le : {new Date(client.createdAt).toLocaleDateString('fr-FR')}</div>
                                {clientStats?.lastOrderDate && (
                                    <div>
                                        Dernière commande :{' '}
                                        {new Date(clientStats.lastOrderDate).toLocaleDateString('fr-FR')}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientDetailPage;
