import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Text } from '@/components/ui/Text';
import { Prisma } from '@prisma/client';

type EquipmentStatus = 'none' | 'provided' | 'required';

interface EquipmentSummaryProps {
  commissionRate: Prisma.Decimal;
  tentsStatus: EquipmentStatus;
  tablesStatus: EquipmentStatus;
  className?: string;
}

const getStatusLabel = (status: EquipmentStatus): string => {
  switch (status) {
    case 'none':
      return 'Aucun';
    case 'provided':
      return 'Fourni';
    case 'required':
      return 'Requis';
    default:
      return 'Non défini';
  }
};

const getStatusVariant = (status: EquipmentStatus): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status) {
    case 'none':
      return 'outline';
    case 'provided':
      return 'default';
    case 'required':
      return 'secondary';
    default:
      return 'outline';
  }
};

export default function EquipmentSummary({ 
  commissionRate, 
  tentsStatus, 
  tablesStatus, 
  className = '' 
}: EquipmentSummaryProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {/* Taux de commission */}
      <div className="flex items-center gap-2">
        <Text variant="small" className="text-gray-600 min-w-[80px]">
          Commission:
        </Text>
        <Badge variant="default" className="text-xs">
          {commissionRate.toString()}%
        </Badge>
      </div>
      
      {/* Statut des équipements */}
      <div className="flex items-center gap-2">
        <Text variant="small" className="text-gray-600 min-w-[80px]">
          Matériel:
        </Text>
        <div className="flex gap-1">
          <Badge 
            variant={getStatusVariant(tentsStatus)} 
            className="text-xs"
            title={`Chapiteaux: ${getStatusLabel(tentsStatus)}`}
          >
            Ch: {getStatusLabel(tentsStatus)}
          </Badge>
          <Badge 
            variant={getStatusVariant(tablesStatus)} 
            className="text-xs"
            title={`Tables: ${getStatusLabel(tablesStatus)}`}
          >
            Ta: {getStatusLabel(tablesStatus)}
          </Badge>
        </div>
      </div>
    </div>
  );
}