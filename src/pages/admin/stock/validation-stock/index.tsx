import React, { useState, useMemo } from 'react';
import { useAdminStockValidation, IGrowerStockUpdateWithRelations } from '@/hooks/useGrowerStockValidation';
import { GrowerStockValidationStatus } from '@/server/grower/IGrowerStockValidation';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/router';
import { Text } from '@/components/ui/Text';
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

// Interface pour grouper les demandes par producteur
interface GrowerSummary {
    growerId: string;
    growerName: string;
    growerEmail: string;
    pendingRequestsCount: number;
    totalRequestsCount: number;
    requests: IGrowerStockUpdateWithRelations[];
    lastRequestDate: Date;
}

const AdminStockValidationPage: React.FC = () => {
    const { allPendingUpdates: pendingRequests, isLoading, processStockUpdateRequest } = useAdminStockValidation();
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
                    pendingRequestsCount: 0,
                    totalRequestsCount: 0,
                    requests: [],
                    lastRequestDate: new Date(request.requestDate)
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
            .filter(grower => grower.pendingRequestsCount > 0)
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
        selectedGrowers.forEach(growerId => {
            const grower = growersSummary.find(g => g.growerId === growerId);
            if (grower) {
                grower.requests
                    .filter(req => req.status === GrowerStockValidationStatus.PENDING)
                    .forEach(req => requestsToApprove.push(req.id));
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
        } catch (error) {
            console.error("Erreur lors de l'approbation globale:", error);
        }
    };

    const handleBatchRejectGrowers = async () => {
        if (selectedGrowers.size === 0) return;

        const requestsToReject: string[] = [];
        selectedGrowers.forEach(growerId => {
            const grower = growersSummary.find(g => g.growerId === growerId);
            if (grower) {
                grower.requests
                    .filter(req => req.status === GrowerStockValidationStatus.PENDING)
                    .forEach(req => requestsToReject.push(req.id));
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
                variant='h1'
                className="text-secondary">
                    Validation des stocks producteurs
                </Text>
                <p className="text-gray-600">Sélectionnez un producteur pour gérer ses demandes de mise à jour de stock</p>

                {growersSummary.length > 0 && (
                    <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between bg-gray-50 p-4 rounded-lg gap-4">
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
                                    className="ml-2 text-sm font-medium text-gray-700"
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
                                    Approuver tous ({selectedGrowers.size} producteur{selectedGrowers.size > 1 ? 's' : ''})
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
                                    Rejeter tous ({selectedGrowers.size} producteur{selectedGrowers.size > 1 ? 's' : ''})
                                </Button>
                            </div>
                        )}
                        <div className="text-sm text-gray-600">
                            {growersSummary.reduce((total, grower) => total + grower.pendingRequestsCount, 0)} demandes en attente
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
                <div className="space-y-4">
                    {growersSummary.map((grower: GrowerSummary) => (
                        <Card
                            key={grower.growerId}
                            className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => handleGrowerClick(grower.growerId)}
                        >
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start space-x-3">
                                        <div className="flex items-center pt-1">
                                            <input
                                                type="checkbox"
                                                id={`select-grower-${grower.growerId}`}
                                                checked={selectedGrowers.has(grower.growerId)}
                                                onChange={(e) => {
                                                    e.stopPropagation();
                                                    toggleGrowerSelection(grower.growerId);
                                                }}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <CardTitle className="text-xl text-blue-600 hover:text-blue-800">
                                                {grower.growerName}
                                            </CardTitle>
                                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                                <span>
                                                    <strong>Email:</strong> {grower.growerEmail}
                                                </span>
                                                <span>
                                                    <strong>Dernière demande:</strong>{' '}
                                                    {formatDistanceToNow(grower.lastRequestDate)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                                            <Icon
                                                name="calendar"
                                                size="xs"
                                                color="#d97706"
                                                className="mr-1"
                                            />
                                            {grower.pendingRequestsCount} en attente
                                        </Badge>
                                        <Icon
                                            name="arrow"
                                            size="sm"
                                            color="#6b7280"
                                            className="transform rotate-90"
                                        />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                    <div className="bg-blue-50 p-3 rounded">
                                        <h4 className="font-medium text-blue-900 mb-1 text-sm">Demandes en attente</h4>
                                        <p className="text-xl sm:text-2xl font-bold text-blue-600">
                                            {grower.pendingRequestsCount}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded">
                                        <h4 className="font-medium text-gray-900 mb-1 text-sm">Total demandes</h4>
                                        <p className="text-xl sm:text-2xl font-bold text-gray-600">
                                            {grower.totalRequestsCount}
                                        </p>
                                    </div>
                                    <div className="bg-green-50 p-3 rounded sm:col-span-2 lg:col-span-1">
                                        <h4 className="font-medium text-green-900 mb-1 text-sm">Produits concernés</h4>
                                        <p className="text-xl sm:text-2xl font-bold text-green-600">
                                            {new Set(grower.requests.map(r => r.productId)).size}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-3 sm:mt-4">
                                    <p className="text-xs sm:text-sm text-gray-600">
                                        <strong>Produits:</strong> {grower.requests.slice(0, 3).map(r => r.product.name).join(', ')}
                                        {grower.requests.length > 3 && ` et ${grower.requests.length - 3} autre(s)...`}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminStockValidationPage;
