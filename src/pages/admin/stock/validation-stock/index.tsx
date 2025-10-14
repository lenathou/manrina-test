import React, { useState, useMemo } from 'react';
import { useAdminStockValidation, IGrowerStockUpdateWithRelations } from '@/hooks/useGrowerStockValidation';
import { GrowerStockValidationStatus } from '@/server/grower/IGrowerStockValidation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { useRouter } from 'next/router';
import { Text } from '@/components/ui/Text';
import GrowerValidationCard from '@/components/admin/stock/validation-stock/GrowerValidationCard';
import { useNotificationInvalidation } from '@/hooks/useNotificationInvalidation';

// Interface pour grouper les demandes par producteur
interface GrowerSummary {
    growerId: string;
    growerName: string;
    growerEmail: string;
    growerAvatar?: string | null;
    pendingRequestsCount: number;
    totalRequestsCount: number;
    requests: IGrowerStockUpdateWithRelations[];
    lastRequestDate: Date;
}

const AdminStockValidationPage: React.FC = () => {
    const { allPendingUpdates: pendingRequests, isLoading, processStockUpdateRequest } = useAdminStockValidation();
    const { invalidateStockNotifications } = useNotificationInvalidation();
    const router = useRouter();
    const [selectedGrowers, setSelectedGrowers] = useState<Set<string>>(new Set());

    // Grouper les demandes par producteur
    const growersSummary = useMemo((): GrowerSummary[] => {
        const growersMap = new Map<string, GrowerSummary>();

        pendingRequests.forEach((request) => {
            const growerId = request.growerId;

            if (!growersMap.has(growerId)) {
                growersMap.set(growerId, {
                    growerId,
                    growerName: request.grower.name,
                    growerEmail: request.grower.email,
                    growerAvatar: null, // Avatar non disponible dans les données actuelles
                    pendingRequestsCount: 0,
                    totalRequestsCount: 0,
                    requests: [],
                    lastRequestDate: new Date(request.requestDate),
                });
            }

            const growerSummary = growersMap.get(growerId)!;
            growerSummary.requests.push(request);
            growerSummary.totalRequestsCount++;

            if (request.status === GrowerStockValidationStatus.PENDING) {
                growerSummary.pendingRequestsCount++;
            }

            // Mettre à jour la date de dernière demande
            const requestDate = new Date(request.requestDate);
            if (requestDate > growerSummary.lastRequestDate) {
                growerSummary.lastRequestDate = requestDate;
            }
        });

        return Array.from(growersMap.values())
            .filter((grower) => grower.pendingRequestsCount > 0)
            .sort((a, b) => b.lastRequestDate.getTime() - a.lastRequestDate.getTime());
    }, [pendingRequests]);

    const handleGrowerClick = (growerId: string) => {
        router.push(`/admin/stock/validation-stock/grower/${growerId}`);
    };

    const toggleGrowerSelection = (growerId: string) => {
        setSelectedGrowers((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(growerId)) {
                newSet.delete(growerId);
            } else {
                newSet.add(growerId);
            }
            return newSet;
        });
    };

    const toggleAllGrowers = () => {
        if (selectedGrowers.size === growersSummary.length) {
            setSelectedGrowers(new Set());
        } else {
            setSelectedGrowers(new Set(growersSummary.map((grower) => grower.growerId)));
        }
    };

    const handleBatchApproveGrowers = async () => {
        if (selectedGrowers.size === 0) return;

        const requestsToApprove: string[] = [];
        selectedGrowers.forEach((growerId) => {
            const grower = growersSummary.find((g) => g.growerId === growerId);
            if (grower) {
                grower.requests
                    .filter((req) => req.status === GrowerStockValidationStatus.PENDING)
                    .forEach((req) => requestsToApprove.push(req.id));
            }
        });

        if (requestsToApprove.length === 0) return;

        try {
            await Promise.all(
                requestsToApprove.map((requestId) =>
                    processStockUpdateRequest.mutateAsync({
                        requestId,
                        status: GrowerStockValidationStatus.APPROVED,
                        adminComment: undefined,
                        approvedBy: 'admin',
                    }),
                ),
            );
            setSelectedGrowers(new Set());
            // Invalider immédiatement les notifications de stock
            invalidateStockNotifications();
        } catch (error) {
            console.error("Erreur lors de l'approbation globale:", error);
        }
    };

    const handleBatchRejectGrowers = async () => {
        if (selectedGrowers.size === 0) return;

        const requestsToReject: string[] = [];
        selectedGrowers.forEach((growerId) => {
            const grower = growersSummary.find((g) => g.growerId === growerId);
            if (grower) {
                grower.requests
                    .filter((req) => req.status === GrowerStockValidationStatus.PENDING)
                    .forEach((req) => requestsToReject.push(req.id));
            }
        });

        if (requestsToReject.length === 0) return;

        try {
            await Promise.all(
                requestsToReject.map((requestId) =>
                    processStockUpdateRequest.mutateAsync({
                        requestId,
                        status: GrowerStockValidationStatus.REJECTED,
                        adminComment: undefined,
                        approvedBy: 'admin',
                    }),
                ),
            );
            setSelectedGrowers(new Set());
            // Invalider immédiatement les notifications de stock
            invalidateStockNotifications();
        } catch (error) {
            console.error('Erreur lors du rejet global:', error);
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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="mb-6 sm:mb-8">
                <Text
                    variant="h1"
                    className="text-secondary"
                >
                    Validation des stocks producteurs
                </Text>
                <p className="text-gray-600">
                    Sélectionnez un producteur pour gérer ses demandes de mise à jour de stock
                </p>

                {growersSummary.length > 0 && (
                    <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between p-4  gap-4">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="select-all-growers"
                                    checked={
                                        selectedGrowers.size === growersSummary.length && growersSummary.length > 0
                                    }
                                    onChange={toggleAllGrowers}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label
                                    htmlFor="select-all-growers"
                                    className="ml-2 text-lg font-semibold  text-gray-700"
                                >
                                    Sélectionner tous les producteurs ({selectedGrowers.size}/{growersSummary.length})
                                </label>
                            </div>
                        </div>
                        {selectedGrowers.size > 0 && (
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                                <Button
                                    onClick={handleBatchApproveGrowers}
                                    className="bg-green-600 hover:bg-green-700 text-white flex items-center text-sm sm:text-base"
                                >
                                    <Icon
                                        name="check"
                                        size="sm"
                                        color="white"
                                        className="mr-2"
                                    />
                                    Approuver tous ({selectedGrowers.size} producteur
                                    {selectedGrowers.size > 1 ? 's' : ''})
                                </Button>
                                <Button
                                    onClick={handleBatchRejectGrowers}
                                    variant="secondary"
                                    className="border-red-300 text-red-700 hover:bg-red-50 flex items-center text-sm sm:text-base"
                                >
                                    <Icon
                                        name="close"
                                        size="sm"
                                        color="#b91c1c"
                                        className="mr-2"
                                    />
                                    Rejeter tous ({selectedGrowers.size} producteur{selectedGrowers.size > 1 ? 's' : ''}
                                    )
                                </Button>
                            </div>
                        )}
                        <div className="text-sm text-gray-600">
                            {growersSummary.reduce((total, grower) => total + grower.pendingRequestsCount, 0)} demandes
                            en attente
                        </div>
                    </div>
                )}
            </div>

            {growersSummary.length === 0 ? (
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
                            <p>Tous les producteurs ont leurs demandes de validation traitées.</p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {growersSummary.map((grower: GrowerSummary) => (
                        <GrowerValidationCard
                            key={grower.growerId}
                            growerId={grower.growerId}
                            growerName={grower.growerName}
                            growerEmail={grower.growerEmail}
                            growerAvatar={grower.growerAvatar}
                            pendingRequestsCount={grower.pendingRequestsCount}
                            productsCount={new Set(grower.requests.map((r) => r.productId)).size}
                            lastRequestDate={grower.lastRequestDate}
                            isSelected={selectedGrowers.has(grower.growerId)}
                            onToggleSelection={() => {
                                toggleGrowerSelection(grower.growerId);
                            }}
                            onClick={() => handleGrowerClick(grower.growerId)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminStockValidationPage;
