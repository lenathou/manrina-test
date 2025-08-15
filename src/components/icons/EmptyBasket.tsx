import { AppImage } from '../Image';

export const EmptyBasket = ({ width, height }: { width?: number; height?: number }) => {
    return (
        <AppImage
            source="/icons/basket-empty.svg"
            style={{ height: height || 40, width: width || 40 }}
            alt="Panier vide"
        />
    );
};
