import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAppContext } from '../../context/AppContext';
import { IProduct } from '../../server/product/IProduct';
import { BasketValidationResult } from '../../server/product/ProductUseCases';
import { numberFormat } from '../../service/NumberFormat';
import { colorUsages, common, variables } from '../../theme';
import { BasketElement } from '../../types/BasketElement';
import { AppImage } from '../Image';
import { Minus } from '../icons/Minus';
import { Plus } from '../icons/Plus';
import { productItemStyles } from './ProductItem';
import { VariantElement } from '../admin/stock/VariantSelector';

interface BasketItemProps {
    element: BasketElement;
    decrementProductQuantity: (productId: string, variantId: string) => void;
    addProductToBasket: (product: IProduct, quantity: number, variantId: string, setQuantity?: boolean) => void;
    canUpdate?: boolean;
    validationResult?: BasketValidationResult;
}

export const BasketItem = ({
    element,
    decrementProductQuantity,
    addProductToBasket,
    canUpdate,
    validationResult,
}: BasketItemProps) => {
    const { removeProductFromBasket, updateProductQuantity } = useAppContext();
    const itemPrice = numberFormat.toPrice(element.quantity * element.price);

    const validationItem = validationResult?.unavailableItems.find(
        (item) => item.productId === element.product.id && item.variantId === element.productVariant.id,
    );

    const getValidationMessage = () => {
        if (!validationItem) return null;

        switch (validationItem.reason) {
            case 'OUT_OF_STOCK':
                return "Ce produit n'est plus en stock";
            case 'INSUFFICIENT_STOCK':
                return `Il ne reste que ${validationItem.availableStock} unité${validationItem.availableStock > 1 ? 's' : ''} en stock`;
            case 'PRODUCT_NOT_FOUND':
                return "Ce produit n'existe plus";
            default:
                return null;
        }
    };

    const getValidationAction = () => {
        if (!validationItem) return null;

        switch (validationItem.reason) {
            case 'INSUFFICIENT_STOCK':
                return (
                    <TouchableOpacity
                        style={productStyles.actionButton}
                        onPress={() => {
                            updateProductQuantity(
                                element.product.id,
                                element.productVariant.id,
                                validationItem.availableStock,
                                true,
                            );
                        }}
                    >
                        <Text style={productStyles.actionButtonText}>
                            Ajuster à {validationItem.availableStock} unité
                            {validationItem.availableStock > 1 ? 's' : ''}
                        </Text>
                    </TouchableOpacity>
                );
            case 'OUT_OF_STOCK':
            case 'PRODUCT_NOT_FOUND':
                return (
                    <TouchableOpacity
                        style={[productStyles.actionButton, productStyles.removeButton]}
                        onPress={() => {
                            removeProductFromBasket(element.product.id, element.productVariant.id);
                        }}
                    >
                        <Text style={[productStyles.actionButtonText, productStyles.removeButtonText]}>
                            Retirer du panier
                        </Text>
                    </TouchableOpacity>
                );
            default:
                return null;
        }
    };

    const validationMessage = getValidationMessage();
    const validationAction = getValidationAction();

    return (
        <View
            style={[productStyles.basketItemContainer, validationItem && productStyles.unavailableItem]}
            key={`${element.product.id}-${element.productVariant.id}`}
        >
            <AppImage
                source={element.product.imageUrl}
                style={{ ...productStyles.productImage, ...(validationItem && productStyles.unavailableImage) }}
                alt={element.name}
            />
            <View style={productStyles.productInfo}>
                <Text style={[productStyles.productTitle, validationItem && productStyles.unavailableText]}>
                    {element.name}
                </Text>
                <View style={{ gap: 8 }}>
                    <View
                        style={{
                            flexDirection: 'row',
                            gap: 8,
                            alignItems: 'center',
                        }}
                    >
                        <VariantElement
                            variant={element.productVariant}
                            selected
                        />
                        <Text style={[productStyles.productPrice, validationItem && productStyles.unavailableText]}>
                            {element.price} € l&apos;unité
                        </Text>
                    </View>
                    {validationMessage && (
                        <View style={productStyles.validationContainer}>
                            <Text style={productStyles.validationMessage}>{validationMessage}</Text>
                            {validationAction}
                        </View>
                    )}
                </View>
            </View>

            <View style={{ gap: 8, alignItems: 'flex-end' }}>
                <Text style={[productItemStyles.price, validationItem && productStyles.unavailableText]}>
                    {itemPrice}
                </Text>
                {canUpdate && !validationItem ? (
                    <UpdateQuantityButtons
                        increment={() => {
                            addProductToBasket(element.product, 1, element.productVariant.id);
                        }}
                        decrement={() => {
                            decrementProductQuantity(element.product.id, element.productVariant.id);
                        }}
                        quantity={element.quantity}
                    />
                ) : (
                    <Text style={[productStyles.quantityViewTextOnly, validationItem && productStyles.unavailableText]}>
                        x{element.quantity}
                    </Text>
                )}
            </View>
        </View>
    );
};

