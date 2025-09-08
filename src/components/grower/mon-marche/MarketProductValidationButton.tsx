
import React from 'react';
import { Button } from '@/components/ui/Button';
import { Prisma } from '@prisma/client';

type MarketProduct = Prisma.MarketProductGetPayload<{
    include: {
        grower: true;
        marketSession: true;
    };
}>;

type MarketSession = {
    id: string;
    name: string;
    date: Date | string;
    location: string | null;
    status: string;
};

interface MarketProductValidationButtonProps {
    selectedSessionId: string;
    standProducts: MarketProduct[];
    upcomingSessions: MarketSession[];
    onOpenValidationModal: (session: MarketSession) => void;
    isSubmitting?: boolean;
    disabled?: boolean;
    className?: string;
    children?: React.ReactNode;
    buttonText?: string;
    buttonClassName?: string;
}

export function MarketProductValidationButton({
    selectedSessionId,
    standProducts,
    upcomingSessions,
    onOpenValidationModal,
    isSubmitting = false,
    disabled = false,
    className = "w-full sm:w-auto",
    children,
    buttonText = "Valider ma liste de produits",
    buttonClassName = ""
}: MarketProductValidationButtonProps) {
    const handleClick = () => {
        if (!selectedSessionId) return;
        
        const session = upcomingSessions.find(s => s.id === selectedSessionId);
        if (session) {
            onOpenValidationModal({
                id: session.id,
                name: session.name,
                date: session.date,
                location: session.location,
                status: session.status
            });
        }
    };

    const isDisabled = disabled || !selectedSessionId || isSubmitting || standProducts.length === 0;

    return (
        <Button
            onClick={handleClick}
            disabled={isDisabled}
            className={`${className} ${buttonClassName}`}
        >
            {children || (isSubmitting ? 'Envoi en cours...' : buttonText)}
        </Button>
    );
}

export default MarketProductValidationButton;