import { StyleSheet, Text, View } from 'react-native';
import { colorUsages, common, variables } from '../../theme';

interface ErrorBannerProps {
    message: string;
}

export function ErrorBanner({ message }: ErrorBannerProps) {
    if (!message) return null;

    return (
        <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{message}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    errorBanner: {
        backgroundColor: colorUsages.error,
        padding: variables.spaceBig,
        marginBottom: variables.spaceBig,
        borderRadius: 8,
    },
    errorText: {
        ...common.text.text,
        color: colorUsages.white,
        textAlign: 'center',
    },
});
