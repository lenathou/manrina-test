/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { useGrowerStockPageData } from '@/hooks/useGrowerStockPageData';
import { ProductItem, PRODUCT_WIDTH } from '@/components/products/ProductItem';
import { FlatListWithAutoColumns } from '@/components/products/CategorySelector';
import { variables } from '@/theme';
import { IGrower } from '@/server/grower/IGrower';

interface GrowerProductsViewProps {
    grower: IGrower;
    onBack: () => void;
}

export function GrowerProductsView({ 
    grower, 
    onBack
}: GrowerProductsViewProps) {
    const { growerProducts, isLoading } = useGrowerStockPageData(grower.id);
    
    // Détection mobile pour limiter à 1 colonne
    const { width } = useWindowDimensions();
    const isMobile = width <= 768; // Breakpoint mobile
    const maxItemsPerRow = isMobile ? 1 : 4;

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <View style={styles.spinner}></View>
                <Text style={styles.loadingText}>
                    Chargement des produits...
                </Text>
            </View>
        );
    }

    // Convertir les produits du producteur en format compatible avec ProductItem
    const products = growerProducts.map(growerProduct => ({
        id: growerProduct.id,
        name: growerProduct.name,
        imageUrl: growerProduct.imageUrl,
        category: null, // Les produits de producteur n'ont pas de catégorie directe
        showInStore: true,
        description: null,
        globalStock: growerProduct.totalStock,
        baseQuantity: 1,
        baseUnitId: growerProduct.baseUnitId,
        variants: growerProduct.variants.map(variant => ({
            id: variant.variantId,
            optionSet: '',
            optionValue: variant.variantOptionValue || '',
            productId: growerProduct.id,
            description: null,
            imageUrl: null,
            quantity: variant.quantity || null,
            unitId: variant.unitId || null,
            price: variant.price || 0,
            stock: variant.stock || 0
        }))
    }));

    return (
        <View style={styles.container}>
            {/* En-tête avec bouton retour */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={onBack}
                    >
                        <Text style={styles.backButtonText}>← Retour</Text>
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.title}>
                            Produits de {grower.name}
                        </Text>
                        <Text style={styles.subtitle}>
                            {products.length} produit{products.length > 1 ? 's' : ''} disponible{products.length > 1 ? 's' : ''}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Liste des produits */}
            {products.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                        Ce producteur n'a pas encore de produits disponibles.
                    </Text>
                </View>
            ) : (
                <FlatListWithAutoColumns
                    data={products}
                    renderItem={({ item, width }) => (
                        <View style={{ width }} key={item.id}>
                            <ProductItem
                                product={item}
                                width={width}
                            />
                        </View>
                    )}
                    keyExtractor={(item) => item.id}
                    itemWidth={PRODUCT_WIDTH}
                    maxItemsPerRow={maxItemsPerRow}
                    horizontalGap={variables.space}
                    verticalGap={variables.spaceXL}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: variables.spaceBig,
        gap: variables.spaceBig,
    },
    loadingContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: variables.spaceXL,
    },
    spinner: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#3b82f6',
        borderTopColor: 'transparent',
    },
    loadingText: {
        marginLeft: variables.space,
        color: '#6b7280',
        fontSize: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: variables.space,
    },
    backButton: {
        paddingHorizontal: variables.space,
        paddingVertical: variables.space / 2,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 8,
        backgroundColor: '#ffffff',
    },
    backButtonText: {
        color: '#111827',
        fontSize: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
    },
    subtitle: {
        fontSize: 16,
        color: '#6b7280',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: variables.spaceXL * 2,
    },
    emptyText: {
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
    },
});