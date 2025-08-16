import { AppImage } from '../Image';

export const Check = ({ width, height }: { width?: number; height?: number }) => {
    return (
        <AppImage
            source="/icons/check.svg"
            style={{ height: height || 40, width: width || 40 }}
            alt="Check"
        />
    );
};
