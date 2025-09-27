import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { variables } from '../../theme';

export type ViewMode = 'categories' | 'growers';

interface ViewToggleProps {
    currentView: ViewMode;
    onViewChange: (view: ViewMode) => void;
}

export function ViewToggle({ currentView, onViewChange }: ViewToggleProps) {
    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={[
                    styles.button,
                    currentView === 'categories' ? styles.activeButton : styles.inactiveButton
                ]}
                onPress={() => onViewChange('categories')}
            >
                <Text style={[
                    styles.buttonText,
                    currentView === 'categories' ? styles.activeText : styles.inactiveText
                ]}>
                    Par catégories
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[
                    styles.button,
                    currentView === 'growers' ? styles.activeButton : styles.inactiveButton
                ]}
                onPress={() => onViewChange('growers')}
            >
                <Text style={[
                    styles.buttonText,
                    currentView === 'growers' ? styles.activeText : styles.inactiveText
                ]}>
                    Par producteur
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: '#f3f4f6',
        borderRadius: 8,
        padding: 4,
        marginHorizontal: variables.spaceXL,
        marginBottom: variables.space,
    },
    button: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    activeButton: {
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    inactiveButton: {
        backgroundColor: 'transparent',
    },
    buttonText: {
        fontSize: 14,
        fontWeight: '500',
    },
    activeText: {
        color: '#111827',
    },
    inactiveText: {
        color: '#6b7280',
    },
});