/**
 * Utilitaire pour la validation et la conversion des valeurs de stock
 */
export class StockValidationUtils {
    /**
     * Valide qu'une valeur de stock est positive et non nulle
     */
    static isValidStock(stock: number | string): boolean {
        const stockNumber = this.toNumber(stock);
        return stockNumber > 0;
    }

    /**
     * Valide qu'une valeur de stock est positive ou nulle
     */
    static isValidStockOrZero(stock: number | string): boolean {
        const stockNumber = this.toNumber(stock);
        return stockNumber >= 0;
    }

    /**
     * Convertit une valeur en number
     */
    static toNumber(value: number | string): number {
        if (typeof value === 'number') {
            return value;
        }
        return parseFloat(value) || 0;
    }

    /**
     * Formate un stock pour l'affichage avec un nombre de décimales spécifique
     */
    static formatStock(stock: number | string, decimals: number = 3): string {
        const stockNumber = this.toNumber(stock);
        return stockNumber.toFixed(decimals);
    }

    /**
     * Parse une valeur de stock depuis un input HTML
     */
    static parseDecimal(value: string, defaultValue: number = 0): number {
        // Remplace les virgules par des points pour la conversion
        const normalizedValue = value.replace(',', '.');
        const parsed = parseFloat(normalizedValue);
        return isNaN(parsed) ? defaultValue : parsed;
    }

    /**
     * Parse une valeur de stock depuis un input HTML (alias pour compatibilité)
     */
    static parseStockFromInput(value: string): number {
        return this.parseDecimal(value, 0);
    }

    /**
     * Valide qu'une quantité peut être soustraite du stock disponible
     */
    static canSubtractFromStock(currentStock: number | string, quantity: number | string): boolean {
        const stockNumber = this.toNumber(currentStock);
        const quantityNumber = this.toNumber(quantity);
        return stockNumber >= quantityNumber;
    }

    /**
     * Calcule le nouveau stock après une opération
     */
    static calculateNewStock(currentStock: number | string, change: number | string, operation: 'add' | 'subtract'): number {
        const stockNumber = this.toNumber(currentStock);
        const changeNumber = this.toNumber(change);
        
        if (operation === 'add') {
            return stockNumber + changeNumber;
        } else {
            return stockNumber - changeNumber;
        }
    }

    /**
     * Valide les contraintes de stock minimum et maximum
     */
    static validateStockConstraints(
        stock: number | string,
        minStock: number | string = 0,
        maxStock?: number | string
    ): { isValid: boolean; error?: string } {
        const stockNumber = this.toNumber(stock);
        const minStockNumber = this.toNumber(minStock);
        
        if (stockNumber < minStockNumber) {
            return {
                isValid: false,
                error: `Le stock ne peut pas être inférieur à ${this.formatStock(minStockNumber)}`
            };
        }
        
        if (maxStock !== undefined) {
            const maxStockNumber = this.toNumber(maxStock);
            if (stockNumber > maxStockNumber) {
                return {
                    isValid: false,
                    error: `Le stock ne peut pas être supérieur à ${this.formatStock(maxStockNumber)}`
                };
            }
        }
        
        return { isValid: true };
    }

    /**
     * Compare deux valeurs de stock
     */
    static compareStock(stock1: number | string, stock2: number | string): number {
        const stock1Number = this.toNumber(stock1);
        const stock2Number = this.toNumber(stock2);
        
        if (stock1Number === stock2Number) return 0;
        if (stock1Number > stock2Number) return 1;
        return -1;
    }

    /**
     * Arrondit un stock à un nombre de décimales spécifique
     */
    static roundStock(stock: number | string, decimals: number = 3): number {
        const stockNumber = this.toNumber(stock);
        return parseFloat(stockNumber.toFixed(decimals));
    }
}

/**
 * Hook personnalisé pour la validation de stock dans les composants React
 */
export const useStockValidation = () => {
    const validateStock = (value: string): { isValid: boolean; error?: string } => {
        try {
            const stock = StockValidationUtils.parseStockFromInput(value);
            return StockValidationUtils.validateStockConstraints(stock);
        } catch (error) {
            return {
                isValid: false,
                error: 'Valeur de stock invalide'
            };
        }
    };

    const formatStockForInput = (stock: number | string): string => {
        return StockValidationUtils.formatStock(stock, 3);
    };

    const parseStockFromInput = (value: string): number => {
        return StockValidationUtils.parseStockFromInput(value);
    };

    return {
        validateStock,
        formatStockForInput,
        parseStockFromInput
    };
};

export default StockValidationUtils;