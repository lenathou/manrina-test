import { StyleSheet } from 'react-native';
import { palette } from '../palette';
import { typography } from '../typography';

export const text = StyleSheet.create({
    h1HighlightInfo: {
        fontSize: 24,
        fontFamily: typography.redgar,
        color: palette.secondary,
    },
    h2Title: {
        fontSize: 16,
        fontFamily: typography.martelBold,
        lineHeight: 20,
        // fontFamily: typography.fredoka,
        color: palette.primaryFont,
    },
    h2Bis: {
        fontSize: 24,
        fontFamily: typography.martelBold,
        color: palette.primaryFont,
    },
    h3Subtitle: {
        fontSize: 16,
        fontFamily: typography.martelLight,
        color: palette.primaryFont,
    },
    h4Tabbar: {
        fontSize: 12,
        fontFamily: typography.martelSemiBold,
        color: palette.detailsColor,
    },
    h5Infos: {
        fontSize: 12,
        fontFamily: typography.martelSemiBold,
        color: palette.darkgrey,
    },
    h5Bis: {
        fontSize: 12,
        fontFamily: typography.martelBold,
        color: palette.secondary,
    },
    infos: {
        fontSize: 10,
        fontFamily: typography.martelSemiBold,
        color: palette.detailsColor,
    },
    detailsInfos: {
        fontSize: 32,
        lineHeight: 32,
        paddingTop: 8,
        fontFamily: typography.redgar,
        color: palette.secondary,
    },
    text: {
        fontSize: 16,
        fontFamily: typography.martelLight,
        color: palette.primaryFont,
        lineHeight: 20,
    },
    paragraph: {
        fontSize: 12,
        fontFamily: typography.martelRegular,
        color: palette.primary,
    },
    error: {
        fontSize: 14,
        fontFamily: typography.martelRegular,
        color: palette.primary,
    },
});
