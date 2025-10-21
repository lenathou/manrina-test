import { useRouter } from 'next/router';
import { PropsWithChildren, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppButton } from '@/components/button';
import { Header } from '@/components/Header/Header';
import { AppImage } from '@/components/Image';
import { BackButton } from '@/components/products/BackButton';
import { unitPriceStyle, UpdateQuantityButtons } from '@/components/products/BasketItem';
import { VariantSelector } from '@/components/admin/stock/VariantSelector';
import { useAppContext } from '@/context/AppContext';
import { useRestrictedAction } from '@/hooks/useRestrictedAction';
import { getFirstVariantWithStock, IProduct, IProductVariant } from '@/server/product/IProduct';
import { numberFormat } from '@/service/NumberFormat';
import { colorUsages, common, variables } from '@/theme';

const ProduitDetails = () => {
    const router = useRouter();
    const { productId } = router.query;
    const { products } = useAppContext();
    const [product, setProduct] = useState<IProduct>();

    useEffect(() => {
        if (productId === undefined || !products.length) {
            return;
        }
        const foundProduct = products.find((p) => p.id === productId);
        if (foundProduct) {
            setProduct(foundProduct);
        }
    }, [productId, products]);

    if (!product) {
        return (
            <ProductPageContainer>
                <View style={styles.productDetailsContainer}>
                    <View style={styles.detailsWrapper}>
                        <Text>Produit introuvable</Text>
                    </View>
                </View>
            </ProductPageContainer>
        );
    }

    return <ProduitDetailsContent product={product} />;
};

const ProductPageContainer = ({ children }: PropsWithChildren) => {
    return (
        <View style={{ minHeight: '100svh' }}>
            <Header
                backgroundStyle={{
                    backgroundColor: 'transparent',
                }}
                LeftSection={<BackButton color={colorUsages.black} />}
            />
            {children}
        </View>
    );
};

const ProduitDetailsContent = ({ product }: { product: IProduct }) => {
    const { addProductToBasket } = useAppContext();
    const { executeWithRestriction } = useRestrictedAction();
    const [quantity, _setQuantity] = useState(1);
    const [selectedVariantId, setSelectedVariantId] = useState(getFirstVariantWithStock(product.variants)?.id);
    const selectedVariant = product.variants.find((v) => v.id === selectedVariantId);

    const setQuantity = (newQuantity: number) => {
        _setQuantity(Math.max(1, newQuantity));
    };

    // Fonctions avec restriction pour les ajustements de quantité
    const handleIncrementQuantity = () => {
        executeWithRestriction(() => setQuantity(quantity + 1));
    };

    const handleDecrementQuantity = () => {
        executeWithRestriction(() => setQuantity(quantity - 1));
    };

    // Fonction avec restriction pour l'ajout au panier
    const handleAddToBasket = () => {
        if (!selectedVariant) return;
        executeWithRestriction(() => addProductToBasket(product, quantity, selectedVariant.id));
    };

    if (!selectedVariant) {
        return <Text>Aucune variante disponible pour ce produit</Text>;
    }

    const totalPrice = numberFormat.toPrice(quantity * selectedVariant.price);

    return (
        <ProductPageContainer>
            <View style={styles.imageWrapper}>
                <AppImage
                    source={product.imageUrl}
                    style={styles.image}
                    alt={product.name}
                />
            </View>
            <View style={styles.productDetailsContainer}>
                <View style={styles.detailsWrapper}>
                    <Text style={styles.title}>{product.name}</Text>
                    <VariantSelector
                        product={product}
                        selectedVariantId={selectedVariantId}
                        setSelectedVariantId={setSelectedVariantId}
                    />

                    <View
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                        }}
                    >
                        <Text
                            style={{
                                ...unitPriceStyle,
                                fontSize: 16,
                                lineHeight: 20,
                            }}
                        >
                            {/* eslint-disable-next-line react/no-unescaped-entities */}
                            {selectedVariant.price} € l'unité
                        </Text>
                        {/* <Text style={productItemStyles.price}>
                            {totalPrice}
                        </Text> */}
                        <UpdateQuantityButtons
                            increment={handleIncrementQuantity}
                            decrement={handleDecrementQuantity}
                            quantity={quantity}
                        />
                    </View>

                    <AppButton
                        label={`Ajouter au panier (${totalPrice})`}
                        action={handleAddToBasket}
                    />
                    <View style={{ marginTop: variables.spaceBig }}>
                        <Text
                            style={{
                                ...common.text.h2Title,
                                marginBottom: variables.spaceBig,
                            }}
                        >
                            Description :
                        </Text>
                        <ProductDescription productVariant={selectedVariant} />
                    </View>
                </View>
            </View>
        </ProductPageContainer>
    );
};

const replaceDoubleLineBreaksWithOneSpaceOnly = (text: string) => {
    return text.replace(/\n\n/g, '\n');
};

export const ProductDescription = ({ productVariant }: { productVariant: Pick<IProductVariant, 'description'> }) => {
    return (
        <Text style={{ fontSize: 14, lineHeight: 1 }}>
            <span
                style={{ fontSize: 14, lineHeight: 1 }}
                dangerouslySetInnerHTML={{
                    __html: replaceDoubleLineBreaksWithOneSpaceOnly(productVariant.description || '-'),
                }}
            ></span>
        </Text>
    );
};



const styles = StyleSheet.create({
    productDetailsContainer: {
        display: 'flex',
        paddingVertical: variables.spaceXXL,
        paddingHorizontal: variables.spaceXL,
        backgroundColor: colorUsages.background,
        borderTopRightRadius: variables.radiusBig,
        borderTopLeftRadius: variables.radiusBig,
        marginTop: variables.spaceXL,
        flex: 1,
    },
    imageWrapper: {
        marginHorizontal: 'auto',
    },
    detailsWrapper: {
        marginHorizontal: 'auto',
        maxWidth: 600,
        gap: variables.space,
        width: '100%',
    },
    image: {
        width: 250,
        height: 250,
        margin: 'auto',
        resizeMode: 'cover',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    price: {
        fontSize: 24,
        color: '#000',
        marginVertical: 10,
    },
    optionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 10,
    },
    quantityContainer: {
        flex: 1,
        alignItems: 'center',
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    button: {
        padding: 10,
        backgroundColor: '#e0e0e0',
    },
    quantity: {
        width: 10,
        marginHorizontal: 20,
        fontSize: 16,
    },
    addToCartButton: {
        borderWidth: 1,
        borderColor: '#004c3f',
        paddingVertical: 15,
        alignItems: 'center',
    },
    addToCartButtonText: {
        color: '#004c3f',
        fontSize: 18,
    },
    breadCrumbsLink: {
        fontSize: 14,
        fontWeight: 'bold',
    },
});

export default ProduitDetails;
