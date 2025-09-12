/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import Image from 'next/image';
import { Input } from '@/components/ui/Input';
import { Text } from '@/components/ui/Text';
import { getEffectiveCommissionRate } from '@/utils/commissionUtils';
import type { MarketSession } from '@prisma/client';
import { Prisma } from '@prisma/client';

interface GrowerCommissionData {
  id: string;
  name: string;
  email: string;
  profilePhoto: string | null;
  commissionRate: Prisma.Decimal | null;
  turnover: number;
  commissionAmount: number;
}

interface CommissionManagementTableProps {
  growerData: GrowerCommissionData[];
  session: Pick<MarketSession, 'id' | 'commissionRate'>;
  onTurnoverChange: (growerId: string, turnover: number) => void;
  onCommissionRateChange: (growerId: string, commissionRate: number | null) => void;
  isLoading?: boolean;
}

export const CommissionManagementTable: React.FC<CommissionManagementTableProps> = ({
  growerData,
  session,
  onTurnoverChange,
  onCommissionRateChange,
  isLoading = false
}) => {
  const handleTurnoverChange = (growerId: string, value: string) => {
    const turnover = parseFloat(value) || 0;
    onTurnoverChange(growerId, turnover);
  };

  const handleCommissionRateChange = (growerId: string, value: string) => {
    const rate = value === '' ? null : parseFloat(value);
    onCommissionRateChange(growerId, rate);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-8 text-center">
          <Text variant="body" className="text-gray-500">
            Chargement...
          </Text>
        </div>
      </div>
    );
  }

  if (growerData.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-8 text-center">
          <Text variant="body" className="text-gray-500">
            Aucun producteur confirmé pour cette session.
          </Text>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                Producteur
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                Taux de commission
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                Chiffre d'affaires (€)
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                Commission (€)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {growerData.map((grower) => {
              const growerRate = grower.commissionRate ? parseFloat(grower.commissionRate.toString()) : null;
               const sessionRate = parseFloat(session.commissionRate.toString());
               
               const effectiveRate = getEffectiveCommissionRate(
                 { commissionRate: new Prisma.Decimal(growerRate || 0) },
                 { commissionRate: new Prisma.Decimal(sessionRate) }
               );
              
              return (
                <tr key={grower.id} className="hover:bg-gray-50">
                  {/* Producteur */}
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {grower.profilePhoto ? (
                          <Image
                            src={grower.profilePhoto}
                            alt={grower.name}
                            width={40}
                            height={40}
                            className="rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                            <Text variant="small" className="text-gray-600 font-medium">
                              {grower.name.charAt(0).toUpperCase()}
                            </Text>
                          </div>
                        )}
                      </div>
                      <div>
                        <Text variant="body" className="font-medium text-gray-900">
                          {grower.name}
                        </Text>
                        <Text variant="small" className="text-gray-500">
                          {grower.email}
                        </Text>
                      </div>
                    </div>
                  </td>

                  {/* Taux de commission */}
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.001"
                        value={grower.commissionRate ? grower.commissionRate.toString() : ''}
                        onChange={(e) => handleCommissionRateChange(grower.id, e.target.value)}
                        className="w-24"
                        placeholder={session.commissionRate.toString()}
                      />
                      <Text variant="small" className="text-gray-500">
                        {grower.commissionRate ? 'Personnalisé' : `Défaut: ${session.commissionRate}%`}
                      </Text>
                    </div>
                  </td>

                  {/* Chiffre d'affaires */}
                  <td className="px-6 py-4">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={grower.turnover.toString()}
                      onChange={(e) => handleTurnoverChange(grower.id, e.target.value)}
                      className="w-32"
                      placeholder="0.00"
                    />
                  </td>

                  {/* Commission calculée */}
                  <td className="px-6 py-4">
                    <Text variant="body" className="font-medium text-orange-600">
                      {grower.commissionAmount.toFixed(2)} €
                    </Text>
                    {grower.turnover > 0 && (
                      <Text variant="small" className="text-gray-500">
                        {effectiveRate.toFixed(1)}% de {grower.turnover.toFixed(2)} €
                      </Text>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};