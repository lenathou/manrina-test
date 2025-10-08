/* eslint-disable react/no-unescaped-entities */
import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { ExhibitorCard } from '@/components/public/ExhibitorCard';
import SearchBarNext from '@/components/ui/SearchBarNext';
import { ActionDropdown } from '@/components/ui/ActionDropdown';
import { useMarketExhibitors } from '@/hooks/useMarketSessionsQuery';
import { Card, CardContent } from '@/components/ui/Card';
// Composants d'icônes simples

const ArrowLeftIcon = ({ className }: { className?: string }) => (
    <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
    >
        <path d="M19 12H5"></path>
        <path d="M12 19l-7-7 7-7"></path>
    </svg>
);

const FilterIcon = ({ className }: { className?: string }) => (
    <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
    >
        <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46"></polygon>
    </svg>
);

const ExhibitorsListPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSpecialty, setSelectedSpecialty] = useState<string>('');

    // Utiliser le hook optimisé pour charger les exposants
    const { exhibitors, loading, error } = useMarketExhibitors();

    // Récupérer toutes les spécialités uniques
    const allSpecialties = useMemo(() => {
        const specialties = exhibitors.flatMap((exhibitor) => exhibitor.specialties || []);
        return Array.from(new Set(specialties)).sort();
    }, [exhibitors]);

    // Filtrer les exposants selon la recherche et la spécialité avec useMemo pour optimiser les performances
    const filteredExhibitors = useMemo(() => {
        let filtered = exhibitors;

        // Filtrer par terme de recherche
        if (searchTerm) {
            filtered = filtered.filter(
                (exhibitor) =>
                    exhibitor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    exhibitor.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (exhibitor.specialties &&
                        exhibitor.specialties.some((specialty) =>
                            specialty.toLowerCase().includes(searchTerm.toLowerCase()),
                        )),
            );
        }

        // Filtrer par spécialité
        if (selectedSpecialty) {
            filtered = filtered.filter(
                (exhibitor) => exhibitor.specialties && exhibitor.specialties.includes(selectedSpecialty),
            );
        }

        return filtered;
    }, [exhibitors, searchTerm, selectedSpecialty]);

    if (loading) {
        return (
            <div className="min-h-screen">
                <div className="flex items-center justify-center h-96">
                    <Text
                        variant="body"
                        className="text-gray-600"
                    >
                        Chargement des exposants...
                    </Text>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen">
                <div className="flex items-center justify-center h-96">
                    <Card className="max-w-md mx-auto">
                        <CardContent className="p-6 text-center">
                            <Text variant="h3" className="text-red-600 mb-2">
                                Erreur de chargement
                            </Text>
                            <Text variant="body" className="text-gray-600 mb-4">
                                {error}
                            </Text>
                            <Button 
                                onClick={() => window.location.reload()}
                                variant="outline"
                            >
                                Réessayer
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* En-tête avec navigation */}
                <div className="mb-8">
                    <Link
                        href="/manrina-an-peyi-a"
                        className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 mb-4"
                    >
                        <ArrowLeftIcon className="w-4 h-4" />
                        <span>Retour au marché</span>
                    </Link>

                    <div className="text-center mb-8">
                        <Text
                            variant="h1"
                            className="text-4xl font-bold text-gray-900 mb-4"
                        >
                            Tous nos Exposants
                        </Text>
                        <Text
                            variant="body"
                            className="text-gray-600 max-w-2xl mx-auto"
                        >
                            Découvrez l'ensemble des producteurs et artisans qui participent au marché Manrina an
                            Péyi-a. Chacun vous propose des produits authentiques et de qualité.
                        </Text>
                    </div>
                </div>

                {/* Barre de recherche et filtres */}
                <div className="p-6 mb-8 w-full">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Recherche */}
                        <div className="flex-1">
                            <SearchBarNext
                                placeholder="Rechercher un exposant, produit ou spécialité..."
                                value={searchTerm}
                                onSearch={setSearchTerm}
                                className="!mx-0"
                            />
                        </div>

                        {/* Filtre par spécialité */}
                        <div className="lg:w-64">
                            <ActionDropdown
                                placeholder={selectedSpecialty || "Toutes les spécialités"}
                                icon={
                                    <Image 
                                        src="/icons/filter.svg" 
                                        alt="Filter" 
                                        width={16}
                                        height={16}
                                        className="w-4 h-4"
                                    />
                                }
                                actions={[
                                    {
                                        id: "all",
                                        label: "Toutes les spécialités",
                                        onClick: () => setSelectedSpecialty(''),
                                    },
                                    ...allSpecialties.map((specialty) => ({
                                        id: specialty,
                                        label: specialty,
                                        onClick: () => setSelectedSpecialty(specialty),
                                    }))
                                ]}
                                className="w-full"
                            />
                        </div>
                    </div>

                    {/* Filtres actifs */}
                    {(searchTerm || selectedSpecialty) && (
                        <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                            <FilterIcon className="w-4 h-4 text-gray-500" />
                            <Text
                                variant="small"
                                className="text-gray-600"
                            >
                                Filtres actifs:
                            </Text>
                            {searchTerm && (
                                <Badge
                                    variant="secondary"
                                    className="cursor-pointer"
                                    onClick={() => setSearchTerm('')}
                                >
                                    Recherche: "{searchTerm}" ×
                                </Badge>
                            )}
                            {selectedSpecialty && (
                                <Badge
                                    variant="secondary"
                                    className="cursor-pointer"
                                    onClick={() => setSelectedSpecialty('')}
                                >
                                    {selectedSpecialty} ×
                                </Badge>
                            )}
                        </div>
                    )}
                </div>

                {/* Résultats */}
                <div className="mb-6">
                    <Text
                        variant="body"
                        className="text-gray-600"
                    >
                        {filteredExhibitors.length} exposant{filteredExhibitors.length > 1 ? 's' : ''} trouvé
                        {filteredExhibitors.length > 1 ? 's' : ''}
                    </Text>
                </div>

                {/* Grille des exposants */}
                {filteredExhibitors.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredExhibitors.map((exhibitor) => (
                            <ExhibitorCard
                                key={exhibitor.id}
                                exhibitor={exhibitor}
                                showProducts={true}
                                variant="detailed"
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Text
                            variant="h3"
                            className="text-gray-500 mb-2"
                        >
                            Aucun exposant trouvé
                        </Text>
                        <Text
                            variant="body"
                            className="text-gray-400 mb-4"
                        >
                            Essayez de modifier vos critères de recherche
                        </Text>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setSearchTerm('');
                                setSelectedSpecialty('');
                            }}
                        >
                            Réinitialiser les filtres
                        </Button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ExhibitorsListPage;
