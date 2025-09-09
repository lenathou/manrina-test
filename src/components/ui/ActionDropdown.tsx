import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { ScrollArea } from './ScrollArea';

interface ActionItem {
    id: string;
    label: string;
    onClick: () => void;
    disabled?: boolean;
    className?: string;
    icon?: React.ReactNode;
}

interface ActionDropdownProps {
    actions: ActionItem[];
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}

export const ActionDropdown: React.FC<ActionDropdownProps> = ({
    actions,
    placeholder = "Actions",
    className = "",
    disabled = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleActionClick = (action: ActionItem) => {
        if (!action.disabled) {
            action.onClick();
            setIsOpen(false);
        }
    };

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <button
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={`
                    flex items-center justify-between w-full px-4 py-2 text-left
                    bg-white border border-gray-300 rounded-lg shadow-sm
                    hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20
                    transition-colors duration-200
                    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    ${isOpen ? 'border-primary' : ''}
                `}
            >
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-5 h-5">
                        <Image 
                            src="/icons/settings.svg" 
                            alt="Settings" 
                            width={16}
                            height={16}
                            className="w-4 h-4"
                        />
                    </div>
                    <span className="text-gray-700">{placeholder}</span>
                </div>
                <svg
                    className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute z-50 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg" style={{ minWidth: '100%', width: 'max-content' }}>
                    <ScrollArea className="max-h-60 overflow-y-auto dropdown-scrollbar">
                        <div className="py-1">
                            {actions.map((action) => (
                                <button
                                    key={action.id}
                                    onClick={() => handleActionClick(action)}
                                    disabled={action.disabled}
                                    className={`
                                        w-full px-4 py-2 text-left text-sm flex items-center gap-2 whitespace-nowrap
                                        hover:bg-gray-50 focus:outline-none focus:bg-gray-50
                                        transition-colors duration-150
                                        ${action.disabled ? 'opacity-50 cursor-not-allowed text-gray-400' : 'text-gray-700 cursor-pointer'}
                                        ${action.className || ''}
                                    `}
                                >
                                    {action.icon && (
                                        <span className="flex-shrink-0">
                                            {action.icon}
                                        </span>
                                    )}
                                    {action.label}
                                </button>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            )}
        </div>
    );
};

export default ActionDropdown;