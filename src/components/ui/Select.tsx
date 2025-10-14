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
  const selectRef = React.useRef<HTMLDivElement>(null);

  // Reset selectedText when value changes externally
  useEffect(() => {
    if (!value) {
      setSelectedText('');
    }
  }, [value]);

  // Handle click outside to close the select
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [open]);

  return (
    <SelectContext.Provider value={{ value, onValueChange: onValueChange || (() => {}), open, setOpen, selectedText, setSelectedText, disabled }}>
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
    const { open, setOpen, disabled } = useSelect();

    return (
      <button
        ref={ref}
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
  const { open } = useSelect();

  if (!open) return null;

  return (
    <div className="absolute z-50 bg-white border border-gray-300 rounded-lg shadow-lg top-full mt-1" style={{ minWidth: '100%', width: 'max-content' }}>
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