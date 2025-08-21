import { useRouter } from 'next/router';
import React, { useMemo, useRef } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useAppContext } from '../../context/AppContext';
import { useFilteredProducts } from '../../hooks/useFilteredProducts';
import { useUrlSearch } from '../../hooks/useUrlSearch';
import { ROUTES } from '../../router/routes';
import { IProduct } from '../../server/product/IProduct';
import { colorUsages, variables } from '../../theme';
import { cleanRouterQuery } from '../CleanRouterQuery';
import { HeaderTitle } from '../Header/Header';
import { BackButton } from './BackButton';
import { CategorySelector, FlatListWithAutoColumns } from './CategorySelector';
import { ManrinaMarketLink } from './ManrinaMarketLink';
import { PageContainer } from './PageContainer';
import { Pagination } from './Pagination';
import { PRODUCT_WIDTH, ProductItem } from './ProductItem';
import { SearchBar } from './SearchBar';

const ALL_PRODUCTS_CATEGORY = 'Tous les produits';
const ITEMS_PER_PAGE = 20;

export const ProductsPage = () => {
    const { isLoading } = useAppContext();
    if (isLoading) {
        return (
            <PageContainer>
                <View style={{ padding: variables.spaceXL }}>
                    <ActivityIndicator
                        animating={true}
                        color={colorUsages.primary}
                        size={40}
                    />
                </View>
            </PageContainer>
        );
    }
    return <ProductsPageContainer />;
};

export const ProductsPageContainer = ({ customRightSection }: { customRightSection?: React.ReactNode } = {}) => {
    const { products, getProductsByCategory } = useAppContext();
    const router = useRouter();
    const { search, setSearch, updatePage } = useUrlSearch();

    // 'search' is the current search query from the URL
    const currentSearch = search;

    const allCategories = useMemo(() => {
        const allProductsByCategories = groupBy(products, (product) => product.category || '');
        return [ALL_PRODUCTS_CATEGORY, ...Object.keys(allProductsByCategories).sort((a, b) => a.localeCompare(b))];
    }, [products]);

    const filterByCategory = (category: string) => {
        router.push(
            {
                pathname: '/',
                query: cleanRouterQuery({
                    ...router.query,
                    category: category,
                    page: 0,
                }),
            },
            undefined,
            { shallow: true },
        );
    };

    const categoryFromRouter = router.query.category as string;
    const productsToShow =
        // If there is a category in the URL and it is not the default category, get the products by category
        categoryFromRouter && categoryFromRouter !== ALL_PRODUCTS_CATEGORY
            ? getProductsByCategory(categoryFromRouter)
            : products;

    // Use the new hook to get the filtered list of products
    const filteredProducts = useFilteredProducts(productsToShow, currentSearch);

    if (!categoryFromRouter) {
        return (
            <PageContainer header={customRightSection ? { RightSection: customRightSection } : undefined}>
                <View style={styles.container}>
                    <div className="px-4 py-6">
                        <ManrinaMarketLink />
                    </div>
                    <CategorySelector
                        allCategories={allCategories}
                        onSelect={filterByCategory}
                    />
                </View>
            </PageContainer>
        );
    }
    return (
        <PageContainer
            header={{
                LeftSection: <BackButton href={ROUTES.PRODUITS} />,
                CentralSection: <HeaderTitle>{categoryFromRouter}</HeaderTitle>,
                RightSection: customRightSection,
            }}
        >
            <View
                style={{
                    paddingHorizontal: variables.spaceXL,
                    paddingBottom: variables.spaceBig,
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
        </PageContainer>
    );
};

export const ProductsPageContainerWithoutHeader = () => {
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

export const styles = StyleSheet.create({
    body: {
        margin: 0,
        padding: 0,
        height: '100%',
        backgroundColor: colorUsages.background,
    },
    container: {
        // maxWidth: 1200,
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
