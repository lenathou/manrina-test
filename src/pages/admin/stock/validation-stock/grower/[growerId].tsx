import React, { useState } from 'react';
import { useRouter } from 'next/router';
import {  IGrowerStockUpdateWithRelations, useAdminStockValidation } from '@/hooks/useGrowerStockValidation';
import { GrowerStockValidationStatus } from '@/server/grower/IGrowerStockValidation';
import { useToast } from '@/components/ui/Toast';
import LoadingSpinner from '@/components/admin/stock/validation-stock/LoadingSpinner';
import ErrorDisplay from '@/components/admin/stock/validation-stock/ErrorDisplay';
import PageHeader from '@/components/admin/stock/validation-stock/PageHeader';
import BatchSelectionCard from '@/components/admin/stock/validation-stock/BatchSelectionCard';
import StockRequestCard from '@/components/admin/stock/validation-stock/StockRequestCard';

// Fonction utilitaire pour formater les dates
const formatDistanceToNow = (date: Date): string => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) {
        return `il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
    } else if (diffInHours > 0) {
        return `il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
    } else {
        return 'il y a moins d\'une heure';
    }
};

const GrowerStockValidationPage: React.FC = () => {
    const router = useRouter();
    const { growerId } = router.query;
    const { error } = useToast();
    const { allPendingUpdates: pendingRequests, isLoading, processStockUpdateRequest } = useAdminStockValidation();
    const [processingRequests, setProcessingRequests] = useState<Set<string>>(new Set());
    const [selectedRequests, setSelectedRequests] = useState<Set<string>>(new Set());
    const [isProcessingBatch, setIsProcessingBatch] = useState(false);

    // Filtrer les demandes pour ce producteur spécifique
    const growerRequests = pendingRequests.filter(
        (request: IGrowerStockUpdateWithRelations) => request.growerId === growerId && request.status === GrowerStockValidationStatus.PENDING
    );

    const growerInfo = growerRequests.length > 0 ? growerRequests[0].grower : null;




    const handleApprove = async (requestId: string) => {
        setProcessingRequests((prev) => new Set(prev).add(requestId));
        try {
            await processStockUpdateRequest.mutateAsync({
                requestId,
                status: GrowerStockValidationStatus.APPROVED,
                approvedBy: 'admin', // TODO: utiliser l'ID de l'admin connecté
            });
        } catch (err) {
            console.error("Erreur lors de l'approbation:", err);
            error("Erreur lors de l'approbation de la demande");
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
                approvedBy: 'admin', // TODO: utiliser l'ID de l'admin connecté
            });
        } catch (err) {
            console.error('Erreur lors du rejet:', err);
            error('Erreur lors du rejet de la demande');
        } finally {
            setProcessingRequests((prev) => {
                const newSet = new Set(prev);
                newSet.delete(requestId);
                return newSet;
            });
        }
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
        if (selectedRequests.size === growerRequests.length) {
            setSelectedRequests(new Set());
        } else {
            setSelectedRequests(new Set(growerRequests.map((req: IGrowerStockUpdateWithRelations) => req.id)));
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
                        approvedBy: 'admin',
                    }),
                ),
            );
            setSelectedRequests(new Set());
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
                        approvedBy: 'admin',
                    }),
                ),
            );
            setSelectedRequests(new Set());
        } catch (error) {
            console.error('Erreur lors du rejet en lot:', error);
        } finally {
            setIsProcessingBatch(false);
        }
    };

    const handleBackToList = () => {
        router.push('/admin/stock/validation-stock');
    };

    if (isLoading) {
        return <LoadingSpinner message="Récupération des informations du producteur" />;
    }

    if (!growerInfo) {
        return (
            <ErrorDisplay
                title="Producteur introuvable"
                message="Aucune information trouvée pour ce producteur."
                onBackClick={handleBackToList}
                backButtonText="← Retour à la liste"
            />
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <PageHeader
                title={`Validation des stocks - ${growerInfo.name}`}
                subtitle="Validez les demandes de mise à jour de stock pour ce producteur"
                requestCount={growerRequests.length}
                onBackClick={handleBackToList}
                description="Demandes en attente"
            />

            <div className="px-4 py-4">
                {growerRequests.length > 0 && (
                    <BatchSelectionCard
                        selectedCount={selectedRequests.size}
                        totalCount={growerRequests.length}
                        isAllSelected={selectedRequests.size === growerRequests.length && growerRequests.length > 0}
                        onToggleAll={toggleAllRequests}
                        onBatchApprove={handleBatchApprove}
                        onBatchReject={handleBatchReject}
                        isProcessing={isProcessingBatch}
                    />
                )}
            </div>

            {growerRequests.length === 0 ? (
                <ErrorDisplay
                    title="Aucune demande en attente"
                    message="Ce producteur n'a actuellement aucune demande de validation de stock."
                    onBackClick={handleBackToList}
                    backButtonText="← Retour à la liste"
                />
            ) : (
                <div className="space-y-4 px-4 pb-6">
                    {growerRequests.map((request: IGrowerStockUpdateWithRelations) => (
                        <StockRequestCard
                            key={request.id}
                            request={request}
                            isSelected={selectedRequests.has(request.id)}
                            onToggleSelection={() => toggleRequestSelection(request.id)}
                            onApprove={() => handleApprove(request.id)}
                            onReject={() => handleReject(request.id)}
                            isProcessing={processingRequests.has(request.id)}
                            formatDistanceToNow={formatDistanceToNow}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default GrowerStockValidationPage;