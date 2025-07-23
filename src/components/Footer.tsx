import { StyleSheet, Text, View } from 'react-native';

export const Footer = () => {
    return (
        <View style={styles.footerMain}>
            <View style={styles.footerNavWrapper}>
                <Text>Contactez-nous</Text>
                <Text>Conditions</Text>
                <Text>Politique de confidentialité</Text>
                <Text>Politique de cookies</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    footerMain: {
        padding: 20,
        backgroundColor: '#eae4de',
    },
    footerNavWrapper: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
        marginBottom: 20,
    },
});
