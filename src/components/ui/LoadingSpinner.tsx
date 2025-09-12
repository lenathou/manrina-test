import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  className?: string;
}

export function LoadingSpinner({ 
  size = 'medium', 
  message, 
  className = '' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    small: 'h-6 w-6',
    medium: 'h-8 w-8',
    large: 'h-12 w-12'
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-2 ${className}`}>
      <div className={`animate-spin rounded-full border-b-2 border-[var(--color-primary)] ${sizeClasses[size]}`}></div>
      {message && (
        <p className="text-sm text-gray-600">{message}</p>
      )}
    </div>
  );
}