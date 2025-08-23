import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Text } from '@/components/ui/Text';
import { CommissionInfo, CommissionDisplayOptions } from '@/types/commission';
import { formatCommissionRate } from '@/utils/commissionUtils';

interface CommissionDisplayProps {
  commissionInfo: CommissionInfo;
  options?: CommissionDisplayOptions;
  className?: string;
}

export function CommissionDisplay({ 
  commissionInfo, 
  options = {}, 
  className = '' 
}: CommissionDisplayProps) {
  const {
    showSource = true,
  } = options;

  const getVariant = () => {
    return commissionInfo.isCustomRate ? 'secondary' : 'default';
  };

  const getTooltipText = () => {
    if (commissionInfo.isCustomRate) {
      return `Taux personnalisé du producteur (session: ${formatCommissionRate(commissionInfo.sessionRate)})`;
    }
    return 'Taux de commission de la session de marché';
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge 
        variant={getVariant()} 
        className="text-xs"
        title={getTooltipText()}
      >
        {formatCommissionRate(commissionInfo.effectiveRate)}
      </Badge>
      
      {showSource && (
        <Text variant="small" className="text-gray-500">
          {commissionInfo.isCustomRate ? '(personnalisé)' : '(session)'}
        </Text>
      )}
    </div>
  );
}

/**
 * Composant pour afficher la commission dans un contexte de liste
 */
export function CommissionListItem({ 
  commissionInfo, 
  label = 'Commission',
  className = '' 
}: {
  commissionInfo: CommissionInfo;
  label?: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <Text variant="small" className="text-gray-600">
        {label}:
      </Text>
      <CommissionDisplay 
        commissionInfo={commissionInfo} 
        options={{ showSource: true }}
      />
    </div>
  );
}

/**
 * Composant pour afficher les détails de commission dans un tooltip ou modal
 */
export function CommissionDetails({ 
  commissionInfo,
  className = ''
}: {
  commissionInfo: CommissionInfo;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <Text variant="small" className="text-gray-600">Taux effectif:</Text>
        <Text variant="small" className="font-medium">
          {formatCommissionRate(commissionInfo.effectiveRate)}
        </Text>
      </div>
      
      <div className="flex items-center justify-between">
        <Text variant="small" className="text-gray-600">Taux de session:</Text>
        <Text variant="small">
          {formatCommissionRate(commissionInfo.sessionRate)}
        </Text>
      </div>
      
      {commissionInfo.growerRate && (
        <div className="flex items-center justify-between">
          <Text variant="small" className="text-gray-600">Taux producteur:</Text>
          <Text variant="small">
            {formatCommissionRate(commissionInfo.growerRate)}
          </Text>
        </div>
      )}
      
      <div className="pt-2 border-t border-gray-200">
        <Text variant="small" className="text-gray-500">
          {commissionInfo.isCustomRate 
            ? 'Le producteur utilise un taux personnalisé qui remplace celui de la session.'
            : 'Le producteur utilise le taux par défaut de la session de marché.'
          }
        </Text>
      </div>
    </div>
  );
}