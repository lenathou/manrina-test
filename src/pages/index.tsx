import { useRouter } from 'next/router';
import React, { useMemo, useRef } from 'react';
import { FlatList, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { CategorySelector, FlatListWithAutoColumns } from '../components/products/CategorySelector';
import { ManrinaMarketLink } from '../components/products/ManrinaMarketLink';
import { Pagination } from '../components/products/Pagination';
import { PRODUCT_WIDTH, ProductItem } from '../components/products/ProductItem';
import { SearchBar } from '../components/products/SearchBar';
import { useAppContext } from '../context/AppContext';
import { useFilteredProducts } from '../hooks/useFilteredProducts';
import { useUrlSearch } from '../hooks/useUrlSearch';
import { IProduct } from '../server/product/IProduct';
import { colorUsages, variables } from '../theme';
import { cleanRouterQuery } from '../components/CleanRouterQuery';

const ALL_PRODUCTS_CATEGORY = 'Tous les produits';
const ITEMS_PER_PAGE = 20;

const ProductsPageContent = ({
    products,
    currentSearch,
    updatePage,
}: {
    products: IProduct[];
    currentSearch?: string;
    updatePage: (pageNumber: number) => void;
}) => {
    const router = useRouter();
    const currentPage = parseInt(router.query.page as string) || 1;
    const containerRef = useRef<FlatList>(null);

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;

    // this is to avoid showing products with no stock
    // might not be needed because already filtered in the backend...
    // but could occur when query refetch and products are differents
    const filteredProducts = products.filter((product) => product.variants.some((variant) => variant.stock > 0));
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

    const goToPage = (pageNumber: number) => {
        const newPage = Math.max(1, Math.min(pageNumber, totalPages));
        updatePage(newPage);
        //Go back to top // not sure this works with react native
        containerRef.current?.scrollToIndex({ index: 0, animated: true });
    };

    if (currentPage !== 1 && totalPages > 0 && currentPage > totalPages) {
        updatePage(1);
    }
    const isProductListEmpty = paginatedProducts.length === 0;

    // Détection mobile pour limiter à 2 colonnes
    const { width } = useWindowDimensions();
    const isMobile = width <= 768; // Breakpoint mobile
    const maxItemsPerRow = isMobile ? 2 : 4;

    return (
        <View style={styles.container}>
            <View style={{ alignItems: 'center', flex: 1 }}>
                {isProductListEmpty && currentSearch && (
                    <View
                        style={{
                            padding: variables.spaceXL,
                            flexDirection: 'row',
                        }}
                    >
                        <Text>Aucun produit trouvé pour </Text>
                        <Text style={{ fontWeight: 'bold' }}>{currentSearch}</Text>
                    </View>
                )}
                <FlatListWithAutoColumns
                    ref={containerRef}
                    data={paginatedProducts}
                    itemWidth={PRODUCT_WIDTH}
                    maxItemsPerRow={maxItemsPerRow}
                    horizontalGap={variables.space}
                    verticalGap={variables.spaceXL}
                    renderItem={({ item, width }) => (
                        <View
                            style={{ width }}
                            key={item.name}
                        >
                            <ProductItem
                                product={item}
                                width={width}
                            />
                        </View>
                    )}
                />
                <Pagination
                    totalPages={totalPages}
                    currentPage={currentPage}
                    goToPage={goToPage}
                />
            </View>
        </View>
    );
};

const groupBy = <T, K extends string>(array: T[], keyFn: (item: T) => K) => {
    return array.reduce(
        (acc, item) => {
            const key = keyFn(item);
            acc[key] = [...(acc[key] || []), item];
            return acc;
        },
        {} as Record<K, T[]>,
    );
};

const HomePage = () => {
    const { products } = useAppContext();
    const router = useRouter();
    const { search, setSearch, updatePage } = useUrlSearch();

    // 'search' is the current search query from the URL
    const currentSearch = search;

    const allCategories = useMemo(() => {
        const allProductsByCategories = groupBy(products, (product) => product.category || '');
        return [ALL_PRODUCTS_CATEGORY, ...Object.keys(allProductsByCategories).sort((a, b) => a.localeCompare(b))];
    }, [products]);

    const currentCategory = router.query.category as string;

    // Préparer les produits filtrés par catégorie (toujours appelé pour respecter les règles des hooks)
    const productsByCategory = currentCategory
        ? currentCategory === ALL_PRODUCTS_CATEGORY
            ? products
            : products.filter((product) => product.category === currentCategory)
        : [];

    const filteredProducts = useFilteredProducts(productsByCategory, currentSearch || '', { includeVariants: false });

    const handleCategoryChange = (category: string) => {
        // Create a clean query object with only string/number values
        const baseQuery: Record<string, string | number> = {};

        // Copy valid query parameters
        Object.entries(router.query).forEach(([key, value]) => {
            if (key !== 'page' && typeof value === 'string') {
                baseQuery[key] = value;
            }
        });

        // Set category (including "Tous les produits")
        baseQuery.category = category;

        const query = cleanRouterQuery(baseQuery);
        router.push({ pathname: router.pathname, query }, undefined, { shallow: true });
    };

    // Si aucune catégorie n'est sélectionnée, afficher seulement les catégories
    if (!currentCategory) {
        return (
            <View style={{ flex: 1, width: '100%' }}>
                <div className="px-4 py-6">
                    <ManrinaMarketLink />
                </div>
                <CategorySelector
                    allCategories={allCategories}
                    onSelect={handleCategoryChange}
                />
            </View>
        );
    }

    // Si une catégorie est sélectionnée, afficher les produits avec la barre de recherche
    return (
        <View style={{ flex: 1, width: '100%' }}>
            <View
                style={{
                    paddingHorizontal: variables.spaceXL,
                    paddingBottom: variables.spaceBig,
                    width: '100%',
                }}
            >
                <SearchBar
                    initialValue={currentSearch}
                    onSearch={setSearch}
                />
            </View>
            <ProductsPageContent
                products={filteredProducts}
                currentSearch={currentSearch}
                updatePage={updatePage}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    body: {
        margin: 0,
        padding: 0,
        height: '100%',
        backgroundColor: colorUsages.background,
    },
    container: {
        maxWidth: 1280,
        margin: 'auto',
        marginTop: 0,
        marginBottom: 0,
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        flex: 1,
        overflow: 'hidden',
    },
    listContainer: {
        flexWrap: 'wrap',
        flexDirection: 'row',
        padding: 10,
        maxWidth: 1280,
        margin: 'auto',
        alignItems: 'center',
        justifyContent: 'center',
    },
    productItem: {
        alignItems: 'center',
        height: 400,
        margin: 'auto',
    },
    picker: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
        padding: 10,
        fontSize: 16,
    },
    categoriesPicker: {
        display: 'flex',
        flexDirection: 'row',
        margin: 10,
        justifyContent: 'flex-end',
    },
});

export default HomePage;
