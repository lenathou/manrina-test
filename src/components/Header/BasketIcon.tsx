import { View } from 'react-native';
import { ROUTES } from '../../router/routes';
import { Basket } from '../icons/Basket';
import { EmptyBasket } from '../icons/EmptyBasket';
import { Link } from '../Link';

export const BasketIcon = ({ totalProducts }: { totalProducts: number }) => {
    return (
        <Link href={ROUTES.PANIER}>
            <View style={{ width: 40 }}>
                {totalProducts === 0 ? <EmptyBasket /> : <Basket number={totalProducts} />}
            </View>
        </Link>
    );
};
