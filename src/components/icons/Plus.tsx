import { AppImage } from '../Image';

export const Plus = ({
    width,
    height,
    ...props
}: { width?: number; height?: number } & React.HTMLAttributes<SVGSVGElement>) => {
    return (
        <AppImage
            source="/icons/plus.svg"
            {...props}
            style={{ height: height || 40, width: width || 40, objectFit: 'scale-down' }}
            alt="Plus Icon"
        />
    );
};
