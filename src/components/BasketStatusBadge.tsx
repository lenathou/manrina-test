import { StyleSheet, Text, View } from 'react-native';
import { colorUsages } from '../theme';

interface BasketStatusBadgeProps {
    quantity: number;
    size?: number;
}

export const BasketStatusBadge = ({ quantity }: BasketStatusBadgeProps) => {
    if (quantity === 0) {
        return null;
    }

    return (
        <View style={styles.badge}>
            <Text style={styles.text}>{quantity}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    badge: {
        backgroundColor: colorUsages.selected,
        minWidth: 16,
        minHeight: 16,
        borderRadius: '50%',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colorUsages.white,
    },
    text: {
        color: colorUsages.white,
        fontSize: 11,
        fontWeight: '600',
    },
});
