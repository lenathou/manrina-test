import { useEffect, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { useDebounce } from 'react-use';
import { colorUsages, variables } from '../../theme';
import { AppImage } from '../Image';

export function SearchBar({
    onSearch,
    initialValue,
}: {
    initialValue: string;
    onSearch: (searchValue: string) => void;
}) {
    const [search, setSearch] = useState(initialValue);
    const [debouncedSearch, setDebouncedSearch] = useState(initialValue);
    useDebounce(
        () => {
            setDebouncedSearch(search);
        },
        300,
        [search],
    );
    useEffect(() => {
        if (debouncedSearch !== initialValue) {
            onSearch(debouncedSearch);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearch]);
    return (
        <View style={styles.searchContainer}>
            <SearchIcon />
            <TextInput
                style={styles.input}
                placeholder="Rechercher un produit..."
                value={search}
                placeholderTextColor={colorUsages.borderColor}
                onChangeText={(text) => setSearch(text)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        minWidth: 200,
        width: '100%',
        maxWidth: 368,
        margin: 'auto',
        marginTop: 0,
        marginBottom: 0,
        borderRadius: variables.smallRadius,
        borderColor: colorUsages.borderColor,
        borderWidth: 1,
        paddingHorizontal: variables.spaceBig,
        paddingVertical: variables.space,
        gap: variables.space,
        backgroundColor: colorUsages.white,
    },
    input: {
        flex: 1,
        outlineStyle: 'none',
        // color: colorUsages.borderColor,
        minHeight: 24,
    },
});

const SearchIcon = () => {
    return (
        <AppImage
            source="/icon-search.svg"
            alt="search icon"
            width={24}
            height={24}
        />
    );
};
