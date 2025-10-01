import React from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from '@/components/ui/Card';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
    isLoading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirmer',
    cancelText = 'Annuler',
    variant = 'danger',
    isLoading = false,
}) => {
    if (!isOpen) return null;

    const getVariantStyles = () => {
        switch (variant) {
            case 'danger':
                return {
                    icon: '⚠️',
                    iconBg: 'bg-red-100',
                    iconColor: 'text-red-600',
                    confirmVariant: 'danger' as const,
                };
            case 'warning':
                return {
                    icon: '⚠️',
                    iconBg: 'bg-yellow-100',
                    iconColor: 'text-yellow-600',
                    confirmVariant: 'primary' as const,
                };
            case 'info':
                return {
                    icon: 'ℹ️',
                    iconBg: 'bg-blue-100',
                    iconColor: 'text-blue-600',
                    confirmVariant: 'primary' as const,
                };
            default:
                return {
                    icon: '❓',
                    iconBg: 'bg-gray-100',
                    iconColor: 'text-gray-600',
                    confirmVariant: 'primary' as const,
                };
        }
    };

    const variantStyles = getVariantStyles();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <Card className="bg-background shadow-xl max-w-md w-full mx-4 transform transition-all" padding="none">
                {/* Header avec icône */}
                <CardHeader className="bg-secondary p-6 pb-4">
                    <div className="flex items-center">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full ${variantStyles.iconBg} flex items-center justify-center mr-4`}>
                            <span className={`text-lg ${variantStyles.iconColor}`}>
                                {variantStyles.icon}
                            </span>
                        </div>
                        <div className="flex-1">
                            <CardTitle className="text-lg font-semibold text-white">
                                {title}
                            </CardTitle>
                        </div>
                    </div>
                </CardHeader>

                {/* Message */}
                <CardContent className="px-6 pb-6">
                    <p className="text-gray-600 leading-relaxed">
                        {message}
                    </p>
                </CardContent>

                {/* Actions */}
                <CardFooter className="flex flex-col sm:flex-row gap-3 p-6 pt-0 sm:justify-end">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                        className="w-full sm:w-auto order-2 sm:order-1"
                    >
                        {cancelText}
                    </Button>
                    <Button
                        variant={variantStyles.confirmVariant}
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="w-full sm:w-auto order-1 sm:order-2"
                    >
                        {isLoading ? 'Chargement...' : confirmText}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};