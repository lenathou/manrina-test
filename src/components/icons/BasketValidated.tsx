import { AppImage } from '../Image';

export const BasketValidated = ({ width, height }: { width?: number; height?: number }) => {
    return (
        <AppImage
            source="/icons/basket-validated.svg"
            style={{ height: height || 40, width: width || 40 }}
            alt="Panier validé"
        />
    );
};
