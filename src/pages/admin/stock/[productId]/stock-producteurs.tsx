/* eslint-disable react/no-unescaped-entities */
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { prisma } from '@/server/database/prisma';
import { IAdminTokenPayload } from '@/server/admin/IAdmin';
import { Product } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';
import { backendFetchService } from '@/service/BackendFetchService';
import { IGrowerProductStockInfo } from '@/server/grower/ProductStockService';
import EditGrowerProductStockModal from '@/components/modals/EditGrowerProductStockModal';
import AdjustGlobalStockModal from '@/components/modals/AdjustGlobalStockModal';
import PageHeader from '@/components/admin/stock/stock-producteur/PageHeader';
import GrowerProductStockCard from '@/components/admin/stock/stock-producteur/GrowerProductStockCard';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';

interface ProductGrowerStockPageProps {
    authenticatedAdmin: IAdminTokenPayload;
    product: Product;
}

function ProductGrowerStockPage({ product }: ProductGrowerStockPageProps) {
    const router = useRouter();
    const { productId } = router.query;
    const productIdString = Array.isArray(productId) ? productId[0] : productId || '';
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [adjustGlobalStockModalOpen, setAdjustGlobalStockModalOpen] = useState(false);
    const [selectedGrowerStock, setSelectedGrowerStock] = useState<{
        growerId: string;
        stock: number;
        growerName: string;
        productBaseUnitSymbol?: string | null;
    } | null>(null);

    // Query pour récupérer les stocks des producteurs pour ce produit
    const { data: growerStocks, isLoading, error } = useQuery<IGrowerProductStockInfo[], Error>({
        queryKey: ['grower-product-stocks', productIdString],
        queryFn: () => backendFetchService.getGrowerStocksForProduct(productIdString),
        enabled: !!productIdString
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <Text variant="body" className="text-gray-600">Chargement des stocks...</Text>
                </div>
            </div>
        );
    }

    if (error || !growerStocks) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="max-w-md w-full mx-4">
                    <CardContent className="p-6 text-center">
                        <div className="text-red-500 mb-4">
                            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <Text variant="h3" className="text-gray-900 mb-2">Erreur de chargement</Text>
                        <Text variant="body" className="text-gray-600 mb-4">
                            {error?.message || 'Impossible de charger les informations de stock.'}
                        </Text>
                        <Button onClick={() => window.location.reload()} variant="outline">
                            Réessayer
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <PageHeader 
                product={product}
                onAdjustGlobalStock={() => setAdjustGlobalStockModalOpen(true)}
            />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {!growerStocks || growerStocks.length === 0 ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="text-lg">Aucun producteur trouvé pour ce produit</div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {growerStocks.map((growerStock) => (
                            <GrowerProductStockCard
                                key={growerStock.growerId}
                                growerStock={growerStock}
                                productBaseUnitSymbol={product.baseUnitId ? 'kg' : undefined}
                                onEdit={() => {
                                    setSelectedGrowerStock({
                                        growerId: growerStock.growerId,
                                        stock: growerStock.stock,
                                        growerName: growerStock.growerName,
                                        productBaseUnitSymbol: product.baseUnitId ? 'kg' : undefined
                                    });
                                    setEditModalOpen(true);
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Modal de modification du stock */}
            {selectedGrowerStock && (
                <EditGrowerProductStockModal
                    isOpen={editModalOpen}
                    onClose={() => {
                        setEditModalOpen(false);
                        setSelectedGrowerStock(null);
                    }}
                    growerId={selectedGrowerStock.growerId}
                    productId={productIdString}
                    currentStock={selectedGrowerStock.stock}
                    productName={product.name}
                    growerName={selectedGrowerStock.growerName}
                    productBaseUnitSymbol={selectedGrowerStock.productBaseUnitSymbol}
                />
            )}

            {/* Modal d'ajustement du stock global */}
            <AdjustGlobalStockModal
                isOpen={adjustGlobalStockModalOpen}
                onClose={() => setAdjustGlobalStockModalOpen(false)}
                productId={productIdString}
                productName={product.name}
                productBaseUnitSymbol={product.baseUnitId ? 'kg' : undefined}
            />
        </div>
    );
}

export default ProductGrowerStockPage;

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { productId } = context.params!;

    try {
        // Vérifier que le produit existe
        const product = await prisma.product.findUnique({
            where: { id: productId as string },
            include: {
                variants: true,
            },
        });

        if (!product) {
            return {
                notFound: true,
            };
        }

        return {
            props: {
                product: JSON.parse(JSON.stringify(product)),
            },
        };
    } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        return {
            notFound: true,
        };
    }
};