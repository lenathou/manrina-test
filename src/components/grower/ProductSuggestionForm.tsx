import { Form } from '@/components/Form/Form';
import { Text } from '@/components/ui/Text';
import { useGrowerProductSuggestion } from '@/hooks/useGrowerProductSuggestion';
import { useProductQuery } from '@/hooks/useProductQuery';

type ProductSuggestionFormProps = { growerId: string; onSuccess?: () => void };
export const ProductSuggestionForm = ({ onSuccess, growerId }: ProductSuggestionFormProps) => {
    const { data: products } = useProductQuery();
    const { createSuggestion } = useGrowerProductSuggestion(growerId);

    if (!growerId) {
        // Optionally show an error to the user
        return;
    }

    // Define form fields for the shared Form component
    const formFields = [
        {
            name: 'name',
            label: 'Nom du produit *',
            type: 'text' as const,
            required: true,
            placeholder: 'Nom du produit *',
        },
        {
            name: 'description',
            label: 'Description (optionnel)',
            type: 'text' as const,
            required: false,
            placeholder: 'Description (optionnel)',
        },
        {
            name: 'pricing',
            label: 'Prix ou informations tarifaires *',
            type: 'text' as const,
            required: true,
            placeholder: 'Prix ou informations tarifaires',
        },
    ];

    const handleNewProductSubmit = async (data: { name: string; description?: string; pricing?: string }) => {
        if (!data.name) {
            createSuggestion.reset();
            return;
        }

        if (products?.some((p) => p.name.toLowerCase() === data.name.toLowerCase())) {
            createSuggestion.reset();
            return;
        }

        await createSuggestion.mutateAsync({
            growerId: growerId || '',
            name: data.name,
            description: data.description,
            pricing: data.pricing ?? '',
        });

        onSuccess?.();
    };

    return (
        <div className="p-6 max-w-lg mx-auto">
            <Text
                variant="h2"
                className="text-xl mb-4"
            >
                Proposer un nouveau produit
            </Text>
            <Form<{ name: string; description?: string; pricing?: string }>
                formFields={formFields}
                submitLabel={createSuggestion.isPending ? 'Proposition en cours...' : 'Proposer le produit'}
                isDisabled={createSuggestion.isPending}
                onSubmit={handleNewProductSubmit}
            />
            {createSuggestion.isError && (
                <div className="text-red-600 text-sm mt-2">Erreur lors de la proposition du produit.</div>
            )}
            {createSuggestion.isSuccess && (
                <div className="text-green-600 text-sm mt-2">
                    Produit proposé avec succès. En attente de validation.
                </div>
            )}
        </div>
    );
};
