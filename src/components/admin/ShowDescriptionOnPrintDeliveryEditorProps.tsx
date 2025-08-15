import { IProductVariant } from '../../server/product/IProduct';
import { useUpdateVariant } from '../../hooks/useUpdateVariant';

interface ShowDescriptionOnPrintDeliveryEditorProps {
    variant: IProductVariant;
}

export function ShowDescriptionOnPrintDeliveryEditor({ variant }: ShowDescriptionOnPrintDeliveryEditorProps) {
    const updateVariantMutation = useUpdateVariant<'showDescriptionOnPrintDelivery'>({
        errorMessage: 'Failed to update show description on print delivery',
    });
    const updating = updateVariantMutation.isPending;

    if (updating) {
        return (
            <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center flex-wrap text-center">
            <span
                className={`ml-2 text-xs font-medium ${variant.showDescriptionOnPrintDelivery ? 'text-emerald-700' : 'text-gray-500'}`}
            >
                {variant.showDescriptionOnPrintDelivery ? 'Impression (description)' : "Pas d'impression"}
            </span>
            <button
                onClick={() =>
                    updateVariantMutation.mutate({
                        variantId: variant.id,
                        dataToUpdate: { showDescriptionOnPrintDelivery: !variant.showDescriptionOnPrintDelivery },
                    })
                }
                disabled={updating}
                className={`
                    relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50
                    ${variant.showDescriptionOnPrintDelivery ? 'bg-emerald-500' : 'bg-gray-300'}
                `}
            >
                <span
                    className={`
                        inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out
                        ${variant.showDescriptionOnPrintDelivery ? 'translate-x-6' : 'translate-x-1'}
                    `}
                />
            </button>
        </div>
    );
}
