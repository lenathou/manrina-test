import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

type SelectableListProps<T> = {
    title: string;
    items: T[];
    onSelect: (item: T) => void;
    renderLabel?: (item: T) => string;
    renderContent?: (item: T) => React.ReactNode;
    keyExtractor: (item: T) => string;
    isDisabled?: (item: T) => boolean;
    renderDisabledMessage?: (item: T) => string | null;
};

export function SelectableList<T>({
    title,
    items,
    onSelect,
    renderLabel,
    renderContent,
    keyExtractor,
    isDisabled,
    renderDisabledMessage,
}: SelectableListProps<T>) {
    const renderItem = ({ item }: { item: T }) => {
        const disabled = isDisabled?.(item) ?? false;
        const disabledMessage = disabled && renderDisabledMessage?.(item);

        return (
            <Pressable
                style={({ pressed }) => [
                    styles.itemContainer,
                    pressed && styles.itemPressed,
                    disabled && styles.itemDisabled,
                    disabledMessage && styles.itemWithMessage,
                ]}
                disabled={disabled}
                onPress={() => onSelect(item)}
            >
                {renderContent ? renderContent(item) : <Text style={styles.itemText}>{renderLabel?.(item)}</Text>}
                {disabledMessage && <Text style={styles.itemDisabledText}>{disabledMessage}</Text>}
            </Pressable>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>
            <FlatList
                data={items}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={true}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        marginVertical: 16,
        marginHorizontal: 16,
        color: '#000',
    },
    listContainer: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    itemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#f8f8f8',
        borderRadius: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        maxWidth: 754,
    },
    itemPressed: {
        backgroundColor: '#e8e8e8',
    },
    itemDisabled: {
        backgroundColor: '#dddddd',
    },
    itemWithMessage: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        paddingVertical: 4,
    },
    itemText: {
        fontSize: 16,
        color: '#333',
    },
    itemDisabledText: {
        fontSize: 12,
        color: '#333',
    },
});
