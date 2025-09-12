import { UpdateQuantityButtons } from '@/components/products/BasketItem';
import { IProduct } from '@/server/product/IProduct';
import { backendFetchService } from '@/service/BackendFetchService';
import { useState } from 'react';

export function GrowerStockEditor({
    growerId,
    variant,
    onStockUpdate,
}: {
    variant: IProduct['variants'][0];
    onStockUpdate: (newStock: number) => void;
    growerId: string;
}) {
    const [inputValue, setInputValue] = useState(variant.stock.toString());
    const inputValueNumber = parseInt(inputValue);
    const [updating, setUpdating] = useState(false);

    const handleStockChange = async (newValue: string) => {
        setInputValue(newValue);
        const newStock = parseFloat(newValue);
        if (!isNaN(newStock) && newStock !== variant.stock) {
            setUpdating(true);
            try {
                await backendFetchService.updateGrowerProductStock({
                    growerId,
                    productId: variant.productId,
                    stock: newStock,
                });
                onStockUpdate(newStock);
            } finally {
                setUpdating(false);
            }
        }
    };

    const handleQuantityChange = async (newQuantity: number) => {
        await handleStockChange(newQuantity.toString());
    };

    return (
        <div className="flex flex-1 items-center justify-center">
            <UpdateQuantityButtons
                increment={() => handleStockChange(Math.max(0, inputValueNumber + 1).toString())}
                decrement={() => handleStockChange(Math.max(0, inputValueNumber - 1).toString())}
                quantity={inputValueNumber}
                disabled={updating}
                centerEditing={true}
                onQuantityChange={handleQuantityChange}
            />
        </div>
    );
}
