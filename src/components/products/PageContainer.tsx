import { PropsWithChildren } from 'react';
import { View } from 'react-native';
import { BaseHeaderProps } from '../Header/BaseHeader';
import { Header } from '../Header/Header';
import { styles } from './ProductsPage';

export const PageContainer = (props: PropsWithChildren<{ header?: BaseHeaderProps }>) => {
    return (
        <View style={styles.body}>
            <Header {...props.header} />
            {props.children}
            {/* <Footer /> */}
        </View>
    );
};
