import React from 'react';
import type { IGrower } from '@/server/grower/IGrower';

interface GrowerBioCardProps {
  grower: IGrower;
  isEditing?: boolean;
  onFieldChange?: (field: keyof IGrower, value: string | null) => void;
}

const GrowerBioCard: React.FC<GrowerBioCardProps> = ({ grower, isEditing = false, onFieldChange }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 h-full flex flex-col">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Biographie</h2>
      </div>
      
      <div className="px-6 py-6 flex-1">
        {isEditing ? (
          <textarea
            value={grower.bio || ''}
            onChange={(e) => onFieldChange?.('bio', e.target.value || null)}
            className="w-full h-32 p-3 text-sm text-gray-700 bg-gray-50 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Décrivez l'histoire du producteur, ses méthodes de production, ses valeurs..."
          />
        ) : (
          grower.bio ? (
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 leading-relaxed text-sm">
                {grower.bio}
              </p>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center bg-gray-100">
                <span className="text-2xl">📝</span>
              </div>
              <p className="text-gray-500 italic text-sm">
                Aucune biographie renseignée
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default GrowerBioCard;