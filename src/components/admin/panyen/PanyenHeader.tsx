import React from 'react';
import { Button } from '@/components/ui/Button';

interface PanyenHeaderProps {
    onCreateClick: () => void;
}

const PanyenHeader: React.FC<PanyenHeaderProps> = ({ onCreateClick }) => {
    return (
        <div className="px-8 py-6">
            {/* Version desktop */}
            <div className="hidden md:flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-secondary font-secondary mb-1">Gestion des panyens</h1>
                    <p className="text-lg text-gray-600">Créez et gérez vos paniers de produits</p>
                </div>
                <div>
                    <Button
                        onClick={onCreateClick}
                        variant="secondary"
                        size="lg"
                        className="whitespace-nowrap rounded-full py-4"
                    >
                        + Nouveau panyen
                    </Button>
                </div>
            </div>

            {/* Version mobile */}
            <div className="md:hidden space-y-4">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-secondary font-secondary mb-1">Gestion des panyens</h1>
                    <p className="text-gray-600">Créez et gérez vos paniers de produits</p>
                </div>
                <div>
                    <Button
                        onClick={onCreateClick}
                        variant="secondary"
                        size="lg"
                        className="w-full rounded-full"
                    >
                        + Nouveau panyen
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default PanyenHeader;
