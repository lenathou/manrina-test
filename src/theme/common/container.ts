import { StyleSheet } from 'react-native';
import { palette } from '../palette';

export const container = StyleSheet.create({
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        backgroundColor: palette.background,
        elevation: 0,
        shadowOffset: { height: 0, width: 0 },
    },
});
