import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { AppImage } from './Image';
export const TanouCircuit = () => {
    const { width } = useWindowDimensions();
    const isMobile = width < 768;
    return (
        <View style={styles.row}>
            <View style={isMobile ? styles.containerMobile : styles.container}>
                <View style={isMobile ? styles.contentContainerMobile : styles.contentContainer}>
                    <View style={styles.content}>
                        <Text style={styles.title}>Reprise du circuit court Ta Nou Bio par Manrina</Text>
                        <Text style={styles.description}>
                            Ta Nou Bio à réouvert son service pour continuer à vous offrir le meilleur de la production
                            locale certifiée Bio.
                        </Text>
                        <Text style={styles.buttonText}>Venez on vous explique tout</Text>
                    </View>
                </View>
                <View style={isMobile ? styles.imageContainerMobile : styles.imageContainer}>
                    <AppImage
                        source="https://cdn.sumup.store/shops/45946206/settings/th1024/378857a6-0e6c-47a6-b5de-b4328bb909c0.jpeg"
                        style={styles.image}
                        fill
                        alt="Tanou bio logo"
                    />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        margin: 'auto',
        maxWidth: 1200,
    },
    containerMobile: {
        display: 'flex',
        flexDirection: 'column',
        flexWrap: 'wrap',
        margin: 'auto',
        maxWidth: 1200,
    },
    row: {
        backgroundColor: '#f7f0ea',
        padding: 10,
    },
    imageContainer: {
        width: '50%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    imageContainerMobile: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        // width: "100%",
        aspectRatio: 1,
    },
    contentContainer: {
        width: '50%',
        textAlign: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    contentContainerMobile: {
        width: '100%',
        textAlign: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    content: {
        padding: 10,
    },
    title: {
        fontFamily: 'Fredoka',
        fontSize: 40,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    description: {
        fontSize: 16,
        marginBottom: 20,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});
