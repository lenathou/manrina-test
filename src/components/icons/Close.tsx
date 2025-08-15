import { AppImage } from '../Image';

export const Close = ({ width, height }: { width?: number; height?: number }) => {
    return (
        <AppImage
            source="/icons/close.svg"
            style={{ height: height || 40, width: width || 40 }}
            alt="Close Icon"
        />
    );
};