export const UpdateQuantityButtons = ({
    increment,
    decrement,
    quantity,
    disabled,
    centerEditing = false,
    onQuantityChange,
}: {
    increment: () => void;
    decrement: () => void;
    quantity: number;
    disabled?: boolean;
    centerEditing?: boolean;
    onQuantityChange?: (newQuantity: number) => void;
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [inputValue, setInputValue] = useState(quantity.toString());

    useEffect(() => {
        setInputValue(quantity.toString());
    }, [quantity]);

    const handleInputBlur = () => {
        setIsEditing(false);
        const numValue = parseInt(inputValue);
        if (!isNaN(numValue) && numValue >= 0 && onQuantityChange) {
            onQuantityChange(numValue);
        } else {
            setInputValue(quantity.toString());
        }
    };

    const handleInputChange = (newValue: string) => {
        setInputValue(newValue);
    };

    const handleCenterClick = () => {
        if (centerEditing && !disabled) {
            setIsEditing(true);
        }
    };

    return (
        <div className="flex items-center">
            <button
                onClick={decrement}
                disabled={disabled}
                className="bg-[#F48953] px-2 py-2 min-w-[20px] flex items-center justify-center rounded-tl-lg disabled:opacity-50 hover:bg-[#e67a4a] transition-colors"
            >
                <Minus
                    height={20}
                    width={20}
                    className="max-w-5 max-h-5"
                />
            </button>

            {isEditing ? (
                <input
                    className="w-12 h-8 text-center px-2 text-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#F48953]"
                    value={inputValue}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onBlur={handleInputBlur}
                    type="number"
                    autoFocus
                    disabled={disabled}
                />
            ) : (
                <button
                    onClick={handleCenterClick}
                    disabled={disabled || !centerEditing}
                    className={`px-3 py-2 text-sm font-semibold min-w-[48px] ${
                        centerEditing ? 'hover:bg-gray-100 cursor-pointer border border-gray-200' : 'cursor-default'
                    } disabled:opacity-50`}
                >
                    {quantity}
                </button>
            )}

            <button
                onClick={increment}
                disabled={disabled}
                className="bg-[#F48953] px-2 py-2 min-w-[20px] flex items-center justify-center rounded-br-lg disabled:opacity-50 hover:bg-[#e67a4a] transition-colors"
            >
                <Plus
                    height={20}
                    width={20}
                    className="max-w-5 max-h-5"
                />
            </button>
        </div>
    );
};

export const unitPriceStyle = {
    ...common.text.h5Infos,
    lineHeight: 12,
};
const productStyles = StyleSheet.create({
    basketItemContainer: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: colorUsages.borderColor,
        paddingVertical: variables.spaceXL,
        gap: variables.space,
    },
    productImage: {
        width: 70,
        height: 70,
        borderRadius: 5,
    },
    productInfo: {
        flex: 2,
    },
    productTitle: {
        ...common.text.h2Title,
    },
    productPrice: unitPriceStyle,
    quantityControl: {
        flexDirection: 'row',
        alignItems: 'center',
        // borderTopLeftRadius: 10,
        // borderBottomRightRadius: 10,
    },
    quantityButton: {
        backgroundColor: '#F48953',
        paddingVertical: 10,
        paddingHorizontal: 5,
        minWidth: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    quantityButtonLeft: {
        borderTopLeftRadius: 10,
    },
    quantityButtonRight: {
        borderBottomRightRadius: 10,
    },
    quantityButtonText: {
        fontSize: 20,
        fontWeight: 'bold',
        lineHeight: 20,
        color: colorUsages.white,
    },
    quantityText: {
        marginHorizontal: 8,
        fontSize: 16,
        // color: colorUsages.white,
        fontWeight: '600',
    },
    productTotal: {
        flex: 1,
        textAlign: 'center',
        fontSize: 14,
    },
    deleteIcon: {
        fontSize: 18,
        color: '#888',
    },
    quantityViewTextOnly: {
        ...common.text.h2Title,
        fontSize: 20,
        color: colorUsages.lightInfo,
    },
    unavailableItem: {
        opacity: 0.7,
        backgroundColor: '#fff3f3',
        borderColor: '#ffcdd2',
    },
    unavailableImage: {
        opacity: 0.5,
    },
    unavailableText: {
        color: '#d32f2f',
    },
    validationMessage: {
        color: '#d32f2f',
        fontSize: 14,
        fontStyle: 'italic',
    },
    validationContainer: {
        alignItems: 'flex-start',
    },
    actionButton: {
        backgroundColor: colorUsages.primary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 4,
        marginTop: 4,
    },
    actionButtonText: {
        color: colorUsages.white,
        fontSize: 14,
        fontWeight: '500',
    },
    removeButton: {
        backgroundColor: '#ffebee',
        borderWidth: 1,
        borderColor: '#d32f2f',
    },
    removeButtonText: {
        color: '#d32f2f',
    },
});
