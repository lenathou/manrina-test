import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAppContext } from '../../context/AppContext';
import { ROUTES } from '../../router/routes';
import { getFirstVariantWithStock, IProduct } from '../../server/product/IProduct';
import { common, variables } from '../../theme';
import { AppImage } from '../Image';
import { Link } from '../Link';
import { Plus } from '../icons/Plus';
import { UpdateQuantityButtons } from './BasketItem';
import { VariantSelector } from '../admin/stock/VariantSelector';

export const PRODUCT_WIDTH = 140;
const ASPECT_RATIO = 1.6;
const MAX_VARIANTS_TO_DISPLAY = 3;

export const ProductItem = ({ product, width }: { product: IProduct; width: number }) => {
    // Get the first variant's price if available
    const { addProductToBasket, getProductQuantityInBasket, decrementProductQuantity } = useAppContext();
    const [variantIdSelected, setVariantId] = useState(getFirstVariantWithStock(product.variants)?.id);

    const productVariant = product.variants?.find((variant) => variant.id === variantIdSelected);
    if (!productVariant) {
        console.log('No variant found for product', product.name, product);
        return <Text>Produit manquant</Text>;
    }
    const price = productVariant?.price || 0;
    const quantityInBasket = getProductQuantityInBasket(product.id, productVariant.id);

    if (!product.variants) {
        console.log('No variants for product', product.name, product);
    }
    return (
        <View
            key={product.id}
            style={productItemStyles.container}
        >
            <Link
                href={ROUTES.ARTICLE(product.id)}
                key={product.name}
                style={{ height: Math.floor(width / ASPECT_RATIO) }}
            >
                <AppImage
                    source={product.imageUrl}
                    style={productItemStyles.image}
                    width={width}
                    height={Math.floor(width / ASPECT_RATIO)}
                    alt={product.name}
                    className="h-full w-full"
                />
            </Link>
            <View style={productItemStyles.infoContainer}>
                <View style={{ flex: 1, marginBottom: variables.spaceBig }}>
                    <Link
                        href={ROUTES.ARTICLE(product.id)}
                        key={product.name}
                    >
                        <Text style={productItemStyles.productName}>{product.name}</Text>
                    </Link>
                </View>

                <VariantSelector
                    product={product}
                    selectedVariantId={variantIdSelected}
                    setSelectedVariantId={setVariantId}
                    maxVariantsToDisplay={MAX_VARIANTS_TO_DISPLAY}
                />
                <View style={productItemStyles.priceWrapper}>
                    <Text style={productItemStyles.price}>{price}€</Text>
                </View>
                <View
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'flex-end',
                        alignItems: 'flex-end',
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                    }}
                >
                    {quantityInBasket > 0 ? (
                        <UpdateQuantityButtons
                            increment={() => addProductToBasket(product, 1, productVariant.id)}
                            decrement={() => decrementProductQuantity(product.id, productVariant.id)}
                            quantity={quantityInBasket}
                        />
                    ) : (
                        <TouchableOpacity
                            style={{
                                backgroundColor: '#F48953',
                                padding: 10,
                                borderTopLeftRadius: 10,
                                borderBottomRightRadius: 10,
                            }}
                            onPress={() => addProductToBasket(product, 1, productVariant.id)}
                        >
                            <Plus
                                height={20}
                                width={20}
                            />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
};

export const productItemStyles = StyleSheet.create({
    productList: {
        display: 'flex',
        flexWrap: 'wrap',
        flexDirection: 'row',
        margin: 'auto',
    },
    container: {
        backgroundColor: '#fff',
        // maxWidth: 240,
        flex: 1,
        // minHeight: 400,
        display: 'flex',
        flexWrap: 'wrap',
        borderRadius: 10,
        boxShadow: '0px 2px 4px rgba(130, 139, 139, 0.2)',
        overflow: 'hidden',
    },
    image: {
        // width: 240,
        // height: 240,
        objectFit: 'cover',
    },
    infoContainer: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 21,
    },
    productName: {
        // fontSize: 16,
        marginBottom: 5,
        ...common.text.h2Title,
    },
    priceWrapper: {
        marginTop: variables.space,
    },
    price: {
        ...common.text.h1HighlightInfo,
    },
});
