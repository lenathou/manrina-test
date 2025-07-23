import { ROUTES } from '../../router/routes';
import { AppImage } from '../Image';
import { Link } from '../Link';

export const ManrinaLogo = () => {
    return (
        <Link href={ROUTES.PRODUITS}>
            <AppImage
                source="/logo-color.png"
                style={{
                    height: 30,
                    width: 120,
                    objectFit: 'contain',
                }}
                alt="Manrina logo"
            />
        </Link>
    );
};
