import { ReactNode } from 'react';
import { View, ViewStyle } from 'react-native';
import { NavbarBasket } from './NavbarBasket';

export type BaseHeaderProps = {
    LeftSection?: ReactNode;
    CentralSection?: ReactNode;
    RightSection?: ReactNode;
    backgroundStyle?: ViewStyle;
    hideBasket?: boolean;
};

export const BaseHeader = ({ LeftSection, CentralSection, RightSection, backgroundStyle, hideBasket }: BaseHeaderProps) => {
    return (
        <View
            style={{
                padding: 20,
                zIndex: 1,
                ...backgroundStyle,
            }}
        >
            <View
                style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    maxWidth: 1000,
                    width: '100%',
                    marginHorizontal: 'auto',
                    gap: 12,
                    flexWrap: 'wrap',
                }}
            >
                {LeftSection}
                <View>{CentralSection}</View>
                {RightSection || (hideBasket ? <View /> : <NavbarBasket />)}
            </View>
        </View>
    );
};
