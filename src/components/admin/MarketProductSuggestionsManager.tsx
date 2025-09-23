import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAllMarketProductSuggestions } from '@/hooks/useAdminMarketProductSuggestion';
import { useAllGrowers } from '@/hooks/useGrowers';
import { IMarketProductSuggestion, IGrower } from '@/server/grower/IGrower';
import { GrowerSuggestionsModal } from './GrowerSuggestionsModal';

export interface GrowerWithSuggestions extends IGrower {
    suggestions: IMarketProductSuggestion[];
    pendingCount: number;
    approvedCount: number;
    rejectedCount: number;
    totalSuggestions: number;
}

interface MarketProductSuggestionsManagerProps {
    className?: string;
    filteredGrowers?: GrowerWithSuggestions[];
    searchTerm?: string;
    selectedStatus?: string;
}

export const MarketProductSuggestionsManager: React.FC<MarketProductSuggestionsManagerProps> = ({ 
    className,
    filteredGrowers: propFilteredGrowers,
    selectedStatus: propSelectedStatus = 'ALL'
}) => {
    const [selectedStatus] = useState<string>(propSelectedStatus);
    const [selectedGrower, setSelectedGrower] = useState<GrowerWithSuggestions | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data: suggestions = [], isLoading, refetch } = useAllMarketProductSuggestions();
    const { data: growers = [], isLoading: isLoadingGrowers } = useAllGrowers();

    // Grouper les suggestions par producteur
    const growerSuggestions = useMemo(() => {
        const grouped = suggestions.reduce((acc, suggestion) => {
            const growerId = suggestion.growerId;
            const grower = growers.find(g => g.id === growerId);
            
            if (!acc[growerId] && grower) {
                acc[growerId] = {
                    ...grower,
                    suggestions: [],
                    pendingCount: 0,
                    approvedCount: 0,
                    rejectedCount: 0,
                    totalSuggestions: 0
                };
            }
            
            if (acc[growerId]) {
                acc[growerId].suggestions.push(suggestion);
                acc[growerId].totalSuggestions++;
                
                switch (suggestion.status) {
                    case 'PENDING':
                        acc[growerId].pendingCount++;
                        break;
                    case 'APPROVED':
                        acc[growerId].approvedCount++;
                        break;
                    case 'REJECTED':
                        acc[growerId].rejectedCount++;
                        break;
                }
            }
            
            return acc;
        }, {} as Record<string, GrowerWithSuggestions>);

        return Object.values(grouped);
    }, [suggestions, growers]);

    // Utiliser les données filtrées des props ou filtrer localement
    const filteredGrowers = useMemo(() => {
        // Si des données filtrées sont fournies en props, les utiliser
        if (propFilteredGrowers) {
            return propFilteredGrowers;
        }
        
        // Sinon, filtrer localement selon le statut sélectionné
        if (selectedStatus === 'ALL') {
            return growerSuggestions;
        }
        
        return growerSuggestions.filter(grower => {
            switch (selectedStatus) {
                case 'PENDING':
                    return grower.pendingCount > 0;
                case 'APPROVED':
                    return grower.approvedCount > 0;
                case 'REJECTED':
                    return grower.rejectedCount > 0;
                default:
                    return true;
            }
        });
    }, [growerSuggestions, selectedStatus, propFilteredGrowers]);

    const handleGrowerClick = (grower: GrowerWithSuggestions) => {
        setSelectedGrower(grower);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedGrower(null);
    };

    const handleSuggestionUpdated = () => {
        refetch();
    };

    const getStatusBadgeColor = (status: string, count: number): string => {
        if (count === 0) return 'bg-gray-100 text-gray-400';
        
        switch (status) {
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800';
            case 'APPROVED':
                return 'bg-green-100 text-green-800';
            case 'REJECTED':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-blue-100 text-blue-800';
        }
    };

    if (isLoading || isLoadingGrowers) {
        return (
            <div className={`p-6 ${className}`}>
                <div className="text-center">
                    <p className="text-gray-500">Chargement des données...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`space-y-6 ${className}`}>
            {/* En-tête avec bouton d'actualisation */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">Liste des producteurs</h2>
                        <p className="text-gray-600 text-sm mt-1">
                            Cliquez sur un producteur pour gérer ses suggestions
                        </p>
                    </div>
                    <Button
                        onClick={() => refetch()}
                        variant="outline"
                        className="flex items-center gap-2"
                    >
                        <span>🔄</span>
                        Actualiser
                    </Button>
                </div>
            </div>

            {/* Liste des producteurs */}
            <div className="space-y-4">
                {filteredGrowers.length === 0 ? (
                    <Card className="p-6 text-center">
                        <p className="text-gray-500">
                            {selectedStatus === 'ALL'
                                ? 'Aucun producteur avec des suggestions pour le moment.'
                                : `Aucun producteur avec des suggestions ${selectedStatus.toLowerCase()} pour le moment.`}
                        </p>
                    </Card>
                ) : (
                    filteredGrowers.map((grower) => (
                        <Card
                            key={grower.id}
                            className="p-6 hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => handleGrowerClick(grower)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <h3 className="text-lg font-semibold text-gray-800">
                                            {grower.name}
                                        </h3>
                                        <span className="text-sm text-gray-500">
                                            ID: {grower.id.slice(0, 8)}...
                                        </span>
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-3">
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor('total', grower.totalSuggestions)}`}>
                                            {grower.totalSuggestions} suggestion{grower.totalSuggestions > 1 ? 's' : ''}
                                        </span>
                                        
                                        {grower.pendingCount > 0 && (
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor('PENDING', grower.pendingCount)}`}>
                                                {grower.pendingCount} en attente
                                            </span>
                                        )}
                                        
                                        {grower.approvedCount > 0 && (
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor('APPROVED', grower.approvedCount)}`}>
                                                {grower.approvedCount} approuvée{grower.approvedCount > 1 ? 's' : ''}
                                            </span>
                                        )}
                                        
                                        {grower.rejectedCount > 0 && (
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor('REJECTED', grower.rejectedCount)}`}>
                                                {grower.rejectedCount} rejetée{grower.rejectedCount > 1 ? 's' : ''}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="flex items-center text-gray-400">
                                    <span className="text-2xl">→</span>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            {/* Modal pour afficher les suggestions d'un producteur */}
            {selectedGrower && (
                <GrowerSuggestionsModal
                    isOpen={isModalOpen}
                    onClose={handleModalClose}
                    growerName={selectedGrower.name}
                    growerId={selectedGrower.id}
                    suggestions={selectedGrower.suggestions}
                    onSuggestionUpdated={handleSuggestionUpdated}
                />
            )}
        </div>
    );
};
