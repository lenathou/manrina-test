import { SelectableList } from '../components/SelectableList';

type DeliveryMethod = {
    title: string;
    valid: boolean;
    price?: number;
};

const AVAILABLE_DELIVERY_METHODS = (canDeliveryToHome: boolean): DeliveryMethod[] => [
    { title: 'Livraison à domicile', valid: canDeliveryToHome, price: 3 },
    { title: 'Retrait en point relais', valid: true },
    { title: 'Retrait en magasin', valid: true },
];

export const SelectDeliveryMethod = ({
    onSelect,
    canDeliveryToHome,
}: {
    onSelect: (category: DeliveryMethod) => void;
    canDeliveryToHome: boolean;
}) => {
    const methods = AVAILABLE_DELIVERY_METHODS(canDeliveryToHome);

    return (
        <SelectableList
            title="Sélectionnez votre méthode de livraison"
            items={methods}
            onSelect={(item) => onSelect(item)}
            renderLabel={(item) => item.title + (item.price ? ` (${item.price}€)` : '')}
            keyExtractor={(item) => item.title}
            isDisabled={(item) => !item.valid}
            renderDisabledMessage={(item) => (!item.valid ? '(non disponible pour votre code postal)' : null)}
        />
    );
};
