import { forwardRef } from 'react';
import { FlatList, FlatListProps, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { colorUsages, variables } from '../../theme';
import { text } from '../../theme/common';
import { AppImage } from '../Image';
import { Arrow } from '../icons/Arrow';

// const allCategories = [
//     "Ta Nou Bio",
//     "Fleurs",
//     "Produits de la mer",
//     "Viande",
//     "Nutrition animale",
//     "Cosmétiques",
//     "Produits transformés",
//     "Boissons",
//     "Bien être",
//     "Fruits",
//     "Légumes",
//     "Nos Paniers Bio",
//     "Aromates",
//     "Kit Manrina",
//     "Crèmerie",
//     "Nos Paniers Manrina",
//     "Epices",
//     "Évènement",
//     "Artisanat",
//     "Plantes",
// ];
// const iconsList
// aromates.png               cremerie.png               legumes.png                semences.png
// artisanat.png              epices.png                 menager.png                services.png
// bien-etre.png              favori.png                 plantes.png                tous.png
// boissons.png               fruits.png                 produits_de_la_mer.png     viande.png
// cosmetiques.png            hygiène.png                produits_transformes.png
const IconsByCategories = {
    'Ta Nou Bio': 'aromates.png',
    'Fleurs': 'plantes.png',
    'Produits de la mer': 'produits_de_la_mer.png',
    'Viande': 'viande.png',
    'Nutrition animale': 'menager.png',
    'Cosmétiques': 'cosmetiques.png',
    'Produits transformés': 'produits_transformes.png',
    'Boissons': 'boissons.png',
    'Bien être': 'bien-etre.png',
    'Fruits': 'fruits.png',
    'Légumes': 'legumes.png',
    'Nos Paniers Bio': 'semences.png',
    'Aromates': 'aromates.png',
    'Kit Manrina': 'menager.png',
    'Crèmerie': 'cremerie.png',
    'Nos Paniers Manrina': 'produits_transformes.png',
    'Epices': 'epices.png',
    'Évènement': 'services.png',
    'Artisanat': 'artisanat.png',
    'Plantes': 'plantes.png',
};
const CategoryComponent = ({ category, onSelect }: { category: string; onSelect: (category: string) => void }) => {
    const icon = IconsByCategories[category as keyof typeof IconsByCategories] || 'tous.png';
    return (
        <View
            style={categoryStyles.container}
            onClick={() => onSelect(category)}
        >
            <AppImage
                source={`/icons/categories/${icon}`}
                alt={category}
                style={categoryStyles.icon}
            />
            <Text style={categoryStyles.title}>{category}</Text>
            <Arrow />
        </View>
    );
};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
function fixedForwardRef<T, P = {}>(
    render: (props: P, ref: React.Ref<T>) => React.ReactNode,
): (props: P & React.RefAttributes<T>) => React.ReactNode {
    //  @ts-expect-error, this is a workaround to fix the type error
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return forwardRef(render) as any;
}

const PADDING_HORIZONTAL = variables.spaceBig;
export const FlatListWithAutoColumns = fixedForwardRef(
    <ItemT,>(
        props: Omit<FlatListProps<ItemT>, 'renderItem'> & {
            itemWidth: number;
            maxItemsPerRow?: number;
            horizontalGap?: number;
            verticalGap?: number;
            renderItem: ({
                item,
                index,
                width,
            }: {
                item: ItemT;
                index: number;
                width: number;
            }) => React.ReactElement | null;
        },
        ref: React.Ref<FlatList>,
    ) => {
        const columnGap = props.horizontalGap || variables.space;
        const rowGap = props.verticalGap || variables.space;
        const dimensions = useWindowDimensions();
        const totalWidth = Math.min(dimensions.width, variables.maxContainerWidth) - 2 * PADDING_HORIZONTAL;
        const maxItemWidth = props.maxItemsPerRow ? totalWidth / props.maxItemsPerRow : 0;
        const itemWidthToUse = Math.max(maxItemWidth - 2 * variables.space, props.itemWidth);
        const itemWidthWithGap = itemWidthToUse + variables.space;
        const numberOfColumns = Math.max(Math.floor(totalWidth / itemWidthWithGap), 1);
        const maxUsableWidth = totalWidth / numberOfColumns - columnGap;
        const renderFn: FlatListProps<ItemT>['renderItem'] = ({ item, index }) => {
            return props.renderItem?.({ item, index, width: maxUsableWidth });
        };
        return (
            <FlatList
                ref={ref}
                style={{
                    width: '100%',
                    gap: variables.space,
                    paddingVertical: variables.spaceXL,
                    paddingHorizontal: PADDING_HORIZONTAL,
                }}
                key={`selector-${numberOfColumns}`}
                contentContainerStyle={{
                    rowGap: rowGap,
                    columnGap: columnGap,
                    marginHorizontal: 'auto',
                }}
                columnWrapperStyle={numberOfColumns > 1 ? { gap: variables.space } : undefined}
                numColumns={numberOfColumns}
                {...props}
                renderItem={renderFn}
            />
        );
    },
);
// FlatListWithAutoColumns.displayName = "FlatListWithAutoColumns";

export const CategorySelector = ({
    allCategories,
    onSelect,
}: {
    allCategories: string[];
    onSelect: (category: string) => void;
}) => {
    return (
        <FlatListWithAutoColumns
            itemWidth={CATEGORY_WIDTH}
            data={allCategories}
            renderItem={({ item }) => (
                <CategoryComponent
                    key={item}
                    category={item}
                    onSelect={onSelect}
                />
            )}
        />
    );
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// const CategorySelectorDesktop = () => {
//     return (
//         <View
//             style={{ flexDirection: "row", flexWrap: "wrap", margin: "auto" }}
//         >
//             {allCategories
//                 .sort((a, b) => a.localeCompare(b))
//                 .map((category) => (
//                     <CategoryComponent key={category} category={category} />
//                 ))}
//         </View>
//     );
// };

const CATEGORY_WIDTH = 300;
const categoryStyles = StyleSheet.create({
    container: {
        paddingHorizontal: variables.spaceXL,
        paddingVertical: variables.space,
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        flex: 1,
        gap: variables.spaceBig,
        backgroundColor: colorUsages.white,
        boxShadow: '0px 2px 4px rgba(130, 139, 139, 0.2)',
        borderRadius: variables.smallRadius,
        cursor: 'pointer',
        marginHorizontal: 'auto',
        // flex: 1,
    },
    icon: {
        width: 63,
        height: 54,
        objectFit: 'contain',
    },
    title: {
        ...text.h2Title,
        flex: 1,
    },
});
