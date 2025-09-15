import React from 'react';

interface LoadingSpinnerProps {
    message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = "Chargement..." }) => {
    return (
        <div className="min-h-screen">
            <div className="max-w-6xl mx-auto p-8">
                <div className="bg-white rounded-lg shadow-lg border border-gray-200">
                    <div className="px-8 py-12">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-lg text-gray-900">
                                {message}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoadingSpinner;