import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { AppImage } from './Image';

export const ManrinaDescription = () => {
    const { width } = useWindowDimensions();
    const isMobile = width < 768;
    return (
        <View style={styles.row}>
            <View style={isMobile ? styles.containerMobile : styles.container}>
                <View style={isMobile ? styles.imageContainerMobile : styles.imageContainer}>
                    <AppImage
                        source="https://cdn.sumup.store/shops/45946206/settings/th1024/6477beaa-8900-4b25-973b-41b544c1059e.png"
                        style={styles.image}
                        fill
                        alt="banner image"
                    />
                </View>
                <View style={isMobile ? styles.contentContainerMobile : styles.contentContainer}>
                    <View style={styles.content}>
                        <Text style={styles.title}>{"MANRINA c'est quoi ?"}</Text>
                        <Text style={styles.description}>
                            {
                                "Manrina est un service digital qui favorise les échanges directs entre producteurs locaux et consommateurs afin de facilité l'accès à la production locale et saine. Grâce à ce service, particuliers et professionnels peuvent commander et se faire livrer à domicile des produits frais, locaux et de saison mis à disposition par des producteurs respectant la charte de qualité Manrina."
                            }
                        </Text>
                        <Text style={styles.buttonText}>En savoir plus sur Manrina</Text>
                    </View>
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
