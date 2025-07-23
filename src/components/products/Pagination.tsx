import { StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { colorUsages, variables } from '../../theme';

const PAGE_BUTTON_WIDTH = 28;
const PAGE_BUTTON_GAP = 8;
const PAGE_BUTTON_WIDTH_WITH_GAP = PAGE_BUTTON_WIDTH + PAGE_BUTTON_GAP;
const ELLIPSIS = '...';

export const Pagination = ({
    totalPages,
    currentPage,
    goToPage,
}: {
    totalPages: number;
    currentPage: number;
    goToPage: (pageNumber: number) => void;
}) => {
    const { width } = useWindowDimensions();

    // Calculate how many buttons we can fit in the available width
    const maxVisibleButtonsInScreenWidth = Math.floor((width - 2 * variables.spaceXL) / PAGE_BUTTON_WIDTH_WITH_GAP);
    const maxVisibleButtons = Math.min(maxVisibleButtonsInScreenWidth, 10);

    const getVisiblePages = () => {
        // If we can show all pages, or there are very few pages, show them all
        if (totalPages <= maxVisibleButtons) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        const pages: (number | string)[] = [];

        // Always show first page
        pages.push(1);

        // Determine the range of pages to show around current page
        const rangeSize = Math.floor((maxVisibleButtons - 5) / 2); // -3 for first, last, and at least one ellipsis
        const rangeStart = Math.max(2, currentPage - rangeSize);
        const rangeEnd = Math.min(totalPages - 1, currentPage + rangeSize);

        // Add ellipsis after first page if needed
        if (rangeStart > 2) {
            pages.push(ELLIPSIS);
        }

        // Add range of pages around current page
        for (let i = rangeStart; i <= rangeEnd; i++) {
            pages.push(i);
        }

        // Add ellipsis before last page if needed
        if (rangeEnd < totalPages - 1) {
            pages.push(ELLIPSIS);
        }

        // Always show last page
        if (rangeEnd < totalPages) {
            pages.push(totalPages);
        }

        return pages;
    };

    return (
        <View style={styles.pagination}>
            <View style={styles.pageNumbersContainer}>
                {getVisiblePages().map((page, index) => {
                    const isPageNumber = typeof page === 'number';
                    return (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.pageNumberButton,
                                isPageNumber && currentPage === page && styles.currentPageButton,
                            ]}
                            onPress={() => isPageNumber && goToPage(page)}
                            disabled={!isPageNumber}
                        >
                            <Text
                                style={[
                                    styles.pageNumberText,
                                    isPageNumber && currentPage === page && styles.currentPageText,
                                ]}
                            >
                                {page}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    pagination: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
        paddingHorizontal: variables.spaceXL,
    },
    pageNumbersContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: PAGE_BUTTON_GAP,
    },
    pageNumberButton: {
        padding: 4,
        borderRadius: 4,
        width: PAGE_BUTTON_WIDTH,
    },
    currentPageButton: {
        backgroundColor: colorUsages.primary,
    },
    pageNumberText: {
        fontSize: 16,
        color: '#000',
        textAlign: 'center',
        textWrap: 'nowrap',
    },
    currentPageText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});
