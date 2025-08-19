import Image from 'next/image';

interface ProductImageProps {
    url?: string | null;
    alt: string;
}

export const ProductImage = ({ url, alt }: ProductImageProps) => {
    if (!url) {
        return <div style={{ width: 60, height: 60, backgroundColor: '#f0f0f0' }} />;
    }

    return (
        <Image
            src={url}
            alt={alt}
            width={60}
            height={60}
            style={{
                objectFit: 'cover',
            }}
        />
    );
};
