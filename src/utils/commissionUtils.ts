import { MarketSession, Grower } from '@prisma/client';
import { 
  CommissionInfo, 
  ProductCommissionCalculation, 
  CommissionCalculationInput, 
  CommissionCalculationResult 
} from '@/types/commission';

/**
 * Calcule la commission effective pour un producteur dans une session de marché.
 * Le taux du producteur override celui de la session s'il est défini.
 * 
 * @param grower - Le producteur avec son taux de commission
 * @param marketSession - La session de marché avec son taux de commission par défaut
 * @returns Le taux de commission effective à appliquer
 */
export function getEffectiveCommissionRate(
  grower: Pick<Grower, 'commissionRate'>,
  marketSession: Pick<MarketSession, 'commissionRate'>
): number {
  // Si le producteur a un taux spécifique, on l'utilise
  if (grower.commissionRate) {
    return Number(grower.commissionRate);
  }
  
  // Sinon, on utilise le taux de la session
  return Number(marketSession.commissionRate);
}

/**
 * Calcule le montant de commission à partir d'un prix et d'un taux
 * 
 * @param price - Le prix de base
 * @param commissionRate - Le taux de commission (en pourcentage)
 * @returns Le montant de la commission
 */
export function calculateCommissionAmount(
  price: number,
  commissionRate: number
): number {
  return (price * commissionRate) / 100;
}

/**
 * Calcule le prix final après application de la commission
 * 
 * @param basePrice - Le prix de base
 * @param commissionRate - Le taux de commission (en pourcentage)
 * @returns Le prix final avec commission
 */
export function calculatePriceWithCommission(
  basePrice: number,
  commissionRate: number
): number {
  const commissionAmount = calculateCommissionAmount(basePrice, commissionRate);
  
  return basePrice + commissionAmount;
}

/**
 * Formate un taux de commission pour l'affichage
 * 
 * @param commissionRate - Le taux de commission
 * @returns Le taux formaté avec le symbole %
 */
export function formatCommissionRate(commissionRate: number): string {
  return `${commissionRate.toFixed(1)}%`;
}

/**
 * Détermine si un producteur utilise un taux de commission personnalisé
 * 
 * @param grower - Le producteur
 * @param marketSession - La session de marché
 * @returns true si le producteur a un taux personnalisé différent de celui de la session
 */
export function hasCustomCommissionRate(
  grower: Pick<Grower, 'commissionRate'>,
  marketSession: Pick<MarketSession, 'commissionRate'>
): boolean {
  if (!grower.commissionRate) {
    return false;
  }
  
  return grower.commissionRate !== marketSession.commissionRate;
}

/**
 * Calcule les informations complètes de commission pour un producteur
 * 
 * @param input - Les données du producteur et de la session
 * @returns Les informations complètes de commission
 */
export function calculateCommissionInfo(
  input: CommissionCalculationInput
): CommissionCalculationResult {
  const { grower, marketSession, basePrice } = input;
  
  const effectiveRate = getEffectiveCommissionRate(grower, marketSession);
  const isCustomRate = hasCustomCommissionRate(grower, marketSession);
  
  const commissionInfo: CommissionInfo = {
    effectiveRate,
    sessionRate: Number(marketSession.commissionRate),
    growerRate: grower.commissionRate ? Number(grower.commissionRate) : null,
    isCustomRate,
    source: isCustomRate ? 'grower' : 'session'
  };
  
  let productCalculation: ProductCommissionCalculation | undefined;
  
  if (basePrice !== undefined) {
    const basePriceNumber = typeof basePrice === 'number' ? basePrice : Number(basePrice);
    const commissionAmount = calculateCommissionAmount(basePriceNumber, effectiveRate);
    const finalPrice = calculatePriceWithCommission(basePriceNumber, effectiveRate);
    
    productCalculation = {
      basePrice: basePriceNumber,
      commissionRate: effectiveRate,
      commissionAmount,
      finalPrice
    };
  }
  
  return {
    commissionInfo,
    productCalculation
  };
}