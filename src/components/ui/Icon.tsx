import { FC, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

// Import des icônes disponibles
import checkIcon from '@/icons/check';
import closeIcon from '@/icons/close';
import calendarIcon from '@/icons/calendar';
import searchIcon from '@/icons/search';
import plusIcon from '@/icons/plus';
import minusIcon from '@/icons/minus';
import trashIcon from '@/icons/bin';
import editIcon from '@/icons/description';
import saveIcon from '@/icons/validated.svg';
import cancelIcon from '@/icons/cancel';
import userIcon from '@/icons/user';
import productIcon from '@/icons/product';
import orderIcon from '@/icons/order';
import deliveryIcon from '@/icons/delivery';
import locationIcon from '@/icons/location';
import phoneIcon from '@/icons/contact';
import emailIcon from '@/icons/myAccount';
import settingsIcon from '@/icons/settings';
import helpIcon from '@/icons/help';
import homeIcon from '@/icons/home';
import arrowIcon from '@/icons/arrow';
import lockIcon from '@/icons/lock';
import eyesOpenIcon from '@/icons/eyes-open';
import eyesCloseIcon from '@/icons/eyes-close';

type IconName =
    | 'check'
    | 'close'
    | 'calendar'
    | 'search'
    | 'plus'
    | 'minus'
    | 'trash'
    | 'edit'
    | 'save'
    | 'cancel'
    | 'user'
    | 'product'
    | 'order'
    | 'delivery'
    | 'location'
    | 'phone'
    | 'email'
    | 'settings'
    | 'help'
    | 'home'
    | 'arrow'
    | 'lock'
    | 'eye-open'
    | 'eye-close';

interface IconProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
    name: IconName;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    color?: string;
    primaryColor?: string;
    primary?: string;
}

const iconMap = {
    'check': checkIcon,
    'close': closeIcon,
    'calendar': calendarIcon,
    'search': searchIcon,
    'plus': plusIcon,
    'minus': minusIcon,
    'trash': trashIcon,
    'edit': editIcon,
    'save': saveIcon,
    'cancel': cancelIcon,
    'user': userIcon,
    'product': productIcon,
    'order': orderIcon,
    'delivery': deliveryIcon,
    'location': locationIcon,
    'phone': phoneIcon,
    'email': emailIcon,
    'settings': settingsIcon,
    'help': helpIcon,
    'home': homeIcon,
    'arrow': arrowIcon,
    'lock': lockIcon,
    'eye-open': eyesOpenIcon,
    'eye-close': eyesCloseIcon,
};

export const Icon: FC<IconProps> = ({ name, size = 'md', color, primaryColor, primary, className, ...rest }) => {
    const sizeClasses = {
        xs: 'w-3 h-3',
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
        xl: 'w-8 h-8',
    };

    const iconFunction = iconMap[name];

    if (!iconFunction) {
        console.warn(`Icon "${name}" not found`);
        return null;
    }

    // Préparer les props pour l'icône
    const iconProps: any = {};
    if (primaryColor) iconProps.primaryColor = primaryColor;
    if (primary) iconProps.primary = primary;
    if (color) {
        iconProps.primaryColor = color;
        iconProps.primary = color;
    }

    const svgContent = iconFunction(iconProps);

    return (
        <div
            {...rest}
            className={cn('inline-flex items-center justify-center', sizeClasses[size], className)}
            dangerouslySetInnerHTML={{ __html: svgContent }}
        />
    );
};

// Composant pour les icônes avec bouton
export const IconButton: FC<
    IconProps & {
        onClick?: () => void;
        disabled?: boolean;
        variant?: 'default' | 'ghost' | 'outline';
    }
> = ({ onClick, disabled = false, variant = 'default', className, ...iconProps }) => {
    const variantClasses = {
        default: 'bg-gray-100 hover:bg-gray-200 active:bg-gray-300',
        ghost: 'hover:bg-gray-100 active:bg-gray-200',
        outline: 'border border-gray-300 hover:bg-gray-50 active:bg-gray-100',
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={cn(
                'inline-flex items-center justify-center rounded-md p-2',
                'transition-colors duration-200 ease-in-out',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                variantClasses[variant],
                className,
            )}
        >
            <Icon {...iconProps} />
        </button>
    );
};
