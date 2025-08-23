import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { ProductsToRetrieveSummary } from '@/components/admin/ProductsToRetrieveSummary';
import { useGetCommandsQuery } from '@/components/Commandes/useGetCommandsQuery';
import { ProductImage } from '@/components/ProductImage';
import { BasketWithCustomerToShow, getDeliveryTypeFromBasket } from '@/server/checkout/IBasket';
import { ProductEntity } from '@/server/product/ProductEntity';
import { backendFetchService } from '@/service/BackendFetchService';
import { colorUsages } from '@/theme';
import { convertUTCToLocaleString } from '@/utils/dateUtils';
import { ProductDescription } from '../article/[productId]';
 

const PAGE_RATIO = 297 / 210; // A4 // 210mm x 297mm // 1.414
const PAGE_WIDTH = 800;
const PAGE_HEIGHT = PAGE_WIDTH * PAGE_RATIO;
const DIMENSIONS = {
    PAGE_HEIGHT,
    PAGE_WIDTH,
    ITEM_HEIGHT: 64,
    ITEM_WIDTH: 350,
    ITEMS_PER_COLUMN: 12,
    ITEMS_GAP: 4,
};
const ITEMS_MAX_HEIGHT = (DIMENSIONS.ITEM_HEIGHT + DIMENSIONS.ITEMS_GAP) * DIMENSIONS.ITEMS_PER_COLUMN;

