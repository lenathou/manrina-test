import React from 'react';
import { Button } from '@/components/ui/Button';

interface ErrorDisplayProps {
    title?: string;
    message?: string;
    onBackClick?: () => void;
    backButtonText?: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ 
    title = "Aucune demande trouvée",
    message = "Producteur non trouvé ou aucune demande en attente.",
    onBackClick,
    backButtonText = "Retour à la liste"
}) => {
    return (
        <div className="min-h-screen ">
            <div className="max-w-6xl mx-auto p-8">
                <div className="bg-white rounded-lg shadow-lg border border-gray-200">
                    <div className="px-8 py-12">
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center bg-gray-100">
                                <span className="text-3xl">📋</span>
                            </div>
                            <h2 className="text-2xl font-bold mb-4 text-gray-900">
                                {title}
                            </h2>
                            <p className="text-lg mb-8 text-gray-600">
                                {message}
                            </p>
                            {onBackClick && (
                                <Button 
                                    onClick={onBackClick} 
                                    variant="primary"
                                    size="lg"
                                >
                                    ← {backButtonText}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ErrorDisplay;