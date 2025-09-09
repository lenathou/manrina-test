/* eslint-disable react/no-unescaped-entities */
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { prisma } from '@/server/prisma';
import { IAdminTokenPayload } from '@/server/admin/IAdmin';
import { Product } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';
import { backendFetchService } from '@/service/BackendFetchService';
import { IProductPriceInfo, IVariantPriceInfo, IGrowerPriceInfo } from '@/server/grower/GrowerPricingService';
import EditGrowerPriceModal from '@/components/modals/EditGrowerPriceModal';
import LoadingSpinner from '@/components/admin/stock/prix-producteur/LoadingSpinner';
import ErrorDisplay from '@/components/admin/stock/prix-producteur/ErrorDisplay';
import PageHeader from '@/components/admin/stock/prix-producteur/PageHeader';
import VariantCard from '@/components/admin/stock/prix-producteur/VariantCard';
import GrowerPriceCard from '@/components/admin/stock/prix-producteur/GrowerPriceCard';
import { Text } from '@/components/ui/Text';

interface ProductGrowerPricesPageProps {
    authenticatedAdmin: IAdminTokenPayload;
    product: Product;
}

function ProductGrowerPricesPage({ product }: ProductGrowerPricesPageProps) {
    const router = useRouter();
    const { productId } = router.query;
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedVariant, setSelectedVariant] = useState<IVariantPriceInfo | null>(null);
    const [selectedGrowerPrice, setSelectedGrowerPrice] = useState<{
        growerId: string;
        variantId: string;
        price: number;
        growerName: string;
        variantName: string;
    } | null>(null);

    // Query pour récupérer les informations du produit avec les prix
    const { data: productPriceInfo, isLoading, error } = useQuery<IProductPriceInfo>({
        queryKey: ['product-price-info', productId],
        queryFn: () => backendFetchService.getProductPriceInfo(productId as string),
        enabled: !!productId
    });

    if (isLoading) {
        return <LoadingSpinner message="Chargement des prix..." />;
    }

    if (error || !productPriceInfo) {
        return (
            <ErrorDisplay 
                error={error || new Error('Impossible de charger les informations de prix.')}
            />
        );
    }

    return (
        <div className="min-h-screen ">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <PageHeader 
                    productPriceInfo={productPriceInfo}
                    selectedVariant={selectedVariant}
                />

                {/* Contenu principal */}
                <div className="bg-white rounded-lg border border-gray-200">
                    <div className="p-6">
                        {productPriceInfo.variants.length === 0 ? (
                            <div className="text-center py-12">
                                <Text variant="body" className="text-gray-500">
                                    Aucun variant trouvé pour ce produit.
                                </Text>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {productPriceInfo.variants.map((variant: IVariantPriceInfo) => (
                                    <VariantCard 
                                        key={variant.variantId}
                                        variant={variant}
                                        isSelected={selectedVariant?.variantId === variant.variantId}
                                        onSelect={() => setSelectedVariant(variant)}
                                    >
                                        {variant.growerPrices.length === 0 ? (
                                            <div className="text-center py-8 bg-gray-50 rounded-lg">
                                                <Text variant="body" className="text-gray-500">
                                                    Aucun producteur n'a défini de prix pour ce variant.
                                                </Text>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {variant.growerPrices.map((growerPrice: IGrowerPriceInfo) => (
                                                    <GrowerPriceCard 
                                                        key={growerPrice.growerId}
                                                        growerPrice={growerPrice}
                                                        onEdit={() => {
                                                            setSelectedGrowerPrice({
                                                                growerId: growerPrice.growerId,
                                                                variantId: variant.variantId,
                                                                price: growerPrice.price,
                                                                growerName: growerPrice.growerName,
                                                                variantName: variant.variantOptionValue || 'Variant par défaut'
                                                            });
                                                            setEditModalOpen(true);
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </VariantCard>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal d'édition du prix */}
            {selectedGrowerPrice && (
                <EditGrowerPriceModal
                    isOpen={editModalOpen}
                    onClose={() => {
                        setEditModalOpen(false);
                        setSelectedGrowerPrice(null);
                    }}
                    growerId={selectedGrowerPrice.growerId}
                    variantId={selectedGrowerPrice.variantId}
                    productId={product.id}
                    currentPrice={selectedGrowerPrice.price}
                    variantName={selectedGrowerPrice.variantName}
                    productName={product.name}
                    growerName={selectedGrowerPrice.growerName}
                />
            )}
        </div>
    );
}

export default ProductGrowerPricesPage;

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