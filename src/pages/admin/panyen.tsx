/* eslint-disable react/no-unescaped-entities */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { AppImage } from '@/components/Image';
import { ProductTable } from '@/components/products/Table';
import { useProductQuery } from '@/hooks/useProductQuery';
import { IPanyenProduct, IPanyenCreateInput, IPanyenUpdateInput } from '@/server/panyen/IPanyen';
import { backendFetchService } from '@/service/BackendFetchService';
import { PanyenShowInStoreBadge } from '@/components/admin/PanyenShowInStoreBadge';

// Composants décomposés
import PanyenHeader from '@/components/admin/panyen/PanyenHeader';
import PanyenStats from '@/components/admin/panyen/PanyenStats';
import PanyenModal from '@/components/admin/panyen/PanyenModal';
import PanyenMobileGrid from '@/components/admin/panyen/PanyenMobileGrid';
import SearchBarNext from '@/components/ui/SearchBarNext';
import { htmlToPlainText } from '@/utils/text';

function PanyenManagementPageContent() {
    const [searchTerm, setSearchTerm] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingPanyen, setEditingPanyen] = useState<IPanyenProduct | undefined>();
    const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
    const queryClient = useQueryClient();

    const { data: panyenProducts = [], isLoading } = useQuery({
        queryKey: ['panyen-products'],
        queryFn: async (): Promise<IPanyenProduct[]> => {
            console.log('Récupération de tous les panyen...');
            const result = await backendFetchService.getAllPanyen(true);
            console.log('Panyen récupérés:', result.length, 'éléments:', result);
            return result;
        },
    });

    useProductQuery();


    const componentProductIds = useMemo(() => {
        const ids = new Set<string>();
        panyenProducts.forEach((panyen) => {
            panyen.components.forEach((component) => {
                if (component.productId) {
                    ids.add(component.productId);
                }
            });
        });
        return Array.from(ids).sort();
    }, [panyenProducts]);

    const {
        data: globalStockMap,
        isLoading: isLoadingGlobalStock,
    } = useQuery({
        queryKey: ['panyen-components-global-stock', componentProductIds],
        queryFn: async () => {
            return await backendFetchService.getAllProductsGlobalStock(componentProductIds);
        },
        enabled: componentProductIds.length > 0,
        staleTime: 30000,
    });

    const panyenAvailability = useMemo(() => {
        const availability: Record<
            string,
            {
                stock: number;
                isAvailable: boolean;
                blockingProducts: string[];
            }
        > = {};

        if (panyenProducts.length === 0) {
            return availability;
        }

        panyenProducts.forEach((panyen) => {
            const componentSummaries = panyen.components.map((component) => {
                const quantity = component.quantity > 0 ? component.quantity : 1;
                const productStock =
                    globalStockMap?.[component.productId] ??
                    component.product?.globalStock ??
                    component.productVariant?.stock ??
                    0;
                const availableUnits = Math.floor(productStock / quantity);

                return {
                    productName: component.product?.name ?? 'Produit',
                    availableUnits,
                    productStock,
                };
            });

            if (componentSummaries.length === 0) {
                availability[panyen.id] = {
                    stock: 0,
                    isAvailable: false,
                    blockingProducts: [],
                };
                return;
            }

            const stock = Math.min(...componentSummaries.map((summary) => summary.availableUnits));
            const blockingProducts = componentSummaries
                .filter((summary) => summary.availableUnits <= 0)
                .map((summary) => summary.productName);

            availability[panyen.id] = {
                stock,
                isAvailable: stock > 0,
                blockingProducts: Array.from(new Set(blockingProducts)),
            };
        });

        return availability;
    }, [panyenProducts, globalStockMap]);

    const createPanyenMutation = useMutation({
        mutationFn: async (panyenData: Partial<IPanyenProduct>) => {
            console.log('Création panyen avec données:', panyenData);
            const result = await backendFetchService.createPanyen(panyenData as IPanyenCreateInput);
            console.log('Panyen créé avec succès:', result);
            return result;
        },
        onSuccess: (data) => {
            console.log('onSuccess createPanyen appelé avec:', data);
            queryClient.invalidateQueries({ queryKey: ['panyen-products'] });
            queryClient.invalidateQueries({ queryKey: ['panyen-store-products'] });
            setModalOpen(false);
            setEditingPanyen(undefined);
        },
        onError: (error) => {
            console.error('Erreur lors de la création du panyen:', error);
            alert('Erreur lors de la création du panyen: ' + (error as Error).message);
        },
    });

    const updatePanyenMutation = useMutation({
        mutationFn: async ({ id, ...panyenData }: Partial<IPanyenProduct> & { id: string }) => {
            console.log('Mise à jour panyen avec ID:', id, 'et données:', panyenData);
            const result = await backendFetchService.updatePanyen(id, panyenData as IPanyenUpdateInput);
            console.log('Panyen mis à jour avec succès:', result);
            return result;
        },
        onSuccess: (data) => {
            console.log('onSuccess updatePanyen appelé avec:', data);
            queryClient.invalidateQueries({ queryKey: ['panyen-products'] });
            queryClient.invalidateQueries({ queryKey: ['panyen-store-products'] });
            setModalOpen(false);
            setEditingPanyen(undefined);
        },
        onError: (error) => {
            console.error('Erreur lors de la mise à jour du panyen:', error);
            alert('Erreur lors de la mise à jour du panyen: ' + (error as Error).message);
        },
    });

    const { mutate: updatePanyen, isPending: isUpdatingPanyen } = updatePanyenMutation;

    const deletePanyenMutation = useMutation({
        mutationFn: async (id: string) => {
            return await backendFetchService.deletePanyen(id);
        },
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ['panyen-products'] });
            queryClient.invalidateQueries({ queryKey: ['panyen-store-products'] });
            setDeletingIds((prev) => {
                const newSet = new Set(prev);
                newSet.delete(id);
                return newSet;
            });
        },
        onError: (_, id) => {
            setDeletingIds((prev) => {
                const newSet = new Set(prev);
                newSet.delete(id);
                return newSet;
            });
        },
    });


    const autoHideProcessedRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        if (!globalStockMap) {
            return;
        }

        panyenProducts.forEach((panyen) => {
            if (panyenAvailability[panyen.id]?.isAvailable) {
                autoHideProcessedRef.current.delete(panyen.id);
            }
        });

        const shortagePanyens = panyenProducts.filter(
            (panyen) => panyen.showInStore && !panyenAvailability[panyen.id]?.isAvailable,
        );

        shortagePanyens.forEach((panyen) => {
            if (autoHideProcessedRef.current.has(panyen.id)) {
                return;
            }
            autoHideProcessedRef.current.add(panyen.id);
            updatePanyen({ id: panyen.id, showInStore: false });
        });
    }, [globalStockMap, panyenProducts, panyenAvailability, updatePanyen]);

    const handleCreatePanyen = () => {
        setEditingPanyen(undefined);
        setModalOpen(true);
    };

    const handleEditPanyen = (panyen: IPanyenProduct) => {
        setEditingPanyen(panyen);
        setModalOpen(true);
    };

    const handleSavePanyen = (panyenData: Partial<IPanyenProduct>) => {
        if (editingPanyen) {
            updatePanyen({ ...panyenData, id: editingPanyen.id });
        } else {
            createPanyenMutation.mutate(panyenData);
        }
    };

    const handleDeletePanyen = (id: string) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce panyen ?')) {
            setDeletingIds((prev) => {
                const newSet = new Set(prev);
                newSet.add(id);
                return newSet;
            });
            deletePanyenMutation.mutate(id);
        }
    };


    const filteredPanyenProducts = useMemo(
        () => {
            const normalizedSearch = searchTerm.toLowerCase();
            return panyenProducts.filter((panyen) => {
                const plainDescription = htmlToPlainText(panyen.description || '').toLowerCase();
                return (
                    panyen.name.toLowerCase().includes(normalizedSearch) ||
                    (plainDescription !== '' && plainDescription.includes(normalizedSearch))
                );
            });
        },
        [panyenProducts, searchTerm],
    );

    if (isLoading) {
        return (
            <div className="flex-1 flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-lg text-gray-600">Chargement des panyens...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <div className="container mx-auto px-4 py-6 lg:px-8">
                {/* Header */}
                <PanyenHeader onCreateClick={handleCreatePanyen} />

                {/* Statistiques */}
                <div className='flex justify-center w-full mb-6'>
                    <PanyenStats panyens={panyenProducts} availabilityById={panyenAvailability} />
                </div>

                <div className="mb-6 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                    La visibilite des paniers est desactivee automatiquement quand un composant est en rupture de stock.
                </div>

                {/* Barre de recherche */}
                <div className="mb-6">
                    <div className="max-w-md">
                        <SearchBarNext
                            placeholder="Rechercher un panyen..."
                            value={searchTerm}
                            onSearch={setSearchTerm}
                        />
                    </div>
                </div>

                {/* Contenu principal */}
                {filteredPanyenProducts.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
                        <div className="text-center">
                            <div className="text-6xl mb-4">📦</div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                {searchTerm ? 'Aucun panyen trouvé' : 'Aucun panyen créé'}
                            </h3>
                            <p className="text-gray-600 mb-6">
                                {searchTerm
                                    ? 'Essayez de modifier votre recherche'
                                    : 'Créez votre premier panyen pour commencer'}
                            </p>
                            {!searchTerm && (
                                <Button
                                    onClick={handleCreatePanyen}
                                    variant="primary"
                                    size="lg"
                                >
                                    Créer votre premier panyen
                                </Button>
                            )}
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Version mobile avec scroll horizontal */}
                        <PanyenMobileGrid
                            panyens={filteredPanyenProducts}
                            onEdit={handleEditPanyen}
                            onDelete={handleDeletePanyen}
                            deletingIds={deletingIds}
                            availabilityById={panyenAvailability}
                            isLoadingStock={isLoadingGlobalStock}
                            isUpdatingVisibility={isUpdatingPanyen}
                        />

                        {/* Version desktop avec tableau */}
                        <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <ProductTable>
                                    <ProductTable.Header>
                                        <ProductTable.HeaderRow>
                                            <ProductTable.HeaderCell>Panyen</ProductTable.HeaderCell>
                                            <ProductTable.HeaderCell className="hidden md:table-cell">
                                                Composants
                                            </ProductTable.HeaderCell>
                                            <ProductTable.HeaderCell>Stock</ProductTable.HeaderCell>
                                            <ProductTable.HeaderCell className="hidden sm:table-cell">
                                                Statut
                                            </ProductTable.HeaderCell>
                                            <ProductTable.HeaderCell>Actions</ProductTable.HeaderCell>
                                        </ProductTable.HeaderRow>
                                    </ProductTable.Header>
                                    <ProductTable.Body>
                                        {filteredPanyenProducts.map((panyen) => {
                                            const availability = panyenAvailability[panyen.id];
                                            const calculatedStock = availability?.stock ?? 0;
                                            const blockingProducts = availability?.blockingProducts ?? [];
                                            const hasMoreBlocking = blockingProducts.length > 2;
                                            const blockingSummary = blockingProducts.slice(0, 3).join(', ');
                                            const isAutoHidden = !!availability && !availability.isAvailable;
                                            const toggleDisabled = isLoadingGlobalStock || isUpdatingPanyen;
                                            const plainDescription = htmlToPlainText(panyen.description || '');
                                            let badgeReason: string | undefined;
                                            if (isAutoHidden) {
                                                badgeReason = blockingProducts.length > 0
                                                    ? 'Stock indisponible: ' + blockingSummary + (hasMoreBlocking ? '...' : '')
                                                    : 'Stock indisponible';
                                            }

                                            return (
                                                <ProductTable.Row key={panyen.id}>
                                                    <ProductTable.Cell>
                                                        <div className="flex items-center space-x-3">
                                                            <div className="flex-shrink-0">
                                                                <AppImage
                                                                    source={panyen.imageUrl}
                                                                    style={{ width: 50, height: 50, borderRadius: 8 }}
                                                                    alt={panyen.name}
                                                                />
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <div className="font-medium text-gray-900 truncate">
                                                                    {panyen.name}
                                                                </div>
                                                                <div className="text-sm text-gray-500 font-semibold">
                                                                    {panyen.price}€
                                                                </div>
                                                                {plainDescription && (
                                                                    <div className="text-sm text-gray-500 truncate md:hidden">
                                                                        {plainDescription.substring(0, 50)}
                                                                        {plainDescription.length > 50 ? '...' : ''}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </ProductTable.Cell>

                                                    <ProductTable.Cell className="hidden md:table-cell">
                                                        <div className="space-y-1 max-w-xs">
                                                            {panyen.components.slice(0, 3).map((component) => (
                                                                <div
                                                                    key={component.id}
                                                                    className="text-sm"
                                                                >
                                                                    <span className="font-medium text-primary">
                                                                        {component.quantity}x
                                                                    </span>{' '}
                                                                    <span className="text-gray-700">
                                                                        {component.product.name}
                                                                    </span>
                                                                    <span className="text-gray-500 text-xs block">
                                                                        {component.productVariant.optionSet}:{' '}
                                                                        {component.productVariant.optionValue}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                            {panyen.components.length > 3 && (
                                                                <div className="text-xs text-gray-500">
                                                                    +{panyen.components.length - 3} autres...
                                                                </div>
                                                            )}
                                                        </div>
                                                    </ProductTable.Cell>

                                                    <ProductTable.Cell>
                                                        <div className="flex items-center space-x-2">
                                                            <div
                                                                className={`font-bold text-lg ${
                                                                    calculatedStock > 10
                                                                        ? 'text-green-600'
                                                                        : calculatedStock > 0
                                                                          ? 'text-yellow-600'
                                                                          : 'text-red-600'
                                                                }`}
                                                            >
                                                                {calculatedStock}
                                                            </div>
                                                            <div className="text-xs text-gray-500">unités</div>
                                                        </div>
                                                    </ProductTable.Cell>

                                                    <ProductTable.Cell className="hidden sm:table-cell">
                                                        <PanyenShowInStoreBadge panyen={panyen} forcedHidden={isAutoHidden} disabled={toggleDisabled} reason={badgeReason} />
                                                    </ProductTable.Cell>

                                                    <ProductTable.Cell>
                                                        <div className="flex flex-col sm:flex-row gap-2">
                                                            <Button
                                                                onClick={() => handleEditPanyen(panyen)}
                                                                variant="primary"
                                                                size="sm"
                                                            >
                                                                Modifier
                                                            </Button>
                                                            <Button
                                                                onClick={() => handleDeletePanyen(panyen.id)}
                                                                variant="danger"
                                                                size="sm"
                                                            >
                                                                Supprimer
                                                            </Button>
                                                        </div>
                                                    </ProductTable.Cell>
                                                </ProductTable.Row>
                                            );
                                        })}
                                    </ProductTable.Body>
                                </ProductTable>
                            </div>
                        </div>
                    </>
                )}

                {/* Modal */}
                <PanyenModal
                    isOpen={modalOpen}
                    onClose={() => {
                        setModalOpen(false);
                        setEditingPanyen(undefined);
                    }}
                    panyen={editingPanyen}
                    onSave={handleSavePanyen}
                />
            </div>
        </div>
    );
}

function PanyenManagementPage() {
    return <PanyenManagementPageContent />;
}

export default PanyenManagementPage;
