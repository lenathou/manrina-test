import { View } from 'react-native';
import { useAppContext } from '../../context/AppContext';
import { BasketIcon } from './BasketIcon';

export const NavbarBasket = () => {
    const { totalProducts } = useAppContext();
    return (
        <View
            style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 10,
            }}
        >
            <BasketIcon totalProducts={totalProducts} />
        </View>
    );
};
