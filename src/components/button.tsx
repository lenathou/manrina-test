import { ActivityIndicator, StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';
import { palette, typography, variables } from '../theme';

interface Props {
    label: string;
    loading?: boolean;
    action?: () => void;
    btnStyle?: ViewStyle;
    labelStyle?: TextStyle;
    disable?: boolean;
}

export const AppButton = ({ label, action, loading, btnStyle, labelStyle, disable }: Props): JSX.Element => {
    return (
        <TouchableOpacity
            style={[styles.container, btnStyle, { opacity: disable ? 0.5 : 1 }]}
            onPress={action}
            disabled={disable || loading}
        >
            {loading ? (
                <ActivityIndicator
                    animating={true}
                    color="white"
                    size="small"
                />
            ) : (
                <Text style={[styles.label, labelStyle]}>{label}</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        minHeight: 40,
        backgroundColor: palette.primary,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: variables.smallRadius,
    },
    label: {
        fontSize: 16,
        lineHeight: 20,
        fontFamily: typography.redgar,
        color: palette.white,
        textAlignVertical: 'center',
        textAlign: 'center',
    },
});
