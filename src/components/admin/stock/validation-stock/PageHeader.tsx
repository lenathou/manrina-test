import React from 'react';
import { Button } from '@/components/ui/Button';

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
    description = "📋 Validez les demandes de mise à jour de stock pour ce producteur"
}) => {
    return (
        <div className="px-8 py-6 bg-secondary">
            {/* Version desktop */}
            <div className="hidden md:flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Button
                        onClick={onBackClick}
                        variant="ghost"
                        size="md"
                        className="text-white border-white/30 hover:bg-white/30"
                    >
                        ← Retour
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-1">{title}</h1>
                        <p className="text-white/80 text-lg">{subtitle}</p>
                    </div>
                </div>
                <div className="bg-white/20 rounded-lg px-6 py-3">
                    <p className="text-white/90 text-sm font-medium">Demandes en attente</p>
                    <p className="text-white text-2xl font-bold">{requestCount}</p>
                </div>
            </div>
            
            {/* Version mobile */}
            <div className="md:hidden">
                {/* Titre en haut */}
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-white mb-1">{title}</h1>
                    <p className="text-white/80 text-base">{subtitle}</p>
                </div>
                
                {/* Bouton et compteur en bas */}
                <div className="flex items-center justify-between">
                    <Button
                        onClick={onBackClick}
                        variant="ghost"
                        size="md"
                        className="text-white border-white/30 hover:bg-white/30"
                    >
                        ← Retour
                    </Button>
                    <div className="bg-white/20 rounded-lg px-4 py-2">
                        <p className="text-white/90 text-xs font-medium">Demandes en attente</p>
                        <p className="text-white text-xl font-bold text-center">{requestCount}</p>
                    </div>
                </div>
            </div>
            
            <div className="mt-4 bg-white/10 rounded-lg px-4 py-3">
                <p className="text-white/90 text-sm">{description}</p>
            </div>
        </div>
    );
};

export default PageHeader;