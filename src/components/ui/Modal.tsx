import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/Card';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, className }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <Card className={cn(
        "relative bg-background shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto",
        className
      )} padding="none">
        {/* Header */}
        <CardHeader className="bg-secondary p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold text-white">{title}</CardTitle>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </CardHeader>
        
        {/* Content */}
        <CardContent className="p-6">
          {children}
        </CardContent>
      </Card>
    </div>
  );
};