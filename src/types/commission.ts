import { MarketSession, Grower } from '@prisma/client';

/**
 * Informations de commission pour un producteur dans une session
 */
export interface CommissionInfo {
  /** Taux de commission effective appliqué */
  effectiveRate: number;
  /** Taux de commission de la session */
  sessionRate: number;
  /** Taux de commission du producteur (peut être null) */
  growerRate: number | null;
  /** Indique si le producteur utilise un taux personnalisé */
  isCustomRate: boolean;
  /** Source du taux appliqué */
  source: 'session' | 'grower';
}

/**
 * Calcul de commission pour un produit
 */
export interface ProductCommissionCalculation {
  /** Prix de base du produit */
  basePrice: number;
  /** Taux de commission appliqué */
  commissionRate: number;
  /** Montant de la commission */
  commissionAmount: number;
  /** Prix final avec commission */
  finalPrice: number;
}

/**
 * Données nécessaires pour calculer une commission
 */
export interface CommissionCalculationInput {
  grower: Pick<Grower, 'id' | 'name' | 'commissionRate'>;
  marketSession: Pick<MarketSession, 'id' | 'commissionRate'>;
  basePrice?: number;
}

/**
 * Résultat d'un calcul de commission
 */
export interface CommissionCalculationResult {
  commissionInfo: CommissionInfo;
  productCalculation?: ProductCommissionCalculation;
}

/**
 * Options pour l'affichage des commissions
 */
export interface CommissionDisplayOptions {
  /** Afficher le détail de la source du taux */
  showSource?: boolean;
  /** Afficher le montant de la commission */
  showAmount?: boolean;
  /** Nombre de décimales pour l'affichage */
  decimals?: number;
}