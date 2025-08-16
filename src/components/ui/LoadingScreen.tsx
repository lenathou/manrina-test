import { Text } from '@/components/ui/Text';
import { cn } from '@/lib/utils';
import { FC, HTMLAttributes } from 'react';

interface LoadingScreenProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {}

export const LoadingScreen: FC<LoadingScreenProps> = ({ className, ...rest }) => (
    <div className={cn('flex shrink-1 grow-1 justify-center items-center min-h-[100svh] bg-background', className)}>
        <Text
            variant="description"
            className="text-center text-primary"
        >
            Chargement...
        </Text>
    </div>
);
