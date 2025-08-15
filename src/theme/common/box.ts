import { StyleSheet } from 'react-native';
import * as theme from '../../theme';

export const box = StyleSheet.create({
    shadow: {
        // Android
        elevation: 2,

        // iOS
        shadowColor: theme.palette.mediumgrey,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
});
