import { useState, useEffect } from 'react';

interface GrowerStockInputProps {
    value: number;
    onChange: (value: number) => void;
    onBlur?: (value: number) => void;
    disabled?: boolean;
    placeholder?: string;
}

export function GrowerStockInput({ 
    value, 
    onChange, 
    onBlur,
    disabled = false, 
    placeholder = "Stock" 
}: GrowerStockInputProps) {
    const [inputValue, setInputValue] = useState(value.toString());
    
    useEffect(() => {
        setInputValue(value.toString());
    }, [value]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInputValue(newValue);
        
        const numValue = parseFloat(newValue);
        if (!isNaN(numValue) && numValue >= 0) {
            onChange(numValue);
        } else if (newValue === '') {
            onChange(0);
        }
    };
    
    const handleBlur = () => {
        const numValue = parseFloat(inputValue);
        if (isNaN(numValue) || numValue < 0) {
            setInputValue('0');
            onChange(0);
            onBlur?.(0);
        } else {
            onBlur?.(numValue);
        }
    };
    
    return (
        <input
            type="number"
            value={inputValue}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-20 px-2 py-1 text-center border rounded focus:outline-none focus:ring-2 focus:ring-tertiary focus:border-transparent ${
                disabled 
                    ? 'border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed' 
                    : 'border-gray-300 bg-white text-gray-900'
            }`}
            placeholder={placeholder}
            min="0"
            step="1"
            disabled={disabled}
        />
    );
}