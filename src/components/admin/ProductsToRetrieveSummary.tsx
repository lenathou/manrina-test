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
        <div className="p-3 mx-auto">
            <h1 className="text-2xl my-4">R&eacute;capitulatif des produits &agrave; pr&eacute;parer</h1>

            <table className="border-collapse text-sm">
                <thead>
                    <tr className="border-b-2 border-black">
                        {/* <th className="text-left p-2 w-15">Image</th> */}
                        <th className="text-left p-2">Produit</th>
                        <th className="text-left p-2">Variante</th>
                        {orderIds.map((orderId) => (
                            <th
                                key={orderId}
                                className={`text-center p-2 cursor-pointer underline ${
                                    disabledCommands[String(orderId)] ? 'opacity-20 bg-gray-100' : 'opacity-100'
                                }`}
                                onClick={() => toggleCommand(orderId.toString())}
                                title="Cliquer pour inclure/exclure du total"
                            >
                                A_{orderId}
                            </th>
                        ))}
                        <th className="text-center p-2 font-bold">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {productVariantsSummary.map((product) => (
                        <tr
                            key={`${product.productId}-${product.productVariantId}`}
                            className="border-b border-gray-200"
                        >
                            {/* <td className="p-2">
                                <div className="w-12 h-12 overflow-hidden">
                                    <ProductImage
                                        url={product.image}
                                        alt={product.name}
                                    />
                                </div>
                            </td> */}
                            <td className="p-2">{product.name}</td>
                            <td className="p-2">{product.variant}</td>
                            {orderIds.map((orderId) => (
                                <td
                                    key={orderId}
                                    className={`text-center p-2 ${
                                        product.quantityByOrder[orderId] ? 'bg-blue-50' : ''
                                    } ${disabledCommands[String(orderId)] ? 'opacity-20' : 'opacity-100'}`}
                                >
                                    {product.quantityByOrder[orderId] || '-'}
                                </td>
                            ))}
                            <td className="text-center p-2 font-bold bg-gray-100">
                                {product.totalQuantity}
                            </td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr className="border-t-2 border-black">
                        <td colSpan={2} className="text-right p-2 font-bold">
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
                                    className={`text-center p-2 bg-gray-200 font-bold ${
                                        disabledCommands[String(orderId)] ? 'opacity-20' : 'opacity-100'
                                    }`}
                                >
                                    {totalForOrder}
                                </td>
                            );
                        })}
                        <td className="text-center p-2 font-bold bg-gray-300">
                            {productVariantsSummary.reduce((sum, product) => sum + product.totalQuantity, 0)}
                        </td>
                    </tr>
                </tfoot>
            </table>

            <div className="mt-5 print:landscape print:p-0 print:m-0">
                {/* Styles d'impression gérés par Tailwind CSS */}
            </div>
        </div>
    );
};

export default ProductsToRetrieveSummary;
