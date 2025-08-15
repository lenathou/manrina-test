import { AppImage } from '../Image';

export const Minus = ({
    width,
    height,
    ...props
}: { width?: number; height?: number } & React.HTMLAttributes<SVGSVGElement>) => {
    return (
        <AppImage
            source="/icons/minus.svg"
            {...props}
            style={{ height: height || 40, width: width || 40, objectFit: 'scale-down' }}
            alt="Minus Icon"
        />
    );
};
