import React from 'react';
import Image from 'next/image';
import type { IGrower } from '@/server/grower/IGrower';

interface GrowerInfoCardProps {
  grower: IGrower;
  isEditing?: boolean;
  onFieldChange?: (field: keyof IGrower, value: string | null) => void;
}

const GrowerInfoCard: React.FC<GrowerInfoCardProps> = ({ grower, isEditing = false, onFieldChange }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 h-full flex flex-col">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Informations personnelles</h2>
      </div>
      
      <div className="px-6 py-6 flex-1">
        {/* Photo de profil et nom */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex-shrink-0">
            {grower.profilePhoto ? (
              <Image 
                src={grower.profilePhoto} 
                alt={grower.name} 
                width={64}
                height={64}
                className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center border-2 border-gray-200">
                <span className="text-gray-400 text-xl">👤</span>
              </div>
            )}
          </div>
          <div className="flex-1">
            {isEditing ? (
              <input
                type="text"
                value={grower.name}
                onChange={(e) => onFieldChange?.('name', e.target.value)}
                className="text-xl font-bold text-gray-900 bg-gray-50 border border-gray-300 rounded px-2 py-1 w-full"
                placeholder="Nom du producteur"
              />
            ) : (
              <h3 className="text-xl font-bold text-gray-900">{grower.name}</h3>
            )}
            <p className="text-sm text-gray-500 font-medium">Producteur local</p>
          </div>
        </div>

        {/* Informations de contact */}
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-600">SIRET:</span>
            {isEditing ? (
              <input
                type="text"
                value={grower.siret || ''}
                onChange={(e) => onFieldChange?.('siret', e.target.value || null)}
                className="text-sm text-gray-900 font-medium bg-gray-50 border border-gray-300 rounded px-2 py-1 max-w-xs"
                placeholder="Numéro SIRET"
              />
            ) : (
              <span className="text-sm text-gray-900 font-medium">{grower.siret || 'Non renseigné'}</span>
            )}
          </div>
          
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-600">Email:</span>
            {isEditing ? (
              <input
                type="email"
                value={grower.email}
                onChange={(e) => onFieldChange?.('email', e.target.value)}
                className="text-sm text-gray-900 font-medium bg-gray-50 border border-gray-300 rounded px-2 py-1 max-w-xs"
                placeholder="Adresse email"
              />
            ) : (
              <span className="text-sm text-gray-900 font-medium">{grower.email}</span>
            )}
          </div>
          
          <div className="flex items-center justify-between py-3">
            <span className="text-sm font-medium text-gray-600">Téléphone:</span>
            {isEditing ? (
              <input
                type="tel"
                value={grower.phone || ''}
                onChange={(e) => onFieldChange?.('phone', e.target.value || null)}
                className="text-sm text-gray-900 font-medium bg-gray-50 border border-gray-300 rounded px-2 py-1 max-w-xs"
                placeholder="Numéro de téléphone"
              />
            ) : (
              <span className="text-sm text-gray-900 font-medium">{grower.phone || 'Non renseigné'}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrowerInfoCard;