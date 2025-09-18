import React from 'react';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';

interface PageHeaderProps {
    title: string;
    subtitle: string;
    requestCount: number;
    onBackClick: () => void;
    description?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ 
    title, 
    subtitle, 
    requestCount, 
    onBackClick,
}) => {
    return (
        <>
            {/* Navigation */}
            <div className="mb-6">
                <Button
                    variant="ghost"
                    onClick={onBackClick}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 p-0"
                >
                    ← Retour à la gestion du stock
                </Button>
            </div>

            {/* En-tête avec informations */}
            <div className="p-6 mb-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <Text
                            variant='h1'
                            className="text-2xl font-bold text-secondary mb-2"
                        >
                            {title}
                        </Text>
                        <p className="text-gray-600 mb-4">{subtitle}</p>
                        
                       
                    </div>
                    
                    {/* Compteur en évidence sur desktop */}
                    <div className="hidden md:block bg-primary text-white rounded-lg px-6 py-3 border">
                        <p className="text-sm font-medium">Produits en attente</p>
                        <p className="text-2xl font-bold">{requestCount}</p>
                    </div>
                </div>
                
            </div>
        </>
    );
};

export default PageHeader;