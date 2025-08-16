import { PropsWithChildren } from 'react';
import { View } from 'react-native';

export const PageContainerWithoutHeader = (props: PropsWithChildren) => {
    return (
        <View style={{ flex: 1, width: '100%' }}>
            {props.children}
        </View>
    );
};