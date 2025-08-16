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
    // Si fill est explicitement demandé, l'utiliser
    if (fill) {
        return (
            <Image
                fill={true}
                src={source}
                style={{ objectFit: 'cover', ...style }}
                alt={alt}
                className={className}
                sizes="100vw"
                priority={false}
            />
        );
    }
    
    // Extraire width et height du style ou utiliser les props
    // Gérer les cas où width/height peuvent être des strings CSS
    const getNumericValue = (value: any): number => {
        if (typeof value === 'number') return value;
        if (typeof value === 'string') {
            const parsed = parseInt(value, 10);
            return isNaN(parsed) ? 100 : parsed;
        }
        return 100;
    };
    
    const imageWidth = width || getNumericValue(style?.width) || 100;
    const imageHeight = height || getNumericValue(style?.height) || 100;
    
    return (
        <Image
            src={source}
            style={{ objectFit: 'cover', ...style }}
            alt={alt}
            width={imageWidth}
            height={imageHeight}
            className={className}
            priority={false}
        />
    );
};
