import { useState } from 'react';
import { StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { colorUsages, common } from '../../theme';

interface TooltipButtonProps {
    onPress: () => void;
    disabled?: boolean;
    tooltipText?: string;
    isLoading?: boolean;
    loadingText?: string;
    children: string;
}

export const TooltipButton = ({
    onPress,
    disabled,
    tooltipText,
    isLoading,
    loadingText = 'En cours...',
    children,
}: TooltipButtonProps) => {
    const [showTooltip] = useState(false);

    return (
        <View style={styles.tooltipContainer as ViewStyle}>
            <Text
                style={[styles.button, (disabled || isLoading) && styles.buttonDisabled] as TextStyle[]}
                onPress={onPress}
            >
                {isLoading ? loadingText : children}
            </Text>
            {showTooltip && tooltipText && (
                <View style={styles.tooltip as ViewStyle}>
                    <Text style={styles.tooltipText as TextStyle}>{tooltipText}</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    tooltipContainer: {
        // position: 'relative', // Not supported in React Native
    } as ViewStyle,
    button: {
        ...common.text.text,
        color: colorUsages.primary,
        textDecorationLine: 'underline',
    } as TextStyle,
    buttonDisabled: {
        opacity: 0.5,
        // pointerEvents: 'none', // Not supported in React Native
    } as TextStyle,
    tooltip: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        backgroundColor: colorUsages.lightInfo,
        padding: 8,
        borderRadius: 4,
        marginBottom: 8,
        width: 200,
        zIndex: 1,
    } as ViewStyle,
    tooltipText: {
        ...common.text.text,
        color: colorUsages.white,
        fontSize: 12,
        textAlign: 'center',
    } as TextStyle,
});
