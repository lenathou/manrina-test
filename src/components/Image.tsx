import Image from 'next/image';
import { CSSProperties } from 'react';

export const AppImage = ({
    source,
    style,
    alt,
    width,
    height,
    fill,
    className,
}: {
    source: string;
    style?: CSSProperties;
    alt: string;
    width?: number;
    height?: number;
    fill?: boolean;
    className?: string;
}) => {
    return (
        <Image
            fill={fill}
            src={source}
            style={{ objectFit: 'cover', ...style }}
            alt={alt}
            width={width || (style?.width as number)}
            height={height || (style?.height as number)}
            className={className}
            // sizes="100vw"
            // objectFit="cover"
        />
    );
};
