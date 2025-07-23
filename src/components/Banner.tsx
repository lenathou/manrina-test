import { StyleSheet, Text, View } from 'react-native';
import { ROUTES } from '../router/routes';
import { AppImage } from './Image';
import { Link } from './Link';

export const Banner = () => {
    return (
        <View style={styles.banner}>
            <AppImage
                source={'/banner.jpg'}
                fill
                alt="Manrina image"
            />
            <View style={styles.overlay}>
                <Text style={styles.title}>Bienvenue sur notre boutique en ligne</Text>
                <Link href={ROUTES.PRODUITS}>
                    <Text style={styles.productLink}>Découvrez nos produits</Text>
                </Link>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    banner: {
        height: 480,
        width: '100%',
    },
    image: {
        height: '100%',
        width: '100%',
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontFamily: 'Fredoka',
        fontSize: 40,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 10,
    },
    productLink: {
        fontSize: 16,
        color: '#FFFFFF',
        textAlign: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
        padding: 4,
    },
});
