import { useRouter } from 'next/router';
import { useMemo, useRef } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { Picker } from 'react-native-web';
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

const ProductsPageContainer = () => {
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
            <PageContainer>
                <View style={styles.container}>
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
                    maxItemsPerRow={4}
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
        height: '100svh',
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
const CategoryPicker = ({
    filterByCategory,
    category,
    categories,
}: {
    filterByCategory: (category: string) => void;
    category: string;
    categories: string[];
}) => {
    return (
        <View style={styles.categoriesPicker}>
            <View>
                <Text style={{ fontFamily: 'Open', marginBottom: 10 }}>Catégories</Text>
                <Picker
                    onValueChange={(category) => {
                        filterByCategory(category as string);
                    }}
                    style={styles.picker}
                    selectedValue={category || ''}
                >
                    {/* @ts-expect-error picker does not exist in react native */}
                    <Picker.Item
                        label="Tout"
                        value=""
                    />
                    {categories.map((cat, index) => (
                        // @ts-expect-error picker does not exist in react native
                        <Picker.Item
                            key={index}
                            label={cat}
                            value={cat}
                        />
                    ))}
                </Picker>
            </View>
        </View>
    );
};
