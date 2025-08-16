import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colorUsages, common, palette } from '../theme';

interface AdditionalMessageInputProps {
    onMessageChange: (message: string) => void;
    initialMessage?: string;
}

export const AdditionalMessageInput = ({ onMessageChange, initialMessage = '' }: AdditionalMessageInputProps) => {
    const [showInput, setShowInput] = useState(false);
    const [message, setMessage] = useState(initialMessage);

    const handleMessageChange = (text: string) => {
        setMessage(text);
        onMessageChange(text);
    };

    return (
        <View style={styles.section}>
            <View style={styles.titleContainer}>
                <Text style={styles.sectionTitle}>Message supplémentaire</Text>
                {showInput && (
                    <TouchableOpacity
                        onPress={() => setShowInput(false)}
                        style={styles.hideButton}
                    >
                        <Text style={styles.hideButtonText}>Masquer</Text>
                    </TouchableOpacity>
                )}
            </View>
            <View style={styles.sectionContent}>
                {!showInput ? (
                    <TouchableOpacity
                        onPress={() => setShowInput(true)}
                        style={styles.button}
                    >
                        <Text style={styles.buttonText}>
                            + Ajouter message à destination de l&apos;équipe (étage, remarque, mentions spéciales...)
                        </Text>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            multiline
                            placeholder="Ex: Remarque générale, remerciement, Code d'entrée: 1234, 3ème étage, sonner à l'interphone..."
                            value={message}
                            onChangeText={handleMessageChange}
                        />
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    section: {
        borderBottomWidth: 1,
        borderBottomColor: colorUsages.borderColor,
        paddingVertical: 8,
        marginBottom: 16,
        maxWidth: 400,
        width: '100%',
    },
    titleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    sectionTitle: {
        fontFamily: 'Fredoka',
        fontSize: 20,
        fontWeight: '500',
    },
    sectionContent: {
        padding: 8,
    },
    button: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 4,
        backgroundColor: colorUsages.backgroundLight,
        alignSelf: 'flex-start',
    },
    buttonText: {
        ...common.text.text,
        color: palette.secondary,
    },
    inputContainer: {
        gap: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: colorUsages.borderColor,
        borderRadius: 4,
        padding: 8,
        minHeight: 80,
        textAlignVertical: 'top',
        ...common.text.text,
    },
    hideButton: {
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 4,
        backgroundColor: colorUsages.backgroundLight,
    },
    hideButtonText: {
        ...common.text.text,
        fontSize: 14,
        color: palette.mediumgrey,
    },
});
