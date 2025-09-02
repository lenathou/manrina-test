import * as React from "react"
import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface DropdownOption {
  value: string
  label: string
}

interface DropdownProps {
  options: DropdownOption[]
  value?: string
  placeholder?: string
  onSelect: (value: string) => void
  className?: string
  disabled?: boolean
  variant?: 'filter' | 'settings'
}

const Dropdown = React.forwardRef<HTMLDivElement, DropdownProps>(
  ({ options, value, placeholder = "Sélectionner...", onSelect, className, disabled = false, variant = 'filter' }) => {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const buttonRef = useRef<HTMLButtonElement>(null)

    // Fermer le dropdown quand on clique à l'extérieur
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false)
        }
      }

      document.addEventListener("mousedown", handleClickOutside)
      return () => {
        document.removeEventListener("mousedown", handleClickOutside)
      }
    }, [])

    const selectedOption = options.find(option => option.value === value)

    const handleSelect = (optionValue: string) => {
      onSelect(optionValue)
      setIsOpen(false)
    }

    const toggleDropdown = () => {
      if (!disabled) {
        setIsOpen(!isOpen)
      }
    }

    return (
      <div ref={dropdownRef} className={cn("relative", className)}>
        {/* Bouton principal */}
        <button
          ref={buttonRef}
          type="button"
          onClick={toggleDropdown}
          disabled={disabled}
          className={cn(
            "flex items-center justify-between w-full px-4 py-3 text-left bg-white border border-gray-200 rounded-lg shadow-sm transition-all duration-200",
            "hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
            disabled && "opacity-50 cursor-not-allowed",
            isOpen && "border-primary ring-2 ring-primary/20"
          )}
        >
          <div className="flex items-center gap-3">
            {/* Icône dynamique */}
            <div className="flex items-center justify-center w-5 h-5">
              {variant === 'filter' ? (
                <Image 
                  src="/icons/filter.svg" 
                  alt="Filter" 
                  width={16}
                  height={16}
                  className="w-4 h-4"
                />
              ) : (
                <Image 
                  src="/icons/filter.svg" 
                  alt="Settings" 
                  width={16}
                  height={16}
                  className="w-4 h-4"
                />
              )}
            </div>
            
            {/* Texte */}
            <span className={cn(
              "text-sm font-medium",
              selectedOption ? "text-gray-900" : "text-gray-500"
            )}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
          </div>

          {/* Flèche */}
          <div className={cn(
            "transition-transform duration-200 text-gray-400",
            isOpen && "rotate-180"
          )}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6,9 12,15 18,9" />
            </svg>
          </div>
        </button>

        {/* Menu déroulant */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
            <div className="max-h-60 overflow-y-auto dropdown-scrollbar">
              <div className="py-2">
                {options.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={cn(
                      "w-full px-4 py-3 text-left text-sm transition-colors duration-150",
                      "hover:bg-gray-50 focus:outline-none focus:bg-gray-50",
                      option.value === value && "bg-primary/5 text-primary font-medium"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }
)

Dropdown.displayName = "Dropdown"

export { Dropdown, type DropdownOption }