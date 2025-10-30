import React, { useState, useRef, useEffect } from 'react';
import { ScrollArea } from './ScrollArea';

interface ActionItem {
    id: string;
    label: string;
    onClick: () => void;
    disabled?: boolean;
    className?: string;
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
    disabled = false,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [dropdownPosition, setDropdownPosition] = useState<{
        vertical: 'bottom' | 'top';
        horizontal: 'left' | 'right';
    }>({ vertical: 'bottom', horizontal: 'left' });
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    // Fonction pour calculer la position optimale du dropdown
    const calculateDropdownPosition = () => {
        if (!buttonRef.current || !dropdownRef.current) return;

        const buttonRect = buttonRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Calculer la hauteur réelle du dropdown en le rendant temporairement visible
        const dropdown = dropdownRef.current;
        const originalDisplay = dropdown.style.display;
        const originalVisibility = dropdown.style.visibility;
        
        dropdown.style.display = 'block';
        dropdown.style.visibility = 'hidden';
        dropdown.style.position = 'absolute';
        dropdown.style.top = '-9999px';
        
        const dropdownRect = dropdown.getBoundingClientRect();
        const dropdownHeight = dropdownRect.height;
        const dropdownWidth = dropdownRect.width;
        
        // Restaurer les styles originaux
        dropdown.style.display = originalDisplay;
        dropdown.style.visibility = originalVisibility;
        dropdown.style.position = '';
        dropdown.style.top = '';

        const margin = 8; // Marge de sécurité
        
        // Calcul du positionnement vertical
        const spaceBelow = viewportHeight - buttonRect.bottom - margin;
        const spaceAbove = buttonRect.top - margin;
        
        let vertical: 'bottom' | 'top' = 'bottom';
        if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
            vertical = 'top';
        } else if (spaceBelow < dropdownHeight && spaceAbove < dropdownHeight) {
            // Si pas assez d'espace des deux côtés, choisir le côté avec le plus d'espace
            vertical = spaceAbove > spaceBelow ? 'top' : 'bottom';
        }

        // Calcul du positionnement horizontal
        const spaceRight = viewportWidth - buttonRect.left - margin;
        const spaceLeft = buttonRect.right - margin;
        
        let horizontal: 'left' | 'right' = 'left';
        if (spaceRight < dropdownWidth && spaceLeft > dropdownWidth) {
            horizontal = 'right';
        } else if (spaceRight < dropdownWidth && spaceLeft < dropdownWidth) {
            // Si pas assez d'espace des deux côtés, choisir le côté avec le plus d'espace
            horizontal = spaceLeft > spaceRight ? 'right' : 'left';
        }

        setDropdownPosition({ vertical, horizontal });
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        // Debounce pour optimiser les performances lors du scroll/resize
        let timeoutId: NodeJS.Timeout;
        const debouncedCalculatePosition = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                if (isOpen) {
                    calculateDropdownPosition();
                }
            }, 16); // ~60fps
        };

        const handleScroll = () => {
            if (isOpen) {
                debouncedCalculatePosition();
            }
        };

        const handleResize = () => {
            if (isOpen) {
                debouncedCalculatePosition();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            window.addEventListener('scroll', handleScroll, true);
            window.addEventListener('resize', handleResize);
        }
        
        return () => {
            clearTimeout(timeoutId);
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('scroll', handleScroll, true);
            window.removeEventListener('resize', handleResize);
        };
    }, [isOpen]);

    const toggleDropdown = () => {
        if (!disabled) {
            if (!isOpen) {
                calculateDropdownPosition();
            }
            setIsOpen(!isOpen);
        }
    };

    const handleActionClick = (action: ActionItem) => {
        if (!action.disabled) {
            action.onClick();
            setIsOpen(false);
        }
    };

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <button
                ref={buttonRef}
                onClick={toggleDropdown}
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
                <span className="text-gray-700 font-medium">{placeholder}</span>
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
                <div 
                    ref={dropdownRef}
                    className={`absolute z-50 bg-white border border-gray-300 rounded-lg shadow-lg ${
                        dropdownPosition.vertical === 'top' 
                            ? 'bottom-full mb-1' 
                            : 'top-full mt-1'
                    } ${
                        dropdownPosition.horizontal === 'right'
                            ? 'right-0'
                            : 'left-0'
                    }`} 
                    style={{ 
                        minWidth: '100%', 
                        width: 'max-content',
                        maxWidth: '90vw' // Éviter que le dropdown dépasse de l'écran
                    }}>
                    <ScrollArea className="max-h-60 overflow-y-auto dropdown-scrollbar">
                        <div className="py-1">
                            {actions.map((action) => (
                                <button
                                    key={action.id}
                                    onClick={() => handleActionClick(action)}
                                    disabled={action.disabled}
                                    className={`
                                        w-full px-4 py-2 text-left text-sm whitespace-nowrap
                                        hover:bg-gray-50 focus:outline-none focus:bg-gray-50
                                        transition-colors duration-150
                                        ${action.disabled ? 'opacity-50 cursor-not-allowed text-gray-400' : 'text-gray-700 cursor-pointer'}
                                        ${action.className || ''}
                                    `}
                                >
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