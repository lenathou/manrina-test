import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useAllGrowers } from '@/hooks/useGrowers';
import { GrowerCard } from './GrowerCard';
import { IGrower } from '@/server/grower/IGrower';
import { variables } from '@/theme';

interface GrowerSelectorProps {
    onGrowerSelect: (grower: IGrower) => void;
    selectedGrowerId?: string;
}

export function GrowerSelector({ onGrowerSelect, selectedGrowerId }: GrowerSelectorProps) {
    const { data: growers = [], isLoading, error } = useAllGrowers();

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2563eb" />
                <Text style={styles.loadingText}>
                    Chargement des producteurs...
                </Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>
                    Erreur lors du chargement des producteurs
                </Text>
            </View>
        );
    }

    if (!growers || growers.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                    Aucun producteur disponible
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                Sélectionnez un producteur
            </Text>
            <View style={styles.gridContainer}>
                {growers.map((grower) => (
                    <GrowerCard
                        key={grower.id}
                        grower={grower}
                        onClick={() => onGrowerSelect(grower)}
                        isSelected={selectedGrowerId === grower.id}
                    />
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: variables.spaceXL,
        paddingVertical: variables.spaceXL,
        alignSelf: 'center',
        maxWidth: variables.maxContainerWidth,
        width: '100%',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: variables.space,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: variables.space,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 32,
    },
    loadingText: {
        marginTop: 12,
        color: '#6b7280',
        fontSize: 16,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 32,
    },
    errorText: {
        color: '#dc2626',
        fontSize: 16,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 32,
    },
    emptyText: {
        color: '#6b7280',
        fontSize: 16,
    },
});