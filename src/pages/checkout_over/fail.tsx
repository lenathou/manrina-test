import { StyleSheet, Text, View } from 'react-native';
import { EmptyBasket } from '../../components/icons/EmptyBasket';
import { PageContainer } from '../../components/products/PageContainer';

export default function HomeSuccessPage() {
    return (
        <PageContainer>
            <View style={styles.body}>
                <View style={{ margin: 20, marginTop: '15vh' }}>
                    <View style={styles.roundBackground}>
                        <EmptyBasket
                            width={120}
                            height={120}
                        />
                    </View>
                    <Text
                        style={{
                            fontSize: 20,
                            margin: 'auto',
                            color: '#333',
                        }}
                    >
                        Votre paiement a été refusé.
                    </Text>
                    <Text
                        style={{
                            fontSize: 16,
                            margin: 'auto',
                            marginTop: 10,
                            color: '#111',
                            textAlign: 'center',
                        }}
                    >
                        Veuillez réessayer ou contacter le support.
                    </Text>
                </View>
            </View>
        </PageContainer>
    );
}

const styles = StyleSheet.create({
    body: {
        flex: 1,
    },
    roundBackground: {
        margin: 'auto',
        height: 200,
        width: 200,
        borderRadius: '100%',
        backgroundColor: '#cccccc',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
