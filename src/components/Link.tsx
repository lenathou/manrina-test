import NextLink from 'next/link';
import { PropsWithChildren, useEffect, useState } from 'react';

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
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    // Pendant l'hydratation, rendre un div simple pour éviter les conflits
    if (!isClient) {
        return (
            <div style={{ textDecoration: 'none', cursor: 'pointer', ...style }}>
                {children}
            </div>
        );
    }

    return (
        <NextLink
            href={href}
            style={{ textDecoration: 'none', ...style }}
        >
            {children}
        </NextLink>
    );
};
