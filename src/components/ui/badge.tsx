import { cn } from '@/lib/utils';
import { FC, HTMLAttributes } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

export const Badge: FC<BadgeProps> = ({
  variant = 'default',
  className,
  children,
  ...props
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        {
          'bg-blue-100 text-blue-800': variant === 'default',
          'bg-gray-100 text-gray-800': variant === 'secondary',
          'bg-red-100 text-red-800': variant === 'destructive',
          'border border-gray-200 text-gray-600': variant === 'outline',
        },
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};