/* eslint-disable react/no-unescaped-entities */
import React, { useState, useEffect } from 'react';
import { Partner } from '@prisma/client';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';

interface PartnerSelectorProps {
  selectedPartners: Partner[];
  onPartnersChange: (partners: Partner[]) => void;
  disabled?: boolean;
}

export const PartnerSelector: React.FC<PartnerSelectorProps> = ({
  selectedPartners,
  onPartnersChange,
  disabled = false
}) => {
  const [availablePartners, setAvailablePartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  // Charger les partenaires disponibles
  useEffect(() => {
    const fetchPartners = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/partners');
        if (response.ok) {
          const partners = await response.json();
          setAvailablePartners(partners.filter((p: Partner) => p.isActive));
        } else {
          setError('Erreur lors du chargement des partenaires');
        }
      } catch (err) {
        console.error('Erreur lors du chargement des partenaires:', err);
        setError('Erreur lors du chargement des partenaires');
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, []);

  // Ajouter un partenaire à la sélection
  const handleAddPartner = (partner: Partner) => {
    if (!selectedPartners.find(p => p.id === partner.id)) {
      onPartnersChange([...selectedPartners, partner]);
    }
    setShowDropdown(false);
  };

  // Retirer un partenaire de la sélection
  const handleRemovePartner = (partnerId: string) => {
    onPartnersChange(selectedPartners.filter(p => p.id !== partnerId));
  };

  // Filtrer les partenaires non sélectionnés
  const unselectedPartners = availablePartners.filter(
    partner => !selectedPartners.find(selected => selected.id === partner.id)
  );

  if (loading) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Partenaires
        </label>
        <div className="flex items-center justify-center h-20 border border-gray-300 rounded-md">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Partenaires
        </label>
        <div className="p-3 border border-red-300 rounded-md bg-red-50">
          <Text variant="small" className="text-red-600">{error}</Text>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Partenaires de l'événement
      </label>
      
      {/* Partenaires sélectionnés */}
      {selectedPartners.length > 0 && (
        <div className="space-y-2">
          {selectedPartners.map((partner) => (
            <div
              key={partner.id}
              className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md"
            >
              <div className="flex items-center space-x-3">
                {partner.imageUrl && (
                  <Image
                    src={partner.imageUrl}
                    alt={partner.name}
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                )}
                <div>
                  <Text variant="body" className="font-medium text-gray-900">{partner.name}</Text>
                  {partner.description && (
                    <Text variant="small" className="text-gray-500">
                      {partner.description.length > 50 
                        ? `${partner.description.substring(0, 50)}...` 
                        : partner.description}
                    </Text>
                  )}
                </div>
              </div>
              {!disabled && (
                <Button
                  type="button"
                  onClick={() => handleRemovePartner(partner.id)}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-800 hover:bg-red-50"
                >
                  Retirer
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Bouton pour ajouter des partenaires */}
      {!disabled && unselectedPartners.length > 0 && (
        <div className="relative">
          <Button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            variant="outline"
            className="w-full justify-center border-dashed border-2 border-gray-300 hover:border-green-500 hover:bg-green-50"
          >
            + Ajouter un partenaire
          </Button>

          {/* Dropdown des partenaires disponibles */}
          {showDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {unselectedPartners.map((partner) => (
                <button
                  key={partner.id}
                  type="button"
                  onClick={() => handleAddPartner(partner)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center space-x-3">
                    {partner.imageUrl && (
                      <Image
                        src={partner.imageUrl}
                        alt={partner.name}
                        width={32}
                        height={32}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <div className="font-medium text-gray-900">{partner.name}</div>
                      {partner.description && (
                        <div className="text-sm text-gray-500">
                          {partner.description.length > 60 
                            ? `${partner.description.substring(0, 60)}...` 
                            : partner.description}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Message si aucun partenaire disponible */}
      {!disabled && unselectedPartners.length === 0 && availablePartners.length > 0 && (
        <Text variant="small" className="text-gray-500 italic">
          Tous les partenaires disponibles ont été sélectionnés
        </Text>
      )}

      {/* Message si aucun partenaire dans le système */}
      {availablePartners.length === 0 && (
        <div className="p-3 border border-gray-300 rounded-md bg-gray-50">
          <Text variant="small" className="text-gray-600">
            Aucun partenaire disponible. 
            <a 
              href="/admin/gestion-marche/partenaires" 
              target="_blank"
              className="text-green-600 hover:text-green-800 underline ml-1"
            >
              Créer un partenaire
            </a>
          </Text>
        </div>
      )}
    </div>
  );
};

export default PartnerSelector;