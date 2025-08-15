import { BasketWithCustomerToShow } from '../../server/checkout/IBasket';
import { IProduct } from '../../server/product/IProduct';

type ProductVariantSummary = {
    productId: string;
    productVariantId: string;
    name: string;
    variant: string;
    image: string;
    totalQuantity: number;
    quantityByOrder: Record<string, number>;
};

export const ProductsToRetrieveSummary = ({
    commands,
    stockItemsByProductId,
    disabledCommands,
    toggleCommand,
}: {
    commands: BasketWithCustomerToShow[];
    stockItemsByProductId: Record<string, IProduct>;
    disabledCommands: Record<string, boolean>;
    toggleCommand: (commandId: string) => void;
}) => {
    const allCommands = commands;
    const orderIds = allCommands.map((command) => command.basket.orderIndex);

    // Helper function to get opacity based on disabled status
    const getCommandStyle = (orderId: string | number, isHeader = false) => {
        const orderIdStr = String(orderId);
        const isDisabled = disabledCommands[orderIdStr];

        if (isHeader) {
            return {
                textAlign: 'center' as const,
                padding: '8px',
                cursor: 'pointer',
                opacity: isDisabled ? 0.2 : 1,
                backgroundColor: isDisabled ? '#f0f0f0' : 'transparent',
                textDecoration: 'underline',
            };
        } else {
            return {
                textAlign: 'center' as const,
                padding: '8px',
                backgroundColor: '#e6e6e6',
                fontWeight: 'bold' as const,
                opacity: isDisabled ? 0.2 : 1,
            };
        }
    };

    // Helper function for cell styling
    const getCellStyle = (orderId: string | number, hasValue: boolean) => {
        const orderIdStr = String(orderId);
        return {
            textAlign: 'center' as const,
            padding: '8px',
            backgroundColor: hasValue ? '#f0f8ff' : 'transparent',
            opacity: disabledCommands[orderIdStr] ? 0.2 : 1,
        };
    };

    // Create a summary of all product variants across all orders
    const productVariantsSummary: ProductVariantSummary[] = [];
    const productVariantMap: Record<string, ProductVariantSummary> = {};

    allCommands.forEach((command) => {
        const orderId = command.basket.orderIndex;

        command.basket.items.forEach((item) => {
            const product = stockItemsByProductId?.[item.productId];
            const variant = product?.variants.find((v) => v.id === item.productVariantId);
            const variantKey = `${item.productId}-${item.productVariantId}`;

            if (!productVariantMap[variantKey]) {
                productVariantMap[variantKey] = {
                    productId: item.productId,
                    productVariantId: item.productVariantId,
                    name: product?.name || item.name,
                    variant: variant?.optionValue || '',
                    image: product?.imageUrl || '',
                    totalQuantity: 0,
                    quantityByOrder: {},
                };
                productVariantsSummary.push(productVariantMap[variantKey]);
            }

            productVariantMap[variantKey].quantityByOrder[orderId] = item.quantity;
            productVariantMap[variantKey].totalQuantity += item.quantity;
        });
    });

    // Recalculate totalQuantity excluding disabled commands
    productVariantsSummary.forEach((product) => {
        let total = 0;
        Object.entries(product.quantityByOrder).forEach(([orderId, quantity]) => {
            if (!disabledCommands[String(orderId)]) {
                total += quantity;
            }
        });
        product.totalQuantity = total;
    });

    // Sort by product name and variant
    productVariantsSummary.sort((a, b) => {
        const nameCompare = a.name.localeCompare(b.name);
        if (nameCompare !== 0) return nameCompare;
        return a.variant.localeCompare(b.variant);
    });

    return (
        <div style={{ padding: 12, margin: 'auto' }}>
            <h1 style={{ fontSize: '1.5rem', margin: '16px 0' }}>Récapitulatif des produits à préparer</h1>

            <table style={{ borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid black' }}>
                        {/* <th style={{ textAlign: 'left', padding: '8px', width: '60px' }}>Image</th> */}
                        <th style={{ textAlign: 'left', padding: '8px' }}>Produit</th>
                        <th style={{ textAlign: 'left', padding: '8px' }}>Variante</th>
                        {orderIds.map((orderId) => (
                            <th
                                key={orderId}
                                style={getCommandStyle(orderId, true)}
                                onClick={() => toggleCommand(orderId.toString())}
                                title="Cliquer pour inclure/exclure du total"
                            >
                                A_{orderId}
                            </th>
                        ))}
                        <th style={{ textAlign: 'center', padding: '8px', fontWeight: 'bold' }}>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {productVariantsSummary.map((product, index) => (
                        <tr
                            key={`${product.productId}-${product.productVariantId}`}
                            style={{ borderBottom: '1px solid #eee' }}
                        >
                            {/* <td style={{ padding: '8px' }}>
                                <div style={{ width: '50px', height: '50px', overflow: 'hidden' }}>
                                    <ProductImage
                                        url={product.image}
                                        alt={product.name}
                                    />
                                </div>
                            </td> */}
                            <td style={{ padding: '8px' }}>{product.name}</td>
                            <td style={{ padding: '8px' }}>{product.variant}</td>
                            {orderIds.map((orderId) => (
                                <td
                                    key={orderId}
                                    style={getCellStyle(orderId, !!product.quantityByOrder[orderId])}
                                >
                                    {product.quantityByOrder[orderId] || '-'}
                                </td>
                            ))}
                            <td
                                style={{
                                    textAlign: 'center',
                                    padding: '8px',
                                    fontWeight: 'bold',
                                    backgroundColor: '#f5f5f5',
                                }}
                            >
                                {product.totalQuantity}
                            </td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr style={{ borderTop: '2px solid black' }}>
                        <td
                            colSpan={2}
                            style={{ textAlign: 'right', padding: '8px', fontWeight: 'bold' }}
                        >
                            Total par commande:
                        </td>
                        {orderIds.map((orderId) => {
                            const totalForOrder = productVariantsSummary.reduce(
                                (sum, product) => sum + (product.quantityByOrder[orderId] || 0),
                                0,
                            );
                            return (
                                <td
                                    key={orderId}
                                    style={getCommandStyle(orderId)}
                                >
                                    {totalForOrder}
                                </td>
                            );
                        })}
                        <td
                            style={{
                                textAlign: 'center',
                                padding: '8px',
                                fontWeight: 'bold',
                                backgroundColor: '#d9d9d9',
                            }}
                        >
                            {productVariantsSummary.reduce((sum, product) => sum + product.totalQuantity, 0)}
                        </td>
                    </tr>
                </tfoot>
            </table>

            <div style={{ marginTop: '20px' }}>
                <style>
                    {`@media print {
                        @page {
                            size: landscape;
                        }
                        body {
                            padding: 0 !important;
                            margin: 0 !important;
                        }
                        nav, header, .navigation, .navbar {
                            display: none !important;
                        }
                        [role="banner"] {
                            display: none !important;
                        }
                        main {
                            padding-top: 0 !important;
                        }
                    }`}
                </style>
            </div>
        </div>
    );
};

export default ProductsToRetrieveSummary;
