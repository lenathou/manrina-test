/* eslint-disable @typescript-eslint/no-empty-object-type */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface SelectContextType {
  value: string;
  onValueChange: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedText: string;
  setSelectedText: (text: string) => void;
  disabled?: boolean;
  selectPosition: {
    vertical: 'top' | 'bottom';
    horizontal: 'left' | 'right';
  };
  triggerRef: React.RefObject<HTMLButtonElement>;
  contentRef: React.RefObject<HTMLDivElement>;
}

const SelectContext = createContext<SelectContextType | undefined>(undefined);

const useSelect = () => {
  const context = useContext(SelectContext);
  if (!context) {
    throw new Error('useSelect must be used within a Select');
  }
  return context;
};

export interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  disabled?: boolean;
}

const Select = ({ value = '', onValueChange, children, disabled }: SelectProps) => {
  const [open, setOpen] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [selectPosition, setSelectPosition] = useState<{
    vertical: 'top' | 'bottom';
    horizontal: 'left' | 'right';
  }>({
    vertical: 'bottom',
    horizontal: 'left'
  });
  
  const selectRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);

  // Fonction pour calculer la position optimale du select
  const calculateSelectPosition = React.useCallback(() => {
    if (!triggerRef.current || !contentRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const contentRect = contentRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const margin = 16; // Marge de sécurité

    // Calcul du positionnement vertical
    const spaceBelow = viewportHeight - triggerRect.bottom - margin;
    const spaceAbove = triggerRect.top - margin;
    const contentHeight = contentRect.height || 240; // Hauteur estimée si pas encore rendu

    const shouldPositionAbove = spaceBelow < contentHeight && spaceAbove > spaceBelow;

    // Calcul du positionnement horizontal
    const spaceRight = viewportWidth - triggerRect.left - margin;
    const spaceLeft = triggerRect.right - margin;
    const contentWidth = contentRect.width || triggerRect.width;

    const shouldPositionRight = spaceRight < contentWidth && spaceLeft > spaceRight;

    setSelectPosition({
      vertical: shouldPositionAbove ? 'top' : 'bottom',
      horizontal: shouldPositionRight ? 'right' : 'left'
    });
  }, []);

  // Reset selectedText when value changes externally
  useEffect(() => {
    if (!value) {
      setSelectedText('');
    }
  }, [value]);

  // Calculer la position lors de l'ouverture
  useEffect(() => {
    if (open) {
      // Petit délai pour s'assurer que le contenu est rendu
      const timeoutId = setTimeout(() => {
        calculateSelectPosition();
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [open, calculateSelectPosition]);

  // Handle click outside to close the select and manage scroll/resize events
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    // Debounce pour optimiser les performances lors du scroll/resize
    let timeoutId: NodeJS.Timeout;
    const debouncedCalculatePosition = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (open) {
          calculateSelectPosition();
        }
      }, 16); // ~60fps
    };

    const handleScroll = () => {
      if (open) {
        debouncedCalculatePosition();
      }
    };

    const handleResize = () => {
      if (open) {
        debouncedCalculatePosition();
      }
    };

    if (open) {
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
  }, [open, calculateSelectPosition]);

  return (
    <SelectContext.Provider value={{ 
      value, 
      onValueChange: onValueChange || (() => {}), 
      open, 
      setOpen, 
      selectedText, 
      setSelectedText, 
      disabled,
      selectPosition,
      triggerRef,
      contentRef
    }}>
      <div ref={selectRef} className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  );
};

export interface SelectTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, ...props }, ref) => {
    const { open, setOpen, disabled, triggerRef } = useSelect();

    const setRefs = React.useCallback((node: HTMLButtonElement | null) => {
      // Assigner à la ref interne
      if (triggerRef.current !== node) {
        (triggerRef as React.MutableRefObject<HTMLButtonElement | null>).current = node;
      }
      
      // Assigner à la ref externe si elle existe
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
      }
    }, [triggerRef, ref]);

    return (
      <button
        ref={setRefs}
        type="button"
        className={cn(
          `flex items-center justify-between w-full px-4 py-2 text-left
          bg-white border border-gray-300 rounded-lg shadow-sm
          hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20
          transition-colors duration-200
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${open ? 'border-primary' : ''}`,
          className
        )}
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        {...props}
      >
        {children}
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
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
    )
  }
)
SelectTrigger.displayName = "SelectTrigger"

export interface SelectValueProps {
  placeholder?: string;
}

const SelectValue = ({ placeholder }: SelectValueProps) => {
  const { value, selectedText } = useSelect();
  
  return (
    <span className={cn("text-gray-700", !value && "text-gray-500")}>
      {selectedText || placeholder}
    </span>
  );
};

export interface SelectContentProps {
  children: React.ReactNode;
}

const SelectContent = ({ children }: SelectContentProps) => {
  const { open, selectPosition, contentRef } = useSelect();

  if (!open) return null;

  return (
    <div 
      ref={contentRef}
      className={cn(
        "absolute z-50 bg-white border border-gray-300 rounded-lg shadow-lg",
        selectPosition.vertical === 'top' 
          ? 'bottom-full mb-1' 
          : 'top-full mt-1',
        selectPosition.horizontal === 'right'
          ? 'right-0'
          : 'left-0'
      )} 
      style={{ 
        minWidth: '100%', 
        width: 'max-content',
        maxWidth: '90vw' // Éviter que le select dépasse de l'écran
      }}
    >
      <div className="max-h-60 overflow-y-auto">
        <div className="py-1">
          {children}
        </div>
      </div>
    </div>
  );
};

export interface SelectItemProps {
  value: string;
  children: React.ReactNode;
}

const SelectItem = ({ value, children }: SelectItemProps) => {
  const { value: selectedValue, onValueChange, setOpen, setSelectedText } = useSelect();
  const isSelected = selectedValue === value;

  const handleClick = () => {
    onValueChange(value);
    // Extract text content from children
    let textContent = '';
    if (typeof children === 'string') {
      textContent = children;
    } else if (React.isValidElement(children)) {
      textContent = children.props.children || value;
    } else if (Array.isArray(children)) {
      // Handle array of children (like text nodes)
      textContent = children.join('');
    } else {
      // Fallback: try to extract text content recursively
      const extractText = (node: React.ReactNode): string => {
        if (typeof node === 'string' || typeof node === 'number') {
          return String(node);
        }
        if (Array.isArray(node)) {
          return node.map(extractText).join('');
        }
        if (React.isValidElement(node)) {
          const props = node.props as { children?: React.ReactNode };
          if (props.children) {
            return extractText(props.children);
          }
        }
        return '';
      };
      textContent = extractText(children) || value;
    }
    setSelectedText(textContent);
    setOpen(false);
  };

  return (
    <button
      className={cn(
        "w-full px-4 py-2 text-left text-sm flex items-center gap-2 whitespace-nowrap hover:bg-primary/30 focus:outline-none focus:bg-gray-50 transition-colors duration-150 text-gray-700 cursor-pointer",
        isSelected && "bg-primary-dark/40"
      )}
      onClick={handleClick}
    >
      {children}
      {isSelected && <span className="ml-auto">✓</span>}
    </button>
  );
};

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }