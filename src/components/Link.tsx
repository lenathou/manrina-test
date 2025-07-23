import NextLink from 'next/link';
import { PropsWithChildren } from 'react';

export const Link = ({
    href,
    children,
    style,
}: PropsWithChildren<{
    href: string;
    style?: {
        flex?: number;
        width?: number;
        height?: number;
    };
}>) => {
    return (
        <NextLink
            href={href}
            style={{ textDecoration: 'none', ...style }}
        >
            {children}
        </NextLink>
    );
};
