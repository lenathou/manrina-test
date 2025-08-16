import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const smallerSpacing = 2;
const defaultSpacing = 4;

export const variables = {
    // space: width * 0.06,
    // smallSpace: width * 0.04,
    // bigSpace: width * 0.1,
    space: defaultSpacing * 2,
    spaceSmall: defaultSpacing,
    spaceSmaller: smallerSpacing,
    spaceBig: defaultSpacing * 3,
    spaceXL: defaultSpacing * 4, // 16
    spaceXXL: defaultSpacing * 6, // 24

    radiusXS: 4,
    smallRadius: 8,
    middleRadius: 13,
    radiusBig: 24,

    iosOffContent: 500,
    maxContainerWidth: 1200,
};
