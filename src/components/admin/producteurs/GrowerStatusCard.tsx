/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import type { IGrower } from '@/server/grower/IGrower';
import { formatDateLong } from '@/utils/dateUtils';

interface GrowerStatusCardProps {
  grower: IGrower;
  isEditing?: boolean;
  onFieldChange?: (field: keyof IGrower, value: string | boolean | null) => void;
}

const GrowerStatusCard: React.FC<GrowerStatusCardProps> = ({ grower, isEditing = false, onFieldChange }) => {
  const getStatusColor = (approved: boolean) => {
    return approved 
      ? 'bg-green-100 text-green-800' 
      : 'bg-yellow-100 text-yellow-800';
  };

  const getStatusIcon = (approved: boolean) => {
    return approved ? '✅' : '⏳';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 h-full flex flex-col">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Statut et informations</h2>
      </div>
      
      <div className="px-6 py-6 flex-1">
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-600">Statut d'approbation:</span>
            {isEditing ? (
              <select
                value={grower.approved ? 'approved' : 'pending'}
                onChange={(e) => onFieldChange?.('approved', e.target.value === 'approved')}
                className="text-sm font-medium bg-gray-50 border border-gray-300 rounded px-2 py-1"
              >
                <option value="pending">⏳ En attente</option>
                <option value="approved">✅ Approuvé</option>
              </select>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="text-lg">{getStatusIcon(grower.approved)}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  getStatusColor(grower.approved)
                }`}>
                  {grower.approved ? 'Approuvé' : 'En attente'}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between py-3">
            <span className="text-sm font-medium text-gray-600">Date d'inscription:</span>
            <span className="text-sm text-gray-900 font-medium">
              {grower.createdAt ? formatDateLong(grower.createdAt) : 'Non disponible'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrowerStatusCard;