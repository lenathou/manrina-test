import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { IGrower } from '@/server/grower/IGrower';
import Image from 'next/image';
import { variables } from '@/theme';

interface GrowerCardProps {
    grower: IGrower;
    onClick: () => void;
    isSelected?: boolean;
}

export function GrowerCard({ grower, onClick, isSelected = false }: GrowerCardProps) {
    return (
        <TouchableOpacity
            style={[
                styles.card,
                isSelected ? styles.selectedCard : styles.normalCard
            ]}
            onPress={onClick}
        >
            <View style={styles.content}>
                <View style={styles.row}>
                    {grower.profilePhoto ? (
                        <Image
                            src={grower.profilePhoto}
                            alt={grower.name}
                            width={48}
                            height={48}
                            style={styles.avatar}
                        />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarText}>
                                {grower.name.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                    )}
                    <View style={styles.textContainer}>
                        <Text style={styles.name} numberOfLines={1}>
                            {grower.name}
                        </Text>
                        <Text style={styles.role}>
                            Producteur
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 8,
        padding: 16,
        marginBottom: variables.space,
        width: 280,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    selectedCard: {
        borderWidth: 2,
        borderColor: '#3b82f6',
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4,
    },
    normalCard: {
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    content: {
        flex: 1,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    avatarPlaceholder: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#e5e7eb',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        color: '#6b7280',
        fontWeight: '500',
        fontSize: 16,
    },
    textContainer: {
        flex: 1,
        marginLeft: 12,
        minWidth: 0,
    },
    name: {
        fontWeight: '500',
        color: '#111827',
        fontSize: 16,
    },
    role: {
        color: '#6b7280',
        fontSize: 14,
        marginTop: 2,
    },
});