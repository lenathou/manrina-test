/* eslint-disable react/no-unescaped-entities */
import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { IGrowerProductDisplay } from '@/types/grower';
import { useAllVariantsPriceRanges} from '@/hooks/useAllProductsPriceRanges';

interface ProductPriceDropdownProps {
    product: IGrowerProductDisplay;
    children: React.ReactNode;
    className?: string;
}

const ProductPriceDropdown: React.FC<ProductPriceDropdownProps> = ({
    product,
    children,
    className
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);

    // Hook pour récupérer les données de prix
    const { data: allVariantsPriceRanges, isLoading } = useAllVariantsPriceRanges();

    // Fonction pour obtenir le prix d'affichage d'un variant
    const getVariantDisplayPrice = (variant: any): string => {
        return variant.customPrice?.toFixed(2) || 'Non défini';
    };

    // Fonction pour obtenir les données de prix du marché pour un variant
    const getMarketPriceData = (variant: any) => {
        const range = allVariantsPriceRanges?.[variant.variantId];
        if (!range) return null;
        
        return {
            min: range.min,
            max: range.max,
            avg: (range.min + range.max) / 2
        };
    };

    // Fonction pour calculer la position optimale du dropdown
    const calculateDropdownPosition = () => {
        if (!triggerRef.current) return;

        const triggerRect = triggerRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const dropdownHeight = 400; // Estimation de la hauteur du dropdown
        const spaceBelow = viewportHeight - triggerRect.bottom;
        const spaceAbove = triggerRect.top;

        // Si pas assez d'espace en bas mais assez en haut, ouvrir vers le haut
        if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
            setDropdownPosition('top');
        } else {
            setDropdownPosition('bottom');
        }
    };

    // Fermer le dropdown quand on clique à l'extérieur
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        const handleScroll = () => {
            if (isOpen) {
                calculateDropdownPosition();
            }
        };

        const handleResize = () => {
            if (isOpen) {
                calculateDropdownPosition();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            window.addEventListener('scroll', handleScroll, true);
            window.addEventListener('resize', handleResize);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('scroll', handleScroll, true);
            window.removeEventListener('resize', handleResize);
        };
    }, [isOpen]);

    const toggleDropdown = () => {
        if (!isOpen) {
            calculateDropdownPosition();
        }
        setIsOpen(!isOpen);
    };

    // Préparer les données de prix pour l'affichage
    const marketPricesData = product.variants.map((variant) => {
        const variantPriceRange = allVariantsPriceRanges?.[variant.variantId];

        return {
            variant,
            priceRange: variantPriceRange || null,
        };
    });

    return (
        <div ref={dropdownRef} className={cn('relative', className)}>
            {/* Trigger */}
            <div
                ref={triggerRef}
                onClick={toggleDropdown}
                className="cursor-pointer"
            >
                {children}
            </div>

            {/* Dropdown Content */}
            {isOpen && (
                <div
                    className={cn(
                        'absolute z-50 bg-white border border-secondary/20 rounded-lg shadow-xl p-4 min-w-[280px] max-w-[320px] animate-in slide-in-from-bottom-2 duration-200',
                        dropdownPosition === 'top'
                            ? 'bottom-full mb-2'
                            : 'top-full mt-2',
                        'right-0'
                    )}
                >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-secondary text-sm leading-tight pr-2">
                            Prix les plus bas
                        </h3>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-tertiary hover:text-secondary transition-colors flex-shrink-0 w-5 h-5 flex items-center justify-center"
                            aria-label="Fermer"
                        >
                            ×
                        </button>
                    </div>

                    {/* Contenu */}
                    {isLoading ? (
                        <div className="text-center py-4">
                            <div className="text-tertiary text-sm">
                                Chargement des prix du marché...
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {/* Liste des variants avec leurs prix du marché - même disposition que la carte produit */}
                            <div className="space-y-1 max-h-32">
                                {marketPricesData.map(({ variant, priceRange }) => (
                                    <div
                                        key={variant.variantId}
                                        className="flex justify-between items-center text-sm"
                                    >
                                        <span className="text-tertiary truncate flex-1 mr-2">
                                            {variant.variantOptionValue}
                                        </span>
                                        <span className="font-medium whitespace-nowrap text-primary">
                                            {priceRange?.min !== null && priceRange?.min !== undefined
                                                ? `${priceRange.min.toFixed(2)} €`
                                                : 'Non disponible'}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Note explicative */}
                             <div className="text-xs text-secondary text-center pt-2 border-t border-secondary/10">
                                 Prix les plus compétitifs actuellement proposés sur la plateforme
                             </div>
                         </div>
                     )}
                </div>
            )}
        </div>
    );
};

export default ProductPriceDropdown;