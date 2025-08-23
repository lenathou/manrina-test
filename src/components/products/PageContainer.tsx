import { PropsWithChildren } from 'react';
import { View, StyleSheet } from 'react-native';
import { BaseHeaderProps } from '../Header/BaseHeader';
import { Header } from '../Header/Header';
import { colorUsages } from '../../theme';

const styles = StyleSheet.create({
    body: {
        margin: 0,
        padding: 0,
        height: '100%',
        backgroundColor: colorUsages.background,
    },
});

export const PageContainer = (props: PropsWithChildren<{ header?: BaseHeaderProps }>) => {
    return (
        <View style={styles.body}>
            <Header {...props.header} />
            {props.children}
            {/* <Footer /> */}
        </View>
    );
};
