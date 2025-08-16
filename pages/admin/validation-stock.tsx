import React, { useState } from 'react';
import { withAdminLayout } from '@/components/layouts/AdminLayout';
import { useAdminStockValidation, IGrowerStockUpdateWithRelations } from '@/hooks/useGrowerStockValidation';
import { GrowerStockValidationStatus } from '@/server/grower/IGrowerStockValidation';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/Card';
import { Textarea } from '@/components/ui/Textarea';
import { Icon } from '@/components/ui/Icon';
// Fonction utilitaire pour formater les dates
const formatDistanceToNow = (date: Date): string => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return "À l'instant";
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
};

// Composant Badge simple
const Badge: React.FC<{ variant?: 'default' | 'warning' | 'success' | 'destructive'; children: React.ReactNode }> = ({
    variant = 'default',
    children,
}) => {
    const variantClasses = {
        default: 'bg-gray-100 text-gray-800',
        warning: 'bg-yellow-100 text-yellow-800',
        success: 'bg-green-100 text-green-800',
        destructive: 'bg-red-100 text-red-800',
    };

    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]}`}
        >
            {children}
        </span>
    );
};

// Utilisation de l'interface IGrowerStockUpdateWithRelations du hook

const AdminStockValidationPage: React.FC = () => {
    const { allPendingUpdates: pendingRequests, isLoading, processStockUpdateRequest } = useAdminStockValidation();
    const [processingRequests, setProcessingRequests] = useState<Set<string>>(new Set());
    const [adminComments, setAdminComments] = useState<Record<string, string>>({});
    const [selectedRequests, setSelectedRequests] = useState<Set<string>>(new Set());
    const [isProcessingBatch, setIsProcessingBatch] = useState(false);

    const handleApprove = async (requestId: string) => {
        setProcessingRequests((prev) => new Set(prev).add(requestId));
        try {
            await processStockUpdateRequest.mutateAsync({
                requestId,
                status: GrowerStockValidationStatus.APPROVED,
                adminComment: adminComments[requestId] || undefined,
                approvedBy: 'admin', // TODO: utiliser l'ID de l'admin connecté
            });
            setAdminComments((prev) => {
                const newComments = { ...prev };
                delete newComments[requestId];
                return newComments;
            });
        } catch (error) {
            console.error("Erreur lors de l'approbation:", error);
        } finally {
            setProcessingRequests((prev) => {
                const newSet = new Set(prev);
                newSet.delete(requestId);
                return newSet;
            });
        }
    };

    const handleReject = async (requestId: string) => {
        setProcessingRequests((prev) => new Set(prev).add(requestId));
        try {
            await processStockUpdateRequest.mutateAsync({
                requestId,
                status: GrowerStockValidationStatus.REJECTED,
                adminComment: adminComments[requestId] || undefined,
                approvedBy: 'admin', // TODO: utiliser l'ID de l'admin connecté
            });
            setAdminComments((prev) => {
                const newComments = { ...prev };
                delete newComments[requestId];
                return newComments;
            });
        } catch (error) {
            console.error('Erreur lors du rejet:', error);
        } finally {
            setProcessingRequests((prev) => {
                const newSet = new Set(prev);
                newSet.delete(requestId);
                return newSet;
            });
        }
    };

    const updateAdminComment = (requestId: string, comment: string) => {
        setAdminComments((prev) => ({
            ...prev,
            [requestId]: comment,
        }));
    };

    const toggleRequestSelection = (requestId: string) => {
        setSelectedRequests((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(requestId)) {
                newSet.delete(requestId);
            } else {
                newSet.add(requestId);
            }
            return newSet;
        });
    };

    const toggleAllRequests = () => {
        if (selectedRequests.size === pendingRequests.length) {
            setSelectedRequests(new Set());
        } else {
            setSelectedRequests(new Set(pendingRequests.map((req) => req.id)));
        }
    };

    const handleBatchApprove = async () => {
        if (selectedRequests.size === 0) return;

        setIsProcessingBatch(true);
        try {
            await Promise.all(
                Array.from(selectedRequests).map((requestId) =>
                    processStockUpdateRequest.mutateAsync({
                        requestId,
                        status: GrowerStockValidationStatus.APPROVED,
                        adminComment: adminComments[requestId] || undefined,
                        approvedBy: 'admin',
                    }),
                ),
            );
            setSelectedRequests(new Set());
            // Nettoyer les commentaires des demandes approuvées
            setAdminComments((prev) => {
                const newComments = { ...prev };
                selectedRequests.forEach((requestId) => {
                    delete newComments[requestId];
                });
                return newComments;
            });
        } catch (error) {
            console.error("Erreur lors de l'approbation en lot:", error);
        } finally {
            setIsProcessingBatch(false);
        }
    };

    const handleBatchReject = async () => {
        if (selectedRequests.size === 0) return;

        setIsProcessingBatch(true);
        try {
            await Promise.all(
                Array.from(selectedRequests).map((requestId) =>
                    processStockUpdateRequest.mutateAsync({
                        requestId,
                        status: GrowerStockValidationStatus.REJECTED,
                        adminComment: adminComments[requestId] || undefined,
                        approvedBy: 'admin',
                    }),
                ),
            );
            setSelectedRequests(new Set());
            // Nettoyer les commentaires des demandes rejetées
            setAdminComments((prev) => {
                const newComments = { ...prev };
                selectedRequests.forEach((requestId) => {
                    delete newComments[requestId];
                });
                return newComments;
            });
        } catch (error) {
            console.error('Erreur lors du rejet en lot:', error);
        } finally {
            setIsProcessingBatch(false);
        }
    };

    const getStatusBadge = (status: GrowerStockValidationStatus) => {
        switch (status) {
            case GrowerStockValidationStatus.PENDING:
                return (
                    <Badge variant="warning">
                        <Icon
                            name="calendar"
                            size="xs"
                            color="#d97706"
                            className="mr-1"
                        />
                        En attente
                    </Badge>
                );
            case GrowerStockValidationStatus.APPROVED:
                return (
                    <Badge variant="success">
                        <Icon
                            name="check"
                            size="xs"
                            color="#16a34a"
                            className="mr-1"
                        />
                        Approuvée
                    </Badge>
                );
            case GrowerStockValidationStatus.REJECTED:
                return (
                    <Badge variant="destructive">
                        <Icon
                            name="close"
                            size="xs"
                            color="#dc2626"
                            className="mr-1"
                        />
                        Rejetée
                    </Badge>
                );
            default:
                return null;
        }
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg">Chargement des demandes...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Validation des stocks producteurs</h1>
                <p className="text-gray-600">Gérez les demandes de mise à jour de stock des producteurs</p>

                {pendingRequests.length > 0 && (
                    <div className="mt-6 flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="select-all"
                                    checked={
                                        selectedRequests.size === pendingRequests.length && pendingRequests.length > 0
                                    }
                                    onChange={toggleAllRequests}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label
                                    htmlFor="select-all"
                                    className="ml-2 text-sm font-medium text-gray-700"
                                >
                                    Sélectionner tout ({selectedRequests.size}/{pendingRequests.length})
                                </label>
                            </div>
                        </div>

                        {selectedRequests.size > 0 && (
                            <div className="flex space-x-3">
                                <Button
                                    onClick={handleBatchApprove}
                                    disabled={isProcessingBatch}
                                    className="bg-green-600 hover:bg-green-700 text-white flex items-center"
                                >
                                    <Icon
                                        name="check"
                                        size="sm"
                                        color="white"
                                        className="mr-2"
                                    />
                                    {isProcessingBatch ? 'Traitement...' : `Approuver (${selectedRequests.size})`}
                                </Button>
                                <Button
                                    onClick={handleBatchReject}
                                    disabled={isProcessingBatch}
                                    variant="secondary"
                                    className="border-red-300 text-red-700 hover:bg-red-50 flex items-center"
                                >
                                    <Icon
                                        name="close"
                                        size="sm"
                                        color="#b91c1c"
                                        className="mr-2"
                                    />
                                    {isProcessingBatch ? 'Traitement...' : `Rejeter (${selectedRequests.size})`}
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {pendingRequests.length === 0 ? (
                <Card>
                    <CardContent className="py-12">
                        <div className="text-center text-gray-500">
                            <Icon
                                name="calendar"
                                size="lg"
                                color="#d1d5db"
                                className="mx-auto mb-4"
                            />
                            <p className="text-lg font-medium mb-2">Aucune demande en attente</p>
                            <p>Toutes les demandes de validation ont été traitées.</p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    {pendingRequests.map((request: IGrowerStockUpdateWithRelations) => (
                        <Card
                            key={request.id}
                            className="border-l-4 border-l-blue-500"
                        >
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start space-x-3">
                                        <div className="flex items-center pt-1">
                                            <input
                                                type="checkbox"
                                                id={`select-${request.id}`}
                                                checked={selectedRequests.has(request.id)}
                                                onChange={() => toggleRequestSelection(request.id)}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">
                                                {request.variant.product.name} - {request.variant.optionValue}
                                            </CardTitle>
                                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                                <span>
                                                    <strong>Producteur:</strong> {request.grower.name}
                                                </span>
                                                <span>
                                                    <strong>Email:</strong> {request.grower.email}
                                                </span>
                                                <span>
                                                    <strong>Demandé:</strong>{' '}
                                                    {formatDistanceToNow(new Date(request.requestDate))}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    {getStatusBadge(request.status)}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <h4 className="font-medium text-gray-900 mb-2">Nouveau stock demandé</h4>
                                            <p className="text-2xl font-bold text-blue-600">
                                                {request.newStock} unités
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <h4 className="font-medium text-gray-900 mb-2">
                                                Raison de la modification
                                            </h4>
                                            <p className="text-gray-700">{request.reason}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Commentaire administrateur (optionnel)
                                        </label>
                                        <Textarea
                                            value={adminComments[request.id] || ''}
                                            onChange={(e) => updateAdminComment(request.id, e.target.value)}
                                            placeholder="Ajoutez un commentaire pour expliquer votre décision..."
                                            className="w-full"
                                            rows={3}
                                        />
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <Button
                                            onClick={() => handleApprove(request.id)}
                                            disabled={processingRequests.has(request.id)}
                                            className="bg-green-600 hover:bg-green-700 text-white flex items-center"
                                        >
                                            <Icon
                                                name="check"
                                                size="sm"
                                                color="white"
                                                className="mr-2"
                                            />
                                            {processingRequests.has(request.id) ? 'Traitement...' : 'Approuver'}
                                        </Button>
                                        <Button
                                            onClick={() => handleReject(request.id)}
                                            disabled={processingRequests.has(request.id)}
                                            variant="secondary"
                                            className="border-red-300 text-red-700 hover:bg-red-50 flex items-center"
                                        >
                                            <Icon
                                                name="close"
                                                size="sm"
                                                color="#b91c1c"
                                                className="mr-2"
                                            />
                                            {processingRequests.has(request.id) ? 'Traitement...' : 'Rejeter'}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default withAdminLayout(AdminStockValidationPage);
