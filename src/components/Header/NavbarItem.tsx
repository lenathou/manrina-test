import { StyleSheet, Text } from 'react-native';
import { Link } from '../Link';

export const NavbarItem = (link: { path: string; title: string }) => {
    return (
        <Link href={link.path}>
            <Text style={styles.navLink}>{link.title}</Text>
        </Link>
    );
};
const styles = StyleSheet.create({
    navLink: {
        fontFamily: 'Open',
        fontSize: 16,
        paddingVertical: 8,
    },
});
