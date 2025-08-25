/* eslint-disable react/no-unescaped-entities */
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/badge';
import { ExhibitorCard } from '@/components/public/ExhibitorCard';
import { PublicExhibitor } from '@/types/market';
// Composants d'icônes simples
const SearchIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8"></circle>
        <path d="m21 21-4.35-4.35"></path>
    </svg>
);

const ArrowLeftIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M19 12H5"></path>
        <path d="M12 19l-7-7 7-7"></path>
    </svg>
);

const FilterIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46"></polygon>
    </svg>
);

// Fonction pour récupérer tous les exposants
const getAllExhibitors = async (): Promise<PublicExhibitor[]> => {
    try {
        const response = await fetch('/api/market/exhibitors');
        if (!response.ok) {
            throw new Error('Erreur lors de la récupération des exposants');
        }
        return await response.json();
    } catch (error) {
        console.error('Erreur API exposants:', error);
        // Fallback avec des données mockées
        return [
            {
                id: '1',
                name: 'Ferme Bio Martinique',
                profilePhoto: '/api/placeholder/300/200',
                description: 'Producteur de légumes biologiques locaux depuis 15 ans',
                specialties: ['Légumes bio', 'Fruits tropicaux', 'Herbes aromatiques'],
                email: 'contact@ferme-bio-martinique.com',
                phone: '0596 XX XX XX',
                products: [],
                nextMarketDate: new Date().toISOString()
            },
            {
                id: '2',
                name: 'Jardin Créole',
                profilePhoto: '/api/placeholder/300/200',
                description: 'Spécialiste des variétés créoles traditionnelles',
                specialties: ['Légumes créoles', 'Épices', 'Plantes médicinales'],
                email: 'info@jardin-creole.com',
                phone: '0596 XX XX XX',
                products: [],
                nextMarketDate: new Date().toISOString()
            },
            {
                id: '3',
                name: 'Élevage Péyi',
                profilePhoto: '/api/placeholder/300/200',
                description: 'Élevage responsable et produits laitiers artisanaux',
                specialties: ['Viandes locales', 'Fromages', 'Œufs fermiers'],
                email: 'contact@elevage-peyi.com',
                phone: '0596 XX XX XX',
                products: [],
                nextMarketDate: new Date().toISOString()
            },
            {
                id: '4',
                name: 'Fruits des Îles',
                profilePhoto: '/api/placeholder/300/200',
                description: 'Producteur de fruits tropicaux de qualité premium',
                specialties: ['Fruits tropicaux', 'Jus naturels', 'Confitures'],
                email: 'contact@fruits-des-iles.com',
                phone: '0596 XX XX XX',
                products: [],
                nextMarketDate: new Date().toISOString()
            },
            {
                id: '5',
                name: 'Épices & Saveurs',
                profilePhoto: '/api/placeholder/300/200',
                description: 'Cultivateur d\'épices et d\'aromates traditionnels',
                specialties: ['Épices', 'Aromates', 'Thés locaux'],
                email: 'info@epices-saveurs.com',
                phone: '0596 XX XX XX',
                products: [],
                nextMarketDate: new Date().toISOString()
            },
            {
                id: '6',
                name: 'Boulangerie Péyi',
                profilePhoto: '/api/placeholder/300/200',
                description: 'Boulangerie artisanale avec des ingrédients locaux',
                specialties: ['Pain artisanal', 'Viennoiseries', 'Pâtisseries créoles'],
                email: 'contact@boulangerie-peyi.com',
                phone: '0596 XX XX XX',
                products: [],
                nextMarketDate: new Date().toISOString()
            },
            {
                id: '7',
                name: 'Miel des Mornes',
                profilePhoto: '/api/placeholder/300/200',
                description: 'Apiculteur passionné produisant du miel de qualité',
                specialties: ['Miel', 'Produits de la ruche', 'Cire d\'abeille'],
                email: 'contact@miel-des-mornes.com',
                phone: '0596 XX XX XX',
                products: [],
                nextMarketDate: new Date().toISOString()
            }
        ];
    }
};