function CommandesImpression() {
    const { commandsQuery, CommandsQueryUpdater } = useGetCommandsQuery({ paid: true });

    const productsQuery = useQuery({
        queryKey: ['products'],
        queryFn: () => backendFetchService.getAllProducts(),
    });
    // Add state to track disabled commands
    const [disabledCommands, setDisabledCommands] = useState<Record<string, boolean>>({});

    if (commandsQuery.isLoading || productsQuery.isLoading) {
        return <div>Loading...</div>;
    }

    // Toggle command enabled/disabled status
    const toggleCommand = (orderId: string) => {
        setDisabledCommands((prev) => ({
            ...prev,
            [orderId]: !prev[orderId],
        }));
    };

    const stockItemsByProductId =
        productsQuery.data?.reduce(
            (acc, product) => {
                acc[product.id] = product;
                return acc;
            },
            {} as Record<string, (typeof productsQuery.data)[number]>,
        ) || {};
    const allCommands = commandsQuery.data || [];
    const allCommandsToPrint = allCommands.filter((command) => !disabledCommands[command.basket.orderIndex.toString()]);
    const disabledCommandsIds = Object.keys(disabledCommands);
    return (
        <div>
            <header
                style={{
                    background: 'black',
                    color: 'white',
                    padding: '16px',
                    fontSize: '1.5rem',
                }}
            >
                Impression des commandes
            </header>
            <style>
                {/* @page {
                    size: ${DIMENSIONS.PAGE_WIDTH}px ${DIMENSIONS.PAGE_HEIGHT}px;
                } */}
                {`@media print {
                    @page {
                        size: ${DIMENSIONS.PAGE_WIDTH}px ${DIMENSIONS.PAGE_HEIGHT}px !important;
                    }
                    /* Hide navigation elements */
                    nav, header, .navigation, .navbar, .print-hidden {
                        display: none !important;
                    }
                    /* Hide the PageContainer header */
                    [role="banner"] {
                        display: none !important;
                    }
                    /* Remove any padding/margin from the body */
                    body {
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                    /* Ensure content starts at the top of the page */
                    main {
                        padding-top: 0 !important;
                    }
                }`}
            </style>

            <div
                style={{
                    fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    backgroundColor: 'white',
                }}
            >
                <div
                    style={{ margin: 'auto' }}
                    className="print-hidden"
                >
                    <CommandsQueryUpdater />
                    {disabledCommandsIds.length ? (
                        <div style={{ padding: 20, backgroundColor: colorUsages.error, maxWidth: 500 }}>
                            Les commandes {disabledCommandsIds.join(', ')} sont désactivées et ne seront pas imprimées.
                        </div>
                    ) : null}
                </div>
                <div className="print-hidden">
                    <ProductsToRetrieveSummary
                        commands={allCommands}
                        stockItemsByProductId={stockItemsByProductId}
                        disabledCommands={disabledCommands}
                        toggleCommand={toggleCommand}
                    />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
                    {allCommandsToPrint?.map((wholeObject) => {
                        return (
                            <CommandeItem
                                key={wholeObject.basket.id}
                                data={wholeObject}
                                stockItemsByProductId={stockItemsByProductId}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

const TitleLabel = ({ text }: { text: string }) => {
    return <div style={{ fontWeight: 'bold', fontSize: '1.125rem' }}>{text}</div>;
};

export default CommandesImpression; 

const CommandeItem = ({
    data,
    stockItemsByProductId,
}: {
    data: BasketWithCustomerToShow;
    stockItemsByProductId: Record<string, ProductEntity>;
}) => {
    const { basket, order: orderFields } = data;
    const itemsWithDescription = basket.items.filter((item) => {
        if (!item.description) {
            return false;
        }
        const product = stockItemsByProductId?.[item.productId];
        const variant = product?.variants.find((v) => v.id === item.productVariantId);
        if (variant) {
            console.log('found variant', product.name, variant.showDescriptionOnPrintDelivery);
        }
        return variant?.showDescriptionOnPrintDelivery;
    });
    const itemsDescriptions = new Set(itemsWithDescription.map((item) => item.description));
    const itemsDescriptionsArray = Array.from(itemsDescriptions);
    if (itemsDescriptionsArray.length) {
        console.log('item', itemsDescriptionsArray);
    }
    return (
        <div
            key={basket.id}
            style={{ fontSize: '1rem', maxHeight: DIMENSIONS.PAGE_HEIGHT, maxWidth: DIMENSIONS.PAGE_WIDTH }}
        >
            <div style={{ pageBreakBefore: 'always' }}></div>
            <div style={{ display: 'flex', gap: 32 }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '1.875rem' }}>A_{basket.orderIndex}</span>
                    <span style={{ fontSize: '0.875rem' }}>{convertUTCToLocaleString(basket.createdAt)}</span>
                    <span style={{ fontWeight: 'bold', fontSize: '1.125rem' }}>Articles ({basket.items.length})</span>
                </div>
                <div>
                    <TitleLabel text="Paiement" />
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 4,
                            fontSize: '0.875rem',
                            marginBottom: 8,
                        }}
                    >
                        <span>{basket.paymentStatus}</span>
                    </div>

                    <TitleLabel text="Livraison" />
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 4,
                            fontSize: '0.875rem',
                        }}
                    >
                        <span>{basket.deliveryDay}</span>
                    </div>
                </div>
                <div style={{ flex: 1 }}>
                    <TitleLabel text="Coordonnées client" />
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 4,
                            fontSize: '0.875rem',
                        }}
                    >
                        <span>{orderFields['Customer name']}</span>
                        <span>{orderFields['Email']}</span>
                        <span>{orderFields['Customer phone number']}</span>
                    </div>
                </div>
                <div style={{ flex: 1 }}>
                    <TitleLabel text="Adresse de livraison" />
                    <div style={{ display: 'flex', flexDirection: 'column', fontSize: '0.875rem' }}>
                        <span>{getDeliveryTypeFromBasket(basket)}</span>
                        <span>{basket.address?.address}</span>
                        <span>{basket.address?.city}</span>
                        <span>{basket.address?.postalCode}</span>
                    </div>
                </div>
            </div>
            <div
                style={{
                    display: 'flex',
                    borderTop: '1px solid black',
                    borderBottom: '1px solid black',
                    marginTop: 8,
                    marginBottom: 8,
                }}
            >
                <span style={{ flex: 1, padding: '4px' }}>Sous-total: {orderFields['Subtotal']}€</span>
                <span style={{ flex: 1, padding: '4px' }}>Taxes: {orderFields['Taxes'] || 0}€</span>
                <span style={{ flex: 1, padding: '4px' }}>Livraison: {orderFields['Shipping'] || 0}€</span>
                {orderFields['Discount'] ? (
                    <span style={{ flex: 1, padding: '4px' }}>Remise: {orderFields['Discount'] || 0}€</span>
                ) : null}
                <span style={{ flex: 1, padding: '4px' }}>Total TTC: {orderFields['Total']}€</span>
            </div>
            <div>
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: DIMENSIONS.ITEMS_GAP,
                        maxHeight: ITEMS_MAX_HEIGHT,
                        gridAutoFlow: 'column',
                        gridTemplateRows: 'repeat(11, minmax(0, 1fr))',
                        position: 'relative',
                    }}
                >
                    {basket.items.map((item, index) => {
                        const product = stockItemsByProductId?.[item.productId];
                        return (
                            <div
                                key={index}
                                style={{
                                    display: 'flex',
                                    border: '1px solid black',
                                    borderRadius: '2px',
                                    gap: 4,
                                    overflow: 'hidden',
                                    height: DIMENSIONS.ITEM_HEIGHT,
                                }}
                            >
                                <ProductImage
                                    url={product?.imageUrl}
                                    alt={product?.name || ''}
                                />
                                <div
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        padding: '0 4px',
                                    }}
                                >
                                    <div style={{ display: 'flex' }}>
                                        <div>{item.name}</div>
                                    </div>
                                    <div style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>
                                        {item.quantity}{' '}
                                        <span style={{ fontWeight: 'normal', fontSize: '1.125rem' }}>
                                            * {item.price}€
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {(itemsDescriptionsArray.length > 0 || basket.deliveryMessage) && (
                        <div
                            className="product-description-container"
                            style={{ position: 'absolute', bottom: 0, right: 0, left: '51%' }}
                        >
                            <style>
                                {`
                                .product-description-container p {
                                    margin: 0;
                                    margin-bottom: 4px;
                                }
                                `}
                            </style>
                            {basket.deliveryMessage && (
                                // goal is to have the message slightly higher than the bottom of the page if there are no product descriptions
                                <div style={{ marginBottom: itemsDescriptionsArray.length === 0 ? 80 : 8 }}>
                                    <p style={{ fontWeight: 'bold', marginBottom: 4 }}>Message de livraison:</p>
                                    <p style={{ fontStyle: 'italic', whiteSpace: 'pre-wrap' }}>
                                        {basket.deliveryMessage}
                                    </p>
                                </div>
                            )}
                            {itemsDescriptionsArray.map((item) => (
                                <ProductDescription
                                    key={item}
                                    productVariant={{ description: item || '' }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