const ExhibitorsListPage: React.FC = () => {
    const [exhibitors, setExhibitors] = useState<PublicExhibitor[]>([]);
    const [filteredExhibitors, setFilteredExhibitors] = useState<PublicExhibitor[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSpecialty, setSelectedSpecialty] = useState<string>('');

    // Récupérer toutes les spécialités uniques
    const allSpecialties = React.useMemo(() => {
        const specialties = exhibitors.flatMap(exhibitor => exhibitor.specialties);
        return Array.from(new Set(specialties)).sort();
    }, [exhibitors]);

    useEffect(() => {
        const loadExhibitors = async () => {
            try {
                const data = await getAllExhibitors();
                setExhibitors(data);
                setFilteredExhibitors(data);
            } catch (error) {
                console.error('Erreur lors du chargement des exposants:', error);
            } finally {
                setLoading(false);
            }
        };

        loadExhibitors();
    }, []);

    // Filtrer les exposants selon la recherche et la spécialité
    useEffect(() => {
        let filtered = exhibitors;

        // Filtrer par terme de recherche
        if (searchTerm) {
            filtered = filtered.filter(exhibitor =>
                exhibitor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                exhibitor.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (exhibitor.specialties && exhibitor.specialties.some(specialty => 
                    specialty.toLowerCase().includes(searchTerm.toLowerCase())
                ))
            );
        }

        // Filtrer par spécialité
        if (selectedSpecialty) {
            filtered = filtered.filter(exhibitor =>
                exhibitor.specialties && exhibitor.specialties.includes(selectedSpecialty)
            );
        }

        setFilteredExhibitors(filtered);
    }, [exhibitors, searchTerm, selectedSpecialty]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
                <div className="flex items-center justify-center h-96">
                    <Text variant="body" className="text-gray-600">
                        Chargement des exposants...
                    </Text>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">            
            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* En-tête avec navigation */}
                <div className="mb-8">
                    <Link href="/manrina-an-peyi-a" className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 mb-4">
                        <ArrowLeftIcon className="w-4 h-4" />
                        <span>Retour au marché</span>
                    </Link>
                    
                    <div className="text-center mb-8">
                        <Text variant="h1" className="text-4xl font-bold text-gray-900 mb-4">
                            Tous nos Exposants
                        </Text>
                        <Text variant="body" className="text-gray-600 max-w-2xl mx-auto">
                            Découvrez l'ensemble des producteurs et artisans qui participent au marché Manrina an Péyi-a.
                            Chacun vous propose des produits authentiques et de qualité.
                        </Text>
                    </div>
                </div>

                {/* Barre de recherche et filtres */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Recherche */}
                        <div className="flex-1">
                            <div className="relative">
                                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    type="text"
                                    placeholder="Rechercher un exposant, produit ou spécialité..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        
                        {/* Filtre par spécialité */}
                        <div className="lg:w-64">
                            <select
                                value={selectedSpecialty}
                                onChange={(e) => setSelectedSpecialty(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                                <option value="">Toutes les spécialités</option>
                                {allSpecialties.map((specialty) => (
                                    <option key={specialty} value={specialty}>
                                        {specialty}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    
                    {/* Filtres actifs */}
                    {(searchTerm || selectedSpecialty) && (
                        <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                            <FilterIcon className="w-4 h-4 text-gray-500" />
                            <Text variant="small" className="text-gray-600">
                                Filtres actifs:
                            </Text>
                            {searchTerm && (
                                <Badge variant="secondary" className="cursor-pointer" onClick={() => setSearchTerm('')}>
                                    Recherche: "{searchTerm}" ×
                                </Badge>
                            )}
                            {selectedSpecialty && (
                                <Badge variant="secondary" className="cursor-pointer" onClick={() => setSelectedSpecialty('')}>
                                    {selectedSpecialty} ×
                                </Badge>
                            )}
                        </div>
                    )}
                </div>

                {/* Résultats */}
                <div className="mb-6">
                    <Text variant="body" className="text-gray-600">
                        {filteredExhibitors.length} exposant{filteredExhibitors.length > 1 ? 's' : ''} trouvé{filteredExhibitors.length > 1 ? 's' : ''}
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
                        <Text variant="h3" className="text-gray-500 mb-2">
                            Aucun exposant trouvé
                        </Text>
                        <Text variant="body" className="text-gray-400 mb-4">
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